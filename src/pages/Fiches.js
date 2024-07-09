
// Fichier Fiches.js 

import { useState }                                             from "react"
import FicheClient                                              from "../components/Commercial/FicheClient"
import FicheProspect                                            from "../components/FicheProspect"
import FicheDemonstration                                       from "../components/FicheDemonstration"
import FeuillesHebdo from "../components/Commercial/FeuillesHebdo"
import FeuilleJournalière from "../components/Commercial/FeuilleJournalière"
import RapportMensuelVisites from "../components/Commercial/RapportMensuelVisites"
import FeuillesMensuelles from "../components/Commercial/FeuillesMensuelles"
import HistoriqueCom from "../components/Commercial/HistoriqueCom"
  
function Fiches({ uid }) {
    const [currentComponent, setCurrentComponent]               = useState(null)

    const openFeuillesDeRoute = () => {
        setCurrentComponent("FeuillesDeRoute")
    }

    const openFicheClient = () => {
        setCurrentComponent("Client")
    }

    const openFicheProspect = () => {
        setCurrentComponent("Prospect")
    }

    const openDemonstration = () => {
        setCurrentComponent("Démonstration")
    }

    const openHistorique = () => {
        setCurrentComponent("Historique")
    }

    const openFeuillesHebdo = () => {
        setCurrentComponent("FeuillesHebdo")
    }

    const openFeuillesMensuelles = () => {
        setCurrentComponent("FeuillesMensuelles")
    }

    const openRapportMensuel = () => {
        setCurrentComponent("RapportMensuel")
    }

    const returnBack = () => {
        setCurrentComponent(null)
    }

    return (
        <div className="fiches-section" style={{paddingBottom: "100px"}}>
            <header>
                <h1>Mes fiches</h1>
            </header>

            <div className="content">
                {!currentComponent && (
                    <>
                    <div className="titre-fiche">
                        <h1>Feuilles de route</h1>
                    </div> 
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "center"}}>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openFeuillesDeRoute}>Feuilles de route journalières</button>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openFeuillesHebdo}>Feuilles de route Hebdomadaires</button>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openFeuillesMensuelles}>Feuilles de route mensuelles</button>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openRapportMensuel}>Rapport des visites réalisées</button>
                    </div>
                    <div className="titre-fiche">
                        <h1>Fiches de suivi</h1>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "center"}}>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openFicheClient}>Fiche de suivi Client</button>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openFicheProspect}>Fiche de suivi Prospect</button>
                    </div>
                    <div className="titre-fiche">
                        <h1>Fiches de Compte rendu</h1>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "center"}}>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openDemonstration}>CR de RDV de Démonstration (formulaire)</button>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openHistorique}>Historique des salons</button>
                    </div>
                    </>
                )}
            </div>
 

            {currentComponent === "FeuillesDeRoute" && (
                <FeuilleJournalière uid={uid} onReturn={returnBack}  />
            )}

            {currentComponent === "Client" && (
                <FicheClient uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "Prospect" && (
                <FicheProspect uid={uid} onReturn={returnBack} openFicheClient={openFicheClient} />
            )}

            {currentComponent === "Démonstration" && (
                <FicheDemonstration uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "Historique" && (
                <HistoriqueCom uid={uid} onReturn={returnBack} />
            )}
 
            {currentComponent === "FeuillesHebdo" && ( 
                <FeuillesHebdo uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "FeuillesMensuelles" && ( 
                <FeuillesMensuelles uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "RapportMensuel" && ( 
                <RapportMensuelVisites uid={uid} onReturn={returnBack} />
            )}
        </div>
    )
}

export default Fiches
