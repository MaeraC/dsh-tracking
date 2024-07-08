

import React, { useEffect, useState } from 'react'

const FeuillesMensuellesAdmin = ({ feuillesDeRoute, selectedMonthYear, selectedUser }) => {
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const [filteredFeuilles, setFilteredFeuilles] = useState([])
    
    useEffect(() => {
        if (selectedMonthYear) {
            const [selectedYear, selectedMonth] = selectedMonthYear.split('-').map(Number)

            const filtered = feuillesDeRoute.filter(feuille => {
                const feuilleDate = feuille.date.toDate()
                return feuilleDate.getFullYear() === selectedYear && (feuilleDate.getMonth() + 1) === selectedMonth
            })

            setFilteredFeuilles(filtered)
        }
        // eslint-disable-next-line
    }, [feuillesDeRoute, selectedMonthYear])

    const groupStopsByWeek = () => {
        const weeks = []
        const [selectedYear, selectedMonth] = selectedMonthYear.split('-').map(Number)
        const start = new Date(selectedYear, selectedMonth - 1, 1)
        const end = new Date(selectedYear, selectedMonth, 0)

        let current = new Date(start)

        while (current <= end) {
            const weekStart = new Date(current)
            const weekEnd = new Date(current)

            weekEnd.setDate(weekEnd.getDate() + 6)

            const stopsByDay = Array(7).fill().map(() => ({
                date: null,
                stops: []
            }))

            weeks.push({
                startDate: new Date(weekStart),
                endDate: new Date(weekEnd),
                stopsByDay,
                totalKmByDay: Array(7).fill(0)
            })

            current.setDate(current.getDate() + 7)
        }

        filteredFeuilles.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000)
            const weekIndex = weeks.findIndex(week => date >= week.startDate && date <= week.endDate)

            if (weekIndex !== -1) {
                const dayOfWeek = date.getDay()
                weeks[weekIndex].stopsByDay[dayOfWeek].date = `${daysOfWeek[dayOfWeek]} ${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`

                feuille?.stops?.forEach(stop => {
                    weeks[weekIndex].stopsByDay[dayOfWeek].stops.push({ ...stop })
                    weeks[weekIndex].totalKmByDay[dayOfWeek] += stop.distance || 0
                })
            }
        })

        weeks.forEach(week => {
            week.stopsByDay.forEach((day, dayIndex) => {

                if (!day.date) {
                    const currentDay = new Date(week.startDate)

                    currentDay.setDate(currentDay.getDate() + dayIndex)
                    day.date = `${daysOfWeek[dayIndex]} ${currentDay.getDate()} ${currentDay.toLocaleDateString('fr-FR', { month: 'long' })}`
                }

                if (day.stops.length === 0) {
                    day.stops.push(null)
                }
            })
        })

        return weeks
    }
    const weeks = groupStopsByWeek()

    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`
        }
        return `${(distance / 1000).toFixed(2)} km`
    }
    const formatMonthYear = (selectedMonthYear) => {
        const [year, month] = selectedMonthYear.split('-')
        const monthName = new Date(`${year}-${month}-01`).toLocaleDateString('fr-FR', { month: 'long' })
        return `${monthName} ${year}`
    }

    return (
        <div style={{ margin: "0 20px" }}>
            <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                <p style={{ color: "grey", fontStyle: "italic" }}> Feuilles mensuelles du mois de {formatMonthYear(selectedMonthYear)}</p>
                <p style={{ color: "grey", fontStyle: "italic" }}>VRP : {selectedUser.firstname} {selectedUser.lastname}</p>
            </div>

            {weeks.map((week, weekIndex) => (
                <div key={weekIndex}>
                    <table border="1" style={{ width: '100%', borderCollapse: 'collapse', fontSize: "15px" }}>
                        <thead>
                            <tr>
                                <th style={{ width: '10%', background: "#3D9B9B", color: "white" }}>Total <strong>{formatDistance(week.totalKmByDay.reduce((acc, km) => acc + km, 0))}</strong></th>
                                {week.stopsByDay.map((day, dayIndex) => (
                                    <th key={dayIndex} style={{ width: '12%', background: "#c7c7c7" }}>
                                        {day.date}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.max(...week.stopsByDay.map(day => day.stops.length), 0) }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td style={{ verticalAlign: 'top', background: "#c7c7c7" }}>
                                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px" }}>
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
                                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px", height: "100%", fontSize: "14px" }}>
                                                    <p>{day.stops[rowIndex].name}</p><br />
                                                    <p>{day.stops[rowIndex].status}</p><br />
                                                    <p>{day.stops[rowIndex].address} {day.stops[rowIndex].city}</p><br />
                                                    <p>{formatDistance(day.stops[rowIndex].distance)}</p><br />
                                                    <p>{day.stops[rowIndex].arrivalTime}</p><br />
                                                    <p>{day.stops[rowIndex].departureTime}</p>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px", height: "100%", fontSize: "14px" }}>
                                                    
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
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



export default FeuillesMensuellesAdmin
