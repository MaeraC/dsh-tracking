
// Fichier Geolocation.js

import { GoogleMap } from "@react-google-maps/api"
import {  useState, useEffect, useRef } from "react"
import ReactModal from "react-modal"
import startIcon from "../assets/start.png" 
import { db } from "../firebase.config"
import { collection, addDoc, setDoc, doc, getDoc, updateDoc } from "firebase/firestore"

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

function Geolocation({ uid }) {
    
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 })
    const [isLoaded, setIsLoaded] = useState(false)
    const [salons, setSalons] = useState([])
    const [selectedSalon, setSelectedSalon] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isTracking, setIsTracking] = useState(false)
    const [stops, setStops] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0)
    const [isTourStarted, setIsTourStarted] = useState(false)
    const [congratulations, setCongratulations] = useState("")
    const [hasVisitsToday, setHasVisitsToday] = useState(null)
    const [startAddress, setStartAddress] = useState("")
    const [startCity, setStartCity] = useState("")
    const [noVisitsReason, setNoVisitsReason] = useState("")
    const [message, setMessage] = useState("")
    const [currentRouteId, setCurrentRouteId] = useState(null)

    const [distanceToSalon, setDistanceToSalon] = useState(null);
    const [newSalonName, setNewSalonName] = useState("");
    const [newSalonCity, setNewSalonCity] = useState("");
    const [newSalonAddress, setNewSalonAddress] = useState("");
    const [isModalSalonOpen, setIsModalSalonOpen] = useState(false)
    const [status, setStatus] = useState("")
    const mapRef = useRef(null)
    const markerRef = useRef(null)

    const [startPosition, setStartPosition] = useState(null);
    //const [distanceToSalonModal, setDistanceToSalonModal] = useState(null);

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

    // Met à jour la position du user 
    useEffect(() => {
        // Déclarez une fonction pour calculer la distance parcourue en temps réel
        const calculateRealTimeDistance = () => {
            if (isTracking && startPosition && currentPosition.lat && currentPosition.lng) {
                const distanceCovered = window.google.maps.geometry.spherical.computeDistanceBetween(
                    new window.google.maps.LatLng(startPosition.lat, startPosition.lng),
                    new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng)
                );
                const distanceInKm = distanceCovered / 1000;
                setTotalDistance(prevDistance => prevDistance + distanceInKm); // Utilisez une mise à jour fonctionnelle de l'état
                if (selectedSalon) {
                    const updatedDistanceToSalon = distanceToSalon - distanceInKm;
                    setDistanceToSalon(updatedDistanceToSalon);
                  }
            }
        };

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }
                setCurrentPosition(newPosition)
                calculateRealTimeDistance()
            },
            () => {
                console.error('Erreur lors de la récupération de votre position')
            },
            {
                enableHighAccuracy: true, maximumAge: 0, timeout: 2000
            }
        )
        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }, [isTracking, startPosition, currentPosition.lat, currentPosition.lng, distanceToSalon, selectedSalon]) 

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
        if (isTracking && startPosition) {
            const distanceCovered = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(startPosition.lat, startPosition.lng),
                new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng)
            );
            const distanceInKm = distanceCovered / 1000;
            const updatedDistanceToSalon = distanceToSalon - distanceInKm; // Mettre à jour la distance au salon
            setDistanceToSalon(updatedDistanceToSalon)  
              
        }
    }, [currentPosition, isTracking, startPosition, distanceToSalon])

    const handleStatusChange = (e) => {
        setStatus(e.target.value)
    }

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
                                    salonsWithOpeningHours.push({
                                        ...results[i],
                                        opening_hours: placeDetails.opening_hours,
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
            console.error('Erreur lors de la récupération des coordonnées de la ville de l\'utilisateur :', error);
        }
    }

    const handleSelectSalon = async (salon) => {       
        if (salon.geometry && salon.geometry.location) {
            setSelectedSalon(salon)
            setIsModalOpen(true)
            // Vérifie si le salon est déjà dans la base de données
            const salonRef = doc(db, "salons", salon.place_id)
            const salonSnapshot = await getDoc(salonRef)
            if (!salonSnapshot.exists()) {
                // Ajoute le salon à la base de données
                await setDoc(salonRef, {
                    name: salon.name,
                    address: salon.vicinity
                })
            }
        } 
        else {
            console.error("Selected salon has no valid location", salon)
        }
    }

    const handleStartTour = async () => {
        handleSalonsNearBy()
        setIsTourStarted(true)
        setTotalDistance(0)
        setStops([])
        setIsTracking(false)
        if (startAddress) {
            try {
                if (currentRouteId) {
                    const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId)
                    await updateDoc(routeDocRef, {
                        date: new Date(),
                        isVisitsStarted: hasVisitsToday === true,
                        motifNoVisits: hasVisitsToday === false ? noVisitsReason : "",
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

    const handleEndTour = async () => {
        setIsTourStarted(false);
        setIsTracking(false);
        setCongratulations("Félicitations, Vous avez terminé votre tournée de la journée ! À bientôt !")    
        let totalDistanceCovered = 0;
        // Calculer les distances entre les arrêts
        const stopsWithDistance = stops.map((stop, index) => {
            if (index > 0) {
                const previousStop = stops[index - 1];
                const distanceBetweenStops = window.google.maps.geometry.spherical.computeDistanceBetween(
                    new window.google.maps.LatLng(previousStop.position.lat, previousStop.position.lng),
                    new window.google.maps.LatLng(stop.position.lat, stop.position.lng)
                );
                const distanceInKm = distanceBetweenStops / 1000;
                totalDistanceCovered += distanceInKm;
                return { name: stop.name, distance: distanceInKm.toFixed(2) };
            }
            return stop;
        })
        try {
            if (currentRouteId) {   
                const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId)
                await updateDoc(routeDocRef, {
                    date: new Date(),
                    isVisitsStarted: hasVisitsToday === true,
                    motifNoVisits: hasVisitsToday === false ? noVisitsReason : "", 
                    departureAddress: startAddress,
                    city: startCity,
                    userId: uid,
                    totalDistance: totalDistanceCovered,
                    stops: stopsWithDistance
                })
            } else {
                console.error("L'identifiant de la route actuelle est null.");
            }
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la feuille de route : ", error);
        }
    }

    const handleVisitsToday = async (response) => {
        setHasVisitsToday(response)
        if (response === false) {
            setIsTourStarted(false)
        }
        try {
            const newDocumentData = {
                date: new Date(),
                isVisitsStarted: response,
                motifNoVisits: response === false ? noVisitsReason : "",
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

    const handleNoVisitsReason = async () => {
        try {
            const docRef = doc(db, "feuillesDeRoute", currentRouteId) 
            await updateDoc(docRef, {
                date: new Date(),
                isVisitsStarted: false,
                motifNoVisits: noVisitsReason,
                userId: uid
            })       
            setMessage("Enregistré avec succès.  À bientôt !")
        } 
        catch (e) {
            console.error("Erreur lors de l'enregistrement du motif de non-visite : ", e)
        }
    }

    const formatDistance = (distance) => {
        if (distance < 1) {
            return `${(distance * 1000).toFixed(0)} m`;
        }
        return `${distance.toFixed(2)} km`;
    }

    const handleStartTracking = () => {
        setIsTracking(true)
        setStartPosition(currentPosition)
        const distanceToSalon = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
            new window.google.maps.LatLng(selectedSalon.geometry.location.lat(), selectedSalon.geometry.location.lng())
        ) / 1000;
        setDistanceToSalon(distanceToSalon)
        updateSalonStatus(selectedSalon.place_id, status)
    }

    const handleStopTracking = () => {
        setIsTracking(false)
        const distanceCovered = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(startPosition.lat, startPosition.lng),
            new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng)
        );
        const distanceInKm = distanceCovered / 1000;
        setStops(prevStops => [...prevStops, {
            name: selectedSalon.name,
            position: {
                lat: selectedSalon.geometry.location.lat(),
                lng: selectedSalon.geometry.location.lng()
            },
            address: selectedSalon.vicinity,
            distance: distanceInKm.toFixed(2)
        }])       
        setIsModalOpen(false)
        setDistanceToSalon(null)
        setStartPosition(null)
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

    const handleAddSalon = async () => {
        setStops(prevStops => [...prevStops, {
            name: newSalonName,
            position: {
                lat: null,
                lng: null
            },
            address: newSalonAddress,
            distance: 0
        }])
        setIsModalSalonOpen(false)
        try {
            await addDoc(collection(db, "salons"), { name: newSalonName, address: newSalonAddress, city: newSalonCity })
        } catch (error) {
            console.error("Erreur lors de l'ajout du salon: ", error);
        }
    }

    const updateSalonStatus = async (salonId, status) => {
        const salonRef = doc(db, "salons", salonId);
        await updateDoc(salonRef, {
            status: status,
        });
    } 

    if (!isLoaded) return <div>Loading Maps...</div>

    return (
        <>
            <header className="geo-header">
                <h1>Map Salons de coiffure</h1>  
            </header>

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

                {hasVisitsToday === true && !isTourStarted && (
                    <div className="start-adress">
                        <input type="text" placeholder="Dans quelle ville sont prévues vos visites ?" value={startCity} onChange={(e) => setStartCity(e.target.value)} />
                        <input type="text" placeholder="Adresse de départ" value={startAddress} onChange={(e) => setStartAddress(e.target.value)} />
                        <p className="info">Cliquer sur ce bouton lorsque vous êtes arrivé à votre point de départ</p>
                        <button className="button-colored" onClick={handleStartTour}>Démarrer mon parcours</button>
                        <p className="congrats">{congratulations}</p>
                    </div>
                )}

                {hasVisitsToday === false && (
                    <div className="motif">
                        <input type="text" placeholder="Motif" value={noVisitsReason} onChange={(e) => setNoVisitsReason(e.target.value)} />
                        <button className="button-colored" onClick={handleNoVisitsReason}>Enregistrer</button>
                        <p className="congrats success">{message}</p>
                    </div>
                )}
    
                {isTourStarted && (
                    <>
                        <div className="btn-end-parcours">
                            <button className="update-btn" onClick={handleSalonsNearBy}>Actualiser</button>
                            <button className="button-colored" onClick={handleEndTour}>Terminer mon parcours</button>
                            <button className="button-colored" onClick={() => setIsModalSalonOpen(true)}>Ajouter un nouveau salon</button>
                        </div>
                                                
                        <div className="distance-results">
                            <p className="total"><strong>{totalDistance.toFixed(2)}</strong> kilomètres parcourus aujourd'hui</p>
                            
                            <div className="arrets">
                                <p className="point">Distance entre chaque point d'arrêt</p>
                                <ul>
                                    {stops.map((stop, index) => (
                                        <li key={index}>
                                            {index === 0 ? (
                                                <p><strong>{stop.distance} km</strong>De <em>{startAddress}</em> à <em>{stop.name}</em></p>
                                            ) : (
                                                <p><strong>{stop.distance} km</strong>De <em>{stops[index - 1].name}</em> à <em>{stop.name}</em></p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="geoloc-results">
                            <ul>
                                {salons.map((salon, index) => (
                                    <li key={index}>
                                        <div>
                                            <div className="distance">
                                                <span>{salon.name} </span>
                                                <p>{formatDistance(
                                                    window.google.maps.geometry.spherical.computeDistanceBetween(
                                                        new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                                                        salon.geometry.location
                                                    ) / 1000
                                                )}</p>
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
                    <ReactModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} contentLabel="Salon Details" className="modale" >
                        <div className="content">
                            <h2>{selectedSalon.name}</h2>
                            <p className="city">{selectedSalon.vicinity}</p>
                            <div>
                                <input type="radio" id="prospect" name="status" value="prospect" checked={status === "prospect"} onChange={handleStatusChange} />
                                <label htmlFor="prospect">Prospect</label>

                                <input type="radio" id="client" name="status" value="client" checked={status === "client"} onChange={handleStatusChange} />
                                <label htmlFor="client">Client</label>
                            </div>

                            {isTracking ? (
                                <div>
                                    <p>Calcul en cours...</p> 
                                    <p className="total"><strong>{formatDistance(distanceToSalon)}</strong></p>
                                    <p>Distance parcourue : {totalDistance.toFixed(2)} km</p>
                                    <button className="button-colored" onClick={handleStopTracking}>Arrivé à destination</button>
                                </div>
                            ) : (
                                <button className="button-colored" onClick={handleStartTracking}>Démarrer le compteur de km</button>
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
                        <button onClick={handleAddSalon} className="button-colored">Ajouter</button>
                        <button onClick={() => setIsModalSalonOpen(false)} className="btn-cancel">Annuler</button>  
                    </div>
                </ReactModal>
            </div>
        </>
    )
    
}

export default Geolocation