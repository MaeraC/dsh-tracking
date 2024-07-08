
// Fichier Preview

import RecapCom from "../components/Commercial/RecapCom"
import StatisticsVisits from "../components/Commercial/StatisticsVisits"

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
            
            <div className="content-prev">   
                <StatisticsVisits uid={uid} />
                <RecapCom uid={uid} />
            </div>
        </div>
    )
}

export default Preview