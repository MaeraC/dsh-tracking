
// fichier RecapAdmin.js 

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from '../../firebase.config';
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import back from "../../assets/back.png"

function RecapAdmin({ onReturn }) { 
    const [dateRange, setDateRange] = useState({ start: '', end: '' })
    const [usersMap, setUsersMap] = useState({})
    const [month, setMonth] = useState('')
    const [selectedUserId, setSelectedUserId] = useState('')
    const [users, setUsers] = useState([])
    const pageRef = useRef()
    const [stats, setStats] = useState({
        semaine: { total: 0, clients: 0, prospects: 0, absences: 0,absenceDates: []  },
        mois: { total: 0, clients: 0, prospects: 0,absences: 0, absenceDates: []  },
        moisSelectionne: { total: 0, clients: 0, prospects: 0,absences: 0, absenceDates: []  },
        periodeSelectionnee: { total: 0, clients: 0, prospects: 0, absences: 0,absenceDates: []  },
    })

    useEffect(() => {
        const fetchUsersData = async () => {
            const usersData = {};
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.forEach((doc) => {
                    usersData[doc.id] = doc.data().firstname + " " + doc.data().lastname
                });
                setUsersMap(usersData)
            } catch (error) {
                    console.error("Erreur lors de la récupération des utilisateurs : ", error);
            }
        };
    
        fetchUsersData()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const feuillesDeRouteRef = collection(db, "feuillesDeRoute")
            const q = query(feuillesDeRouteRef)
            const snapshot = await getDocs(q)
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            const uniqueUsers = [...new Set(data.map(doc => doc.userId))]
            setUsers(uniqueUsers)

            let filteredData = data
            if (selectedUserId) {
                filteredData = data.filter(doc => doc.userId === selectedUserId)
            } 

            let endDate = new Date()
            if (dateRange.end) {
                endDate = new Date(dateRange.end)
                endDate.setDate(endDate.getDate() + 1)
            }

            const startOfWeek = new Date()
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
            startOfWeek.setHours(0, 0, 0, 0)

            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const calculateStats = (data, filter) => {
                let total = 0
                let clients = 0
                let prospects = 0
                let absences = 0
                let absenceDates = []

                data.forEach(doc => {
                    if (doc.date && doc.date.toDate) {
                        const timestamp = doc.date.toDate()
                        if (filter(timestamp)) {
                            // Compter les stops sauf le dernier
                            const stopsCount = doc?.stops?.length > 0 ? doc?.stops?.length - 1 : 0;
                            total += stopsCount;

                            doc?.stops?.forEach((stop, index) => {
                                if (index < stopsCount) {
                                    if (stop.status === "Client") { 
                                        clients += 1;
                                    } else if (stop.status === "Prospect") {
                                        prospects += 1;
                                    }
                                }
                            })

                            if (doc?.isVisitsStarted === false) {
                                absences += 1
                                absenceDates.push(timestamp.toLocaleDateString())
                            }
                        }
                    }
                })
                return { total, clients, prospects, absences, absenceDates };
            }
            const semaineStats = calculateStats(filteredData, (timestamp) => {
                return timestamp >= startOfWeek;
            })
            const moisStats = calculateStats(filteredData, (timestamp) => {
                return timestamp >= startOfMonth;
            })
            const moisSelectionneStats = calculateStats(filteredData, (timestamp) => {
                if (!month) return false;
                const [year, monthNum] = month.split("-");
                const date = new Date(timestamp);
                return date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(monthNum) - 1;
            })
            const periodeSelectionneeStats = calculateStats(filteredData, (timestamp) => {
                if (!dateRange.start || !dateRange.end) return false;
                const date = new Date(timestamp);
                return date >= new Date(dateRange.start) && date < endDate;
            })

            setStats({
                semaine: semaineStats,
                mois: moisStats,
                moisSelectionne: moisSelectionneStats,
                periodeSelectionnee: periodeSelectionneeStats,
            })
        }

        fetchData();
    }, [selectedUserId, dateRange, month])

    const handleUserChange = (e) => {
        setSelectedUserId(e.target.value);
    }
    const handleDateRangeChange = (field, value) => {
        setDateRange(prevRange => ({ ...prevRange, [field]: value }));
        setMonth(''); // Réinitialiser la sélection du mois
    }
    const handleMonthChange = (value) => {
        setMonth(value);
        setDateRange({ start: '', end: '' }); // Réinitialiser la sélection des dates
    }

    const generateReportText = () => {
        let periodText = "cette semaine et ce mois-ci";
        let selectedStats = stats.semaine;
        let userName = usersMap[selectedUserId] || "Tous les utilisateurs";
        let userText = selectedUserId ? `Le VRP <span class="bold">${userName}</span>` : `<span class="bold">${userName}</span>`;
        let verb = selectedUserId ? 'a effectué' : 'ont effectué';

        if (dateRange.start && dateRange.end) {
            periodText = `la période du <span class="bold">${new Date(dateRange?.start).toLocaleDateString()}</span> au <span class="bold">${new Date(dateRange.end).toLocaleDateString()}</span>`;
            selectedStats = stats?.periodeSelectionnee;
        } else if (month) {
            const [year, monthNum] = month.split("-");
            const monthName = new Date(year, monthNum - 1).toLocaleString('fr-FR', { month: 'long' });
            periodText = `le mois de <span class="bold">${monthName} ${year}</span>`;
            selectedStats = stats.moisSelectionne;
        } else {
            if (stats.semaine.total > 0) {
                periodText = `la <span class="bold">semaine en cours</span>`;
                selectedStats = stats.semaine;
            } else {
                periodText = `le <span class="bold">mois en cours</span>`;
                selectedStats = stats.mois;
            }
        }

        const additionalStats = `Pour la <span class="bold">semaine en cours</span>, <span class="bold">${stats.semaine.total}</span> visites au total dont <span class="bold">${stats.semaine.clients}</span> visites client et <span class="bold">${stats.semaine.prospects}</span> visites prospect.</br> Pour le <span class="bold">mois en cours</span>, <span class="bold">${stats.mois.total}</span> visites au total dont <span class="bold">${stats.mois.clients}</span> visites client et <span class="bold">${stats.mois.prospects}</span> visites prospect.`;
        const absenceText = selectedStats.absences > 0 
        ? `Il y a eu <span class="bold">${selectedStats.absences}</span> jours d'absence aux dates suivantes : <span class="bold">${selectedStats.absenceDates.join(", ")}</span>.`
        : `Il n'y a pas eu de jours d'absence.`;

        return `Le rapport est le suivant :</br> Pour ${periodText},</br> ${userText} ${verb} <span class="bold">${selectedStats.total}</span> visites au total dont <span class="bold">${selectedStats.prospects}</span> visites prospect et <span class="bold">${selectedStats.clients}</span> visites client.</br> ${additionalStats} </br> ${absenceText}`; 
    }

    const generatePDF = (input, filename) => {
        if (!input) {
            console.error('Erreur : référence à l\'élément non valide');
            return;
        }

        html2canvas(input, {
            useCORS: true,
            scale: 2, // Augmente la résolution du canvas pour une meilleure qualité
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth;
            const height = width / ratio;

            let position = 0;

            if (height > pdfHeight) {
                const totalPages = Math.ceil(canvasHeight / (canvasWidth * pdfHeight / pdfWidth));
                for (let i = 0; i < totalPages; i++) {
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvasWidth;
                    pageCanvas.height = canvasWidth * pdfHeight / pdfWidth;
                    const pageContext = pageCanvas.getContext('2d');
                    pageContext.drawImage(canvas, 0, position, canvasWidth, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);
                    const pageImgData = pageCanvas.toDataURL('image/png');
                    if (i > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    position += pageCanvas.height;
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
            }

            pdf.save(filename);
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    }
    const downloadPDF = () => {
        const input = pageRef.current;
        generatePDF(input, "rapport-des-visites.pdf")
    }
    
    return (
        <>
        <div className="title-fiche">
                <h1>Rapport des visites effectuées</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>
        <button style={{ padding: "10px 30px", marginTop: "20px", marginLeft: "30px" }} onClick={downloadPDF} className='button-colored'>Télécharger le rapport des visites</button>
        <div ref={pageRef} className='recap recap-admin'>
            <h2>Statistiques et rapport des visites effectuées</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>
                            Sélectionner un utilisateur
                            <select value={selectedUserId} onChange={handleUserChange}>
                                <option value="">Tous les utilisateurs</option>
                                {users.map(user => (
                                    <option key={user} value={user}>{usersMap[user] || user}</option>
                                ))}
                            </select>
                        </th>
                        <th>Cette semaine</th>
                        <th>Ce mois</th>
                        <th>
                            Choisir une période :
                            <input type="date" value={dateRange.start} onChange={(e) => handleDateRangeChange('start', e.target.value)} />
                            <input type="date" value={dateRange.end} onChange={(e) => handleDateRangeChange('end', e.target.value)} />
                        </th>
                        <th>
                            Choisir un mois :
                            <input type="month" value={month} onChange={(e) => handleMonthChange(e.target.value)} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='colonne'>Visites total</td>
                        <td>{stats.semaine.total}</td>
                        <td>{stats.mois.total}</td>
                        <td>{stats.periodeSelectionnee.total}</td>
                        <td>{stats.moisSelectionne.total}</td>
                    </tr>
                    <tr>
                        <td className='colonne'>Visites clients</td>
                        <td>{stats.semaine.clients}</td>
                        <td>{stats.mois.clients}</td>
                        <td>{stats.periodeSelectionnee.clients}</td>
                        <td>{stats.moisSelectionne.clients}</td>
                    </tr>
                    <tr>
                        <td className='colonne'>Visites prospects</td>
                        <td>{stats.semaine.prospects}</td>
                        <td>{stats.mois.prospects}</td>
                        <td>{stats.periodeSelectionnee.prospects}</td>
                        <td>{stats.moisSelectionne.prospects}</td>
                    </tr>
                </tbody>
            </table>
            <div style={{margin: "20px"}}>
                <p style={{lineHeight: "25px"}} dangerouslySetInnerHTML={{ __html: generateReportText() }} />
            </div> 
        </div>
        </>
    );
}

export default RecapAdmin