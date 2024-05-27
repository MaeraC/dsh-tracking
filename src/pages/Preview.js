
// Fichier Preview

import Geolocation from "../components/Geolocation" 

function Preview({ firstname }) {

    return (     
        <div className="preview-section"> 
            <span className="status">COMMERCIAL</span>
            <h1>Bonjour, <span className="name">{firstname}</span> !</h1>
            <p>Bienvenue sur votre tableau de bord.</p>

            <Geolocation /> 
        </div>
    )
}

export default Preview