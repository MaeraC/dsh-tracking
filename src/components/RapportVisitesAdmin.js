import { useState, useEffect } from "react"
import { collection, getDocs, Timestamp } from 'firebase/firestore'
import { db } from "../firebase.config"
import { fr } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';  
import back from "../assets/back.png"

function RapportVisitesAdmin({ onReturn }) {
    const [monthlyReports, setMonthlyReports] = useState([]);
    const [feuillesRoute, setFeuillesRoute] = useState([]);
    // eslint-disable-next-line
    const [searchTerm, setSearchTerm] = useState('');
    const [salonSuggestions, setSalonSuggestions] = useState([]);
    const [selectedSalon, setSelectedSalon] = useState('');
    const [salonStatus, setSalonStatus] = useState("");
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [visitsCount, setVisitsCount] = useState(0);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [usersMap, setUsersMap] = useState({});
    const [userName, setUserName] = useState("");


    useEffect(() => {
        const fetchUsersData = async () => {
            const usersData = {};
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.forEach((doc) => {
                    usersData[doc.id] = doc.data();
                });
                setUsersMap(usersData);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs : ", error);
            }
        };
    
        fetchUsersData();
    }, [])

    useEffect(() => {
        const fetchFeuillesRoute = async () => {
            const feuillesRouteRef = collection(db, 'feuillesDeRoute');
            const querySnapshot = await getDocs(feuillesRouteRef);
            const feuillesRouteData = querySnapshot.docs.map(doc => {
                const feuilleData = doc.data();
                const userName = usersMap[feuilleData.userId]?.firstname + " " + usersMap[feuilleData.userId]?.lastname || "Utilisateur inconnu";
                return {
                    id: doc.id,
                    ...feuilleData,
                    userName
                };
            });
            setFeuillesRoute(feuillesRouteData);
        };

        fetchFeuillesRoute();
    }, [usersMap])

    useEffect(() => {
        generateMonthlyReport();
        // eslint-disable-next-line
    }, [feuillesRoute])

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
        const feuille = feuillesRoute.find((feuille) =>
            feuille.stops.some((stop) => stop.name === salonName)
        );
        if (feuille) {
            const stop = feuille.stops.find((stop) => stop.name === salonName);
            setSalonStatus(stop.status);
        }
        setSalonSuggestions([]);
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
                const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                months[monthKey] = {
                    startOfMonth: firstDayOfMonth,
                    endOfMonth: lastDayOfMonth,
                    stopsByDay: {},
                    totalKmByDay: {}
                };

                const currentDate = new Date(firstDayOfMonth);
                while (currentDate <= lastDayOfMonth) {
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
                    months[monthKey].stopsByDay[dayOfMonth].stops.push({ ...stop, userName: feuille.userName });
                    months[monthKey].totalKmByDay[dayOfMonth] += stop.distance || 0;
                }
            });

            if (isCurrentMonth(months[monthKey].startOfMonth, months[monthKey].endOfMonth)) {
                currentMonth[monthKey] = months[monthKey];
            }
        });

        return currentMonth;
    };

    const isCurrentMonth = (startOfMonth, endOfMonth) => {
        const today = new Date();
        return (
            today >= startOfMonth && today <= endOfMonth
        );
    };

    const currentMonth = groupStopsByMonth();

    const generateMonthlyReport = () => {
        const reports = {};

        Object.keys(currentMonth).forEach(monthKey => {
            const { stopsByDay } = currentMonth[monthKey];
            Object.keys(stopsByDay).forEach(day => {
                stopsByDay[day].stops.slice(0, -1).forEach(stop => {
                    if (!reports[stop.name]) {
                        reports[stop.name] = {
                            status: stop.status,
                            dates: [],
                            totalMinutes: 0,
                            userName: stop.userName
                        };
                    }
                    const visitDate = new Date(currentMonth[monthKey].startOfMonth);
                    visitDate.setDate(parseInt(day, 10));
                    const formattedDate = `${visitDate.getDate().toString().padStart(2, '0')}/${(visitDate.getMonth() + 1).toString().padStart(2, '0')}`;

                    reports[stop.name].dates.push(formattedDate);

                    const arrivalTime = new Date(`1970-01-01T${stop.arrivalTime}:00`);
                    const departureTime = new Date(`1970-01-01T${stop.departureTime}:00`);
                    const timeSpent = (departureTime - arrivalTime) / 60000;
                    reports[stop.name].totalMinutes += timeSpent;
                });
            });
        });

        const formattedReports = Object.keys(reports).map(name => ({
            name,
            status: reports[name].status,
            dates: reports[name].dates,
            totalMinutes: reports[name].totalMinutes,
            userName: reports[name].userName
        }));

        const filteredReports = formattedReports.filter(report =>
            report.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setMonthlyReports(filteredReports);
    };

    const handleGenerateReport = (e) => {
        e.preventDefault();
        setIsFormSubmitted(true);

        const startTimestamp = startDate ? Timestamp.fromDate(new Date(startDate)) : null;
        const endTimestamp = endDate ? Timestamp.fromDate(new Date(endDate)) : null;

        const filteredFeuilles = feuillesRoute.filter(feuille => {
            const feuilleTimestamp = feuille.date;
            return (!startTimestamp || feuilleTimestamp >= startTimestamp) && (!endTimestamp || feuilleTimestamp <= endTimestamp) &&
                feuille.stops.some(stop => stop.name === selectedSalon);
        });

        let visits = 0;
        let totalTime = 0;
        let userName = "";

        filteredFeuilles.forEach(feuille => {
            feuille.stops.forEach(stop => {
                if (stop.name === selectedSalon) {
                    visits++;
                    const arrivalTime = new Date(`1970-01-01T${stop.arrivalTime}:00`);
                    const departureTime = new Date(`1970-01-01T${stop.departureTime}:00`);
                    const timeSpent = (departureTime - arrivalTime) / 60000;
                    totalTime += timeSpent;
                    userName = usersMap[feuille.userId]?.firstname + " " + usersMap[feuille.userId]?.lastname || "Utilisateur inconnu"; 
                }
            });
        });

        setVisitsCount(visits);
        setTotalTimeSpent(totalTime);
        setUserName(userName);
    };

    const moisEnCours = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <div>
            <div className='titre-fiche'> 
                <h1>Rapport des visites réalisées</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div> 
                   
            <div style={{width: "100%", display: "flex", justifyContent: "space-around", marginTop: "20px", alignItems: "flex-start" }}>  
                <div style={{width: "30%", margin: "20px", display: "flex", flexDirection: "column"}}>  
                    <form onSubmit={handleGenerateReport} style={{ width: "100%", boxShadow : "2px 2px 15px #cfcfcf", padding: "20px", borderRadius: "20px", marginBottom: "30px"}}>  
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
                    {isFormSubmitted && selectedSalon && startDate && endDate && (
                        <div style={{ boxShadow: "2px 2px 15px #cfcfcf", padding: "20px", borderRadius: "20px", width: "100%" }}>
                            <h3 style={{fontSize: "17px", marginBottom: "10px"}}>Rapport du salon {selectedSalon}</h3> 
                            <p style={{fontSize: "14px", color: "#3D9B9B", margin: "5px 0"}}>{salonStatus}</p>
                            <p>Période : Du <strong>{format(parseISO(startDate), "dd MMMM yyyy", { locale: fr })}</strong> au <strong>{format(parseISO(endDate), "dd MMMM yyyy", { locale: fr })}</strong></p>
                            <p style={{marginBottom: "5px", marginTop: "5px"}}>Nombre de visites : <strong>{visitsCount}</strong></p>
                            <p style={{marginBottom: "5px"}}>Temps total consacré : <strong>{Math.floor(totalTimeSpent / 60)}</strong> h <strong>{totalTimeSpent % 60}</strong> min</p>
                            <p>VRP : <strong>{userName}</strong></p> 
                        </div>
                    )}
                </div>
                <div style={{width: "70%"}}>  
                    <h3 style={{textAlign: "center", fontSize: "18px", marginBottom: "20px"}}>Rapport du mois de {moisEnCours}</h3>
                    <div style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center",}}>
                    {monthlyReports.map((report, index) => (
                        <div key={index} style={{ margin: '20px', boxShadow: "2px 2px 15px #cfcfcf", padding: "20px", borderRadius: "20px" }}>
                            <p style={{fontSize: "17px"}}><strong>{report.name}</strong></p> 
                            <p style={{fontSize: "14px", color: "#3D9B9B", margin: "5px 0"}}>{report.status}</p>
                            <p style={{margin: "10px 0"}}>Nombre de visites : <strong>{report.dates.length}</strong></p>
                            <p style={{marginBottom: "10px"}}>Temps total consacré : <strong>{Math.floor(report.totalMinutes / 60)}</strong> h <strong>{report.totalMinutes % 60}</strong> min</p>
                            <p>VRP : <strong>{report.userName}</strong></p>
                        </div>
                    ))}
                    </div>
                </div>
                
            </div>

           
            
        </div>
    )
}

export default RapportVisitesAdmin;
