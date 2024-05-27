
// Fichier Account
 
import { useNavigate } from "react-router-dom"
import { logout } from "../auth/AuthUtils"

function Account() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <div>
            <h1>Mon compte</h1>
            <button onClick={handleLogout}>Déconnexion</button>
        </div>
    )
}

export default Account