
// Fichier StatisticsVisitsAdmin.js

import { collection, getDocs, Timestamp, query, where } from "firebase/firestore";
import { db } from "../firebase.config.js";
import { useEffect, useState } from "react";

function StatisticsAdmin() {

    const [stats, setStats] = useState({
        feuilleDeRouteCount: 0,
        ficheDeProspectionCount: 0,
        ficheSuiviClientCount: 0,
        ficheSuiviProspectCount: 0,
        compteRenduPresentationCount: 0,
        compteRenduDemonstrationCount: 0,
        totalForms: 0,
        totalFormsWeek: 0,
        totalFormsMonth: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            const visitsCollection = collection(db, 'visits');
            const visitsSnapshot = await getDocs(visitsCollection);

            let feuilleDeRouteCount = 0;
            let ficheDeProspectionCount = 0;
            let ficheSuiviClientCount = 0;
            let ficheSuiviProspectCount = 0;
            let compteRenduPresentationCount = 0;
            let compteRenduDemonstrationCount = 0;

            visitsSnapshot.forEach(doc => {
                feuilleDeRouteCount++;

                const data = doc.data();

                if (data.dailyProspection) {
                    ficheDeProspectionCount += data.dailyProspection.length;
                }
                if (data.suiviClient) {
                    ficheSuiviClientCount += data.suiviClient.length;
                }
                if (data.suiviProspect) {
                    ficheSuiviProspectCount += data.suiviProspect.length;
                }
                if (data.crPresentation) {
                    compteRenduPresentationCount += data.crPresentation.length;
                }
                if (data.crDemonstration) {
                    compteRenduDemonstrationCount += data.crDemonstration.length;
                }
            });

            const totalForms =
                feuilleDeRouteCount +
                ficheDeProspectionCount +
                ficheSuiviClientCount +
                ficheSuiviProspectCount +
                compteRenduPresentationCount +
                compteRenduDemonstrationCount;

            // Calculate forms for the last week and month
            const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            const oneMonthAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

            const countFormsByDateRange = async (startDate, endDate) => {
                const dateRangeQuery = query(
                    visitsCollection,
                    where('createdAt', '>=', startDate),
                    where('createdAt', '<=', endDate)
                );

                const dateRangeSnapshot = await getDocs(dateRangeQuery);

                let count = 0;
                dateRangeSnapshot.forEach(doc => {
                    count++;
                    const data = doc.data();

                    if (data.dailyProspection) count += data.dailyProspection.length;
                    if (data.suiviClient) count += data.suiviClient.length;
                    if (data.suiviProspect) count += data.suiviProspect.length;
                    if (data.crPresentation) count += data.crPresentation.length;
                    if (data.crDemonstration) count += data.crDemonstration.length;
                });

                return count;
            };

            const totalFormsWeek = await countFormsByDateRange(oneWeekAgo, Timestamp.now());
            const totalFormsMonth = await countFormsByDateRange(oneMonthAgo, Timestamp.now());

            setStats({
                feuilleDeRouteCount,
                ficheDeProspectionCount,
                ficheSuiviClientCount,
                ficheSuiviProspectCount,
                compteRenduPresentationCount,
                compteRenduDemonstrationCount,
                totalForms,
                totalFormsWeek,
                totalFormsMonth
            });
        };

        fetchData();
    }, []);

    return (
        <section className="stats-section">
            <div className="stats-nb">
                <div className="nb total">
                    <p>Total des visites</p>
                    <span>{stats.totalForms}</span>
                </div>
                <div className="nb total">
                    <p>Total ce mois-ci</p>
                    <span>{stats.totalFormsMonth}</span>
                </div>
                <div className="nb total">
                    <p>Total cette semaine</p>
                    <span>{stats.totalFormsWeek}</span>
                </div>
                <div className="nb fr">
                    <p>Feuilles de route</p>
                    <span>{stats.feuilleDeRouteCount}</span>
                </div>
                <div className="nb pj">
                    <p>Prospection journalière</p>
                    <span>{stats.ficheDeProspectionCount}</span>
                </div>
                <div className="nb sp">
                    <p>Suivi Prospect</p>
                    <span>{stats.ficheSuiviProspectCount}</span>
                </div>
                <div className="nb sc">
                    <p>Suivi Client</p>
                    <span>{stats.ficheSuiviClientCount}</span>
                </div>
                <div className="nb crd">
                    <p>CR Démonstration</p>
                    <span>{stats.compteRenduDemonstrationCount}</span>
                </div>
                <div className="nb crp">
                    <p>CR Présentation</p>
                    <span>{stats.compteRenduPresentationCount}</span>
                </div>
            </div>
        </section>
    );
}

export default StatisticsAdmin 
