
// fichier Entry.js

import { Link } from "react-router-dom"
import { useState} from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase.config" 
import logo from "../assets/logo.png"

function Home() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false) 

    const handleResetPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.");
            setIsModalOpen(false)
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'e-mail de réinitialisation du mot de passe :", error);
            setMessage("Une erreur s'est produite lors de l'envoi de l'e-mail de réinitialisation du mot de passe. Veuillez réessayer.");
        }
    }



    return (
        <div className="entry">
            <h1>GEO COIFF</h1>
            <img style={{width: "200px", marginBottom: "50px"}} src={logo} alt="Logo" />
            
            

            <Link to="/connexion" className="button-white">Me connecter</Link>

            <button onClick={() => setIsModalOpen(true)} style={{color: "white", background: "none", border: "none", fontFamily: "Roboto", textDecoration: "underline", cursor: "pointer"}}>Mot de passe oublié</button>
            {message && <p style={{marginTop: "20px", marginBottom: "0px"}}>{message}</p>} 
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content" style={{background: "white", padding: "40px 20px", borderRadius: "20px", textAlign: "center"}}>
                        <p style={{color: "black", marginBottom: "20px", lineHeight: "20px"}}>Si vous souhaitez réinitialiser votre mot de passe, <br></br>veuillez entrer votre adresse e-mail</p>
                        <input style={{width: "100%"}} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}  /><br></br>
                        <button className="button-colored" onClick={handleResetPassword}>Valider</button>
                        
                        <button onClick={() => setIsModalOpen(false)} className="cancel">Annuler</button>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Home


