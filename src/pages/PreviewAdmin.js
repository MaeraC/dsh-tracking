
// Fichier PreviewAdmin

import { useNavigate } from "react-router-dom"
import { db, auth } from "../firebase.config"  
import { useState, useEffect } from "react"
import StatisticsAdmin from "../components/Administrateur/StatisticsAdmin" 
import { collection, getDocs, getDoc, Timestamp, addDoc, doc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged, } from "firebase/auth"
import deleteIcon                                       from "../assets/delete.png"  

import back from "../assets/back.png" 

function PreviewAdmin({ firstname, uid }) {
    const [signUpModal, setSignUpModal] = useState(false)
    const [showManage, setShowManage]                     = useState(false)
    const [show, setShow] = useState(false)
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState("")
    const [selectedReason, setSelectedReason] = useState(""); 
    const [customReason, setCustomReason] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    // eslint-disable-next-line
    const [message, setMessage] = useState("")
    const [admin, setAdmin] = useState({})
    const [unavailabilities, setUnavailabilities] = useState([])
    const [userNames, setUserNames] = useState({})
    const [showHistorique, setShowHistorique] = useState(false)
    const [historique, setHistorique] = useState([])
    const [showDeleteUser, setshowDeleteUser] = useState(false) 
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [manageDpt, setManageDpt] = useState(false)
    const [userDepartments, setUserDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const navigate = useNavigate()

    useEffect(() => {
        const fetchUnavailabilities = async () => {
            const unavailabilitySnapshot = await getDocs(collection(db, "unavailabilities"))
            const unavailabilityList = unavailabilitySnapshot.docs.map(doc => doc.data())
            setUnavailabilities(unavailabilityList)
        }

        const fetchUserNames = async () => {
            const usersSnapshot = await getDocs(collection(db, "users"))

            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            const userNameMap = {}

            usersList.forEach(user => {
                userNameMap[user.id] = `${user.firstname} ${user.lastname}`
            })

            setUserNames(userNameMap)
        }

        const fetchHistorique = async () => {
            const historiqueSnapshot = await getDocs(collection(db, "historiqueAdmin"))
            const historiqueList = historiqueSnapshot.docs.map(doc => doc.data())
            setHistorique(historiqueList)
        }

        fetchUnavailabilities()
        fetchUserNames()
        fetchHistorique()
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, "users"))

            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            const updatedUsers = usersList.filter((user) => !user.deleted);
            setUsers(updatedUsers);
        }

        const fetchAdmin = async (user) => {
            const adminDoc = await getDoc(doc(db, "users", user.uid))
            setAdmin({ id: user.uid, ...adminDoc.data() })
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchAdmin(user)
            }
        })

        fetchUsers()
    }, [])

    useEffect(() => {
        if (selectedUser) {
            const fetchUserDepartments = async () => {
                const userDoc = await getDoc(doc(db, "users", selectedUser))
                if (userDoc.exists()) {
                    setUserDepartments(userDoc.data().departments || [])
                }
            }
            fetchUserDepartments()
        }
    }, [selectedUser])

    useEffect(() => {
        const service = new window.google.maps.places.AutocompleteService()
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
                        .map(prediction => prediction.description.replace(", France", ""));
                    setDepartments(filteredDepartments);
                }
            }
        )
    }, [searchTerm])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedUser || !selectedReason || !startDate || !endDate) {
            setMessage("Veuillez remplir tous les champs.")
            return
        }

        const reason = selectedReason === "Autre" ? customReason : selectedReason

        try {
            await addDoc(collection(db, "unavailabilities"), {
                userId: selectedUser,
                reason: reason,
                startDate: Timestamp.fromDate(new Date(startDate)),
                endDate: Timestamp.fromDate(new Date(endDate)),
                adminName: `${admin.firstname} ${admin.lastname}`
            })

            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `VRP déconnecté : ${userNames[selectedUser]}`, 
            })

            setMessage("Indisponibilité ajoutée avec succès. L'utilisateur ne pourra pas se connecter durant la période saisie.")
            // Réinitialiser le formulaire
            setSelectedUser("")
            setSelectedReason("")
            setCustomReason("")
            setStartDate("")
            setEndDate("")

            setShowManage(false)
        } 
        catch (error) {
            console.error("Erreur lors de l'ajout de l'indisponibilité: ", error)
            setMessage("Erreur lors de l'ajout de l'indisponibilité.")
        }
    }

    const handleSearch = async () => {
        try {
            const unavailabilitySnapshot = await getDocs(collection(db, "unavailabilities"));
            const unavailabilityList = unavailabilitySnapshot.docs.map(doc => doc.data());

            // Filtrer les résultats en fonction de startDate et endDate
            const filteredUnavailabilities = unavailabilityList.filter(unavailability => {
                const startDateTimestamp = unavailability.startDate?.seconds || 0;
                const endDateTimestamp = unavailability.endDate?.seconds || Number.MAX_SAFE_INTEGER;

                if (startDate && endDate) {
                    const startTimestamp = new Date(startDate).getTime() / 1000;
                    const endTimestamp = new Date(endDate).getTime() / 1000;
                    return startTimestamp <= endDateTimestamp && endTimestamp >= startDateTimestamp;
                } else if (startDate) {
                    const startTimestamp = new Date(startDate).getTime() / 1000;
                    return startTimestamp <= endDateTimestamp;
                } else if (endDate) {
                    const endTimestamp = new Date(endDate).getTime() / 1000;
                    return endTimestamp >= startDateTimestamp;
                }
                return true; // Retourne tous les éléments si aucune date sélectionnée
            });

            setUnavailabilities(filteredUnavailabilities);
            console.log(unavailabilities)
        } catch (error) {
            console.error("Erreur lors de la récupération et du filtrage des indisponibilités : ", error);
        }
    }

    const handleDeleteUser = async () => {
        try {
            if (!selectedUser) {
                setMessage("Veuillez sélectionner un utilisateur.");
                return
            }

            await updateDoc(doc(db, "users", selectedUser), {
                deleted: true,
            })
        
            setMessage(
                `L'utilisateur ${userNames[selectedUser]} a été supprimé avec succès.`
            )
           
            const updatedUsers = users.filter((user) => !user.deleted)
            setUsers(updatedUsers);

            setSelectedUser("");
            setShowDeleteConfirm(false)
            setshowDeleteUser(false)
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur :", error)
            setMessage("Erreur lors de la suppression de l'utilisateur.")
        }
    }

    const addDepartment = async () => {
        if (selectedDepartment) {
            await updateDoc(doc(db, "users", selectedUser), {
                departments: [...userDepartments, selectedDepartment]
            })
            setUserDepartments([...userDepartments, selectedDepartment])
        }
    };

    const deleteDepartment = async (department) => {
        const updatedDepartments = userDepartments.filter(dpt => dpt !== department);
        await updateDoc(doc(db, "users", selectedUser), {
            departments: updatedDepartments
        })
        setUserDepartments(updatedDepartments)
    };

    

    return (
        <div className="preview-section preview-admin">
            <header>
                <h1>Tableau de bord</h1>  
            </header>

            <div className="hello">
                <h2>Bonjour, <span className="name">{firstname}</span> !</h2>
                <p>Voici votre tableau de gestion administrateur</p>
            </div>

            <div className="content">
            <StatisticsAdmin />

                <div className="droits-admin"> 
                    <h2>Sélectionner une action</h2>
                    <button className="button" onClick={() => setSignUpModal(true)} >Inscrire un nouvel utilisateur</button>
                    <button className="button" onClick={() => setshowDeleteUser(true)} >Supprimer un utilisateur</button>
                    <button className="button" onClick={() => setManageDpt(true)} >Gérer les départements des VRP</button>
                    <button className="button" onClick={() => setShowManage(true)}>Rendre indisponible un VRP</button>
                    <button className="button" onClick={() => setShow(true)} >Voir la fiche d'indisponibilités</button>
                    <button className="button" onClick={() => setShowHistorique(true)}>Voir l'historique des actions admin</button>
                </div>

                
            </div>

            {signUpModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Vous allez être redirigé vers la page d'inscription.<br></br><br></br>Êtes-vous sûr de vouloir inscrire un nouvel utilisateur ?</p>
                        <div className="mini-buttons">
                            <button onClick={() => navigate("/inscription")}>Oui</button>
                            <button onClick={() => setSignUpModal(false)}>Non</button>
                        </div>
                    </div> 
                </div>
            )}

            {showDeleteUser && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="user-list">
                            <h3 style={{marginBottom: "30px"}}>Supprimer un VRP</h3>
                            <select className="custom-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                                <option value="">Sélectionner un utilisateur</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {userNames[user.id]}
                                    </option>
                                ))}
                            </select>
                            {selectedUser && (
                                <div>
                                    <button className="button-colored" onClick={() => setShowDeleteConfirm(true)}>Supprimer</button>
                                </div>
                            )}
                            <button className="cancel" onClick={() => {setShowDeleteConfirm(false); setshowDeleteUser(false)}}>Annuler</button>
                        </div>
                    </div> 
                </div>
            )}

            {showDeleteConfirm && (
            <div className="modal">
                <div className="modal-content">
                    <p>Êtes-vous sûr de vouloir supprimer l'utilisateur {userNames[selectedUser]} ?</p>
                    {message && <p style={{margin: "0 20px", color: "grey"}}>{message}</p>}
                    <div className="mini-buttons">
                    <button onClick={handleDeleteUser}>Oui</button>
                    <button  onClick={() => {setShowDeleteConfirm(false); setshowDeleteUser(false)}}>Non</button>
                    </div>
                </div>
                </div>
            )}

            {showManage && (
                <section className="modal">
                    <form onSubmit={handleSubmit} className="modal-content modal-form">
                        <h2>Indisponibilités</h2>
                        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                            <option value="">Sélectionnez un commercial</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
                            ))}
                        </select><br></br>

                        <select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
                            <option value="">Sélectionnez une raison</option>
                            <option value="Arrêt maladie">Arrêt maladie</option> 
                            <option value="Congé vacances">Congés vacances</option>
                            <option value="Autre">Autre</option>
                        </select>

                        {selectedReason === "Autre" && (  
                            <div>
                                <input 
                                    type="text" 
                                    value={customReason} 
                                    onChange={(e) => setCustomReason(e.target.value)} 
                                    placeholder="Entrez la raison" 
                                />
                            </div>
                        )}

                        <label className="label">Date de début</label>
                        <input className="custom-select" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <label className="label">Date de fin</label>
                        <input className="custom-select" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                        <button className="button-colored" type="submit">Déconnecter le commercial</button><br></br>
                        <button className="cancel" onClick={() => setShowManage(false)}>Annuler</button>
                    </form>
                </section>
            )}

            {show && (
                <div className="tableau-indispo">
                    <button onClick={() => setShow(false)} className="button-back"><img src={back} alt="retour" /></button>
                    <div className="date-inputs">
                        <div>
                            <label className="label">Date de début :</label><br></br>
                            <input className="custom-select" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Date de fin :</label><br></br>
                            <input className="custom-select" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <button className="button-colored" onClick={handleSearch}>Rechercher</button>
                    </div>
                    <h2>Historique des indisponibilités</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Administrateur</th>
                                <th>Commercial</th>
                                <th>Date de début</th>
                                <th>Date de fin</th>
                                <th>Raison</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unavailabilities.map((unavailability, index) => (
                                <tr key={index}>
                                    <td>{unavailability.adminName || " "}</td>
                                    <td>{userNames[unavailability.userId] || " "}</td>
                                    <td>{new Date(unavailability.startDate?.seconds * 1000).toLocaleDateString() || " "}</td>
                                    <td>{new Date(unavailability.endDate?.seconds * 1000).toLocaleDateString() || " "}</td>
                                    <td>{unavailability.reason || " "}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showHistorique && (
                <div className="modal-page">
                     <button onClick={() => setShowHistorique(false)} className="button-back"><img src={back} alt="retour" /></button>
                    <div>
                        <h2 style={{margin: "20px 0"}}>Historique des actions des administrateurs</h2>

                        <table className="tableau-action-admin" border="1">
                            <thead>
                                <tr style={{background: "#3D9B9B", color: "white"}}>    
                                    <th style={{width: "40%"}}>Action</th>
                                    <th style={{width: "30%"}}>Administrateur</th>
                                    <th style={{width: "30%"}}>Date</th>
                                </tr> 
                            </thead>
                            <tbody>
                                {historique.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{entry.action || " "}</td>
                                        <td>{userNames[entry.userId] || " "}</td>
                                        <td>{new Date(entry.date?.seconds * 1000).toLocaleString() || " "}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {manageDpt && (
                <div className="modal">
                    <div className="modal-content"> 
                        <select className="custom-select supp" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                            <option value="">Sélectionner un utilisateur</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {userNames[user.id]}
                                </option>
                            ))}
                        </select>
                        {selectedUser && (
                            <>
                                <ul>
                                    <p style={{color: "grey", marginBottom: "10px", textAlign: "start", fontSize: "14px"}}>Départements affiliés au VRP :</p>
                                    {userDepartments.map(department => (
                                        <li key={department} style={{display: "flex", alignItems: "center"}}>
                                            {department}
                                            <button className="btn-supp" onClick={() => deleteDepartment(department)}><img style={{width: "17px", height: "17px"}} src={deleteIcon} alt="" /></button>
                                        </li>
                                    ))}
                                </ul><br></br>
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher un département" />
                                <ul>
                                    {departments.map(department => (
                                        <li className="supp-dpt" key={department} onClick={() =>{ setSelectedDepartment(department); addDepartment()}}>{department}</li>
                                    ))}
                                </ul>
                                <button className="button-colored" onClick={() => setManageDpt(false)}>Fermer</button>
                            </>
                        )}
                        <button className="cancel" onClick={() => setManageDpt(false)}>Annuler</button>
                    </div>
                    
                </div>
            )}
        </div>
    )
}

export default PreviewAdmin  