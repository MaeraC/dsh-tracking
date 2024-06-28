import React from 'react';

const FeuillesHebdoAdmin = ({ feuillesDeRoute, startDate, endDate }) => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

    const getDayName = (timestamp) => { 
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('fr-FR', { weekday: 'long' }).charAt(0).toUpperCase() + date.toLocaleDateString('fr-FR', { weekday: 'long' }).slice(1);
    } 

    const groupStopsByWeek = () => {
        //const currentWeek = {};
        const weeks = {};

        feuillesDeRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000); 
            const day = date.getDay();
            const diffToMonday = day === 0 ? 6 : day - 1;
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - diffToMonday);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 4);

            const weekKey = `${startOfWeek.toISOString().split('T')[0]}_${endOfWeek.toISOString().split('T')[0]}`;

            if (!weeks[weekKey]) {
                weeks[weekKey] = { startOfWeek, endOfWeek, stopsByDay: {}, totalKmByDay: {}};

                days.forEach(day => {
                    weeks[weekKey].stopsByDay[day] = [];
                    weeks[weekKey].totalKmByDay[day] = 0;
                });
            }

            feuille.stops.forEach((stop, index) => {
                const dayName = getDayName(feuille.date);
                if (weeks[weekKey].stopsByDay.hasOwnProperty(dayName)) {
                    weeks[weekKey].stopsByDay[dayName].push({ ...stop, dayName });
                    weeks[weekKey].totalKmByDay[dayName] += stop.distance || 0;

                    
                }
            });
        });

        return weeks;
    }
    
    const weeks = groupStopsByWeek() 

    const formatDistance = (distance) => {
        if (distance < 1000) {
          return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    }
    const formatDate = (date) => date.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    })

    return (
        <div>
            {Object.keys(weeks).map(weekKey => {
                const { startOfWeek, endOfWeek, stopsByDay, totalKmByDay} = weeks[weekKey];
                const totalKmAll = Object.values(totalKmByDay).reduce((acc, km) => acc + km, 0);

                // Vérifier si la semaine se trouve dans l'intervalle sélectionné
                if (startOfWeek < new Date(startDate) || endOfWeek > new Date(endDate)) {
                    return null;
                }

                return (
                    <div className='hebdo' key={weekKey}>
                        <h2>{`Semaine du ${formatDate(startOfWeek)} au ${formatDate(endOfWeek)}`}</h2>
                        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' , marginBottom: "20px", fontSize: "15px"}}>
                            <thead>
                                <tr>
                                    <th style={{ width: '10%', background: "#3D9B9B", color: "white"  }}>Total <strong>{formatDistance(totalKmAll)}</strong></th>
                                    
                                    {days.map((day, dayIndex) => (
                                        <th key={dayIndex} style={{ width: '18%', background: "#c7c7c7" }}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                            {Array.from({ length: Math.max(...Object.values(stopsByDay).map(stops => stops.length), 0) }).map((_, rowIndex) => (
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
                                    {days.map(day => (
                                        <td key={day} style={{ verticalAlign: 'top' }}>
                                            {stopsByDay[day][rowIndex] ? (
                                                <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px", height: "100%", fontSize: "14px"}}>
                                                    <p>{stopsByDay[day][rowIndex].name}</p><br />
                                                    <p>{stopsByDay[day][rowIndex].status}</p><br />
                                                    <p>{stopsByDay[day][rowIndex].address} {stopsByDay[day][rowIndex].city}</p><br />
                                                    <p>{formatDistance(stopsByDay[day][rowIndex].distance)}</p><br />
                                                    <p>{stopsByDay[day][rowIndex].arrivalTime}</p><br />
                                                    <p>{stopsByDay[day][rowIndex].departureTime}</p><br />
                                                </div>
                                            ) : null}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
                                    <strong>Total km</strong>
                                </td>
                                {days.map(day => (
                                    <td key={day} style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white"   }}>
                                        <strong>{formatDistance(totalKmByDay[day])}</strong>
                                    </td>
                                ))}
                            </tr>
                            </tbody>
                        </table>
                    </div>
                );
                })}
        </div>
    );
};

export default FeuillesHebdoAdmin;
