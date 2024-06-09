
// Fichier Fiches.js 

import React, { useState } from "react"
import FeuillesDeRouteSemaine from "../components/FeuillesDeRouteSemaine"
import FicheClient from "../components/FicheClient"
import FicheProspect from "../components/FicheProspect"
import FicheDemonstration from "../components/FicheDemonstration"
import FichePresentation from "../components/FichePresentation"

function Fiches({ uid }) {
    const [currentComponent, setCurrentComponent] = useState(null)

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
                        <button onClick={openFDR}>Feuilles de route de la semaine</button>
                        <button onClick={openFicheClient}>Fiche de suivi Client</button>
                        <button onClick={openFicheProspect}>Fiche de suivi Prospect</button>
                        <button onClick={openDemonstration}>CR de RDV de Démonstration</button>
                        <button onClick={openPresentation}>CR de RDV de Présentation</button>
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
        </div>
    )
}

export default Fiches
