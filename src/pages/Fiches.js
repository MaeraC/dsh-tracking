
// Fichier Fiches.js 

import { useNavigate } from "react-router-dom"


function Fiches({ uid }) {

    const navigate = useNavigate()

    return (
        <div className="fiches-section">
            <header>
                <h1>Mes fiches</h1>
            </header>

            <div className="content">
                <button onClick={() => navigate('/tableau-de-bord-commercial/feuilles-de-route-de-la-semaine')}>Feuilles de route de la semaine</button>
            </div>
        </div>
    )
}

export default Fiches 