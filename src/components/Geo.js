
// fichier Geo.js 

import { GoogleMap } from "@react-google-maps/api"
import {  useState, useEffect, useRef } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../firebase.config"

const mapContainerStyle = {
    width: '96vw',
    height: '60vh',
}
  
const options = {
    disableDefaultUI: true,
    zoomControl: true,
    mapId: "b3f2841793c037a8"
}

function Geo({ uid }) {
    const mapRef = useRef(null)
    const markerRef = useRef(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 })
    const [hasVisitsToday, setHasVisitsToday] = useState(null)
    //const [noVisitsReason, setNoVisitsReason] = useState("")
    const [startAddress, setStartAddress] = useState("") 
    const [startCity, setStartCity] = useState("")
    //const [currentRouteId, setCurrentRouteId] = useState(null)
    const [salons, setSalons] = useState([])
    const [selectedSalon, setSelectedSalon] = useState(null);
    const [tourStarted, setTourStarted] = useState(false);
    //const [distanceTraveled, setDistanceTraveled] = useState(0);
    const [counterStarted, setCounterStarted] = useState(false);
    const [distance, setDistance] = useState(0);
    const [timer, setTimer] = useState(null);

    // Charge la map
    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.marker && window.google.maps.geometry) {
            setIsLoaded(true)
        } 
        else {
            const handleScriptLoad = () => {
                setIsLoaded(true)
            }
            window.addEventListener('load', handleScriptLoad)
            return () => window.removeEventListener('load', handleScriptLoad)
        }
    }, [setIsLoaded])

    // Doit actualiser en temps réel la position du user 
    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newPosition = { lat: position.coords.latitude, lng: position.coords.longitude }
                setCurrentPosition(newPosition)
            },
            () => {
                console.error('Erreur lors de la récupération de votre position')
            },
            {
                enableHighAccuracy: true, maximumAge: 0, timeout: 3000
            }
        )
        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }, []) 

    // Ajout un marqueur personnalisé sur la position du user sur la map
    useEffect(() => {
        if (isLoaded && mapRef.current && currentPosition.lat !== 0 && currentPosition.lng !== 0) {
            const { AdvancedMarkerElement } = window.google.maps.marker
            // Supprime l'ancien marqueur s'il existe
            if (markerRef.current) {
                markerRef.current.setMap(null)
            }
            // Marker personnalisé
            const markerIcon = document.createElement('div')
            markerIcon.style.width = '32px'
            markerIcon.style.height = '32px'
            markerIcon.style.backgroundImage = 'url("/assets/marker.png")'
            markerIcon.style.backgroundSize = 'contain'
            markerIcon.style.backgroundRepeat = 'no-repeat'
            // Créer un nouveau marqueur
            markerRef.current = new AdvancedMarkerElement({ position: currentPosition, map: mapRef.current, content: markerIcon })
            // Centre la carte sur la nouvelle position
            mapRef.current.setCenter(currentPosition)
        }
    }, [isLoaded, currentPosition])

    // affiche les salons à proximités de la position du user 
    const handleSalonsNearBy = async () => {
        try {
            const service = new window.google.maps.places.PlacesService(mapRef.current)   
            service.nearbySearch({ location: currentPosition, type: 'hair_care', radius: 5000 },
            async (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    const salonsWithOpeningHours = [];

                    for (let i = 0; i < results.length; i++) {
                        try {
                            const placeDetails = await new Promise((resolve, reject) => {
                                service.getDetails(
                                    {
                                        placeId: results[i].place_id,
                                    },
                                    (place, status) => {
                                        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                                            resolve(place);
                                        } else {
                                            reject(new Error('Erreur lors de la récupération des détails du salon'));
                                        }
                                    }
                                );
                            });
                            const distance = calculateDistance(currentPosition, {
                                lat: placeDetails.geometry.location.lat(),
                                lng: placeDetails.geometry.location.lng()
                            })
                            salonsWithOpeningHours.push({ ...placeDetails, distance })
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    const sortedSalons = salonsWithOpeningHours.sort((a, b) => a.distance - b.distance);

                    for (let i = 0; i < sortedSalons.length; i++) {
                        const place = sortedSalons[i];
                        new window.google.maps.marker.AdvancedMarkerElement({ position: place.geometry.location, map: mapRef.current, title: place.name })
                    }
                    setSalons(sortedSalons)
                } 
                else {
                    console.error('Erreur lors de la recherche des salons de coiffure', status)
                }
            })   
        } catch (error) {
            console.error('Erreur lors de la récupération des coordonnées de la ville de l\'utilisateur :', error);
        }
    }

    const handleVisitsToday = async (response) => {
        setHasVisitsToday(response)
        if (response === false) {
            setTourStarted(false)
        }
        try {
            const newDocumentData = {
                date: new Date(),
                isVisitsStarted: response,
                //motifNoVisits: response === false ? noVisitsReason : "",
                departureAddress: startAddress,
                city: startCity,
                stops: [],
                status: "",
                userId: uid
            }
            const docRef = await addDoc(collection(db, "feuillesDeRoute"), newDocumentData)
            //setCurrentRouteId(docRef.id)
            console.log(docRef) 
        } 
        catch (e) {
            console.error("Erreur lors de l'enregistrement de la réponse : ", e)
        }
    }

    const handleStartTour = async () => {
        setTourStarted(true);
        await handleSalonsNearBy()
    };

    const handleSelectSalon = (salon) => {
        setSelectedSalon(salon);
    };

    // Fonction pour démarrer le compteur
    const startCounter = () => {
        setCounterStarted(true);
        setTimer(setInterval(updateDistance, 1000)); // Mettre à jour la distance toutes les secondes
    };

    // Fonction pour mettre à jour la distance
    const updateDistance = () => {
        if (selectedSalon && currentPosition) {
            const newDistance = calculateDistance(currentPosition, {
                lat: selectedSalon.geometry.location.lat(),
                lng: selectedSalon.geometry.location.lng()
            })
            setDistance(newDistance)
        }
    };

    // Fonction pour terminer le compteur
    const stopCounter = () => {
        clearInterval(timer); // Arrêter le minuteur
        setCounterStarted(false);
        setDistance(0);
        setTimer(null);
        // Code pour fermer la modale et afficher la distance parcourue
    };

    // Fonction pour calculer la distance entre deux points géographiques
    const calculateDistance = (pointA, pointB) => {
        const lat1 = pointA.lat;
        const lon1 = pointA.lng;
        const lat2 = pointB.lat;
        const lon2 = pointB.lng;

        const R = 6371e3; // Rayon de la Terre en mètres
        const φ1 = (lat1 * Math.PI) / 180; // φ, λ en radians
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // en mètres
        return distance;
    };

     // Composant pour afficher la modale du compteur de distance
     const CounterModal = () => {
        // Votre code pour la modale du compteur de distance
        return (
            <div className="modal">
                <h3>{selectedSalon.name}</h3>
                <p>Distance parcourue: {distance.toFixed(2)} mètres</p>
                {!counterStarted ? (
                    <button onClick={startCounter}>Démarrer le compteur de km</button>
                ) : (
                    <button onClick={stopCounter}>Arrivé à destination</button>
                )}
            </div>
        );
    };

    const handleFinishTour = async () => {
        // Enregistrer les données du parcours et terminer le tour
        try {
            // Code pour enregistrer les données du parcours
            const tourData = {
                date: new Date(),
                userId: uid,
                distance: distance
            };
            // Enregistrer les données dans la base de données
            await addDoc(collection(db, "parcours"), tourData);

            // Réinitialiser les états
            setHasVisitsToday(null);
            setStartAddress("");
            setStartCity("");
            //setCurrentRouteId(null);
            setSalons([]);
            setSelectedSalon(null);
            setTourStarted(false);
            //setDistanceTraveled(0);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement des données du parcours :", error);
        }
    };

    if (!isLoaded) return <div>La map se charge...</div>

    return (
        <div className="geoloc-section">
            <GoogleMap mapContainerStyle={mapContainerStyle} zoom={16} center={currentPosition} options={options} onLoad={(map) => (mapRef.current = map)}></GoogleMap>

            {hasVisitsToday === null && (
                    <div className="start-tour">
                        <p>Avez-vous prévu des visites aujourd'hui ?</p>
                        <div>
                            <button onClick={() => handleVisitsToday(true)}>OUI</button>
                            <button onClick={() => handleVisitsToday(false)}>NON</button>
                        </div>
                    </div>
                )}

                {hasVisitsToday === true  && (
                    <div className="start-adress">
                        <input type="text" placeholder="Dans quelle ville sont prévues vos visites ?" value={startCity} onChange={(e) => setStartCity(e.target.value)} />
                        <input type="text" placeholder="Adresse de départ" value={startAddress} onChange={(e) => setStartAddress(e.target.value)} />
                        <p className="info">Cliquer sur ce bouton lorsque vous êtes arrivé à votre point de départ</p>
                        <button className="button-colored" onClick={handleStartTour}>Démarrer mon parcours</button>
                    </div>
                )}

                <div className="arrets">
                    <p className="point">Distance entre chaque point d'arrêts :</p>
                    <ul>
                    
                    </ul>
                </div>
                
                {tourStarted && (
                    <div className="salons-nearby">
                        <p>Listes des salons à proximité</p>
                        <ul>
                            {salons.map((salon, index) => (
                                <li key={index}>
                                    <span>{salon.name}</span>
                                    <span>Distance : {salon.distance} mètres</span>
                                    <button onClick={() => handleSelectSalon(salon)}>Sélectionner</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                
                {/* Modale pour afficher le compteur de distance */}
            {selectedSalon && <CounterModal />}

            {/* Bouton pour terminer le parcours */}
            {tourStarted && <button onClick={handleFinishTour}>Terminer mon parcours</button>}
        </div>
    ) 
}

export default Geo