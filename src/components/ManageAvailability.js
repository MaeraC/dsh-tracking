
// Fichier ManageAvailability.js

import { useState, useEffect } from "react"

import UnavailabilityHistory from "../pages/UnavailabilityHistory"

function ManageAvailability() {

    const [showHistory, setShowHistory] = useState(false)




    const openHistory = () => {
        setShowHistory(true)
    }

    return (
        <section className="available-section">

            <button className="button" onClick={openHistory} >Voir la fiche d'indisponibilité</button>

            {showHistory && (
                <UnavailabilityHistory />  
            )}
        </section>
    );
}

export default ManageAvailability;
