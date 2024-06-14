
// fichier FeuillesDeRouteSemaineAdmin.js

import { useState, useEffect } from 'react'
import { db } from '../firebase.config'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import back from "../assets/back.png"

function FeuillesDeRouteSemaineAdmin({ onReturn }) {
    const [feuillesDeRoute, setFeuillesDeRoute] = useState([]);
    const [filteredFeuillesDeRoute, setFilteredFeuillesDeRoute] = useState([]);
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

    const handleSearch = () => {
        let filtered = feuillesDeRoute;

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

        if (isThisWeekOpen) {
            const currentWeek = getWeek(new Date());
            filtered = filtered.filter(feuille => {
                if (!feuille.date) return false;
                const feuilleDate = new Date(feuille.date.seconds * 1000);
                return getWeek(feuilleDate) === currentWeek;
            });
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
    };

    const getWeek = (date) => {
        const dayOfWeek = date.getDay();
        const firstDayOfWeek = new Date(date);
        firstDayOfWeek.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        const onejan = new Date(firstDayOfWeek.getFullYear(), 0, 1);
        return Math.ceil((((firstDayOfWeek - onejan) / 86400000) + onejan.getDay() + 1) / 7);
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
        <div className="feuilles-de-route-section">
            <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            <header>
                <h1>Feuilles de route</h1>
            </header>

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

                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={isThisWeekOpen}
                            onChange={(e) => setIsThisWeekOpen(e.target.checked)}
                        />
                        Feuilles de route de la semaine
                    </label>
                    <label>
                        <input
                            type="checkbox"
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
                                    <p><strong>Commercial</strong> : {usersMap[feuille.userId]?.lastname} {usersMap[feuille.userId]?.firstname}</p>
                                </>
                            ) : (
                                <>
                                    <p>Visites commencées : {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                    <p>Motif de non-visite : {feuille.motifNoVisits}</p>
                                    <p><strong>Commercial</strong> : {usersMap[feuille.userId]?.lastname} {usersMap[feuille.userId]?.firstname}</p>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Aucune feuille de route trouvée pour les critères sélectionnés.</p>
                )}
            </div>
        </div>
    );
}

export default FeuillesDeRouteSemaineAdmin;

