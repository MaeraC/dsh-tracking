
// Fichier Fiches.js 

import { useState }                                             from "react"
import FeuillesDeRouteSemaine                                   from "./FeuillesDeRouteSemaine"
import FicheClient                                              from "../components/FicheClient"
import FicheProspect                                            from "../components/FicheProspect"
import FicheDemonstration                                       from "../components/FicheDemonstration"
import FichePresentation                                        from "../components/FichePresentation"
import Historique                                               from "../components/Historique"
  
function Fiches({ uid }) {
    const [currentComponent, setCurrentComponent]               = useState(null)

    const openFDR = () => {
        setCurrentComponent("FDR")
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

    const returnBack = () => {
        setCurrentComponent(null)
    }

    return (
        <div className="fiches-section">
            <header>
                <h1>Mes fiches</h1>
            </header>

            <div className="content">
                {!currentComponent && (
                    <>
                        <button className="button" onClick={openFDR}>Feuilles de route de la semaine</button>
                        <button className="button" onClick={openFicheClient}>Fiche de suivi Client</button>
                        <button className="button" onClick={openFicheProspect}>Fiche de suivi Prospect</button>
                        <button className="button" onClick={openDemonstration}>CR de RDV de Démonstration</button>
                        <button className="button" onClick={openPresentation}>CR de RDV de Présentation</button>
                        <button className="button" onClick={openHistorique}>Historique des salons</button>
                    </>
                )}
            </div>

            {currentComponent === "FDR" && (
                <FeuillesDeRouteSemaine uid={uid} onReturn={returnBack} />
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
        </div>
    )
}

export default Fiches
