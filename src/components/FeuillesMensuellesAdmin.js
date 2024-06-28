
/*
function FeuillesMensuellesAdmin({ feuillesDeRoute, startDate, endDate }) {
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const groupStopsByWeek = () => {
        const weeks = [];

        feuillesDeRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000);
            const dayOfWeek = date.getDay();
            const weekIndex = Math.floor((date.getDate() - 1) / 7);

            if (!weeks[weekIndex]) {
                weeks[weekIndex] = {
                    stopsByDay: Array(7).fill().map((_, index) => ({
                        date: null,
                        stops: []
                    })),
                    totalKmByDay: Array(7).fill(0)
                };
            }

            weeks[weekIndex].stopsByDay[dayOfWeek].date = `${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`;
            feuille.stops.forEach(stop => {
                weeks[weekIndex].stopsByDay[dayOfWeek].stops.push({ ...stop });
                weeks[weekIndex].totalKmByDay[dayOfWeek] += stop.distance || 0;
            });
        });

        // Ajouter les dates manquantes
        weeks.forEach(week => {
            week.stopsByDay.forEach((day, dayIndex) => {
                if (!day.date) {
                    const weekStartDate = new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
                    const currentDayDate = new Date(weekStartDate.setDate(weekStartDate.getDate() + dayIndex));
                    day.date = `${currentDayDate.getDate()} ${currentDayDate.toLocaleDateString('fr-FR', { month: 'long' })}`;
                }
            });
        });

        return weeks;
    };

    const getDayName = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return daysOfWeek[date.getDay()];
    };

    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    };

    const weeks = groupStopsByWeek();

    return (
        
        <div>
            {weeks.map((week, weekIndex) => (
                    <div key={weekIndex}>
                        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: "20px", fontSize: "15px" }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '10%', background: "#3D9B9B", color: "white" }}>Total <strong>{formatDistance(week.totalKmByDay.reduce((acc, km) => acc + km, 0))}</strong></th>
                                    {week.stopsByDay.map((day, dayIndex) => (
                                        <th key={dayIndex} style={{ width: '12%', background: "#c7c7c7"}}>
                                            {daysOfWeek[dayIndex]} <br />
                                            {day.date}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: Math.max(...week.stopsByDay.map(day => day.stops.length), 0) }).map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td style={{ verticalAlign: 'top', background: "#c7c7c7" }}>
                                            <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px"}}>
                                                <strong>Nom:</strong> <br />
                                                <strong>Prosp/Clt:</strong> <br />
                                                <strong>Ville:</strong><br />
                                                <strong>Km:</strong><br />
                                                <strong>Arrivée:</strong><br />
                                                <strong>Départ:</strong>
                                            </div>
                                        </td>
                                        {week.stopsByDay.map((day, dayIndex) => (
                                            <td key={dayIndex} style={{ verticalAlign: 'top' }}>
                                                {day.stops[rowIndex] ? (
                                                    <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px", height: "100%", fontSize: "14px"}}>
                                                        <p>{day.stops[rowIndex].name}</p>
                                                        <p>{day.stops[rowIndex].status}</p>
                                                        <p>{day.stops[rowIndex].address} {day.stops[rowIndex].city}</p>
                                                        <p>{formatDistance(day.stops[rowIndex].distance)}</p>
                                                        <p>{day.stops[rowIndex].arrivalTime}</p>
                                                        <p>{day.stops[rowIndex].departureTime}</p>
                                                    </div>
                                                ) : (
                                                    <div></div> // Afficher la date si aucun arrêt n'est présent
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white"  }}>
                                        <strong>Total km</strong>
                                    </td>
                                    {week.totalKmByDay.map((km, index) => (
                                        <td key={index} style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
                                            <strong>{formatDistance(km)}</strong>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
        </div>
    )
}

export default FeuillesMensuellesAdmin*/

import React from 'react';

