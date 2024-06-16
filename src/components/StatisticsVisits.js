
// Fichier StatisticsVisits.js

import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../firebase.config.js";
import { useEffect, useState } from "react";
import search from "../assets/searchb.png"
import close from "../assets/close.png"

function StatisticsVisits({ uid }) {
    const [visitsCount, setVisitsCount] = useState(0);
    const [daysWithoutVisitsCount, setDaysWithoutVisitsCount] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);
    const [unit, setUnit] = useState("")
    const [clientVisitsCount, setClientVisitsCount] = useState(0);
    const [prospectVisitsCount, setProspectVisitsCount] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [result, setResult] = useState({ visits: 0, daysWithoutVisits: 0, distance: 0 });

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
                const q = query(feuillesDeRouteRef, where("userId", "==", uid));
                const feuillesDeRouteSnapshot = await getDocs(q);
                const feuillesDeRouteData = feuillesDeRouteSnapshot.docs.map(doc => doc.data());

                let visits = 0;
                let daysWithoutVisits = 0;
                let distance = 0;
                let clientVisits = 0;
                let prospectVisits = 0;

                feuillesDeRouteData.forEach(feuille => {
                    if (feuille.isVisitsStarted) {
                        visits += feuille.stops.length;
                        feuille.stops.forEach(stop => {
                            distance += stop.distance;

                            const units = stop.unitDistance || 'km';
                            setUnit(units)

                            if (stop.status === "Client") {
                                clientVisits++;
                            } 
                            else if (stop.status === "Prospect") {
                                prospectVisits++;
                            }
                        });
                    } else {
                        daysWithoutVisits++;
                    }
                });

                setVisitsCount(visits); 
                setDaysWithoutVisitsCount(daysWithoutVisits);
                setTotalDistance(distance)
                setClientVisitsCount(clientVisits);
                setProspectVisitsCount(prospectVisits);
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques :', error);
            }
        };

        fetchStatistics();
    }, [uid, unit]);

    const handleModalOpen = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleDateRangeSelect = async () => {
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);

        // Ajouter un jour à la date de fin pour inclure toute la journée
        endDate.setDate(endDate.getDate() + 1);

        try {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
            const q = query(feuillesDeRouteRef, where("userId", "==", uid));
            const feuillesDeRouteSnapshot = await getDocs(q);
            const feuillesDeRouteData = feuillesDeRouteSnapshot.docs.map(doc => doc.data());

            let visits = 0;
            let daysWithoutVisits = 0;
            let distance = 0;

            feuillesDeRouteData.forEach(feuille => {
                const feuilleDate = feuille.date.toDate();  // Conversion du timestamp en objet Date
                if (feuilleDate >= startDate && feuilleDate < endDate) {
                    if (feuille.isVisitsStarted) {
                        visits += feuille.stops.length;
                        feuille.stops.forEach(stop => {
                            distance += stop.distance;
                        });
                    } else {
                        daysWithoutVisits++;
                    }
                }
            });

            setResult({ visits, daysWithoutVisits, distance });
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

            <div className="nb total">
                <p>Total Visites réalisées</p>
                <span>{visitsCount}</span>
            </div>

            <div className="cp">
                <div className="nb fr">
                    <p>Visites Client</p>
                    <span>{clientVisitsCount}</span>
                </div>
                <div className="nb fr">
                    <p>Visites Prospect</p>
                    <span>{prospectVisitsCount}</span>
                </div>
            </div>

            <div className="nb total">
                <p>Jours sans visites</p>
                <span>{daysWithoutVisitsCount}</span>
            </div>

            <div className="nb total">
                <p>Kilomètres parcourus</p>
                <span>{totalDistance.toFixed(2) + " " + unit}</span> 
            </div> 

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
                            <p><span>{result.visits}</span>Visites réalisées</p>
                            <p><span>{result.daysWithoutVisits}</span>Jours sans visites</p>
                            <p><span>{result.distance.toFixed(2)} </span>Kilomètres parcourus</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default StatisticsVisits;



