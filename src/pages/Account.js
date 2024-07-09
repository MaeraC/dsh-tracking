
// Fichier Account
 
import { useNavigate }                                  from "react-router-dom"
import { useEffect, useState }                                     from "react"
import { logout }                                       from "../auth/AuthUtils"
import { auth, db }                                         from "../firebase.config"
import { sendPasswordResetEmail }                       from "firebase/auth"
import { getDoc, doc, updateDoc } from "firebase/firestore"

function Account({ email, firstname, lastname, uid }) {
    
    const [message, setMessage]                         = useState("")
    const [showModal, setShowModal]                     = useState(false)
    const [action, setAction]                           = useState(null)
    const [userAdresses, setUserAdresses] = useState([null, null, null])
    const [showModals, setShowModals] = useState([false, false, false])

    const [currentAddress, setCurrentAddress] = useState('');
    const [currentCity, setCurrentCity] = useState('');
    const [currentModalIndex, setCurrentModalIndex] = useState(null);

    const [addressSuggestions, setAddressSuggestions] = useState([]); 
    const [citySuggestions, setCitySuggestions] = useState([]);

    const navigate                                      = useNavigate()


    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const handleResetPassword = async () => {
        try {
            const email = auth.currentUser.email
            
            sendPasswordResetEmail(auth, email)
            .then(() => {
                setMessage("Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.")
            })
            
        } 
        catch (error) {
            console.error("Erreur lors de l'envoi de l'e-mail de réinitialisation du mot de passe :", error)
            setMessage("Une erreur s'est produite lors de l'envoi de l'e-mail de réinitialisation du mot de passe. Veuillez réessayer.")
        }
    }

    const confirmAction = () => {
        if (action === "logout") {
            handleLogout()
        } 
        else if (action === "resetPassword") {
            handleResetPassword()
        }

        setShowModal(false)
    }

    const openModal = (actionType) => {
        setAction(actionType)
        setShowModal(true)
    }

    useEffect(() => {
        const fetchAdresses = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", uid));

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const adresses = data.adresses || [];
                    setUserAdresses(adresses);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des adresses :", error);
            }
        }

        fetchAdresses();
    }, [uid]);

    const handleAdressSave = async () => {
        try {
            const userDoc = doc(db, "users", uid);
            const adresses = [...userAdresses];

            adresses[currentModalIndex] = { address: currentAddress, city: currentCity };

            await updateDoc(userDoc, { adresses });

            setUserAdresses(adresses);
            setShowModals(showModals.map((_, index) => index === currentModalIndex ? false : _));
            window.location.reload();
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'adresse :", error);
        }
    }

    const fetchCitySuggestions = (input, setCitySuggestions) => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({
            input,
            componentRestrictions: { country: 'fr' },
            types: ['(cities)']
        }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setCitySuggestions(predictions.map(prediction => prediction.description.split(',')[0]));
            } else {
                setCitySuggestions([]);
            }
        });
    };

    const fetchAddressSuggestions = (input, setAddressSuggestions) => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({ input, componentRestrictions: { country: 'fr' } }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                const filteredPredictions = predictions.map(prediction => {
                    const description = prediction.description.replace(', France', ''); // Supprime 'France' de la description
                    return {
                        description: description,
                        place_id: prediction.place_id
                    };
                });
                setAddressSuggestions(filteredPredictions);
            } else {
                setAddressSuggestions([]);
            }
        });
    };

    const handleAddressSelect = (placeId, setAddress, setCity, setAddressSuggestions) => {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails({ placeId }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const addressComponents = place.address_components;
                let streetNumber = '';
                let route = '';
                let selectedCity = '';

                addressComponents.forEach(component => {
                    const types = component.types;
                    if (types.includes('street_number')) {
                        streetNumber = component.long_name;
                    }
                    if (types.includes('route')) {
                        route = component.long_name;
                    }
                    if (types.includes('locality')) {
                        selectedCity = component.long_name;
                    }
                });

                const selectedAddress = `${streetNumber} ${route}`.trim();
                setAddress(selectedAddress);
                setCity(selectedCity);
                setAddressSuggestions([]);
            }
        });
    };

    const openModaal = (index) => {
        setCurrentModalIndex(index);
        if (userAdresses[index]) {
            setCurrentAddress(userAdresses[index].address);
            setCurrentCity(userAdresses[index].city);
        } else {
            setCurrentAddress('');
            setCurrentCity('');
        }
        setShowModals(showModals.map((_, i) => i === index ? true : _));
    };

    return (
        <div className="account">
  
            <header className="account-header">
                <h1>Mon compte</h1>
            </header>
            
            <div className="content">
                <div>
                    <span>Prénom</span>
                    <p>{firstname}</p>
                </div>
                <div>
                    <span>Nom</span>
                    <p>{lastname}</p>
                </div>
                <div>
                    <span>E-mail</span>
                    <p>{email}</p>
                </div>
                <div className="adresse-account">
                    {[0, 1, 2].map(index => (
                        <button className="adresse-account-btns" key={index} onClick={() => openModaal(index)}>
                            <span>Adresse de départ {index + 1}</span>
                            <p className={!userAdresses[index] ? "adresse-txt" : ""}>
                                {userAdresses[index] ? `${userAdresses[index].address}, ${userAdresses[index].city}` : "Veuillez définir une adresse"}
                            </p>
                        </button>
                    ))}
                </div>
                <button onClick={() => openModal("resetPassword")}>Réinitialiser mon mot de passe</button>
                <button onClick={() => openModal("logout")}>Déconnexion</button>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Êtes-vous sûr de vouloir {action === "logout" ? "vous déconnecter" : "réinitialiser votre mot de passe"} ?</p>
                        <button onClick={confirmAction}>Oui</button>
                        <button onClick={() => setShowModal(false)}>Non</button>
                    </div>
                </div>
            )}

            {showModals.map((showModal, index) => (
                showModal && (
                    <div className="modal" key={index}>
                        <div className="modal-content">
                            <p>Veuillez saisir une adresse et une ville de départ</p>
                            <input
                                type="text"
                                placeholder="Votre adresse"
                                value={currentAddress}
                                onChange={(e) => { setCurrentAddress(e.target.value); fetchAddressSuggestions(e.target.value, setAddressSuggestions); }}
                            />
                            {addressSuggestions.length > 0 && (
                                <ul className="city-suggestions" style={{ width: "100%" }}>
                                    {addressSuggestions.map((suggestion, index) => (
                                        <li key={index} onClick={() => handleAddressSelect(suggestion.place_id, setCurrentAddress, setCurrentCity, setAddressSuggestions)}>
                                            {suggestion.description}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <input
                                type="text"
                                placeholder="Votre ville"
                                value={currentCity}
                                onChange={(e) => { setCurrentCity(e.target.value); fetchCitySuggestions(e.target.value, setCitySuggestions); }}
                            />
                            {citySuggestions.length > 0 && (
                                <ul className="city-suggestions">
                                    {citySuggestions.map((suggestion, index) => (
                                        <li key={index} onClick={() => { setCurrentCity(suggestion); setCitySuggestions([]); }}>
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button className="validate-btn" onClick={handleAdressSave}>Valider</button><br></br>
                            <button className="cancel-btn" onClick={() => setShowModals(showModals.map((_, i) => i === index ? false : _))}>Annuler</button>
                        </div>
                    </div>
                )
            ))}
           
            
            <p className="success">{message}</p>
        </div>
    )
}

export default Account