const FeuillesMensuellesAdmin = ({ feuillesDeRoute, startDate, endDate }) => {
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const groupStopsByWeek = () => {
        const weeks = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        let current = new Date(start);

        while (current <= end) {
            const weekStart = new Date(current);
            const weekEnd = new Date(current);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const stopsByDay = Array(7).fill().map(() => ({
                date: null,
                stops: []
            }));

            weeks.push({
                startDate: new Date(weekStart),
                endDate: new Date(weekEnd),
                stopsByDay,
                totalKmByDay: Array(7).fill(0)
            });

            current.setDate(current.getDate() + 7);
        }

        feuillesDeRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000);
            const weekIndex = weeks.findIndex(week => date >= week.startDate && date <= week.endDate);

            if (weekIndex !== -1) {
                const dayOfWeek = date.getDay();
                weeks[weekIndex].stopsByDay[dayOfWeek].date = `${daysOfWeek[dayOfWeek]} ${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`;
                feuille.stops.forEach(stop => {
                    weeks[weekIndex].stopsByDay[dayOfWeek].stops.push({ ...stop });
                    weeks[weekIndex].totalKmByDay[dayOfWeek] += stop.distance || 0;
                });
            }
        });

        // Set dates for weeks without feuillesDeRoute
        weeks.forEach(week => {
            week.stopsByDay.forEach((day, dayIndex) => {
                if (!day.date) {
                    const currentDay = new Date(week.startDate);
                    currentDay.setDate(currentDay.getDate() + dayIndex);
                    day.date = `${daysOfWeek[dayIndex]} ${currentDay.getDate()} ${currentDay.toLocaleDateString('fr-FR', { month: 'long' })}`;
                }
                if (day.stops.length === 0) {
                    day.stops.push(null); // Ajouter un objet vide si aucun arrêt n'est présent
                }
            });
        });

        return weeks;
    };

    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    };

    const weeks = groupStopsByWeek();

    return (
        <div>
            {weeks.map((week, weekIndex) => (
                <div key={weekIndex}>
                    <table border="1" style={{ width: '100%', borderCollapse: 'collapse',  fontSize: "15px" }}>
                        <thead>
                            <tr>
                                <th style={{ width: '10%', background: "#3D9B9B", color: "white" }}>Total <strong>{formatDistance(week.totalKmByDay.reduce((acc, km) => acc + km, 0))}</strong></th>
                                {week.stopsByDay.map((day, dayIndex) => (
                                    <th key={dayIndex} style={{ width: '12%', background: "#c7c7c7"}}>
                                        {day.date}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.max(...week.stopsByDay.map(day => day.stops.length), 0) }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td style={{ verticalAlign: 'top', background: "#c7c7c7" }}>
                                        <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px"}}>
                                            <strong>Nom:</strong> <br />
                                            <strong>Prosp/Clt:</strong> <br />
                                            <strong>Ville:</strong><br />
                                            <strong>Km:</strong><br />
                                            <strong>Arrivée:</strong><br />
                                            <strong>Départ:</strong>
                                        </div>
                                    </td>
                                    {week.stopsByDay.map((day, dayIndex) => (
                                        <td key={dayIndex} style={{ verticalAlign: 'top' }}>
                                            {day.stops[rowIndex] ? (
                                                <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px", height: "100%", fontSize: "14px"}}>
                                                    <p>{day.stops[rowIndex].name}</p>
                                                    <p>{day.stops[rowIndex].status}</p>
                                                    <p>{day.stops[rowIndex].address} {day.stops[rowIndex].city}</p>
                                                    <p>{formatDistance(day.stops[rowIndex].distance)}</p>
                                                    <p>{day.stops[rowIndex].arrivalTime}</p>
                                                    <p>{day.stops[rowIndex].departureTime}</p>
                                                </div>
                                            ) : (
                                                <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px", height: "100%", fontSize: "14px"}}>
                                                    <p></p>
                                                    <p></p>
                                                    <p></p>
                                                    <p></p>
                                                    <p></p>
                                                    <p></p>
                                                </div>// Afficher la date si aucun arrêt n'est présent
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white"  }}>
                                    <strong>Total km</strong>
                                </td>
                                {week.totalKmByDay.map((km, index) => (
                                    <td key={index} style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
                                        <strong>{formatDistance(km)}</strong>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default FeuillesMensuellesAdmin;




