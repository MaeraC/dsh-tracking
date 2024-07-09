
// fichier RapportMensuelVisites.js

import { useState, useEffect, useRef }                                             from "react"
import { collection, getDocs, query, where , Timestamp} from 'firebase/firestore'
import { db } from "../../firebase.config"
import { fr } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';  
import back from "../../assets/back.png"
import jsPDF from "jspdf";   
import html2canvas from "html2canvas"

function RapportMensuelVisites({uid, onReturn}) {
    const [monthlyReports, setMonthlyReports] = useState([]);
    const [feuillesRoute, setFeuillesRoute] = useState([]);
    // eslint-disable-next-line
    const [searchTerm, setSearchTerm] = useState('');
    const [salonSuggestions, setSalonSuggestions] = useState([]);
    const [selectedSalon, setSelectedSalon] = useState('');
    const [salonStatus, setSalonStatus] = useState("")
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [visitsCount, setVisitsCount] = useState(0);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)
    const [visitDates, setVisitDates] = useState([])
    const pageRef = useRef()
    const pageRef2 = useRef()

    useEffect(() => {
        if (!uid) return;

        const fetchFeuillesRoute = async () => {
            const feuillesRouteRef = collection(db, 'feuillesDeRoute');
            const q = query(feuillesRouteRef, where('userId', '==', uid));
            const querySnapshot = await getDocs(q);
            const feuillesRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setFeuillesRoute(feuillesRouteData);
        };

        fetchFeuillesRoute();
    }, [uid])

    useEffect(() => {
        generateMonthlyReport();
        // eslint-disable-next-line
    }, [feuillesRoute]); 

    const handleSalonSearch = (inputValue) => {
        const filteredSalons = feuillesRoute
          .map((feuille) =>
            feuille?.stops?.slice(0, -1).map((stop) => stop.name)
          )
          .flat()
          .filter(
            (name, index, self) => 
              name?.toLowerCase().includes(inputValue.toLowerCase()) &&
              self?.indexOf(name) === index
          );
    
        setSalonSuggestions(filteredSalons);
    }

    const handleSalonSelect = (salonName) => {
        setSelectedSalon(salonName);
        // Rechercher le statut du salon sélectionné
        const feuille = feuillesRoute.find((f) =>
            f.stops.some((stop) => stop.name === salonName)
        
        )
        
        if (feuille) {
            const stop = feuille.stops.find((stop) => stop.name === salonName);
            setSalonStatus(stop.status);
        }
        setSalonSuggestions([])
    }

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    }
    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    }

    const groupStopsByMonth = () => {
        const currentMonth = {};
        const months = {};

        feuillesRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000);
            const monthKey = `${date.getFullYear()}_${date.getMonth()}`;

            if (!months[monthKey]) {
                // Création de la structure pour le mois
                const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
                const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).setHours(23, 59, 99, 999)

                months[monthKey] = {
                    startOfMonth: firstDayOfMonth,
                    endOfMonth: lastDayOfMonth,
                    stopsByDay: {},
                    totalKmByDay: {}
                };

                // Initialisation de chaque jour du mois avec un tableau vide
                const currentDate = new Date(firstDayOfMonth);
                while (currentDate <= lastDayOfMonth) {
                    //const dayOfWeek = currentDate.getDay();
                    const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleDateString('fr-FR', { month: 'long' })}`;
                    months[monthKey].stopsByDay[currentDate.getDate()] = {
                        date: formattedDate,
                        stops: []
                    };
                    months[monthKey].totalKmByDay[currentDate.getDate()] = 0;
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            feuille?.stops?.forEach(stop => {
                const dayOfMonth = new Date(feuille.date.seconds * 1000).getDate()
                if (months[monthKey].stopsByDay.hasOwnProperty(dayOfMonth)) {
                    months[monthKey].stopsByDay[dayOfMonth].stops.push({ ...stop })
                    months[monthKey].totalKmByDay[dayOfMonth] += stop.distance || 0
                }
            });

            // Vérifier si la feuille appartient au mois en cours
            if (isCurrentMonth(months[monthKey].startOfMonth, months[monthKey].endOfMonth)) {
                currentMonth[monthKey] = months[monthKey]
            }
        })
        return currentMonth
    }
    const isCurrentMonth = (startOfMonth, endOfMonth) => {
        const today = new Date()
        return (
            today >= startOfMonth && today <= endOfMonth
        )
    }
    const currentMonth = groupStopsByMonth() 

    const generateMonthlyReport = () => {
        const reports = {}
        Object.keys(currentMonth).forEach(monthKey => {
            const { stopsByDay } = currentMonth[monthKey];
            Object.keys(stopsByDay).forEach(day => {
                stopsByDay[day].stops.slice(0, -1).forEach(stop => {
                    if (stop.name === "Domicile") return;  
                    if (!reports[stop.name]) {
                        reports[stop.name] = {
                            status: stop.status,
                            dates: [],
                            totalMinutes: 0
                        };
                    }
                    const visitDate = new Date(currentMonth[monthKey].startOfMonth)
                    visitDate.setDate(parseInt(day, 10))
                    const formattedDate = `${visitDate.getDate().toString().padStart(2, '0')}/${(visitDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
                    reports[stop.name].dates.push(formattedDate)
    
                    const arrivalTime = new Date(`1970-01-01T${stop.arrivalTime}:00`);
                    const departureTime = new Date(`1970-01-01T${stop.departureTime}:00`);
                    const timeSpent = (departureTime - arrivalTime) / 60000; // Temps en minutes
                    reports[stop.name].totalMinutes += timeSpent;
                });
            });
        });

        const formattedReports = Object.keys(reports).map(name => ({
            name,
            status: reports[name].status,
            dates: reports[name].dates,
            totalMinutes: reports[name].totalMinutes
        }))

        // Filtrer les résultats en fonction du terme de recherche
        const filteredReports = formattedReports.filter(report =>
            report.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        setMonthlyReports(filteredReports);
        
    }

    const handleGenerateReport = (e) => {
        e.preventDefault()
        setIsFormSubmitted(true)

        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        if (endDateObj) {
            endDateObj.setHours(23, 59, 59, 999);
        }

        const startTimestamp = startDateObj ? Timestamp.fromDate(startDateObj) : null;
        const endTimestamp = endDateObj ? Timestamp.fromDate(endDateObj) : null;

        // Filtrer les feuilles de route pour la période et le salon sélectionnés
        const filteredFeuilles = feuillesRoute.filter(feuille => {
            const feuilleTimestamp = feuille.date;
            return (!startTimestamp || feuilleTimestamp >= startTimestamp) && (!endTimestamp || feuilleTimestamp <= endTimestamp) &&
                feuille?.stops?.some(stop => stop.name.toLowerCase() === selectedSalon.toLowerCase())
        })
        
        let visits = 0
        let totalTime = 0
        const dates = []

        filteredFeuilles.forEach(feuille => {
            const feuilleDate = new Date(feuille.date.seconds * 1000)
            const formattedDate = `${feuilleDate.getDate().toString().padStart(2, '0')}/${(feuilleDate.getMonth() + 1).toString().padStart(2, '0')}`;
            feuille.stops.forEach(stop => {
                if (stop.name.toLowerCase() === selectedSalon.toLowerCase()) {
                    visits++;
                    const arrivalTime = new Date(`1970-01-01T${stop.arrivalTime}:00`)
                    const departureTime = new Date(`1970-01-01T${stop.departureTime}:00`)
                    const timeSpent = (departureTime - arrivalTime) / 60000
                    totalTime += timeSpent
                    dates.push(formattedDate)
                }
            })
        })
        setVisitsCount(visits)
        setTotalTimeSpent(totalTime)
        setVisitDates(dates)
    }

    const moisEnCours = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

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
    
            const totalPages = height > pdfHeight
                ? Math.ceil(canvasHeight / (canvasWidth * pdfHeight / pdfWidth))
                : 1;
    
            const addPageNumber = (pdf, pageNumber, totalPages) => {
                pdf.setFontSize(10);
                const pageNumText = `Page ${pageNumber} / ${totalPages}`;
                pdf.text(pageNumText, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
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
                    position += pageCanvas.height;
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
                addPageNumber(pdf, 1, totalPages);
            }
    
            pdf.save(filename);
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    }
    const downloadPDF = () => {
        const input = pageRef.current;
        generatePDF(input, "rapport-mensuel-des-visites.pdf")
    }
    const generatePDF2 = (input, filename) => {
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
    
            // Défini les marges (en mm)
            const leftMargin = 20;
            const rightMargin = 50;
            const usableWidth = pdfWidth - leftMargin - rightMargin;
    
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = usableWidth;
            const height = width / ratio;
    
            let position = 0;
    
            if (height > pdfHeight) {
                const totalPages = Math.ceil(canvasHeight / (canvasWidth * pdfHeight / usableWidth));
                for (let i = 0; i < totalPages; i++) {
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvasWidth;
                    pageCanvas.height = canvasWidth * pdfHeight / usableWidth;
                    const pageContext = pageCanvas.getContext('2d');
                    pageContext.drawImage(canvas, 0, position, canvasWidth, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);
                    const pageImgData = pageCanvas.toDataURL('image/png');
                    if (i > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(pageImgData, 'PNG', leftMargin, 0, usableWidth, pdfHeight);
                    position += pageCanvas.height;
                }
            } else {
                pdf.addImage(imgData, 'PNG', leftMargin, 0, usableWidth, height);
            }
    
            pdf.save(filename);
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    }
    const downloadPDF2 = () => {
        const input = pageRef2.current; 
        generatePDF2(input, "rapport-des-activités-du-salon.pdf")
    }

    return (
        <div>
            <div className='titre-fiche'>  
                <h1>Rapport des visites réalisées</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <div className="rapport-container" style={{width: "100%", display: "flex", justifyContent: "space-evenly", marginTop: "20px", alignItems: "flex-start" }}>  
                <div className="rapport2" style={{width: "35%", margin: "20px"}}>
                    <form className="form-rapport" onSubmit={handleGenerateReport}  style={{ width: "100%", boxShadow : "2px 2px 15px #cfcfcf", padding: "20px", borderRadius: "20px"}}>  
                        <h4 style={{fontSize: "18px", marginBottom: "30px", textAlign: "center"}}>Générer un rapport</h4>        
                        <div>
                            <input type="text" placeholder="Rechercher un salon" value={selectedSalon} onChange={(e) => { setSelectedSalon(e.target.value); handleSalonSearch(e.target.value); }} className="input-rapport" />
                            {salonSuggestions.length > 0 && (   
                                <ul style={{border: "1px solid #cfcfcf"}} >{salonSuggestions.map((salon, index) => ( <li style={{background: "white", padding: "5px 10px", borderBottom: "1px solid #cfcfcf", cursor: "pointer"}} key={index} onClick={() => handleSalonSelect(salon)}>{salon}</li> ))}</ul>
                            )}
                        </div>
                        <div>
                            <label style={{marginTop: "10px"}} className="label">Date de début</label>  
                            <input  className='custom-select' type="date" value={startDate} onChange={handleStartDateChange} />
                            <label className="label">Date de fin</label>
                            <input  className='custom-select' type="date" value={endDate} onChange={handleEndDateChange} />
                        </div>
                        <button style={{width: "100%", marginTop: "20px"}} type="submit" className="button-colored">Valider</button>

                        {isFormSubmitted && selectedSalon && startDate && endDate && (
                            <button style={{margin: "20px 0", width: "100%"}} onClick={downloadPDF2} className='button-colored'>Télécharger le rapport des activités du salon</button>
                        )}
                        {isFormSubmitted && selectedSalon && startDate && endDate && (
                            <div  ref={pageRef2} style={{ boxShadow: "2px 2px 15px #cfcfcf", padding: "20px", borderRadius: "20px", width: "100%", marginTop: "20px" }}>
                                <h3 style={{fontSize: "17px", marginBottom: "10px"}}>Rapport du salon {selectedSalon}</h3> 
                                <p style={{fontSize: "14px", color: "#3D9B9B", margin: "5px 0"}}>{salonStatus}</p>
                                <p>Période : Du <strong>{format(parseISO(startDate), "dd MMMM yyyy", { locale: fr })}</strong> au <strong>{format(parseISO(endDate), "dd MMMM yyyy", { locale: fr })}</strong></p>
                                <p style={{ marginTop: "5px"}}>Nombre de visites : <strong>{visitsCount}</strong></p>
                                <div style={{display : "flex"}}>
                                    {visitDates.map((date, index) => (
                                        <p key={index} style={{marginRight: "10px", color: "grey", marginBottom: "5px", fontSize: "14px"}}>{date}</p>
                                    ))}
                                </div>
                                <p>Temps total consacré : <strong>{Math.floor(totalTimeSpent / 60)}</strong> h <strong>{totalTimeSpent % 60}</strong> min</p> 
                            </div>
                        )}
                    </form> 
                    <button style={{margin: "20px 0", width: "100%"}} onClick={downloadPDF} className='button-colored'>Télécharger le rapport mensuel des visites</button>
                </div>
                <div ref={pageRef} className="rapport-month">  
                    <h3 className="rapport-header">Rapport du mois de {moisEnCours}</h3>
                    <div style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center",}}>
                    {monthlyReports.map((report, index) => (
                        <div className="rapport-mensuel-visite" key={index}>
                            <p style={{fontSize: "17px"}}><strong>{report.name}</strong></p> 
                            <p style={{fontSize: "14px", color: "#3D9B9B", margin: "5px 0"}}>{report.status}</p>
                            <div style={{margin: "10px 0"}}>
                                <p>Nombre de visites : <strong>{report.dates.length}</strong></p> 
                                <div style={{display: "flex"}}>
                                    {report.dates.map((date, dateIndex) => (
                                        <p style={{marginRight: "10px", color: "grey", fontSize: "14px"}} key={dateIndex}>{date}</p>
                                    ))}
                                </div>
                            </div>
                            <p>Temps total consacré : <strong>{Math.floor(report.totalMinutes / 60)}</strong> h <strong>{report.totalMinutes % 60}</strong> min</p>
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            
            
        </div>
    )
}

export default RapportMensuelVisites