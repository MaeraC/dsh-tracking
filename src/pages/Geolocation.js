
// Fichier Geolocation.js

import { GoogleMap }                                    from "@react-google-maps/api"
import {  useState, useEffect, useRef }                 from "react"
import ReactModal                                       from "react-modal"
import startIcon                                        from "../assets/start.png" 
import plus                                             from "../assets/plus.png"
import refresh                                          from "../assets/refresh.png"
import { db }                                           from "../firebase.config"
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"

const mapContainerStyle = {
    width: '96vw',
    height: '60vh',
}
  
const options = {
    disableDefaultUI: true,
    zoomControl: true,
    mapId: "b3f2841793c037a8"
}

ReactModal.setAppElement('#root') 

const computeDistance = (start, end) => {
    const R = 6371e3; 
    const dLat = (end.lat - start.lat) * Math.PI / 180
    const dLon = (end.lng - start.lng) * Math.PI / 180
    const lat1 = start.lat * Math.PI / 180
    const lat2 = end.lat * Math.PI / 180

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
 
    const distance = R * c
    return distance
}

function Geolocation({ uid }) {
    const [currentPosition, setCurrentPosition]         = useState({ lat: 0, lng: 0 })
    const [isLoaded, setIsLoaded]                       = useState(false)
    const [hasVisitsToday, setHasVisitsToday]           = useState(null) 
    const [startAddress, setStartAddress]               = useState('')
    const [startCity, setStartCity]                     = useState('')
    const [currentRouteId, setCurrentRouteId]           = useState(null)
    const [salons, setSalons]                           = useState([])
    const [selectedSalon, setSelectedSalon]             = useState(null)
    const [isTracking, setIsTracking]                   = useState(false)
    const [isParcoursStarted, setIsParcoursStarted]     = useState(false)
    const [isParcoursEnded, setIsParcoursEnded]         = useState(false)
    const [totalDistance, setTotalDistance]             = useState(0)
    const [distance, setDistance]                       = useState(0) 
    const [stops, setStops]                             = useState([])
    const [isModalCounterOpen, setIsModalCounterOpen]   = useState(false)
    const [isRadioVisible, setIsRadioVisible]           = useState(true)
    const [status, setStatus]                           = useState("") 
    const [isChecked, setIsChecked]                     = useState(false)
    const [statusLoaded, setStatusLoaded]               = useState(false)
    const [newSalonName, setNewSalonName]               = useState("")
    const [newSalonAddress, setNewSalonAddress]         = useState("")
    const [newSalonCity, setNewSalonCity]               = useState("")
    const [isModalSalonOpen, setIsModalSalonOpen]       = useState(false)
    const [isModalEndingOpen, setIsModalEndingOpen]     = useState(false)
    const [isModalHomeOpen, setIsModalHomeOpen]         = useState(false)
    const [isHomeTracking, setIsHomeTracking]           = useState(false)
    const [homeDistance, setHomeDistance]               = useState(0)
    const [isRetourVisible, setIsRetourVisible]         = useState(true)
    const [isTerminerVisible, setIsTerminerVisible]     = useState(false)
    const [errorMessage, setErrorMessage]               = useState("")
    const mapRef                                        = useRef(null)
    const markerRef                                     = useRef(null)
    const previousPosition                              = useRef(null)
    
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

    // affiche le marqueur 
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

    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }

                    setCurrentPosition(newPosition)

                    if (isTracking && previousPosition.current) {
                        const distance = computeDistance(previousPosition.current, newPosition);
                        //setTotalDistance(distance)
                        //setDistance((prevDistance) => prevDistance + distance)
                        setDistance((prevDistance) => prevDistance + distance); // Cumul de la distance
                        setTotalDistance((prevTotal) => prevTotal + distance); // Mettre à jour la distance totale parcourue aujourd'hui
                    }

                    if (isHomeTracking && previousPosition.current) {
                        const distance = computeDistance(previousPosition.current, newPosition);
                        setHomeDistance((prevDistance) => prevDistance + distance);
                    }

                    previousPosition.current = newPosition;
                },
                (error) => {
                    console.error(error);
                },
                { enableHighAccuracy: true }
            )
            return () => navigator.geolocation.clearWatch(watchId)
        } else {
            console.error("Geolocation is not supported by this browser.")
        }
    }, [isTracking, isHomeTracking]) 

    // Vérifie si le statut est déjà enregistré dans la base de données
    useEffect(() => {
        const checkStatusInDatabase = async () => {
            const salonRef = doc(db, "salons", selectedSalon.place_id)
            const salonSnapshot = await getDoc(salonRef)
            const salonData = salonSnapshot.data()

            if (salonData && salonData.status) {
                setStatus(salonData.status);
                setIsRadioVisible(false);
                setIsChecked(salonData.status === 'Prospect' || salonData.status === 'Client')
            }
            else {
                // Si aucun statut enregistré, réinitialiser les états
                setStatus('');
                setIsRadioVisible(true);
                setIsChecked(false);
            }
            setStatusLoaded(true)
        }

        if (selectedSalon) {
            checkStatusInDatabase()
        }
    }, [selectedSalon])
    
    // Gère la réponse OUI/NON du user 
    const handleVisitsToday = async (response) => {
        setHasVisitsToday(response)
        if (response === false) {
            setIsParcoursStarted(false)
        }
        else {
            try {
                const newDocumentData = {
                    date: new Date(),
                    isVisitsStarted: response,
                    departureAddress: startAddress,
                    city: startCity,
                    stops: [],
                    status: "",
                    userId: uid
                }
                const docRef = await addDoc(collection(db, "feuillesDeRoute"), newDocumentData)
                setCurrentRouteId(docRef.id)
            } 
            catch (e) {
                console.error("Erreur lors de l'enregistrement de la réponse : ", e)
            }
        }
    }

    const handleStartParcours = () => {
        if (!startAddress || !startCity) {
            setErrorMessage("Veuillez remplir tous les champs avant de démarrer le parcours.");
        } else {
            startParcours()
        }
    }

    // Démarre le parcours 
    const startParcours = async () => {
        setIsParcoursStarted(true)
        handleSalonsNearBy()
        setStops([])
        // enregistre l'adresse de départ du user dans la bdd
        if (startAddress) {
            try {
                if (currentRouteId) {
                    const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId)
                    await updateDoc(routeDocRef, {
                        date: new Date(),
                        isVisitsStarted: hasVisitsToday === true,
                        departureAddress: startAddress,
                        city: startCity,
                        status: "",
                        userId: uid
                    })
                }
                else {
                    console.log("Ce document n'existe pas")
                }
            } 
            catch (e) {
                console.error("Erreur lors de l'enregistrement de l'adresse de départ : ", e);
            }
        }
    }

    const endParcours = async () => {
        setIsModalEndingOpen(false)
        setIsParcoursStarted(false)
        setIsParcoursEnded(true)
        await updateRouteWithStops()
    } 

    const updateRouteWithStops = async () => {
        try {
            const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId);
            await updateDoc(routeDocRef, {
                stops: stops
            })
            console.log("Arrêts mis à jour avec succès");
        } catch (e) {
            console.error("Erreur lors de la mise à jour des arrêts : ", e);
        }
    }
  
    // recherche les salons à proximité
    const handleSalonsNearBy = async () => {
        try {
            const service = new window.google.maps.places.PlacesService(mapRef.current)   
            service.nearbySearch({
                location: currentPosition,
                type: 'hair_care',
                radius: 5000,
            },
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

                            if (placeDetails.opening_hours) {
                                const city = await getCityFromCoords(placeDetails.geometry.location.lat(), placeDetails.geometry.location.lng())                    
                                if (city && city.toLowerCase() === startCity.toLowerCase()) {
                                    const distance = computeDistance(currentPosition, {
                                        lat: placeDetails.geometry.location.lat(),
                                        lng: placeDetails.geometry.location.lng(),
                                    });
                                    salonsWithOpeningHours.push({
                                        ...results[i],
                                        opening_hours: placeDetails.opening_hours,
                                        distance: distance
                                    })
                                }
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    const sortedSalons = salonsWithOpeningHours.sort((a, b) => {
                        const distanceA = window.google.maps.geometry.spherical.computeDistanceBetween(
                            new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                            a.geometry.location
                        );
                        const distanceB = window.google.maps.geometry.spherical.computeDistanceBetween(
                            new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                            b.geometry.location
                        );
                        return distanceA - distanceB;
                    })

                    for (let i = 0; i < sortedSalons.length; i++) {
                        const place = sortedSalons[i];
                        new window.google.maps.marker.AdvancedMarkerElement({
                            position: place.geometry.location,
                            map: mapRef.current,
                            title: place.name,
                        });
                    }
                    setSalons(sortedSalons)
                } 
                else {
                    console.error('Erreur lors de la recherche des salons de coiffure', status)
                }
            })   
        } catch (error) {
            console.error('Erreur lors de la récupération des coordonnées de la ville de l\'utilisateur :', error)
        }
    }

    // n'affiche pas les salons qui sont en dehors de la ville choisie par le user
    const getCityFromCoords = async (lat, lng) => {
        return new Promise((resolve, reject) => {
            const geocoder = new window.google.maps.Geocoder()
            const latlng = { lat, lng }  
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const addressComponents = results[0].address_components
                    for (let component of addressComponents) {
                        if (component.types.includes("locality")) {
                            resolve(component.long_name)
                            return
                        }
                    }
                    resolve(null)
                } else {
                    reject(status)
                }
            })
        })
    }
    
    // Gère le clic d'un salon
    const handleSelectSalon = async (salon) => {
        setIsTracking(false)
        setTotalDistance(0)
        setDistance(0)

        if (salon.geometry && salon.geometry.location) {
            setSelectedSalon(salon)
            setIsModalCounterOpen(true)
            // Vérifie si le salon est déjà dans la base de données
            const salonRef = doc(db, "salons", salon.place_id)
            const salonSnapshot = await getDoc(salonRef)

            if (!salonSnapshot.exists()) {
                // Ajoute le salon à la base de données s'il n'existe pas
                await setDoc(salonRef, {
                    name: salon.name,
                    address: salon.vicinity,
                    status: ""
                })

                setIsRadioVisible(true);
            } 
            else {
                // Si le salon existe, vérifie s'il a déjà un statut défini
                const salonData = salonSnapshot.data();
                
                if (!salonData.status) {
                    setIsRadioVisible(true)
                } else {
                    setStatus(salonData.status);
                    setIsRadioVisible(false);
                }
            }
        } 
        else {
            console.error("Selected salon has no valid location", salon)
        }
    }

    const handleStatusChange = async (e) => {
        const selectedStatus = e.target.value
        setStatus(selectedStatus)
        setIsChecked(selectedStatus === 'Prospect' || selectedStatus === 'Client')

        // Ajoute l'action d'ajout de statut dans le champ 'historique' du document du salon
        const logMessage = `Statut mis à jour : ${selectedStatus}`
    
        // Met à jour le statut dans la base de données du salon
        const salonRef = doc(db, "salons", selectedSalon.place_id)
        await updateDoc(salonRef, {
            status: selectedStatus,
            historique: arrayUnion({
                date: new Date(),
                action: logMessage,
                userId: uid
            })
        })

        // Masque les boutons radio après avoir choisi un statut
        setIsRadioVisible(false)
    }

    const handleModalClose = () => {
        setIsModalCounterOpen(false);
        // Réinitialiser les états lorsque la modale se ferme
        setStatus('');
        setIsChecked(false);
        setIsRadioVisible(true);
    }
    
    // Active le suivi de la position
    const handleStartTracking = () => {
        setIsTracking(true)
    }
    
    // Désactive le suivi de la position 
    const handleStopTracking = async () => {
        // Ajoute cet arrêt à la liste des stops
        setStops(prevStops => [
            ...prevStops,
            {
                name: selectedSalon.name,
                address: selectedSalon.vicinity,
                distance: totalDistance, 
                status: status
            }
        ])

        // Ajoute l'action de visite dans le champ 'historique' du document du salon
        const logMessage = `Salon visité`
        const salonRef = doc(db, 'salons', selectedSalon.place_id)
        await updateDoc(salonRef, {
            historique: arrayUnion({
                date: new Date(),
                action: logMessage,
                userId: uid
            })
        })
        
        setIsTracking(false);
        setIsModalCounterOpen(false);
        setTotalDistance(0);
        setDistance(0)
    }

    const handleStartHomeTracking = () => {
        setIsHomeTracking(true);
        setHomeDistance(0);
    }
    
    const handleStopHomeTracking = () => {
        setIsHomeTracking(false);
        setStops(prevStops => [
            ...prevStops,
            {
                name: 'Adresse de départ',
                address: startAddress,
                distance: homeDistance,
            }
        ]);
        setIsModalHomeOpen(false);
    }
    
    const getTotalStopDistances = () => {
        return stops.reduce((total, stop) => total + stop.distance, 0);
    }

    const handleAddSalon = async () => {

        setStops(prevStops => [...prevStops, {
            name: newSalonName,
            address: newSalonAddress,
            distance: totalDistance
        }])

        setIsModalSalonOpen(false)

        try {
            await addDoc(collection(db, "salons"), 
            { 
                name: newSalonName, 
                address: newSalonAddress + ", " + newSalonCity,  
                status: status 
            })
        } 
        catch (error) {
            console.error("Erreur lors de l'ajout du salon: ", error);
        }

        setStatus('');
        setNewSalonAddress("")
        setNewSalonCity("")
        setNewSalonName("")
    }

    const handleStatusChange2 = (e) => {
        setStatus(e.target.value)
    }

    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    }

    const getNextCloseTime = (openingHours) => {
        const now = new Date();
        const today = now.getDay(); // Jour de la semaine actuel (0 pour dimanche, 1 pour lundi, etc.)
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        // Récupérer les heures de fermeture pour aujourd'hui
        const todayClosingTimes = openingHours.periods.filter(period => period.close && period.close.day === today);
        // Trier les heures de fermeture pour aujourd'hui par heure croissante
        const sortedClosingTimes = todayClosingTimes.sort((a, b) => {
            const hourA = a.close.time.slice(0, 2);
            const minuteA = a.close.time.slice(2);
            const hourB = b.close.time.slice(0, 2);
            const minuteB = b.close.time.slice(2);
            const timeA = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourA, minuteA);
            const timeB = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourB, minuteB);
            return timeA - timeB;
        });
        // Trouver la première heure de fermeture après l'heure actuelle
        for (const closingTime of sortedClosingTimes) {
            const hour = parseInt(closingTime.close.time.slice(0, 2));
            const minute = parseInt(closingTime.close.time.slice(2));
            if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
                return `${hour}:${minute < 10 ? '0' + minute : minute}`;
            }
        }
        return "Fermé";
    }

    const getNextOpenTime = (openingHours) => {
        const now = new Date();
        const today = now.getDay(); // Jour de la semaine actuel (0 pour dimanche, 1 pour lundi, etc.)
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        // Récupérer les heures d'ouverture pour aujourd'hui
        const todayOpeningTimes = openingHours.periods.filter(period => period.open && period.open.day === today);
        // Trier les heures d'ouverture pour aujourd'hui par heure croissante
        const sortedOpeningTimes = todayOpeningTimes.sort((a, b) => {
            const hourA = a.open.time.slice(0, 2);
            const minuteA = a.open.time.slice(2);
            const hourB = b.open.time.slice(0, 2);
            const minuteB = b.open.time.slice(2);
            const timeA = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourA, minuteA);
            const timeB = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourB, minuteB);
            return timeA - timeB;
        });

        // Trouver la première heure d'ouverture après l'heure actuelle
        for (const openingTime of sortedOpeningTimes) {
            const hour = parseInt(openingTime.open.time.slice(0, 2));
            const minute = parseInt(openingTime.open.time.slice(2));

            if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
                return `${hour}:${minute < 10 ? '0' + minute : minute}`;
            }
        }
    
        return "Fermé";
    }

    if (!isLoaded) return <div>Loading Maps...</div>
   
    return (
        <>
            <header className="geo-header">
                <h1>Map Salons de coiffure</h1>  
                <div className="btns">
                    <img onClick={() => setIsModalSalonOpen(true)} src={plus} alt="Ajouter un salon"/> 
                    <button><img onClick={handleSalonsNearBy} src={refresh} alt="Actualiser" /></button>
                </div>
                
            </header>
            <div className="geoloc-section">
                <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={currentPosition} options={options} onLoad={(map) => (mapRef.current = map)}></GoogleMap>

                {hasVisitsToday === null && (
                    <div className="start-tour">
                        <p>Avez-vous prévu des visites aujourd'hui ?</p>
                        <div>
                            <button onClick={() => handleVisitsToday(true)}>OUI</button>
                            <button onClick={() => handleVisitsToday(false)}>NON</button>
                        </div>
                    </div>
                )}

                {hasVisitsToday === true && !isParcoursStarted && !isParcoursEnded && (
                    <div className="start-adress" id="start-adress">
                        <input type="text" placeholder="Dans quelle ville sont prévues vos visites ?" value={startCity} onChange={(e) => setStartCity(e.target.value)} />
                        <input type="text" placeholder="Adresse de départ" value={startAddress} onChange={(e) => setStartAddress(e.target.value)} />
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <p className="info">Cliquer sur ce bouton lorsque vous êtes arrivé à votre point de départ</p>
                        <button className="button-colored" onClick={handleStartParcours}>Démarrer mon parcours</button>
                        
                    </div>
                )}

                {hasVisitsToday === false && (
                    <div className="motif">
                        <p className="congrats success">Enregistré avec succès. À bientôt !</p>
                    </div>
                )}

                {isParcoursStarted === true && (
                    <>
                        {isRetourVisible && (
                            <button className="button-colored back-home-btn" onClick={() => { setIsModalHomeOpen(true); setIsRetourVisible(false); setIsTerminerVisible(true); }}>Retour à mon domicile</button>
                        )}

                        {isTerminerVisible && (
                            <button className="button-colored" onClick={() => setIsModalEndingOpen(true)}>Terminer mon parcours</button>
                        )}
                                                  
                        <div className="distance-results">
                            <p className="total"><strong>{formatDistance(getTotalStopDistances())}</strong> kilomètres parcourus aujourd'hui</p>
                            
                            <div className="arrets">
                                <p className="point">Distance entre chaque point d'arrêt</p>
                                <ul>
                                    {stops.map((stop, index) => (
                                        <li key={index}>
                                            {index === 0 ? (
                                                <p><strong>{formatDistance(stop.distance)}</strong>De <em>{startAddress}</em> à <em>{stop.name}</em></p>
                                            ) : (
                                                <p><strong>{formatDistance(stop.distance)}</strong>De <em>{stops[index - 1].name}</em> à <em>{stop.name}</em></p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                
                            </div>
                        </div>

                        {isModalHomeOpen && (
                            <ReactModal isOpen={isModalHomeOpen} onRequestClose={() => setIsModalHomeOpen(false)} contentLabel="Retour à mon domicile" className="modale">
                                <div className="content">
                                    <h2>Retour à mon domicile</h2>
                                    <p className="city">{startAddress}</p>

                                    {isHomeTracking ? (
                                        <div>
                                            <p>Distance en cours : {formatDistance(homeDistance)}</p>
                                            <button className="button-colored" onClick={handleStopHomeTracking}>Arrivé à destination</button>
                                        </div>
                                    ) : (
                                        <button className="button-colored" onClick={handleStartHomeTracking} >Démarrer le compteur de km</button>
                                    )}
                                </div>
                            </ReactModal>
                        )}

                        <div className="geoloc-results">
                            <ul>
                                {salons.map((salon, index) => (
                                    <li key={index}>
                                        <div>
                                            <div className="distance">
                                                <span>{salon.name} </span> 
                                                <p>{formatDistance(salon.distance)}</p>
                                            </div>
                                            <p>{salon.vicinity}</p> 

                                            {salon.opening_hours ? (
                                                salon.opening_hours.isOpen() ? (
                                                    <p><span className="open">Ouvert</span> - Ferme à : {getNextCloseTime(salon.opening_hours)}</p>
                                                ) : (
                                                    <p><span className="close">Fermé</span> - Ouvre à : {getNextOpenTime(salon.opening_hours)}</p>
                                                )
                                            ) : (
                                                <p>Heures d'ouverture inconnues</p>
                                            )}
                                        </div>
                                        <button className="button-colored btn" onClick={() => handleSelectSalon(salon)}><img src={startIcon} alt="choisir ce salon"/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                {selectedSalon && (
                    <ReactModal isOpen={isModalCounterOpen} onRequestClose={handleModalClose} contentLabel="Salon Details" className="modale" >
                        <div className="content">
                            <h2>{selectedSalon.name}</h2>
                            <p className="city">{selectedSalon.vicinity}</p>
                            {statusLoaded && isRadioVisible && ( 
                                <div className="status">
                                    <input className="checkbox" type="checkbox" id="Prospect" name="status" value="Prospect" checked={status === "Prospect"} onChange={handleStatusChange} />
                                    <label htmlFor="prospect" className="prospect">Prospect</label>

                                    <input className="checkbox" type="checkbox" id="Client" name="status" value="Client" checked={status === "Client"} onChange={handleStatusChange} />
                                    <label htmlFor="client">Client</label>
                                </div>
                            )}

                            {!isRadioVisible && (
                                <p>Statut : {status}</p>
                            )}

                            {isTracking ? (
                                <div>
                                    <p>Calcul en cours...</p> 
                                    <p className="total"><strong>{formatDistance(distance)}</strong></p>
                                    <button className="button-colored" onClick={handleStopTracking}>Arrivé à destination</button>
                                </div>
                            ) : (
                                <button className="button-colored" onClick={handleStartTracking} disabled={!isChecked}>Démarrer le compteur de km</button>
                            )} 
                            
                        </div>
                    </ReactModal>
                )}

                <ReactModal isOpen={isModalSalonOpen} onRequestClose={() => setIsModalSalonOpen(false)} contentLabel="Ajouter un nouveau salon" className="modale" >    
                    <div className="new-salon content">
                        <h2>Ajouter un nouveau salon</h2>
                        <input type="text" placeholder="Nom du salon" value={newSalonName} onChange={(e) => setNewSalonName(e.target.value)} />
                        <input type="text" placeholder="Adresse du salon" value={newSalonAddress} onChange={(e) => setNewSalonAddress(e.target.value)} />
                        <input type="text" placeholder="Ville du salon" value={newSalonCity} onChange={(e) => setNewSalonCity(e.target.value)} />
                        
                        <div className="status"> 
                            <input className="checkbox" type="checkbox" id="Prospect" name="status" value="Prospect" checked={status === "Prospect"} onChange={handleStatusChange2} />
                            <label htmlFor="Prospect">Prospect</label>

                            <input className="checkbox" type="checkbox" id="Client" name="status" value="Client" checked={status === "Client"} onChange={handleStatusChange2} />
                            <label htmlFor="Client">Client</label>
                        </div>
                        <button onClick={handleAddSalon} className="button-colored">Ajouter</button>
                        <button onClick={() => setIsModalSalonOpen(false)} className="btn-cancel">Annuler</button>  
                    </div>
                </ReactModal>

                <ReactModal isOpen={isModalEndingOpen} onRequestClose={() => setIsModalEndingOpen(false)} contentLabel="Terminer mon parcours" className="modale" >   
                    <div className="content">
                        <p>Êtes-vous sûr de vouloir terminer votre parcours ?</p>
                        <div className="ending-btns">
                            <button onClick={endParcours}>Oui</button> 
                            <button onClick={() => setIsModalEndingOpen(false)}>Non</button>
                        </div>
                    </div> 
                </ReactModal>

                {isParcoursEnded && (
                    <div className="congrats">
                        <p>Félicitations, vous avez terminé votre parcours !<br></br> À bientôt !</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default Geolocation 
