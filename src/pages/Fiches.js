
// Fichier Fiches.js 

import { useState }                                             from "react"
import FeuillesDeRouteSemaine                                   from "./FeuillesDeRouteSemaine"
import FicheClient                                              from "../components/FicheClient"
import FicheProspect                                            from "../components/FicheProspect"
import FicheDemonstration                                       from "../components/FicheDemonstration"
import FichePresentation                                        from "../components/FichePresentation"
import Historique                                               from "../components/Historique"
import FeuillesHebdo from "../components/FeuillesHebdo"
import FeuilleJournalière from "../components/FeuilleJournalière"
import RapportMensuelVisites from "../components/RapportMensuelVisites"
import SearchFeuillesDuJour from "../components/SearchFeuillesDuJour"
import FeuillesMensuelles from "../components/FeuillesMensuelles"
import RapportVisitesAdmin from "../components/RapportVisitesAdmin"
  
function Fiches({ uid }) {
    const [currentComponent, setCurrentComponent]               = useState(null)

    const openFDR = () => {
        setCurrentComponent("FDR")
    } 

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

    const openPresentation = () => {
        setCurrentComponent("Présentation")
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

    const openRapportAdmin = () => {
        setCurrentComponent("RapportAdmin")
    }

    const openSearchFeuillesDuJour = () => {
        setCurrentComponent("SearchFdj")
    }

    const returnBack = () => {
        setCurrentComponent(null)
    }

    return (
        <div className="fiches-section" style={{paddingBottom: "100px"}}>
            <header>
                <h1>Mes fiches</h1>
            </header>

            <div>
                
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
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openRapportAdmin}>Rapport des ADMIN</button>
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
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openDemonstration}>CR de RDV de Démonstration</button>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openPresentation}>CR de RDV de Présentation</button>
                    </div>
                    <div className="titre-fiche">
                        <h1>A définir</h1>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "center"}}>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openFDR}>Feuilles de route de la semaine</button>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openHistorique}>Historique des salons</button>
                        <button style={{margin: "20px", width: "40%"}} className="button" onClick={openSearchFeuillesDuJour}>ADMIN ! Rechercher feuilles du jour par date</button>
                    </div>

                        
                        
                    </>
                )}
            </div>

            {currentComponent === "FDR" && (
                <FeuillesDeRouteSemaine uid={uid} onReturn={returnBack}  />
            )}

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

            {currentComponent === "Présentation" && (
                <FichePresentation uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "Historique" && (
                <Historique uid={uid} onReturn={returnBack} />
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

            {currentComponent === "RapportAdmin" && ( 
                <RapportVisitesAdmin uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "SearchFdj" && ( 
                <SearchFeuillesDuJour uid={uid} onReturn={returnBack} />
            )}
        </div>
    )
}

export default Fiches
