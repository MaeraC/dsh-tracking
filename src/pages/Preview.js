
// Fichier Preview

import StatisticsVisits from "../components/StatisticsVisits"

function Preview({ firstname }) {

    return (     
        <div className="preview-section"> 
            <span className="status">COMMERCIAL</span>
            <h1>Bonjour, <span className="name">{firstname}</span> !</h1>
            <p>Bienvenue sur votre tableau de bord.</p>

            <StatisticsVisits />
        </div>
    )
}

export default Preview