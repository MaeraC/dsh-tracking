
// fichier SearchFeuillesDuJour.js

import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import FeuillesHebdoAdmin from './FeuillesHebdoAdmin';
import FeuillesMensuellesAdmin from './FeuillesMensuellesAdmin';

function SearchFeuillesDuJour() {
    const [feuillesDeRoute, setFeuillesDeRoute] = useState([]);
    const [usersMap, setUsersMap] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showResults, setShowResults] = useState(false); 
    const [nombreVisites, setNombreVisites] = useState(0);
    const [nombreVisitesClient, setNombreVisitesClient] = useState(0);
    const [nombreVisitesProspect, setNombreVisitesProspect] = useState(0);
    const [format, setFormat] = useState('')
    const [selectedMonthYear, setSelectedMonthYear] = useState('')



    // récupère le nom des users
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
    }, []);

    useEffect(() => {
        /*
        if (!selectedUser  || !startDate || !endDate ) {   
            setFeuillesDeRoute([]);
            setNombreVisites(0);
            setNombreVisitesClient(0);
            setNombreVisitesProspect(0);
            return;
        }

        const fetchFeuillesDeRoute = async () => {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
            const startTimestamp = Timestamp.fromDate(new Date(startDate));
            const endTimestamp = Timestamp.fromDate(new Date(endDate)); 
            const q = query(feuillesDeRouteRef, 
                where('userId', '==', selectedUser.userId),
                where('date', '>=', startTimestamp),
                where('date', '<=', endTimestamp)
            )
    
            try {
                const querySnapshot = await getDocs(q) 
                if (!querySnapshot.empty) {
                    const feuilles = querySnapshot.docs.map(doc => doc.data());
                    setFeuillesDeRoute(feuilles)
                    calculateVisites(feuilles);
                } else {
                    setFeuillesDeRoute([]); 
                    setNombreVisites(0);
                    setNombreVisitesClient(0);
                    setNombreVisitesProspect(0);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des feuilles de route : ", error);
            }
        };*/

        if (!selectedUser || (!startDate && !endDate && !selectedMonthYear)) {
            setFeuillesDeRoute([]);
            setNombreVisites(0);
            setNombreVisitesClient(0);
            setNombreVisitesProspect(0);
            return;
        }
    
        const fetchFeuillesDeRoute = async () => {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
    
            let q = query(feuillesDeRouteRef, where('userId', '==', selectedUser.userId));
    
            if (startDate && endDate) {
                const startTimestamp = Timestamp.fromDate(new Date(startDate));
                const endTimestamp = Timestamp.fromDate(new Date(endDate));
                q = query(q, where('date', '>=', startTimestamp), where('date', '<=', endTimestamp));
            } else if (selectedMonthYear) {
                const [selectedYear, selectedMonth] = selectedMonthYear.split('-').map(Number);
                const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
                const endOfMonth = new Date(selectedYear, selectedMonth, 0); // Dernier jour du mois
                const startTimestamp = Timestamp.fromDate(startOfMonth);
                const endTimestamp = Timestamp.fromDate(endOfMonth);
                q = query(q, where('date', '>=', startTimestamp), where('date', '<=', endTimestamp));
            }
    
            try {
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const feuilles = querySnapshot.docs.map(doc => doc.data());
                    setFeuillesDeRoute(feuilles);
                    calculateVisites(feuilles);
                } else {
                    setFeuillesDeRoute([]);
                    setNombreVisites(0);
                    setNombreVisitesClient(0);
                    setNombreVisitesProspect(0);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des feuilles de route : ", error);
            }
        }; 
    
        fetchFeuillesDeRoute();
        // eslint-disable-next-line
    }, [selectedUser, startDate, endDate, showResults, selectedMonthYear])
    console.log(feuillesDeRoute) 

    const formatTimestamp = (timestamp) => {
        if (!timestamp) {
            return ''; 
        }
        const dateObject = timestamp.toDate();
        return dateObject.toLocaleDateString(); 
    };

    const getNombreDeVisites = (stops) => {
        return stops.length > 1 ? stops.length - 1 : 0
    }
    const countVisitesByStatus = (stops, status) => {
        return stops.filter(stop => stop.status === status).length 
    }
    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    }

    const handleUserSearch = (event) => {
        const { value } = event.target;
        setSearchTerm(value);

        // Filter users based on search term and role
        const filtered = Object.values(usersMap).filter(user =>
            user.role === 'commercial' &&
            (user.firstname.toLowerCase().includes(value.toLowerCase()) ||
             user.lastname.toLowerCase().includes(value.toLowerCase()))
        );

        setFilteredUsers(filtered);
    };

    const handleUserSelection = (user) => {
        setSelectedUser(user);
        setSearchTerm(`${user.firstname} ${user.lastname}`)
        setFilteredUsers([]);
    };

    const handleStartDateChange = (event) => {
        const { value } = event.target;
    setStartDate(value);
    };

    const handleEndDateChange = (event) => {
        const { value } = event.target;
        setEndDate(value);
    };

    const calculateVisites = (feuilles) => {
        let totalVisites = 0;
        let totalVisitesClient = 0;
        let totalVisitesProspect = 0;

        feuilles.forEach(feuille => {
            const stops = feuille.stops || [];
            totalVisites += stops.length > 1 ? stops.length - 1 : 0;

            totalVisitesClient += stops.filter(stop => stop.status === 'Client').length;
            totalVisitesProspect += stops.filter(stop => stop.status === 'Prospect').length;
        });

        setNombreVisites(totalVisites);
        setNombreVisitesClient(totalVisitesClient);
        setNombreVisitesProspect(totalVisitesProspect);
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    const handleFormatChange = (event) => { 
        setFormat(event.target.value);
    };

    // Fonction pour gérer la sélection du mois
    const handleMonthChange = (event) => {
        setShowResults(true);
        const newMonthYear = event.target.value;
        setSelectedMonthYear(newMonthYear);
    };

    return (
        <div  className='filter-feuilles filter-feuilles-admin' style={{marginTop: "30px", padding: "0 20px"}}>
            <div  className='filters filters-admin'>
                <div className='filters-input-admin'>
                    <div className='input-admin'>
                        <label  className='label'>Rechercher un VRP</label><br></br>
                        <input type="text" placeholder="Prénom Nom" value={searchTerm} onChange={handleUserSearch} />
                        <ul>
                            {filteredUsers.map(user => (
                                <li key={user.userId} onClick={() => handleUserSelection(user)}>
                                    {user.firstname} {user.lastname}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='input-admin'>
                        <label  className='label'>Date de début </label><br></br>
                        <input type="date" value={startDate} onChange={handleStartDateChange} />
                    </div>
                    <div className='input-admin'>
                        <label className='label'>Date de fin </label><br></br>
                        <input type="date" value={endDate} onChange={handleEndDateChange} />
                    </div>
                    <div className='input-admin'>
                        <label className='label'>Sélectionner un mois</label><br></br>
                        <input type="month" value={selectedMonthYear} onChange={handleMonthChange} />
                    </div>
                    <div className='input-admin' style={{alignSelf: "center"}}> 
                        <div>
                            <input type="radio" id="daily" name="format" value="daily" checked={format === 'daily'} onChange={handleFormatChange} className='checkbox' />
                            <label>Feuilles journalières</label>
                        </div><br></br>
                        <div>
                            <input type="radio" className='checkbox' id="weekly" name="format" value="weekly" checked={format === 'weekly'} onChange={handleFormatChange} />
                            <label>Feuilles hebdomadaires</label>
                        </div><br></br>
                    </div>
                </div>
               
                <button onClick={handleSubmit} className='button-colored'>Valider</button>
            </div>

            {showResults && (
                <div  className='filter-feuilles-stats' style={{marginBottom: "20px"}}>  
                    <p><strong>Nombre de visites</strong><span>{nombreVisites}</span></p>
                    <p><strong>Visites client</strong><span>{nombreVisitesClient}</span></p>
                    <p><strong>Visites prospect</strong><span>{nombreVisitesProspect}</span></p>
                </div>
            )}
 
            {showResults && format === 'daily' && feuillesDeRoute.length > 0 && (
                <div className="content"> 
                {feuillesDeRoute.map((feuille, index) => (
                    <div key={index} className='feuille-du-jour  feuille-this-filter'>
                        <h3 style={{textAlign: "center", marginBottom: "20px"}}>Feuille du {feuille.date ? formatTimestamp(feuille.date) : "Date non disponible"}</h3>
                        {feuille.stops && feuille.stops.map((stop, idx) => (
                            <>
                            {idx < feuille.stops.length - 1 ? (
                                <p style={{ background: "white", display: "inline-block", padding: "5px", marginTop: "20px" }}><strong>Visite n°{idx + 1}</strong></p>
                            ) : (
                                <p style={{ background: "white", display: "inline-block", padding: "5px", marginTop: "20px" }}><strong>Retour</strong></p>
                            )}
                            <div className='visites' key={idx}>
                            {stop.name && (
                                    <div>
                                        <p className='titre'>Nom</p>
                                        <p className='texte'>{stop.name}</p>
                                    </div>
                                )}
                                {stop.status && (
                                    <div>
                                        <p className='titre'>Statut</p>
                                        <p className='texte'>{stop.status}</p>
                                    </div>
                                )}
                                {stop.address && (
                                    <div>
                                        <p className='titre'>Adresse</p>
                                        <p className='texte'>{stop.address}</p>
                                    </div>
                                )}
                                {stop.postalCode && stop.city && (
                                    <div>
                                        <p className='titre'>Ville</p>
                                        <p className='texte'>{stop.postalCode} {stop.city}</p>
                                    </div>
                                )}
                                {stop.distance !== undefined && (
                                    <div>
                                        <p className='titre'>Km parcourus</p>
                                        <p className='texte'>{formatDistance(stop.distance)}</p>
                                    </div>
                                )}
                                {stop.arrivalTime && (
                                    <div>
                                        <p className='titre'>Heure d'arrivée</p>
                                        <p className='texte'>{stop.arrivalTime}</p>
                                    </div>
                                )}
                                {stop.departureTime && (
                                    <div>
                                        <p className='titre'>Heure de départ</p>
                                        <p className='texte'>{stop.departureTime}</p>
                                    </div>
                                )}
                            </div>
                            </>
                        ))}

                        <p style={{ marginTop: "20px" }}><strong>Total de la distance parcourue </strong>: {formatDistance(feuille.totalKm)}</p>
                        <p style={{ marginTop: "5px" }}><strong>Total des visites effectuées </strong>: {getNombreDeVisites(feuille.stops || [])}</p>
                        <p style={{ marginTop: "5px" }}><strong>Visites client </strong>: {countVisitesByStatus(feuille.stops || [], 'Client')}</p>
                        <p style={{ marginTop: "5px" }}><strong>Visites prospect </strong>: {countVisitesByStatus(feuille.stops || [], 'Prospect')}</p>
                        <p style={{ marginTop: "20px" }}>Validé le {feuille.signatureDate}</p>
                    </div>
                ))} 
                </div>
            )}

            {showResults && format === 'weekly' && feuillesDeRoute.length > 0 && (
                <FeuillesHebdoAdmin feuillesDeRoute={feuillesDeRoute} startDate={startDate} endDate={endDate} />
            )}

            {showResults  && selectedMonthYear && selectedUser && (
                <FeuillesMensuellesAdmin feuillesDeRoute={feuillesDeRoute} selectedMonthYear={selectedMonthYear} selectedUser={selectedUser} />
            )}
        </div>
    )
}

export default SearchFeuillesDuJour