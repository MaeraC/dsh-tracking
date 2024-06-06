
// Fichier Fiches.js 

import FeuillesDeRouteSemaine from "../components/FeuillesDeRouteSemaine"
import { useState } from "react"


function Fiches({ uid }) {

    const [isFDROpen, setisFDROpen] = useState(false)

    const openFDR = () => {
        setisFDROpen(true)
        console.log(isFDROpen)
    }

    const returnBack = () => {
        setisFDROpen(false)
    }

    return (
        <div className="fiches-section">
            <header>
                <h1>Mes fiches</h1>
            </header> 

            <div className="content">
                <button onClick={openFDR}>Feuilles de route de la semaine</button>
            </div>

            {isFDROpen && (
                <FeuillesDeRouteSemaine uid={uid} onReturn={returnBack} />
            )}
            
        </div>
    )
}

export default Fiches 