import React, { useState, useEffect, useCallback, useRef } from "react"
import { db } from "../firebase.config"
import { getDocs, collection, addDoc } from "firebase/firestore"
import back from "../assets/back.png"
import jsPDF from "jspdf"
import html2canvas from "html2canvas" 
import ResultsFicheD from "./ResultsFicheD"

function SearchCRD({onReturn, uid}) {
    const [usersMap, setUsersMap] = useState({})
    const [selectedSalon, setSelectedSalon] = useState('')
    const [salons, setSalons] = useState([]) 
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    const [selectedExactDate, setSelectedExactDate] = useState('');
    const currentYear = new Date().getFullYear();
    const [filterType, setFilterType] = useState('currentYear'); 
    const pageRef = useRef()

    useEffect(() => {
        const fetchUsersData = async () => {
            const usersData = {};
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.forEach((doc) => {
                    const userData = doc.data();
                    usersData[doc.id] = { firstname: userData.firstname, lastname: userData.lastname }; // Assurez-vous que les champs firstname et lastname existent
                });
                setUsersMap(usersData)
            } catch (error) {
                    console.error("Erreur lors de la récupération des utilisateurs : ", error);
            }
        };
    
        fetchUsersData()
    }, [])

    const fetchSalons = async () => {
        try {
            const salonsCollection = collection(db, 'salons');
            const snapshot = await getDocs(salonsCollection);

            if (snapshot.empty) {
                console.log('Aucun document trouvé dans la collection "salons".');
                setSalons([]);
                return;
            }

            const salonsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            let filteredResults = [];

            salonsData.forEach(salon => {
                const { crDemonstration } = salon;
                if (crDemonstration && Array.isArray(crDemonstration)) {
                    crDemonstration.forEach(demo => {
                        const createdAt = demo.createdAt.toDate(); // Convert Timestamp to Date
                        if (filterType === 'exactDate' && selectedExactDate) {
                            const exactDate = new Date(selectedExactDate);
                            if (createdAt.toDateString() === exactDate.toDateString()) {
                                filteredResults.push(demo);
                            }
                        } else if (filterType === 'dateRange' && selectedStartDate && selectedEndDate) {
                            const startDate = new Date(selectedStartDate);
                            const endDate = new Date(selectedEndDate);
                            if (createdAt >= startDate && createdAt <= endDate) {
                                filteredResults.push(demo);
                            }
                        } else {
                            const startOfYear = new Date(currentYear, 0, 1);
                            const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
                            if (createdAt >= startOfYear && createdAt <= endOfYear) {
                                filteredResults.push(demo);
                            }
                        }
                    });
                }
            });

            setSalons(filteredResults);
        } catch (error) {
            console.error('Erreur lors de la récupération des salons :', error);
        }
    }

    useEffect(() => {
        fetchSalons();
        // eslint-disable-next-line
    }, [filterType, selectedStartDate, selectedEndDate, selectedExactDate])

    const formatDate = (date) => {
        if (!date || !date.seconds) {
            return 'Date non disponible';
        }
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

        const d = new Date(date.seconds * 1000)
        const dayName = days[d.getUTCDay()]
        const day = d.getUTCDate()
        const month = months[d.getUTCMonth()]
        const year = d.getUTCFullYear()

        return `${dayName} ${day} ${month} ${year}`
    }
    const generatePDF = (input, filename) => {
        if (!input) {
            console.error('Erreur : référence à l\'élément non valide');
            return;
        }
    
        const currentDate = new Date();
        const formattedDate = `Téléchargé le ${currentDate.toLocaleDateString()} à ${currentDate.toLocaleTimeString()}`;
    
        html2canvas(input, {
            useCORS: true,
            scale: 2, 
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
    
            const totalPages = height > pdfHeight
                ? Math.ceil(canvasHeight / (canvasWidth * pdfHeight / pdfWidth))
                : 1;
    
            const addPageNumber = (pdf, pageNumber, totalPages) => {
                pdf.setFontSize(8);
                const pageNumText = `Page ${pageNumber} / ${totalPages}`;
                pdf.text(pageNumText, pdfWidth - 15, pdfHeight - 10);
            };
    
            const addDateTime = (pdf, dateTime) => {
                pdf.setFontSize(8);
                pdf.text(dateTime, pdfWidth - 50, 5);
            };
    
            if (height > pdfHeight) {
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
                    addPageNumber(pdf, i + 1, totalPages);
                    if (i === 0) {
                        addDateTime(pdf, formattedDate);
                    }
                    position += pageCanvas.height;
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
                addPageNumber(pdf, 1, totalPages);
                addDateTime(pdf, formattedDate);
            }
    
            pdf.save(filename);
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    }
    const downloadPDF = async () => {
        const input = pageRef.current;
        generatePDF(input, "crdemonstration-all.pdf")

        try {
            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `CR de Démonstration de ${selectedSalon} téléchargé`,
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'historique : ", error)
        }
    }

    return (
        <div>
             <div className="title-fiche">
                <h1>Recherche de Compte rendu de RDV de Démonstration</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <div className="filters-search-crd">
                <div className="filter1">
                    <h2>Filtrer les comptes rendus</h2>
                    <div>
                        <label><input className="checkbox" type="radio" value="currentYear" checked={filterType === 'currentYear'} onChange={() => setFilterType('currentYear')} /> Voir les comptes rendu de l'année en cours</label><br></br><br></br>
                        <label><input className="checkbox" type="radio" value="exactDate" checked={filterType === 'exactDate'} onChange={() => setFilterType('exactDate')} />Voir les comptes rendu selon une date spécifique</label><br></br><br></br>
                        {filterType === 'exactDate' && (
                            <>
                            <input style={{width: "100%"}} type="date" value={selectedExactDate} onChange={e => setSelectedExactDate(e.target.value)} /><br></br><br></br>
                            </>
                        )}
                        <label><input  className="checkbox" type="radio" value="dateRange" checked={filterType === 'dateRange'} onChange={() => setFilterType('dateRange')} />Voir les comptes rendu selon une période sélectionnée</label><br></br><br></br>
                        {filterType === 'dateRange' && (
                            <div>
                                <label className="label">Date de début: <input type="date" style={{width: "100%"}} value={selectedStartDate} onChange={e => setSelectedStartDate(e.target.value)} /></label><br></br>
                                <label className="label">Date de fin: <input type="date"style={{width: "100%"}}  value={selectedEndDate} onChange={e => setSelectedEndDate(e.target.value)} /></label>
                            </div>
                        )}
                    </div>
                </div>
                <div  className="filter">
                    <button className="button-colored" style={{ padding: "15px 20px" }} onClick={fetchSalons}>Rechercher</button>
                    <button style={{ padding: "15px 20px" }} onClick={downloadPDF} className='button-colored'>Télécharger les comptes rendus</button>
                </div>
            </div>

            <div className="all-fiches-client">
                <div ref={pageRef} style={{paddingTop: "20px", fontSize: "16px"}}>
                    <h4 style={{textAlign: "center", fontSize: "20px", marginBottom: "20px"}}>Comptes rendu de RDV de Démonstration du salon {selectedSalon}</h4>
                    <ul>
                    {salons.map((fiche, index) => (
                        <li key={index}>
                            <div style={{paddingLeft: "100px"}}>Enregistré le : <strong>{formatDate(fiche.createdAt)}</strong>, par <strong>{usersMap[fiche.userId].firstname} {usersMap[fiche.userId].lastname}</strong></div>
                            <ResultsFicheD 
                                data={{ 
                                    name: fiche.name,
                                    adresse: fiche.adresse,
                                    city: fiche.city, 
                                    nomPrenomDuResponsable: fiche.nomPrenomDuResponsable, 
                                    responsablePrésent: fiche.responsablePrésent,
                                    téléphone: fiche.téléphone,
                                    email: fiche.email,
                                    nombreDeCollaborateurs: fiche.nombreDeCollaborateurs,
                                    typeDeDémonstration: fiche.typeDeDémonstration, 
                                    duréeDeLaDémonstration: fiche.duréeDeLaDémonstration,
                                    techniciennePrésente: fiche.techniciennePrésente, 
                                    nomDeLaTechnicienne: fiche.nomDeLaTechnicienne, 
                                    avecLaVRP: fiche.avecLaVRP, 
                                    seule: fiche.seule, 
                                    issueFavorable: fiche.issueFavorable, 
                                    issueDéfavorable: fiche.issueDéfavorable, 
                                    motif: fiche.motif, // ajouter le champs 
                                    actions: fiche.actions, 
                                    précisions: fiche.précisions, 
                                    observationsGénérales: fiche.observationsGénérales, 
                                    département: fiche.département, 
                                }}
                            />
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default SearchCRD