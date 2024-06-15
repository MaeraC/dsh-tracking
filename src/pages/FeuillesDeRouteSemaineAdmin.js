
// fichier FeuillesDeRouteSemaineAdmin.js

import { useState, useEffect } from 'react'
import { db } from '../firebase.config'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import back from "../assets/back.png"

function FeuillesDeRouteSemaineAdmin({ onReturn }) {
    const [feuillesDeRoute, setFeuillesDeRoute] = useState([]);
    const [fdrSemaine, setFdrSemaine] = useState([]);
    const [filteredFeuillesDeRoute, setFilteredFeuillesDeRoute] = useState([]);
    const [filteredSemaine, setFilteredSemaine] = useState([]); 
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isThisWeekOpen, setIsThisWeekOpen] = useState(false);
    const [isThisMonthOpen, setIsThisMonthOpen] = useState(false);
    const [usersMap, setUsersMap] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

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
        const fetchFeuillesDeRoute = async () => {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
            const q = query(feuillesDeRouteRef, orderBy('date'));
            const querySnapshot = await getDocs(q);

            const feuillesDeRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(), 
            }));
            setFeuillesDeRoute(feuillesDeRouteData);
        };
        fetchFeuillesDeRoute();
    }, []);


    useEffect(() => {
        const fetchFeuilleSemaine = async () => {
            const feuillesDeRouteRef = collection(db, 'fdrSemaine');
            const q = query(feuillesDeRouteRef, orderBy('dateSignature')) 
            const querySnapshot = await getDocs(q);

            const feuillesDeRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));  
            setFdrSemaine(feuillesDeRouteData); 
        };
        fetchFeuilleSemaine();
    }, []);

    /*
    const handleSearch = () => {
        let filtered = feuillesDeRoute
    
        // Apply filters based on fdrSemaine if isThisWeekOpen is checked
        if (isThisWeekOpen) {
            filtered = fdrSemaine; // Create a copy of fdrSemaine
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            filtered = filtered.filter(feuille => {
                if (!feuille.date) {
                    return false;
                }
                const feuilleDate = new Date(feuille.date.seconds * 1000);
                return feuilleDate >= start && feuilleDate <= end;
            });
        }

        if (selectedUserId) {
            filtered = filtered.filter(feuille => feuille.userId === selectedUserId);
        }

       
 
        if (isThisMonthOpen) {
            const currentMonth = new Date().getMonth() + 1;
            filtered = filtered.filter(feuille => {
                if (!feuille.date) return false;
                const feuilleDate = new Date(feuille.date.seconds * 1000);
                return feuilleDate.getMonth() + 1 === currentMonth;
            });
        }

    setFilteredFeuillesDeRoute(filtered);
        setFilteredSemaine(filtered)
    };*/

    const handleSearch = () => {
        if (isThisWeekOpen) {
            // Filtrer uniquement les données de fdrSemaine
            let filtered = fdrSemaine.slice(); // Copier le tableau fdrSemaine

            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                filtered = filtered.filter(feuille => {
                    if (!feuille.dateSignature) {
                        return false;
                    }
                    const feuilleDate = new Date(feuille.dateSignature.seconds * 1000);
                    return feuilleDate >= start && feuilleDate <= end;
                });
            }

            if (selectedUserId) {
                filtered = filtered.filter(feuille => feuille.userId === selectedUserId);
            }

            setFilteredSemaine(filtered);
        } else {
            // Filtrer les données de feuillesDeRoute
            let filtered = feuillesDeRoute.slice(); // Copier le tableau feuillesDeRoute

            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                filtered = filtered.filter(feuille => {
                    if (!feuille.date) {
                        return false;
                    }
                    const feuilleDate = new Date(feuille.date.seconds * 1000);
                    return feuilleDate >= start && feuilleDate <= end;
                });
            }

            if (selectedUserId) {
                filtered = filtered.filter(feuille => feuille.userId === selectedUserId);
            }

            if (isThisMonthOpen) {
                const currentMonth = new Date().getMonth() + 1;
                filtered = filtered.filter(feuille => {
                    if (!feuille.date) return false;
                    const feuilleDate = new Date(feuille.date.seconds * 1000);
                    return feuilleDate.getMonth() + 1 === currentMonth;
                });
            }

            setFilteredFeuillesDeRoute(filtered);
        }}

    const handleSearchTermChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 0) {
            const matchingUsers = Object.keys(usersMap).filter(key => {
                const user = usersMap[key];
                const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
                return fullName.includes(term.toLowerCase());
            }).map(key => ({ id: key, ...usersMap[key] }));
            setSuggestions(matchingUsers);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (user) => {
        setSearchTerm(`${user.firstname} ${user.lastname}`);
        setSelectedUserId(user.id);
        setShowSuggestions(false);
    };

    const formatDate = (date) => {
        if (!date || !date.seconds) {
            return 'Date non disponible';
        }
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        const d = new Date(date.seconds * 1000);
        const dayName = days[d.getUTCDay()];
        const day = d.getUTCDate();
        const month = months[d.getUTCMonth()];
        const year = d.getUTCFullYear();

        return `${dayName} ${day} ${month} ${year}`;
    };

    return (
        <div className="feuilles-de-route-section fdr-section-admin">
            <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            <header>
                <h1>Feuilles de route</h1>
            </header>
            <div className='content'>
                <div className='search'>
                    <label>Recherche par nom ou prénom</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        placeholder="Recherche par nom ou prénom"
                    />
                    {showSuggestions && (
                        <ul className="suggestions-list">
                            {suggestions.map(user => (
                                <li key={user.id} onClick={() => handleSuggestionClick(user)}>
                                    {user.firstname} {user.lastname}
                                </li>
                            ))}
                        </ul>
                    )}

                    <label>Date de début</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

                    <label>Date de fin</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                    <div className="checkbox-group margin">
                        <label>
                            <input
                                type="checkbox"
                                className='checkbox'
                                checked={isThisWeekOpen}
                                onChange={(e) => setIsThisWeekOpen(e.target.checked)}
                            />
                            Feuilles de route de la semaine
                        </label><br></br>
                        <label>
                            <input
                                type="checkbox"
                                className='checkbox'
                                checked={isThisMonthOpen}
                                onChange={(e) => setIsThisMonthOpen(e.target.checked)}
                            />
                            Feuilles de route du mois
                        </label>
                    </div>

                    <button className='button-colored' onClick={handleSearch}>Rechercher</button>
                </div>

                <div className='results'>
                    {filteredFeuillesDeRoute.length > 0 ? (
                        filteredFeuillesDeRoute.map(feuille => (
                            <div className='feuille-jj' key={feuille.id}>
                                <p className='date'>{formatDate(feuille.date)}</p>
                                {feuille.isVisitsStarted ? (
                                    <>
                                        <p><strong>Ville</strong> : {feuille.city}</p>
                                        <p><strong>Distance totale</strong> : {feuille.totalKm} {feuille.unitTotalKm}</p>
                                        <p><strong>Visites</strong> :</p>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <td>Nom</td>
                                                    <td>Distance</td>
                                                    <td>Status</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {feuille.stops.map((stop, index) => (
                                                    <tr key={index}>
                                                        <td>{stop.name}</td>
                                                        <td>{stop.distance.toFixed(2)}{stop.unitDistance}</td>
                                                        <td>{stop.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <p className='vrp'><strong>Commercial</strong> : {usersMap[feuille.userId]?.lastname} {usersMap[feuille.userId]?.firstname}</p>
                                        <p style={{marginBottom: "20px",  fontSize: "15px"}}>Clôturée le : {formatDate(feuille.date)}</p>
                                        <img src={feuille.signature} width={120} alt="" />   
                                        
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Visites effectuées</strong> : {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                        <p><strong>Motif de non-visite</strong> : {feuille.motifNoVisits}</p>
                                        <p className='vrp'><strong>Commercial</strong> : {usersMap[feuille.userId]?.lastname} {usersMap[feuille.userId]?.firstname}</p>
                                        <p style={{marginBottom: "20px", fontSize: "15px"}}>Clôturée le : {formatDate(feuille.date)}</p>
                                        <img src={feuille.signature} width={120} alt="" />   
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className='none-fdr'></p>
                    )}

                      
                
                    <div className="feuilles-de-route-list">
                    {filteredSemaine.length > 0 ? (
                        filteredSemaine.map(feuille => ( 
                            <div key={feuille.id} className="this-week">  
                                <h2 style={{textAlign: "center"}}>Semaine du {formatDate(feuille.dateSignature)}</h2>
                                <div className="dayOn-section">
                                    {feuille.dayOn && feuille.dayOn.length > 0 && (
                                        <div className='feuille-jj'>
                                            
                                            {feuille.dayOn.map((day, index) => (  
                                                <div key={index}>
                                                    <p className='date'>{formatDate(day.date)}</p>  
                                                    <p><strong>Ville</strong> : {day.city}</p>
                                                    <p><strong>Distance totale</strong> : {day.totalKm.toFixed(2)}{day.unitTotalKm}</p>
                                                    <p><strong>Visites</strong> :</p>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <td>Nom</td>
                                                                <td>Distance</td>
                                                                <td>Status</td>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {day.stops.map((stop, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{stop.name}</td>
                                                                    <td>{stop.distance.toFixed(2)}{stop.unitDistance}</td>
                                                                    <td>{stop.status}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="dayOff-section">
                                    {feuille.dayOff && feuille.dayOff.length > 0 && (
                                        <div>
                                            {feuille.dayOff.map((day, index) => (
                                                 
                                                <div className='feuille-jj' key={index}>
                                                    <p className='date'>{formatDate(day.date)}</p>
                                                    <p>Visites effectuées : Non</p>
                                                    <p>Motif de non-visite : {day.motifNoVisits}</p>
                                                </div>
                                            ))}
                                        </div>    
                                    )}
                                </div>
                                <div className='signature-draw'>
                                    <img src={feuille.signature} alt="" />
                                    <p>Signé le : {formatDate(feuille.dateSignature)}</p>
                                    <p className='vrp'><strong>Commercial</strong> : {usersMap[feuille.userId]?.lastname} {usersMap[feuille.userId]?.firstname}</p>
                                        
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                        
                        </> 
                    )}
                </div>
                
                
                
                </div>
            </div>
        </div>
    );
}

export default FeuillesDeRouteSemaineAdmin;
