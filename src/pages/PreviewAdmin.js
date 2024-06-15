
// Fichier PreviewAdmin

import StatisticsAdmin from "../components/StatisticsAdmin"  

function PreviewAdmin({ firstname }) {

    return (
        <div className="preview-section preview-admin">
            <header>
                <h1>Tableau de bord</h1>
            </header>
            <div className="hello">
                <h2>Bonjour, <span className="name">{firstname}</span> !</h2>
                <p>Voici votre tableau de gestion administrateur</p>
            </div>

            <StatisticsAdmin />
        </div>
    )
}

export default PreviewAdmin  