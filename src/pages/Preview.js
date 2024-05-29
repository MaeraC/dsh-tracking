
// Fichier Preview

import StatisticsVisits from "../components/StatisticsVisits"

function Preview({ firstname }) {

    return (     
        <div className="preview-section"> 
            <header>
                <h1>Tableau de bord</h1>
            </header>
            <div className="hello">
                <span className="status">COMMERCIAL</span>
                <h2>Bonjour, <span className="name">{firstname}</span> !</h2>
                <p>Voici les statistiques des vos visites effectuées</p>
            </div>
            

            <StatisticsVisits />
        </div>
    )
}

export default Preview