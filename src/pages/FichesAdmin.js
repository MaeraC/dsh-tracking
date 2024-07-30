
// Fichier FichesAmin.js 

import { useState }                                             from "react"
import Client                                              from "../components/Administrateur/Client"
import Historique                                               from "../components/Historique"
import RecapAdmin from "../components/Administrateur/RecapAdmin"
import FeuilleJournaliereAdmin from "../components/Administrateur/FeuilleJournaliereAdmin"
import RapportVisitesAdmin from "../components/Administrateur/RapportVisitesAdmin"
import SearchCRD from "../components/SearchCRD"
import Prospect from "../components/Administrateur/Prospect" 
import Demonstration from "../components/Administrateur/Demonstration"
  
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

    const openCRD = () => {
        setCurrentComponent("SearchCRD")
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
                        <h1>Feuilles de route et historique</h1>
                    </div> 
                    <div style={{width: "100%" , display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "space-evenly"}}>
                        <button style={{width: "40%", marginRight: "20px"}} className="button" onClick={openFdj}>Feuilles de route</button>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openHistorique}>Historique des salons</button>
                    </div>
                    <div className="titre-fiche">
                        <h1>Fiches de suivi</h1>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "space-evenly"}}>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openFicheClient}>Fiches de suivi Client</button>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openFicheProspect}>Fiches de suivi Prospect</button>
                    </div>
                    <div className="titre-fiche">
                        <h1>Fiches de Compte rendu</h1>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "space-evenly"}}>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openDemonstration}>CR de RDV de Démonstration (formulaire)</button>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openCRD}>CR de RDV de Démonstration (recherche)</button>
                    </div>
                    <div className="titre-fiche">
                        <h1>Rapports</h1>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", padding: "20px", justifyContent: "space-evenly"}}>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openTableauVisites}>Rapport des visites effectuées</button>
                        <button style={{width: "40%", marginRight: "20px"}}  className="button" onClick={openRapportVisites}>Rapport des salons visités</button>
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
                <Client uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "Prospect" && (
                <Prospect uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "Démonstration" && (
                <Demonstration uid={uid} onReturn={returnBack} />
            )}

            {currentComponent === "SearchCRD" && (
                <SearchCRD uid={uid} onReturn={returnBack} /> 
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