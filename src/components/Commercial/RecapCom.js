import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase.config'; 

const RecapCom = ({ uid }) => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [month, setMonth] = useState('');
    const [stats, setStats] = useState({
        semaine: { total: 0, clients: 0, prospects: 0 },
        mois: { total: 0, clients: 0, prospects: 0 },
        moisSelectionne: { total: 0, clients: 0, prospects: 0 },
        periodeSelectionnee: { total: 0, clients: 0, prospects: 0 },
    });

    useEffect(() => {
        const fetchData = async () => {
        const feuillesDeRouteRef = collection(db, "feuillesDeRoute");
        const q = query(feuillesDeRouteRef, where("userId", "==", uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
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
                    const timestamp = doc.date.toDate(); 

                    if (filter(timestamp)) {

                        const stopsCount = doc.stops?.length > 0 ? doc.stops?.length - 1 : 0;
                        total += stopsCount;

                        doc.stops?.forEach((stop, index) => {
                            if (index < stopsCount) {
                                if (stop.status === "Client") {
                                    clients += 1;
                                } else if (stop.status === "Prospect") {
                                    prospects += 1;
                                }
                            }
                        });
                    }
                });

                return { total, clients, prospects };
            };

            const semaineStats = calculateStats(data, (timestamp) => {
                const date = new Date(timestamp);
                return date >= startOfWeek;
            });
            

            const moisStats = calculateStats(data, (timestamp) => {
                const date = new Date(timestamp);
                return date >= startOfMonth;
            });

            const moisSelectionneStats = calculateStats(data, (timestamp) => {
                if (!month) return false;
                const [year, monthNum] = month.split("-");
                const date = new Date(timestamp);
                // Comparaison pour vérifier si la date est dans le mois sélectionné
                return date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(monthNum) - 1;
            });

            const periodeSelectionneeStats = calculateStats(data, (timestamp) => { 
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
    }, [uid, dateRange, month]);

    return (
        <div className='recap'>
            <h2>Statistiques globales</h2>
            <table border="1" style={{width: "100%"}}>
                <thead>
                    <tr>
                        <th style={{width: "20%"}}></th>
                        <th style={{width: "20%"}}>Cette semaine</th>
                        <th style={{width: "20%"}}>Ce mois</th>
                        <th style={{width: "20%"}}>
                            Choisir une période<br></br>
                            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} /><br></br>
                            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                        </th>
                        <th style={{width: "20%"}}>
                            Choisir un mois<br></br>
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
};

export default RecapCom; 

