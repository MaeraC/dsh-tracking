
// Fichier StatisticsAdminAdmin.jsimport { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase.config.js";
import { useEffect, useState } from "react";
import search from "../assets/searchb.png";
import close from "../assets/close.png";
import { getDocs, collection, query, where,  } from "firebase/firestore";

function StatisticsAdmin() {
    const [totalStats, setTotalStats] = useState({
        visits: 0,
        daysWithoutVisits: 0,
        distance: 0,
        clientVisits: 0,
        prospectVisits: 0
    });
    const [usersMap, setUsersMap] = useState({});
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [userStats, setUserStats] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [unit, setUnit] = useState("km");
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState({});
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());


    useEffect(() => {
        const fetchUsersData = async () => {
            const usersData = {};
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.forEach((doc) => {
                    usersData[doc.id] = doc.data();
                });
                setUsersMap(usersData);
                setFilteredUsers(Object.keys(usersData));
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs : ", error);
            }
        };
        fetchUsersData();
    }, []);

    useEffect(() => {
        // Fonction pour calculer la date de début de la semaine en cours
        const calculateStartOfWeek = () => {
            const today = new Date();
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1); // ajustement pour le dimanche
            return new Date(today.setDate(diff));
        };

        // Définir startDate et endDate pour la semaine en cours
        const startOfWeek = calculateStartOfWeek();
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7); // Fin de la semaine (7 jours plus tard)

        setStartDate(startOfWeek);
        setEndDate(endOfWeek);
    }, []);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
                const q = query(feuillesDeRouteRef, where("date", ">=", startDate), where("date", "<", endDate));
                const feuillesDeRouteSnapshot = await getDocs(q);
                const feuillesDeRouteData = feuillesDeRouteSnapshot.docs.map(doc => doc.data());

                const updatedUserStats = {};
                let updatedTotalStats = {
                    visits: 0,
                    daysWithoutVisits: 0,
                    distance: 0,
                    clientVisits: 0,
                    prospectVisits: 0
                };

                feuillesDeRouteData.forEach(feuille => {
                    const uid = feuille.userId;
                    const userName = usersMap[uid]?.firstname + ' ' + usersMap[uid]?.lastname;

                    if (!updatedUserStats[userName]) {
                        updatedUserStats[userName] = {
                            visits: 0,
                            daysWithoutVisits: 0,
                            distance: 0,
                            clientVisits: 0,
                            prospectVisits: 0
                        };
                    }

                    if (feuille.isVisitsStarted) {
                        updatedUserStats[userName].visits += feuille.stops.length;
                        updatedTotalStats.visits += feuille.stops.length;
                        feuille.stops.forEach(stop => {
                            updatedUserStats[userName].distance += stop.distance;
                            updatedTotalStats.distance += stop.distance;

                            const units = stop.unitDistance || 'km';
                            setUnit(units);

                            if (stop.status === "Client") {
                                updatedUserStats[userName].clientVisits++;
                                updatedTotalStats.clientVisits++;
                            } else if (stop.status === "Prospect") {
                                updatedUserStats[userName].prospectVisits++;
                                updatedTotalStats.prospectVisits++;
                            }
                        });
                    } else {
                        updatedUserStats[userName].daysWithoutVisits++;
                        updatedTotalStats.daysWithoutVisits++;
                    }
                });

                setUserStats(updatedUserStats);
                setTotalStats(updatedTotalStats);
                setFilteredUsers(Object.keys(updatedUserStats));
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques :', error);
            }
        };

        if (Object.keys(usersMap).length > 0) {
            fetchStatistics();
        }
    }, [usersMap, startDate, endDate]);

    const handleModalOpen = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleDateRangeSelect = async () => {
        const start = new Date(document.getElementById('start-date').value);
        const end = new Date(document.getElementById('end-date').value);
        end.setDate(end.getDate() + 1); // Ajouter un jour pour inclure toute la journée

        try {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
            let q = query(feuillesDeRouteRef);

            // Appliquer le filtre par période
            q = start ? query(q, where("date", ">=", start)) : q;
            q = end ? query(q, where("date", "<", end)) : q;

            const feuillesDeRouteSnapshot = await getDocs(q);
            const feuillesDeRouteData = feuillesDeRouteSnapshot.docs.map(doc => doc.data());

            const periodUserStats = {};
            let total = {
                visits: 0,
                daysWithoutVisits: 0,
                distance: 0,
                clientVisits: 0,
                prospectVisits: 0
            };

            feuillesDeRouteData.forEach(feuille => {
                const uid = feuille.userId;
                const userName = usersMap[uid]?.firstname + ' ' + usersMap[uid]?.lastname;

                if (!periodUserStats[userName]) {
                    periodUserStats[userName] = {
                        visits: 0,
                        daysWithoutVisits: 0,
                        distance: 0,
                        clientVisits: 0,
                        prospectVisits: 0
                    };
                }

                if (feuille.isVisitsStarted) {
                    periodUserStats[userName].visits += feuille.stops.length;
                    total.visits += feuille.stops.length;
                    feuille.stops.forEach(stop => {
                        periodUserStats[userName].distance += stop.distance;
                        total.distance += stop.distance;

                        if (stop.status === "Client") {
                            periodUserStats[userName].clientVisits++;
                            total.clientVisits++;
                        } else if (stop.status === "Prospect") {
                            periodUserStats[userName].prospectVisits++;
                            total.prospectVisits++;
                        }
                    });
                } else {
                    periodUserStats[userName].daysWithoutVisits++;
                    total.daysWithoutVisits++;
                }
            });

            setResult(periodUserStats);
            setTotalStats(total);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques :', error);
        }
    };

    const handleUserChange = (event) => {
        setSelectedUser(event.target.value);
    };

    const handleSearchChange = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setSearchTerm(searchValue);
        if (searchValue === '') {
            setFilteredUsers(Object.keys(userStats));
        } else {
            const filtered = Object.keys(userStats).filter(userName =>
                userName.toLowerCase().includes(searchValue)
            );
            setFilteredUsers(filtered);
        }
    };

    return (
        <section className="stats-section">
            <div className="title-stats">
                <h2>Statistiques de la semaine</h2>
                <button onClick={handleModalOpen}><img src={search} alt="rechercher" /></button>
            </div>

            <div className="nb total">
                <p>Total Visites réalisées</p>
                <span>{totalStats.visits}</span>
            </div>

            <div className="cp">
                <div className="nb fr">
                    <p>Visites Client</p>
                    <span>{totalStats.clientVisits}</span>
                </div>
                <div className="nb fr">
                    <p>Visites Prospect</p>
                    <span>{totalStats.prospectVisits}</span>
                </div>
            </div>

            <div className="nb total">
                <p>Jours sans visites</p>
                <span>{totalStats.daysWithoutVisits}</span>
            </div>

            <div className="nb total">
                <p>Kilomètres parcourus</p>
                <span>{totalStats.distance.toFixed(2) + " " + unit}</span>
            </div>

            {modalOpen && (
                <div className="modal-stats">
                    <div className="content">
                        <span className="close" onClick={handleModalClose}><img src={close} alt="fermer" /></span>
                        <h3 className="h3">Sélectionner une période et un utilisateur</h3>
                        <label>Date de début :</label>
                        <input  type="date" id="start-date" placeholder="12/06/2024" className="input"  />
                        
                        
                        <label>Date de fin :</label>
                        <input className="input custom-datepicker" type="date" id="end-date" />

                        <label>Utilisateur :</label>
                        <input
                            type="text"
                            className="input"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Rechercher un utilisateur"
                        />
                        <select value={selectedUser} onChange={handleUserChange}>
                            <option value="">Sélectionner un utilisateur</option>
                            {filteredUsers.map(userName => (
                                <option key={userName} value={userName}>{userName}</option>
                            ))}
                        </select>

                        <button className="button-colored" onClick={handleDateRangeSelect}>Valider</button>

                        {selectedUser ? (
                            <div>
                                <h3>Statistiques pour {selectedUser}</h3>
                                <p><span>{userStats[selectedUser]?.visits || 0}</span> Visites réalisées</p>
                                <p><span>{userStats[selectedUser]?.daysWithoutVisits || 0}</span> Jours sans visites</p>
                                <p><span>{userStats[selectedUser]?.distance.toFixed(2) || 0}</span> Kilomètres parcourus</p>
                                <p><span>{userStats[selectedUser]?.clientVisits || 0}</span> Visites Client</p>
                                <p><span>{userStats[selectedUser]?.prospectVisits || 0}</span> Visites Prospect</p>
                            </div>
                        ) : (
                            <div>
                                <h3>Statistiques globales pour la période sélectionnée</h3>
                                <p><span>{totalStats.visits}</span> Visites réalisées</p>
                                <p><span>{totalStats.daysWithoutVisits}</span> Jours sans visites</p>
                                <p><span>{totalStats.distance.toFixed(2)}</span> Kilomètres parcourus</p>
                                <p><span>{totalStats.clientVisits}</span> Visites Client</p>
                                <p><span>{totalStats.prospectVisits}</span> Visites Prospect</p>
                                {Object.keys(result).map(userName => (
                                    <div key={userName}>
                                        <h3>Utilisateur: {userName}</h3>
                                        <p><span>{result[userName]?.visits || 0}</span> Visites réalisées</p>
                                        <p><span>{result[userName]?.daysWithoutVisits || 0}</span> Jours sans visites</p>
                                        <p><span>{result[userName]?.distance.toFixed(2) || 0}</span> Kilomètres parcourus</p>
                                        <p><span>{result[userName]?.clientVisits || 0}</span> Visites Client</p>
                                        <p><span>{result[userName]?.prospectVisits || 0}</span> Visites Prospect</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            

        </section>
    );
}

export default StatisticsAdmin;
