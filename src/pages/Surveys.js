
// Fichier Surveys

import FDRSemaine from "../components/FDRSemaine"
import CRDemonstration from "../components/CRDemonstration"
import CRProspection from "../components/CRProspection"

import { Link, Routes, Route, useLocation } from "react-router-dom" 
 
function Surveys({ uid }) {
     
    const location = useLocation()
    const isSurveyRoute = location.pathname === "/tableau-de-bord-commercial/questionnaires"

    return (
        <section className="surveys-section">
            
            {isSurveyRoute && (
                <div className="all-surveys">
                    <Link to="fdr-semaine" className="button">Feuille De Route de la semaine écoulée</Link>
                    <Link to="cr-rdv-prospection" className="button">Compte rendu du RDV de Prospection</Link>
                    <Link to="cr-rdv-demonstration" className="button">Compte rendu du RDV de Démonstration</Link>
                </div>
            )}

            <Routes>
                <Route path="fdr-semaine/*" element={<FDRSemaine uid={uid} />} />
                <Route path="cr-rdv-prospection" element={<CRProspection />} />
                <Route path="cr-rdv-demonstration" element={<CRDemonstration />} />
            </Routes>
        </section>
    )
}

export default Surveys