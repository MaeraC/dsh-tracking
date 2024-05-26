
// Fichier Logout

import { useNavigate } from "react-router-dom"
import { logout } from "../auth/AuthUtils"

function Logout() {

    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <div>
            <button onClick={handleLogout}>Déconnexion</button>
        </div>
    )
}

export default Logout