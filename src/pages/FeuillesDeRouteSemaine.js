
// fichier FeuillesDeRouteSemaine.js

import { useState, useEffect } from 'react'
import { db } from '../firebase.config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

function FeuillesDeRouteSemaine({ uid }) {

    const [feuillesDeRoute, setFeuillesDeRoute] = useState([]);
    const [filteredFeuillesDeRoute, setFilteredFeuillesDeRoute] = useState([]);
    const [date, setDate] = useState('');

    useEffect(() => {
        if (!uid) return

        const fetchFeuillesDeRoute = async () => {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
            const q = query(feuillesDeRouteRef, where('userId', '==', uid), orderBy('date'));
            const querySnapshot = await getDocs(q);

            const feuillesDeRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(), 
            }));

            setFeuillesDeRoute(feuillesDeRouteData);
        };

        fetchFeuillesDeRoute();
    }, [uid])

    useEffect(() => {
        if (date) {
            const selectedDate = new Date(date);
            const startOfWeek = new Date(selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay() + 1));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 4);

            const filtered = feuillesDeRoute.filter(feuille => {
                const feuilleDate = new Date(feuille.date.seconds * 1000);
                return feuilleDate >= startOfWeek && feuilleDate <= endOfWeek;
            });

            setFilteredFeuillesDeRoute(filtered);
        }
    }, [date, feuillesDeRoute]);

    const groupByWeek = (data) => {
        return data.reduce((acc, current) => {
            const date = new Date(current.date.seconds * 1000);
            const year = date.getFullYear();
            const week = getWeek(date);

            if (!acc[year]) acc[year] = {};
            if (!acc[year][week]) acc[year][week] = [];

            acc[year][week].push(current);
            return acc;
        }, {});
    };

    const getWeek = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    const groupedFeuillesDeRoute = groupByWeek(feuillesDeRoute);

    return (
        <div className="feuilles-de-route-section">
            <header>
                <h1>Feuilles de route de la semaine</h1>
            </header>

            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            {filteredFeuillesDeRoute.map(feuille => (
                <div key={feuille.id}>
                    <h2>Feuilles de route pour la période sélectionnée :</h2>
                    <p>Date: {new Date(feuille.date.seconds * 1000).toLocaleDateString()}</p>
                    <p>Distance totale: {feuille.totalDistance} km</p>
                    <ul>
                        {feuille.stops.map((stop, index) => (
                            <li key={index}>{stop.name} - {stop.distance} km</li>
                        ))}
                    </ul>
                </div>
            ))}

            <div>
                <h2>Feuilles de route par semaine :</h2>
                {Object.entries(groupedFeuillesDeRoute).map(([year, weeks]) => (
                    <div key={year}>
                        <h3>{year}</h3>
                        {Object.entries(weeks).map(([week, feuilles]) => (
                            <div key={week}>
                                <h4>Semaine {week}</h4>
                                {feuilles.map(feuille => (
                                    <div key={feuille.id}>
                                        <p>Date: {new Date(feuille.date.seconds * 1000).toLocaleDateString()}</p>
                                        <p>Distance totale: {feuille.totalDistance} km</p>
                                        <ul>
                                            {feuille.stops.map((stop, index) => (
                                                <li key={index}>
                                                    {stop.name} - {stop.distance} km
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FeuillesDeRouteSemaine