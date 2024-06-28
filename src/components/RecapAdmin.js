
// fichier RecapAdmin.js 

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from '../firebase.config';

function RecapAdmin() {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [month, setMonth] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        semaine: { total: 0, clients: 0, prospects: 0 },
        mois: { total: 0, clients: 0, prospects: 0 },
        moisSelectionne: { total: 0, clients: 0, prospects: 0 },
        periodeSelectionnee: { total: 0, clients: 0, prospects: 0 },
    });

    useEffect(() => {
        const fetchData = async () => {
            const feuillesDeRouteRef = collection(db, "feuillesDeRoute");
            const q = query(feuillesDeRouteRef);
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            // Collecter tous les utilisateurs uniques
            const uniqueUsers = [...new Set(data.map(doc => doc.userId))];
            setUsers(uniqueUsers);

            // Filtrer les données en fonction de l'utilisateur sélectionné
            let filteredData = data;
            if (selectedUserId) {
                filteredData = data.filter(doc => doc.userId === selectedUserId);
            } 

            // Déterminer la date de fin pour la période sélectionnée
            let endDate = new Date(); // Date d'aujourd'hui par défaut
            if (dateRange.end) {
                endDate = new Date(dateRange.end);
                // Ajouter un jour pour inclure les données jusqu'à la fin de la journée sélectionnée
                endDate.setDate(endDate.getDate() + 1);
            }

            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
            startOfWeek.setHours(0, 0, 0, 0);

            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const calculateStats = (data, filter) => {
                let total = 0;
                let clients = 0;
                let prospects = 0;

                data.forEach(doc => {
                    if (doc.date && doc.date.toDate) {
                        const timestamp = doc.date.toDate(); // Convertir le timestamp Firestore en objet Date
                        if (filter(timestamp)) {
                            // Compter les stops sauf le dernier
                            const stopsCount = doc.stops.length > 0 ? doc.stops.length - 1 : 0;
                            total += stopsCount;

                            doc.stops.forEach((stop, index) => {
                                if (index < stopsCount) {
                                    if (stop.status === "Client") {
                                        clients += 1;
                                    } else if (stop.status === "Prospect") {
                                        prospects += 1;
                                    }
                                }
                            });
                        }
                    }
                });

                return { total, clients, prospects };
            };

            const semaineStats = calculateStats(filteredData, (timestamp) => {
                return timestamp >= startOfWeek;
            });

            const moisStats = calculateStats(filteredData, (timestamp) => {
                return timestamp >= startOfMonth;
            });

            const moisSelectionneStats = calculateStats(filteredData, (timestamp) => {
                if (!month) return false;
                const [year, monthNum] = month.split("-");
                const date = new Date(timestamp);
                return date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(monthNum) - 1;
            });

            const periodeSelectionneeStats = calculateStats(filteredData, (timestamp) => {
                if (!dateRange.start || !dateRange.end) return false;
                const date = new Date(timestamp);
                return date >= new Date(dateRange.start) && date < endDate;
            });

            setStats({
                semaine: semaineStats,
                mois: moisStats,
                moisSelectionne: moisSelectionneStats,
                periodeSelectionnee: periodeSelectionneeStats,
            });
        };

        fetchData();
    }, [selectedUserId, dateRange, month]);

    const handleUserChange = (e) => {
        setSelectedUserId(e.target.value);
    };

    return (
        <div className='recap'>
            <h2>Tableau des visites</h2>
            <div>
                <label>Sélectionner un utilisateur :</label>
                <select value={selectedUserId} onChange={handleUserChange}>
                    <option value="">Tous les utilisateurs</option>
                    {users.map(user => (
                        <option key={user} value={user}>{user}</option>
                    ))}
                </select>
            </div>
            <table border="1">
                <thead>
                    <tr>
                        <th></th>
                        <th>Cette semaine</th>
                        <th>Ce mois</th>
                        <th>
                            Choisir une période :
                            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                        </th>
                        <th>
                            Choisir un mois :
                            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='colonne'>Visites total</td>
                        <td>{stats.semaine.total}</td>
                        <td>{stats.mois.total}</td>
                        <td>{stats.periodeSelectionnee.total}</td>
                        <td>{stats.moisSelectionne.total}</td>
                    </tr>
                    <tr>
                        <td className='colonne'>Visites clients</td>
                        <td>{stats.semaine.clients}</td>
                        <td>{stats.mois.clients}</td>
                        <td>{stats.periodeSelectionnee.clients}</td>
                        <td>{stats.moisSelectionne.clients}</td>
                    </tr>
                    <tr>
                        <td className='colonne'>Visites prospects</td>
                        <td>{stats.semaine.prospects}</td>
                        <td>{stats.mois.prospects}</td>
                        <td>{stats.periodeSelectionnee.prospects}</td>
                        <td>{stats.moisSelectionne.prospects}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default RecapAdmin