
// Fichier PreviewAdmin

function PreviewAdmin({ firstname }) {

    return (
        <div className="preview-section">
            <header>
                <h1>Tableau de bord</h1>
            </header>
            <div className="hello">
                <h2>Bonjour, <span className="name">{firstname}</span> !</h2>
                <p>Voici les statistiques de vos commerciaux.</p>
            </div>
        </div>
    )
}

export default PreviewAdmin  