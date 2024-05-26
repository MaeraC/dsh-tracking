
// Fichier Dashbaord-Admin.js

import { useLocation } from "react-router-dom"

function DashboardAdmin() {

    const location = useLocation()
    const { firstname } = location.state || {}

    return (
        <div>
            TABLEAU DE BORD ADMINISTRATEUR
            <h1>Bonjour, {firstname} !</h1>
            <p>Bienvenue sur votre tableau de bord.</p>
        </div>
    )
}

export default DashboardAdmin