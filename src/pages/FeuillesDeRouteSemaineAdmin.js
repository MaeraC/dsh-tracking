
// fichier FeuillesDeRouteSemaineAdmin.js

import { useState, useEffect } from 'react'
import { db } from '../firebase.config'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import back from "../assets/back.png"

function FeuillesDeRouteSemaineAdmin({ onReturn }) {
    const [fdrSemaine, setFdrSemaine] = useState([]);
    const [feuillesDeRoute, setFeuillesDeRoute] = useState([]);
    const [filteredSemaine, setFilteredSemaine] = useState([]); 
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(''); 
    const [filteredFeuilles, setFilteredFeuilles] = useState([]);
    const [isThisMonthOpen, setIsThisMonthOpen] = useState(false);
    const [usersMap, setUsersMap] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isFeuilleDuJourChecked, setIsFeuilleDuJourChecked] = useState(false); 


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
        if (isThisWeekOpen) {
            let filtered = fdrSemaine.slice()

            if (isThisMonthOpen) {
                const currentMonth = new Date().getMonth() + 1;
                filtered = filtered.filter(feuille => {
                    if (!feuille.date) return false;
                    const feuilleDate = new Date(feuille.dateSignature.seconds * 1000);
                    return feuilleDate.getMonth() + 1 === currentMonth;
                });
            }

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
    }}*/

            const handleSearch = async () => {
                let filtered;
                if (isFeuilleDuJourChecked) {
                    // Utiliser la collection feuillesDeRoute si la checkbox est cochée
                    filtered = feuillesDeRoute.slice();
                } else {
                    // Utiliser la collection fdrSemaine par défaut si la checkbox n'est pas cochée
                    filtered = fdrSemaine.slice();
                } // Utilisation des données de fdrSemaine pour le filtrage
        
                if (isThisMonthOpen) {
                    const currentMonth = new Date().getMonth() + 1;
                    filtered = filtered.filter(feuille => {
                        if (!feuille.dateSignature) {
                            return false;
                        }
                        const feuilleDate = new Date(feuille.dateSignature.seconds * 1000);
                        return feuilleDate.getMonth() + 1 === currentMonth;
                    });
                }
        
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
        
                    filtered = filtered.filter(feuille => {
                        if (isFeuilleDuJourChecked) {
                            // Utiliser feuillesDeRoute
                            if (!feuille.date) {
                                return false;
                            }
                            const feuilleDate = new Date(feuille.date.seconds * 1000);
                            return feuilleDate >= start && feuilleDate <= end;
                        } else {
                            // Utiliser fdrSemaine
                            if (!feuille.dateSignature) {
                                return false;
                            }
                            const feuilleDate = new Date(feuille.dateSignature.seconds * 1000);
                            return feuilleDate >= start && feuilleDate <= end;
                        }
                    });
                }
        
                if (searchTerm.trim() !== '') {
                    // Filtrage par nom ou prénom
                    filtered = filtered.filter(feuille => {
                        const user = usersMap[feuille.userId];
                        if (!user) return false;
                        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
                        return fullName.includes(searchTerm.trim().toLowerCase());
                    });
                }
        
                if (!isFeuilleDuJourChecked) {
                    // Filtrer les feuilles de route de la semaine spécifiquement si la checkbox n'est pas cochée
                    setFilteredSemaine(filtered);
                } else {
                    // Sinon, filtrer les feuilles de route de la collection feuillesDeRoute
                    setFilteredFeuilles(filtered);
                }
            };

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
        //setSelectedUserId(user.id);
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
    }
    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    }

    return (
        <div className="feuilles-de-route-section fdr-section-admin">
            <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            <header>
                <h1>Feuilles de route</h1>
            </header>
            <div className='content'>
                <div className='search'>
                    <label>Filtres</label>
                    <input
                    className='input-filter'
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
                    <input className='custom-select' type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

                    <label>Date de fin</label>
                    <input className='custom-select' type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                    <div className="checkbox-group margin">
                    <label className='input'>
                        <input
                        type="checkbox"
                        className='checkbox'
                        checked={isFeuilleDuJourChecked}
                        onChange={(e) => setIsFeuilleDuJourChecked(e.target.checked)}
                        />
                        Feuille du jour de cette semaine
                    </label>
                        <label  className='input'>
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
                {/* Affichage des résultats filtrés */}
                {isFeuilleDuJourChecked ? (
                    // Affichage des feuilles de route de la collection feuillesDeRoute si la checkbox est cochée
                    filteredFeuilles.length > 0 ? (
                        filteredFeuilles.map(feuille => (
                            <div className='feuille-jj' key={feuille.id}>
                                <p className='date'>{formatDate(feuille.date)}</p>
                                {feuille.isVisitsStarted ? (
                                    <>
                                        <p><strong>Ville</strong> : {feuille.city}</p>
                                        <p><strong>Distance totale</strong> : {formatDistance(feuille.totalKm)}</p>
                                        <p><strong>Visites</strong> :</p>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <td>Nom</td>
                                                    <td>Adresse</td>
                                                    <td>Code postal</td>
                                                    <td>Distance</td>
                                                    <td>Heure d'arrivée</td>
                                                    <td>Heure de départ</td>
                                                    <td>Status</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {feuille.stops.map((stop, index) => (
                                                    <tr key={index}>
                                                        <td>{stop.name}</td>
                                                        <td>{stop.address}</td>
                                                        <td>{stop.postalCode}{stop.city}</td>
                                                        <td>{formatDistance(stop.distance)}</td>
                                                        <td>{stop.arrivalTime}</td>
                                                        <td>{stop.departureTime}</td>
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
                        <p className='none-fdr'>Aucune feuille de route trouvée.</p>
                    )
                ) : (
                    // Affichage des feuilles de route de la semaine si la checkbox n'est pas cochée
                    filteredSemaine.length > 0 ? (
                        filteredSemaine.map(feuille => (
                            <div key={feuille.id} className="this-week">
                                <h2 style={{textAlign: "center"}}>Semaine du {formatDate(feuille.dateSignature)}</h2>
                                <div className="dayOn-section">
                                    {feuille.dayOn && feuille.dayOn.length > 0 && (
                                        <div className='feuille-jj ad'>
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
                                                                <td>Adresse</td>
                                                                <td>Code postal</td>
                                                                <td>Distance</td>
                                                                <td>Heure d'arrivée</td>
                                                                <td>Heure de départ</td>
                                                                <td>Status</td>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {day.stops.map((stop, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{stop.name}</td>
                                                                    <td>{stop.address}</td>
                                                                    <td>{stop.postalCode}{stop.city}</td>
                                                                    <td>{formatDistance(stop.distance)}</td>
                                                                    <td>{stop.arrivalTime}</td>
                                                        <td>{stop.departureTime}</td>
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
                        <p className='none-fdr'>Aucune feuille de route trouvée.</p>
                    )
                )}
            </div>

                </div>

                
        </div>
    );
}

export default FeuillesDeRouteSemaineAdmin;
