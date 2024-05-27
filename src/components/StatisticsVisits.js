
// Fichier StatisticsVisits.js

import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase.config.js"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parse } from "date-fns"


function StatisticsVisits() {

    const calculateStats = async () => {
        try {
            const visitsRef = collection(db, "visits");
            const querySnapshot = await getDocs(visitsRef);
    
            let totalVisits = 0;
            let totalProspectionForms = 0;
            let totalSuiviClientForms = 0;
            let totalSuiviProspectForms = 0;
            let totalDemonstrationReports = 0;
            let totalPresentationReports = 0;
    
            const currentDay = new Date();
            const weekInterval = {
                start: startOfWeek(currentDay, { weekStartsOn: 1 }),
                end: endOfWeek(currentDay, { weekStartsOn: 1 })
            };
            const monthInterval = {
                start: startOfMonth(currentDay),
                end: endOfMonth(currentDay)
            };
    
            let weeklyVisits = 0;
            let monthlyVisits = 0;
    
            querySnapshot.forEach((doc) => {
                const visit = doc.data();
    
                // Comptage des visites de la feuille de route de la semaine
                totalVisits += 1;
    
                // Vérification si la visite est dans la semaine ou le mois
                const visitDate = parse(visit.exactDate, 'dd/MM/yyyy', new Date());
    
                if (isWithinInterval(visitDate, weekInterval)) {
                    weeklyVisits += 1;
                }
                if (isWithinInterval(visitDate, monthInterval)) {
                    monthlyVisits += 1;
                }
    
                // Comptage des formulaires de prospection journalière
                if (visit.dailyProspection && Array.isArray(visit.dailyProspection)) {
                    totalProspectionForms += visit.dailyProspection.length;
                }
    
                // Comptage des fiches de suivi client
                if (visit.suiviClient && Array.isArray(visit.suiviClient)) {
                    totalSuiviClientForms += visit.suiviClient.length;
                }
    
                // Comptage des fiches de suivi prospect
                if (visit.suiviProspect && Array.isArray(visit.suiviProspect)) {
                    totalSuiviProspectForms += visit.suiviProspect.length;
                }
    
                // Comptage des comptes rendus de RDV de démonstration
                if (visit.demonstrationReports && Array.isArray(visit.demonstrationReports)) {
                    totalDemonstrationReports += visit.demonstrationReports.length;
                }
    
                // Comptage des comptes rendus de RDV de présentation
                if (visit.presentationReports && Array.isArray(visit.presentationReports)) {
                    totalPresentationReports += visit.presentationReports.length;
                }
            });
    
            console.log("Nombre total de visites :", totalVisits);
            console.log("Nombre total de fiches de prospection :", totalProspectionForms);
            console.log("Nombre total de fiches de suivi client :", totalSuiviClientForms);
            console.log("Nombre total de fiches de suivi prospect :", totalSuiviProspectForms);
            console.log("Nombre total de comptes rendus de démonstration :", totalDemonstrationReports);
            console.log("Nombre total de comptes rendus de présentation :", totalPresentationReports);
            console.log("Nombre total de visites cette semaine :", weeklyVisits);
            console.log("Nombre total de visites ce mois-ci :", monthlyVisits);
        } 
        catch (error) {
            console.error("Erreur lors du calcul des visites :", error);
        }
    }

     calculateStats()

    return (
        <h3>Statistiques des visites réalisées</h3>
    )
}

export default StatisticsVisits