/*
function FeuillesDeRouteSemaineAdmin({ onReturn }) {

    const [feuillesDeRoute, setFeuillesDeRoute] = useState([])
    const [filteredFeuillesDeRoute, setFilteredFeuillesDeRoute] = useState([])
    const [selectedPeriod, setSelectedPeriod] = useState([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isThisWeekOpen, setisThisWeekOpen] = useState(false)
    const [isSelectedPeriodShown, setIsSelectedPeriodShown] = useState(false)
    const [isThisMonthOpen, setIsThisMonthOpen] = useState(false);
    const [monthlyFeuillesDeRoute, setMonthlyFeuillesDeRoute] = useState([]); 
    const [usersMap, setUsersMap] = useState({})
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showFilteredUsers, setShowFilteredUsers] = useState(false);
    const [isMonthlyChecked, setIsMonthlyChecked] = useState(false);
    const [isWeeklyChecked, setIsWeeklyChecked] = useState(false);

    // Récupère et stocke les nom et prénom des users
    useEffect(() => {
        const fetchUsersData = async () => {
            const usersData = {};
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.forEach((doc) => {
                    usersData[doc.id] = doc.data();
                });
                setUsersMap(usersData)
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs : ", error);
            }
        }; 
        fetchUsersData();
    }, [usersMap]);

    // récupère toutes les feuilles de route
    useEffect(() => {
        const fetchFeuillesDeRoute = async () => {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute')
            const q = query(feuillesDeRouteRef, orderBy('date'))
            const querySnapshot = await getDocs(q)

            const feuillesDeRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(), 
            }))
            setFeuillesDeRoute(feuillesDeRouteData)
        }
        fetchFeuillesDeRoute()
    }, [])

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredUsers([]);
            setShowFilteredUsers(false);
            return;
        }

        const filtered = Object.values(usersMap).filter(user =>
            `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
        setShowFilteredUsers(true);
    }, [searchTerm, usersMap]);

    // configure la semaine 
    const getWeek = (date) => {
        const dayOfWeek = date.getDay(); // 0 pour dimanche, 1 pour lundi, ..., 6 pour samedi
        const firstDayOfWeek = new Date(date); // Clone la date pour ne pas modifier l'original
        firstDayOfWeek.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Réglez le premier jour de la semaine à lundi
        const onejan = new Date(firstDayOfWeek.getFullYear(), 0, 1); // Premier jour de l'année
        const week = Math.ceil((((firstDayOfWeek - onejan) / 86400000) + onejan.getDay() + 1) / 7); // Calcul du numéro de semaine
        return week;
    }

    const getMonth = (date) => {
        return date.getMonth() + 1; // Months are zero-based, so add 1
    };

    const displayThisMonth = async () => {
        setIsThisMonthOpen(true); 
        setisThisWeekOpen(false);

        const today = new Date();
        const currentMonth = getMonth(today);

        const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
        const feuillesDeRouteSnapshot = await getDocs(query(feuillesDeRouteRef));
        const feuillesDeRouteData = feuillesDeRouteSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const filtered = feuillesDeRouteData.filter(feuille => {
            if (!feuille.date) {
                return false;
            }
            const feuilleDate = new Date(feuille.date.seconds * 1000);
            const feuilleMonth = getMonth(feuilleDate);
            return feuilleMonth === currentMonth;
        }).sort((a, b) => new Date(a.date.seconds * 1000) - new Date(b.date.seconds * 1000));

        setMonthlyFeuillesDeRoute(filtered)
    };
    
    // affiche la feuille de route de la semaine en cours
    const displayThisWeek = () => {
        setisThisWeekOpen(true)
        const today = new Date()
        const currentWeek = getWeek(today)

        const filtered = feuillesDeRoute.filter(feuille => {
            if (!feuille.date) {
                return false
            }

            const feuilleDate = new Date(feuille.date.seconds * 1000)
            const feuilleWeek = getWeek(feuilleDate)
            return feuilleWeek === currentWeek
        })

        setFilteredFeuillesDeRoute(filtered)
    }

    // nouveau format
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

    // affiche les fiches la periode sélectionnée 
    const handleApplyDates = () => {
        setIsSelectedPeriodShown(true)

        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)

            const filtered = feuillesDeRoute.filter(feuille => {
                if (!feuille.date) {
                    return false;
                }
                const feuilleDate = new Date(feuille.date.seconds * 1000)
                return feuilleDate >= start && feuilleDate <= end
            })

            setSelectedPeriod(filtered)
        }
    }

    const handleSearch = () => {
        const filtered = feuillesDeRoute.filter(feuille => {
            const feuilleDate = new Date(feuille.date.seconds * 1000);
            const isWithinDateRange = startDate && endDate ? feuilleDate >= new Date(startDate) && feuilleDate <= new Date(endDate) : true;
            const isWeekly = isWeeklyChecked ? getWeek(feuilleDate) === getWeek(new Date()) : true;
            const isMonthly = isMonthlyChecked ? getMonth(feuilleDate) === getMonth(new Date()) : true;
            const isUserMatch = selectedUser ? feuille.userId === selectedUser.id : true;

            return isWithinDateRange && isWeekly && isMonthly && isUserMatch;
        });

        setFilteredFeuillesDeRoute(filtered);
    }

    return (
        <div className="feuilles-de-route-section">
            <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            <header> 
                <h1>Feuilles de route de la semaine</h1>
            </header>

            <div className='search'>
                <label>Date de début</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                
                <label>Date de fin</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />  

                <button className='button-colored' onClick={handleApplyDates}>Appliquer</button>  
            </div>

            <div className='search'>
                <label>Recherche utilisateur</label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Entrez le nom ou prénom"
                />
                {showFilteredUsers && (
                    <ul className="user-suggestions">
                        {filteredUsers.map(user => (
                            <li key={user.id} onClick={() => {
                                setSelectedUser(user);
                                setSearchTerm(`${user.firstname} ${user.lastname}`);
                                setShowFilteredUsers(false);
                            }}>
                                {user.firstname} {user.lastname}
                            </li>
                        ))}
                    </ul>
                )}

                <label>Date de début</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

                <label>Date de fin</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                <div className='checkbox-group'>
                    <label>
                        <input
                            type="checkbox"
                            checked={isMonthlyChecked}
                            onChange={(e) => setIsMonthlyChecked(e.target.checked)}
                        />
                        Feuilles de route du mois
                        </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={isWeeklyChecked}
                            onChange={(e) => setIsWeeklyChecked(e.target.checked)}
                        />
                        Feuilles de route de la semaine
                    </label>
                </div>

                <button className='button-colored' onClick={handleSearch}>Rechercher</button>
            </div>

            <button className='button-colored' onClick={displayThisWeek}>Feuille de route de la semaine en cours</button>
            <button className='button-colored' onClick={displayThisMonth}>Feuille de route du mois en cours</button>

            {selectedPeriod.length > 0 && isSelectedPeriodShown === true && (
                <div className='selected-period'>
                    <h2>Feuilles de route pour la période sélectionnée :</h2>
                    <button className='close-btn' onClick={() => setIsSelectedPeriodShown(false)} >
                       <img src={close} alt="fermer" /> 
                    </button> 
                    {selectedPeriod.map(feuille => (
                        <div className='feuille-jj' key={feuille.id}>
                            <p className='date'>{formatDate(feuille.date)}</p>
                            {feuille.isVisitsStarted ? (
                                <>
                                    <p><strong>Ville</strong> : {feuille.city}</p>
                                    <p><strong>Distance totale</strong> : {feuille.totalKm} km</p>
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
                                                <td>{stop.distance} km</td>
                                                <td>{stop.status}</td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p><strong>Commercial</strong> : {usersMap[feuille.userId]?.lastname} {usersMap[feuille.userId]?.firstname}</p>
                                </>
                            ) : (
                                <>
                                    <p>Visites commencées : {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                    <p>Motif de non-visite : {feuille.motifNoVisits}</p>
                                    <p><strong>Commercial</strong> : {usersMap[feuille.userId]?.lastname} {usersMap[feuille.userId]?.firstname}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isThisWeekOpen && (
                <div className='this-week'>
                    <button className='close-btn' onClick={() => setisThisWeekOpen(false)} >
                       <img src={close} alt="fermer" /> 
                    </button> 
                    <h2>Feuille de route de la semaine en cours</h2>

                    {filteredFeuillesDeRoute.map(feuille => (
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
                                </>
                            ) : (
                                <>
                                    <p>Visites commencées : {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                    <p>Motif de non-visite : {feuille.motifNoVisits}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isThisMonthOpen && (
                <div className='this-month'>
                    <button className='close-btn' onClick={() => setIsThisMonthOpen(false)}>
                        <img src={close} alt="fermer" />
                    </button>
                    <h2>Feuille de route du mois en cours</h2>

                    {monthlyFeuillesDeRoute.map(feuille => (
                        <div className='feuille-jj' key={feuille.id}>
                            <p className='date'>{formatDate(feuille.date)}</p>
                            {feuille.isVisitsStarted ? (
                                <>
                                    <p><strong>Ville</strong> : {feuille.city}</p>
                                    <p><strong>Distance totale</strong> : {feuille.totalKm}{feuille.unitTotalKm}</p>
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
                                                <td>{stop.distance.toFixed(2)} {stop.unitDistance}</td>
                                                <td>{stop.status}</td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p><strong>Commercial</strong> : {usersMap[feuille.userId]?.lastname} {usersMap[feuille.userId]?.firstname}</p>
                                </>
                            ) : (
                                <>
                                    <p>Visites commencées : {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                    <p>Motif de non-visite : {feuille.motifNoVisits}</p>
                                    <p><strong>Commercial</strong> : {usersMap[feuille.userId]?.lastname} {usersMap[feuille.userId]?.firstname}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FeuillesDeRouteSemaineAdmin
*/