
// Fichier StatisticsVisits.js

import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase.config.js"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parse } from "date-fns"
import { useEffect, useState } from "react"


function StatisticsVisits() {

    const [statistics, setStatistics] = useState({
        totalVisits: 0,
        totalProspectionForms: 0,
        totalSuiviClientForms: 0,
        totalSuiviProspectForms: 0,
        totalDemonstrationReports: 0,
        totalPresentationReports: 0,
        weeklyVisits: 0,
        monthlyVisits: 0,
    })

    useEffect(() => {
        const calculateStats = async () => {
            try {
                const visitsRef = collection(db, "visits")
                const querySnapshot = await getDocs(visitsRef)
        
                let totalVisits = 0
                let totalProspectionForms = 0
                let totalSuiviClientForms = 0
                let totalSuiviProspectForms = 0
                let totalDemonstrationReports = 0
                let totalPresentationReports = 0
        
                const currentDay = new Date()
    
                const weekInterval = {
                    start: startOfWeek(currentDay, { weekStartsOn: 1 }),
                    end: endOfWeek(currentDay, { weekStartsOn: 1 })
                }
    
                const monthInterval = {
                    start: startOfMonth(currentDay),
                    end: endOfMonth(currentDay)
                }
        
                let weeklyVisits = 0
                let monthlyVisits = 0
        
                querySnapshot.forEach((doc) => {
                    const visit = doc.data()
        
                    // Compte les visites de la feuille de route de la semaine
                    totalVisits += 1
                    // Vérifie si la visite est dans la semaine ou le mois
                    const visitDate = parse(visit.exactDate, 'dd/MM/yyyy', new Date())
        
                    if (isWithinInterval(visitDate, weekInterval)) {
                        weeklyVisits += 1
                    }
                    if (isWithinInterval(visitDate, monthInterval)) {
                        monthlyVisits += 1
                    }
        
                    // Compte les formulaires de prospection journalière
                    if (visit.dailyProspection && Array.isArray(visit.dailyProspection)) {
                        totalProspectionForms += visit.dailyProspection.length
                    }
        
                    // Compte les fiches de suivi client
                    if (visit.suiviClient && Array.isArray(visit.suiviClient)) {
                        totalSuiviClientForms += visit.suiviClient.length
                    }
        
                    // Compte les fiches de suivi prospect
                    if (visit.suiviProspect && Array.isArray(visit.suiviProspect)) {
                        totalSuiviProspectForms += visit.suiviProspect.length
                    }
        
                    // Compte les comptes rendus de RDV de démonstration
                    if (visit.demonstrationReports && Array.isArray(visit.demonstrationReports)) {
                        totalDemonstrationReports += visit.demonstrationReports.length
                    }
        
                    // Compte les comptes rendus de RDV de présentation
                    if (visit.presentationReports && Array.isArray(visit.presentationReports)) {
                        totalPresentationReports += visit.presentationReports.length
                    }
                })
        
                setStatistics({
                    totalVisits,
                    totalProspectionForms,
                    totalSuiviClientForms,
                    totalSuiviProspectForms,
                    totalDemonstrationReports,
                    totalPresentationReports,
                    weeklyVisits,
                    monthlyVisits,
                })
            } 
            catch (error) {
                console.error("Erreur lors du calcul des visites :", error)
            }
        }
    
        calculateStats()
    }, [])

    return (
        <section className="stats-section">

            <div className="nb-calcul">
                <div className="total-visits">
                    <p>Statistiques des visites réalisées</p>
                    <div className="nb-total">
                        <span className="nb">{statistics.totalVisits}</span>
                        <span className="txt">Total</span>
                    </div>
                    
                </div>
                
                <div className="all-stats">
                    <div className="p">
                        <p>Nombre total des Fiches de Prospection : {statistics.totalProspectionForms}</p>
                        <p>Nombre total des Fiches de suivi Client : {statistics.totalSuiviClientForms}</p>
                        <p>Nombre total des Fiches de suivi Prospect : {statistics.totalSuiviProspectForms}</p>
                        <p>Nombre total des Comptes rendus de Démonstration : {statistics.totalDemonstrationReports}</p>
                        <p>Nombre total des Comptes rendus de Présentation : {statistics.totalPresentationReports}</p>
                        <div className="wk">
                            <p>Nombre total des visites cette semaine : {statistics.weeklyVisits}</p>
                            <p>Nombre total de visites ce mois-ci : {statistics.monthlyVisits}</p>
                        </div>
                    </div>

                    
                </div>
            </div>
            


        </section>
    )
}

export default StatisticsVisits