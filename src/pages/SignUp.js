
// Fichier SignUp.js

import "../index.css" 
import { useState, useEffect } from "react"
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../firebase.config.js"
import { doc, setDoc, addDoc, collection } from "firebase/firestore"
import { Link, useNavigate } from "react-router-dom"
import emailImg from "../assets/email.png"
import mdpImg from "../assets/mdp.png"
import userImg from "../assets/users.png"
import closeImg from "../assets/close-white.png"

function SignUp() {
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("")
    const [role, setRole] = useState("")
    const [departments, setDepartments] = useState([])
    const [selectedDepartments, setSelectedDepartments] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [currentUserUid, setCurrentUserUid] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        // Obtenir l'utilisateur courant lors du chargement du composant
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserUid(user.uid)
            } else {
                setCurrentUserUid(null)
            }
        })
        return unsubscribe     
    }, [])
 
    const handleSignUp = async (e) => {
        e.preventDefault()

        if (password.length < 6) {
            setMessage("Le mot de passe doit contenir au moins 6 caractères.")
            setMessageType("error")
        }
        if (!role) {
            setMessage("Veuillez sélectionner un rôle.")
            return
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            const userRef = doc(db, "users", user.uid)

            await setDoc(userRef, {
                userId: user.uid,
                firstname: firstname,
                lastname: lastname,
                email: email,
                role: role,
                departments: role === "commercial" ? selectedDepartments : []
            }) 

            await addDoc(collection(db, "historiqueAdmin"), {
                userId: currentUserUid,
                date: new Date(),
                action: `Nouvel utilisateur inscrit : ${firstname} ${lastname}`, 
            })

            setMessage("Inscription réussie")
            setMessageType("success")
            navigate("/connexion") 
        }
        catch (error) {
            console.error("Erreur lors de l'inscription", error)
            setMessage("Inscription échouée")
            setMessageType("error")
        }
    }

    useEffect(() => {
        if (role === "commercial" && searchTerm) {
            const service = new window.google.maps.places.AutocompleteService();
            service.getPlacePredictions(
                {
                    input: searchTerm,
                    componentRestrictions: { country: 'fr' },
                    types: ['(regions)']
                },
                (predictions, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        const filteredDepartments = predictions
                            .filter(prediction => prediction.types.includes('administrative_area_level_2')) 
                            .filter(prediction => prediction.description.endsWith(", France"))  
                            .map(prediction => prediction.description.replace(", France", ""))
                        setDepartments(filteredDepartments)
                    }
                }
            )
        } else {
            setDepartments([])
        }
    }, [role, searchTerm])

    const handleAddDepartment = (department) => {
        if (!selectedDepartments.includes(department)) {
            setSelectedDepartments([...selectedDepartments, department])
            setSearchTerm("")
            setDepartments([])
        }
    }

    const handleRemoveDepartment = (department) => {
        setSelectedDepartments(selectedDepartments.filter(dep => dep !== department))
    }

    return (
        <div className="signup-page">
            <form className="signup-form">
                <h1>INSCRIPTION</h1>

                <div className="email-input">
                    <img src={userImg} alt="icone prenom" />   
                    <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="Prénom" />
                </div>
                <div className="email-input">
                    <img src={userImg} alt="icone nom" />   
                    <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Nom" />
                </div>
                <div className="email-input">
                    <img src={emailImg} alt="icone email" />   
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
                </div>
                <div className="email-input">
                    <img src={mdpImg} alt="icone email" />   
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
                </div>
                <label><input className="checkbox" type="radio" value="administrateur" checked={role === "administrateur"} onChange={(e) => setRole(e.target.value)} />Compte administrateur</label><br></br>
                <label><input className="checkbox" type="radio" value="commercial" checked={role === "commercial"} onChange={(e) => setRole(e.target.value)} />Compte commercial</label>

                {role === "commercial" && (
                    <div>
                        <input className="input-dpt" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Attribuer un département" />
                        {departments.length > 0 && (
                            <ul>
                                {departments.map((department, index) => (
                                    <li key={index} style={{background: "white", padding: "5px", borderBottom: "1px solid #cfcfcf", cursor: "pointer"}} onClick={() => handleAddDepartment(department)}>
                                        {department}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div style={{color: "white"}}>
                            <p style={{marginBottom: "10px", fontWeight: "bold"}}>Départements attribués :</p>
                            <ul>
                                {selectedDepartments.map((department, index) => (
                                    <div style={{display: "flex", alignItems: "center", marginBottom: "5px"}}>
                                        <li key={index} >{department} </li>
                                        <img onClick={() => handleRemoveDepartment(department)} className="delete-dpt" src={closeImg} alt="retirer le département" />
                                    </div>
                                    
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {messageType === "success" && (
                    <div className="success-animation">
                        <div className="circle"> 
                            <div className="checkmark"></div>
                        </div>
                        <span>{message}</span>
                    </div>
                )}

                {messageType === "error" && (
                    <p className="error-message">{message}</p>
                )}

                <button onClick={handleSignUp} className="button-white">M'inscrire</button>
                <Link to="/connexion" className="link-signup">Me connecter</Link>
                <p className={messageType === "success" ? "sucess-message" : "error-message"}>{message}</p>
            </form>
        </div>
    )
}
export default SignUp
