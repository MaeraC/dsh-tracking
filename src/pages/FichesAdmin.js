
// Fichier FichesAmin.js 

import { useState }                                             from "react"
import FicheClient                                              from "../components/FicheClient"
import FicheProspect                                            from "../components/FicheProspect"
import FicheDemonstration                                       from "../components/FicheDemonstration"
import FichePresentation                                        from "../components/FichePresentation"
import Historique                                               from "../components/Historique"
import RecapAdmin from "../components/RecapAdmin"
import FeuilleJournaliereAdmin from "../components/FeuilleJournaliereAdmin"
import RapportVisitesAdmin from "../components/RapportVisitesAdmin"
  
function FichesAmin({ uid }) {
    const [currentComponent, setCurrentComponent]               = useState(null)



    const openFdj = () => {
        setCurrentComponent("fdj")
    }

    const openRapportVisites = () => {
        setCurrentComponent("rapportVisites")
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

    const openTableauVisites = () => {
        setCurrentComponent("TableauVisites")
    }

    const returnBack = () => {
        setCurrentComponent(null)
    }

    return (
        <div className="fiches-section fiches-section-admin">
            <header>
                <h1>Mes fiches</h1>
            </header>

            <div className="content" style={{width: "100%"}}>

                {!currentComponent && (
                    <>
                    <div className="titre-fiche">
                        <h1>Feuilles de route</h1>
                    </div> 
                    <div style={{width: "100%" , display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "center"}}>
                        <button style={{width: "40%", marginRight: "20px"}} className="button" onClick={openFdj}>Feuilles de route</button>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openRapportVisites}>Rapport Visites</button>
                    </div>
                    <div className="titre-fiche">
                        <h1>Fiches de suivi</h1>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "center"}}>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openFicheClient}>Fiche de suivi Client</button>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openFicheProspect}>Fiche de suivi Prospect</button>
                    </div>
                    <div className="titre-fiche">
                        <h1>Fiches de Compte rendu</h1>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "center"}}>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openDemonstration}>CR de RDV de Démonstration</button>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openPresentation}>CR de RDV de Présentation</button>
                    </div>
                    <div className="titre-fiche">
                        <h1>A définir</h1>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "center"}}>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openHistorique}>Historique des salons</button>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openTableauVisites}>Tableau des visites</button>
                    </div>
                    </>
                )}
            </div>

            {currentComponent === "fdj" && (
                <FeuilleJournaliereAdmin uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "rapportVisites" && (
                <RapportVisitesAdmin uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "Client" && (
                <FicheClient uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "Prospect" && (
                <FicheProspect uid={uid} onReturn={returnBack} />
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

            {currentComponent === "TableauVisites" && (
                <RecapAdmin uid={uid} onReturn={returnBack} />
            )}
        </div>
    )
}

export default FichesAmin