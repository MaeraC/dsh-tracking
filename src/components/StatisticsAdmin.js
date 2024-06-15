
// Fichier StatisticsAdminAdmin.js

import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase.config.js";
import { useEffect, useState } from "react";
import search from "../assets/searchb.png"
import close from "../assets/close.png"

function StatisticsAdmin() {

    const [statistics, setStatistics] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [result, setResult] = useState({});
    const [unit, setUnit] = useState("");

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
                const feuillesDeRouteSnapshot = await getDocs(feuillesDeRouteRef);
                const feuillesDeRouteData = feuillesDeRouteSnapshot.docs.map(doc => doc.data());

                const userStats = {};

                feuillesDeRouteData.forEach(feuille => {
                    const uid = feuille.userId;
                    if (!userStats[uid]) {
                        userStats[uid] = {
                            visits: 0,
                            daysWithoutVisits: 0,
                            distance: 0,
                            clientVisits: 0,
                            prospectVisits: 0
                        };
                    }

                    if (feuille.isVisitsStarted) {
                        userStats[uid].visits += feuille.stops.length;
                        feuille.stops.forEach(stop => {
                            userStats[uid].distance += stop.distance;

                            const units = stop.unitDistance || 'km';
                            setUnit(units);

                            if (stop.status === "Client") {
                                userStats[uid].clientVisits++;
                            } 
                            else if (stop.status === "Prospect") {
                                userStats[uid].prospectVisits++;
                            }
                        });
                    } else {
                        userStats[uid].daysWithoutVisits++;
                    }
                });

                setStatistics(userStats);
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques :', error);
            }
        };

        fetchStatistics();
    }, [unit]);

    const handleModalOpen = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleDateRangeSelect = async () => {
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        endDate.setDate(endDate.getDate() + 1);

        try {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
            const feuillesDeRouteSnapshot = await getDocs(feuillesDeRouteRef);
            const feuillesDeRouteData = feuillesDeRouteSnapshot.docs.map(doc => doc.data());

            const userStats = {};

            feuillesDeRouteData.forEach(feuille => {
                const feuilleDate = feuille.date.toDate();
                const uid = feuille.userId;
                if (!userStats[uid]) {
                    userStats[uid] = {
                        visits: 0,
                        daysWithoutVisits: 0,
                        distance: 0,
                        clientVisits: 0,
                        prospectVisits: 0
                    };
                }

                if (feuilleDate >= startDate && feuilleDate < endDate) {
                    if (feuille.isVisitsStarted) {
                        userStats[uid].visits += feuille.stops.length;
                        feuille.stops.forEach(stop => {
                            userStats[uid].distance += stop.distance;

                            const units = stop.unitDistance || 'km';
                            setUnit(units);

                            if (stop.status === "Client") {
                                userStats[uid].clientVisits++;
                            } 
                            else if (stop.status === "Prospect") {
                                userStats[uid].prospectVisits++;
                            }
                        });
                    } else {
                        userStats[uid].daysWithoutVisits++;
                    }
                }
            });

            setResult(userStats);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques :', error);
        }
    };

    return (
        <section className="stats-section">
            <div className="title-stats">
                <h2>Statistiques de la semaine</h2>
                <button onClick={handleModalOpen}><img src={search} alt="rechercher" /></button>
            </div>

            {Object.keys(statistics).map(uid => (
                <div key={uid}>
                    <h3>Utilisateur: {uid}</h3>
                    <div className="nb total">
                        <p>Total Visites réalisées</p>
                        <span>{statistics[uid].visits}</span>
                    </div>

                    <div className="cp">
                        <div className="nb fr">
                            <p>Visites Client</p>
                            <span>{statistics[uid].clientVisits}</span>
                        </div>
                        <div className="nb fr">
                            <p>Visites Prospect</p>
                            <span>{statistics[uid].prospectVisits}</span>
                        </div>
                    </div>

                    <div className="nb total">
                        <p>Jours sans visites</p>
                        <span>{statistics[uid].daysWithoutVisits}</span>
                    </div>

                    <div className="nb total">
                        <p>Kilomètres parcourus</p>
                        <span>{statistics[uid].distance.toFixed(2) + " " + unit}</span>
                    </div>
                </div>
            ))}

            {modalOpen && (
                <div className="modal-stats">
                    <div className="content">
                        <span className="close" onClick={handleModalClose}><img src={close} alt="fermer" /></span>
                        <h3 className="h3">Sélectionner une période</h3>
                        <label>Date de début </label>
                        <input  className="input" type="date" id="start-date" />
                          
                        <label>Date de fin :</label>
                        <input type="date" id="end-date" />
                       
                        <button className="button-colored" onClick={handleDateRangeSelect}>Valider</button>
                        <div>
                            {Object.keys(result).map(uid => (
                                <div key={uid}>
                                    <h3>Utilisateur: {uid}</h3>
                                    <p><span>{result[uid].visits}</span> Visites réalisées</p>
                                    <p><span>{result[uid].daysWithoutVisits}</span> Jours sans visites</p>
                                    <p><span>{result[uid].distance}</span> Kilomètres parcourus</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default StatisticsAdmin;

