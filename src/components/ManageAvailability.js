
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

            

            {showHistory && (
                <UnavailabilityHistory />  
            )}
        </section>
    );
}

export default ManageAvailability;
