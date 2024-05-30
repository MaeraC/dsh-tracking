
// Fichier Preview

import StatisticsVisits from "../components/StatisticsVisits"

function Preview({ firstname, uid }) {

    return (     
        <div className="preview-section"> 
            <header>
                <h1>Tableau de bord</h1>
            </header>
            <div className="hello">
                <h2>Bonjour, <span className="name">{firstname}</span> !</h2>
                <p>Voici les statistiques de vos visites effectuées.</p>
            </div>
            

            <StatisticsVisits uid={uid} />
        </div>
    )
}

export default Preview