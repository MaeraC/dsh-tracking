
// fichier RapportMensuelVisites.js

import { useState, useEffect }                                             from "react"
import { collection, getDocs, query, where , Timestamp} from 'firebase/firestore'
import { db } from "../firebase.config"
import { fr } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';  
import back from "../assets/back.png"
//import back from "../assets/back.png"
//import jsPDF from "jspdf";   
//import html2canvas from "html2canvas";

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
            feuille.stops.slice(0, -1).map((stop) => stop.name)
          )
          .flat()
          .filter(
            (name, index, self) =>
              name.toLowerCase().includes(inputValue.toLowerCase()) &&
              self.indexOf(name) === index
          );
    
        setSalonSuggestions(filteredSalons);
    };

    const handleSalonSelect = (salonName) => {
        setSelectedSalon(salonName);
        // Rechercher le statut du salon sélectionné
        const feuille = feuillesRoute.find((feuille) =>
            feuille.stops.some((stop) => stop.name === salonName)
        );
        if (feuille) {
            const stop = feuille.stops.find((stop) => stop.name === salonName);
            setSalonStatus(stop.status);
        }
        setSalonSuggestions([])
    };

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const groupStopsByMonth = () => {
        const currentMonth = {};
        const months = {};

        feuillesRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000);
            const monthKey = `${date.getFullYear()}_${date.getMonth()}`;

            if (!months[monthKey]) {
                // Création de la structure pour le mois
                const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

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

            feuille.stops.forEach(stop => {
                const dayOfMonth = new Date(feuille.date.seconds * 1000).getDate();
                if (months[monthKey].stopsByDay.hasOwnProperty(dayOfMonth)) {
                    months[monthKey].stopsByDay[dayOfMonth].stops.push({ ...stop });
                    months[monthKey].totalKmByDay[dayOfMonth] += stop.distance || 0;
                }
            });

            // Vérifier si la feuille appartient au mois en cours
            if (isCurrentMonth(months[monthKey].startOfMonth, months[monthKey].endOfMonth)) {
                currentMonth[monthKey] = months[monthKey];
            }
        });

        return currentMonth;
    }

    const isCurrentMonth = (startOfMonth, endOfMonth) => {
        const today = new Date();
        return (
            today >= startOfMonth && today <= endOfMonth
        );
    }

    const currentMonth = groupStopsByMonth()

    const generateMonthlyReport = () => {
        const reports = {};

        Object.keys(currentMonth).forEach(monthKey => {
            const { stopsByDay } = currentMonth[monthKey];
            Object.keys(stopsByDay).forEach(day => {
                stopsByDay[day].stops.slice(0, -1).forEach(stop => {  // Ignore the last stop of each day
                    if (!reports[stop.name]) {
                        reports[stop.name] = {
                            status: stop.status,
                            dates: [],
                            totalMinutes: 0
                        };
                    }
                    const visitDate = new Date(currentMonth[monthKey].startOfMonth);
                    visitDate.setDate(parseInt(day, 10));
                    const formattedDate = `${visitDate.getDate().toString().padStart(2, '0')}/${(visitDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
                    reports[stop.name].dates.push(formattedDate);
    
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
        }));

        // Filtrer les résultats en fonction du terme de recherche
        const filteredReports = formattedReports.filter(report =>
            report.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setMonthlyReports(filteredReports);
    };

    const handleGenerateReport = (e) => {
        e.preventDefault(); // Empêcher le rechargement de la page par défaut
        setIsFormSubmitted(true); // Marquer le formulaire comme soumis

        // Convertir les dates en Timestamp pour la comparaison avec les Timestamp de Firebase
        const startTimestamp = startDate ? Timestamp.fromDate(new Date(startDate)) : null;
        const endTimestamp = endDate ? Timestamp.fromDate(new Date(endDate)) : null;

        // Filtrer les feuilles de route pour la période et le salon sélectionnés
        const filteredFeuilles = feuillesRoute.filter(feuille => {
            const feuilleTimestamp = feuille.date;
            return (!startTimestamp || feuilleTimestamp >= startTimestamp) && (!endTimestamp || feuilleTimestamp <= endTimestamp) &&
                feuille.stops.some(stop => stop.name === selectedSalon);
        });

        // Calculer le nombre de visites et le temps total passé
        let visits = 0;
        let totalTime = 0;

        filteredFeuilles.forEach(feuille => {
            feuille.stops.forEach(stop => {
                if (stop.name === selectedSalon) {
                    visits++;
                    const arrivalTime = new Date(`1970-01-01T${stop.arrivalTime}:00`);
                    const departureTime = new Date(`1970-01-01T${stop.departureTime}:00`);
                    const timeSpent = (departureTime - arrivalTime) / 60000; // Temps en minutes
                    totalTime += timeSpent;
                }
            });
        });

        setVisitsCount(visits);
        setTotalTimeSpent(totalTime);
    };

    const moisEnCours = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <div>
            <div className='titre-fiche'> 
                <h1>Rapport des visites réalisées</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>
                   
            <div style={{display: "flex", justifyContent: "space-around", marginTop: "20px", alignItems: "flex-start" }}>  
                <form onSubmit={handleGenerateReport}  style={{width: "30%", margin: "20px", boxShadow : "2px 2px 15px #cfcfcf", padding: "20px", borderRadius: "20px"}}>  
                    <h4 style={{fontSize: "18px", marginBottom: "30px", textAlign: "center"}}>Générer un rapport</h4>        
                    <div>
                        <input type="text" placeholder="Rechercher un salon" value={selectedSalon} onChange={(e) => { setSelectedSalon(e.target.value); handleSalonSearch(e.target.value); }} className="input-rapport" />
                        {salonSuggestions.length > 0 && (   
                            <ul style={{border: "1px solid #cfcfcf"}} >{salonSuggestions.map((salon, index) => ( <li style={{background: "white", padding: "5px 10px", borderBottom: "1px solid #cfcfcf", cursor: "pointer"}} key={index} onClick={() => handleSalonSelect(salon)}>{salon}</li> ))}</ul>
                        )}
                    </div>
                    <div>
                        <label style={{marginTop: "10px"}} className="label">Date de début</label>  
                        <input type="date" value={startDate} onChange={handleStartDateChange} />
                        <label className="label">Date de fin</label>
                        <input type="date" value={endDate} onChange={handleEndDateChange} />
                    </div>
                    <button style={{width: "100%", marginTop: "20px"}} type="submit" className="button-colored">Valider</button>
                </form>

                <div style={{width: "70%", marginLeft: "50px",}}>  
                    <h3 style={{textAlign: "center", fontSize: "18px", marginBottom: "20px"}}>Rapport du mois de {moisEnCours}</h3>
                    <div style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center",}}>
                    {monthlyReports.map((report, index) => (
                        <div key={index} style={{ margin: '20px', boxShadow: "2px 2px 15px #cfcfcf", padding: "20px", borderRadius: "20px" }}>
                            <p style={{fontSize: "17px"}}><strong>{report.name}</strong></p> 
                            <p style={{fontSize: "14px", color: "#3D9B9B", margin: "5px 0"}}>{report.status}</p>
                            <div style={{margin: "10px 0"}}>
                                <p>Nombre de visites : <strong>{report.dates.length}</strong></p> 
                            </div>
                            <p>Temps total consacré : <strong>{Math.floor(report.totalMinutes / 60)}</strong> h <strong>{report.totalMinutes % 60}</strong> min</p>
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            {isFormSubmitted && selectedSalon && startDate && endDate && (
                <div style={{ margin: '20px', boxShadow: "2px 2px 15px #cfcfcf", padding: "20px", borderRadius: "20px", width: "30%" }}>
                    <h3 style={{fontSize: "17px", marginBottom: "10px"}}>Rapport du salon {selectedSalon}</h3> 
                    <p style={{fontSize: "14px", color: "#3D9B9B", margin: "5px 0"}}>{salonStatus}</p>
                    <p>Période : Du <strong>{format(parseISO(startDate), "dd MMMM yyyy", { locale: fr })}</strong> au <strong>{format(parseISO(endDate), "dd MMMM yyyy", { locale: fr })}</strong></p>
                    <p style={{marginBottom: "5px", marginTop: "5px"}}>Nombre de visites : <strong>{visitsCount}</strong></p>
                    <p>Temps total consacré : <strong>{Math.floor(totalTimeSpent / 60)}</strong> h <strong>{totalTimeSpent % 60}</strong> min</p> 
                </div>
            )}
            
        </div>
    )

}

export default RapportMensuelVisites