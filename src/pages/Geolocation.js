
// Fichier Geolocation.js

import { GoogleMap }                                    from "@react-google-maps/api"
import {  useState, useEffect, useRef }                 from "react"
import ReactModal                                       from "react-modal"
import startIcon                                        from "../assets/start.png" 
import plus                                             from "../assets/plus.png"
import refresh                                          from "../assets/refresh.png"
import { db }                                           from "../firebase.config"
import { collection, addDoc, setDoc, doc, getDoc,getDocs, updateDoc, query, where, arrayUnion, deleteDoc, arrayRemove, Timestamp } from "firebase/firestore"

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

const computeDistance = async (start, end) => {
    const directionsService = new window.google.maps.DirectionsService();
    const request = {
        origin: new window.google.maps.LatLng(start.lat, start.lng),
        destination: new window.google.maps.LatLng(end.lat, end.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
    }
    return new Promise((resolve, reject) => {
        directionsService.route(request, (response, status) => {
            if (status === 'OK') {
                const route = response.routes[0];
                let totalDistance = 0;
                for (let i = 0; i < route.legs.length; i++) {
                    totalDistance += route.legs[i].distance.value; // in meters
                }
                resolve(totalDistance);
            } 
            else { reject(status) }
        });
    });
}

function Geolocation({ uid }) {
    const [currentPosition, setCurrentPosition]         = useState({ lat: 0, lng: 0 })
    const [isLoaded, setIsLoaded]                       = useState(false)
    const [hasVisitsToday, setHasVisitsToday]           = useState(null) 
    const [startAddress, setStartAddress]               = useState('')
    const [startCity, setStartCity]                     = useState('')
    const [startCityParcours, setStartCityParcours]                     = useState('')
    const [userAdresse, setUserAdresse]                 = useState("")
    const [userCity, setUserCity]                       = useState("")
    const [openNewUserAdresse, setOpenNewUserAdresse]   = useState(false)
    const [updatedAddress, setUpdatedAddress]           = useState('')
    const [isAddressConfirmed, setIsAddressConfirmed]   = useState(false)
    const [error, setError]                             = useState('')
    const [showConfirmButtons, setShowConfirmButtons]   = useState(true)
    const [citySuggestions, setCitySuggestions]         = useState([])
    const [currentRouteId, setCurrentRouteId]           = useState(null)
    const [salons, setSalons]                           = useState([])
    const [selectedSalon, setSelectedSalon]             = useState(null)
    const [recentlyAddedSalon, setRecentlyAddedSalon] = useState(false);
    const [recentlyAddedAction, setRecentlyAddedAction] = useState(false)
    const [initialStatus, setInitialStatus] = useState("");
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
    const [isCheckedNewSalon, setIsCheckedNewSalon]     = useState(false)
    const [statusLoaded, setStatusLoaded]               = useState(false)
    const [newSalonName, setNewSalonName]               = useState("")
    const [newSalonAddress, setNewSalonAddress]         = useState("")
    const [newSalonCity, setNewSalonCity]               = useState("")
    const [isModalSalonOpen, setIsModalSalonOpen]       = useState(false)
    const [isModalEndingOpen, setIsModalEndingOpen]     = useState(false)
    const [isModalConfirmHomeOpen, setIsModalConfirmHomeOpen] = useState(false)
    const [isModalHomeOpen, setIsModalHomeOpen]         = useState(false)
    const [isModalNewHomeOpen, setIsModalNewHomeOpen]   = useState(false) //
    const [isHomeTracking, setIsHomeTracking]           = useState(false)
    const [isNewHomeTracking, setIsNewHomeTracking]           = useState(false) //
    const [homeDistance, setHomeDistance]               = useState(0)
    const [userAddressLat, setUserAddressLat] = useState(null)
const [userAddressLng, setUserAddressLng] = useState(null)
const [newHomeBackAddressLat, setNewHomeBackAddressLat] = useState(null)
const [newHomeBackAddressLng, setNewHomeBackAddressLng] = useState(null)
const [arrivalTime, setArrivalTime] = useState(null);
const [departureTime, setDepartureTime] = useState(null);
    const [newHomeDistance, setNewHomeDistance]               = useState(0) //
    const [newHomeBackAddress, setNewHomeBackAddress] = useState('');
    const [newHomeBackCity, setNewHomeBackCity] = useState('');
    const [isModalBackOpen, setIsModalBackOpen] = useState(false);
    const [isRetourVisible, setIsRetourVisible]         = useState(true)
    const [isTerminerVisible, setIsTerminerVisible]     = useState(false)
    const [errorMessage, setErrorMessage]               = useState("")
    const [feuilleDuJour, setFeuilleDuJour] = useState(null)
    const [isModalTimeOpen,  setIsModalTimeOpen ]= useState(false)
    const [showModal, setShowModal]                     = useState(false);
    const mapRef                                        = useRef(null)
    const markerRef                                     = useRef(null)
    const previousPosition                              = useRef(null)

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

    useEffect(() => {
        if (isLoaded && mapRef.current && currentPosition.lat !== 0 && currentPosition.lng !== 0) {
            const { AdvancedMarkerElement } = window.google.maps.marker
            if (markerRef.current) {
                markerRef.current.setMap(null)
            }
            const markerIcon = document.createElement('div')
            markerIcon.style.width = '32px'
            markerIcon.style.height = '32px'
            markerIcon.style.backgroundImage = 'url("/assets/marker.png")'
            markerIcon.style.backgroundSize = 'contain'
            markerIcon.style.backgroundRepeat = 'no-repeat'
            markerRef.current = new AdvancedMarkerElement({ position: currentPosition, map: mapRef.current, content: markerIcon })
            mapRef.current.setCenter(currentPosition)
        }
    }, [isLoaded, currentPosition])

    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newPosition = { lat: position.coords.latitude, lng: position.coords.longitude, }
                    setCurrentPosition(newPosition)
                    if (isTracking && previousPosition.current) { computeAndSetDistance(previousPosition.current, newPosition) }
                    if (isHomeTracking && previousPosition.current) { computeAndSetHomeDistance(previousPosition.current, newPosition) }
                    if (isNewHomeTracking && previousPosition.current) { computeAndSetNewHomeDistance(previousPosition.current, newPosition) }
                    previousPosition.current = newPosition
                },
                (error) => { console.error(error) }, { enableHighAccuracy: true }
            )
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            console.error("La géolocalisation n'est pas supportée dans votre navigateur.")
        }
    }, [isTracking, isHomeTracking, isNewHomeTracking])

    useEffect(() => {
        const fetchFeuilleDuJour = async () => {
            try {
                const feuillesDeRouteRef = collection(db, 'feuillesDeRoute')
                const q = query(feuillesDeRouteRef, where('userId', '==', uid))
                const querySnapshot = await getDocs(q)
                querySnapshot.forEach(doc => {
                    const feuille = doc.data()
                    const feuilleDate = feuille.date.toDate()
                    const today = new Date()
                    // Vérifier si la feuille est du jour et non clôturée
                    if (!feuille.isClotured && feuilleDate.getDate() === today.getDate() &&
                        feuilleDate.getMonth() === today.getMonth() && feuilleDate.getFullYear() === today.getFullYear()) {
                        setFeuilleDuJour(feuille)
                        setShowModal(true)
                    }
                })
            } catch (error) { console.error("Erreur lors de la récupération de la feuille de route du jour :", error) }
        }
        fetchFeuilleDuJour()
    }, [uid, feuilleDuJour])

    const geocodeAddress = (address) => {
        return new Promise((resolve, reject) => {
            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK') {
                    const location = results[0].geometry.location
                    resolve({ lat: location.lat(), lng: location.lng() })
                } else {
                    reject(status)
                }
            })
        })
    }
    const computeAndSetDistance = async (start, end) => {
        try {
            const distance = await computeDistance(start, end)
            setDistance((prevDistance) => prevDistance + distance)
            setTotalDistance((prevTotal) => prevTotal + distance)
        } catch (error) {
            console.error('Error computing distance:', error)
        }
    }
    const computeAndSetHomeDistance = async (start, end) => {
        try {
            const distance = await computeDistance(start, end)
            setHomeDistance((prevDistance) => prevDistance + distance)
        } catch (error) {
            console.error("Erreur pour calculer la distance de l'adresse de domicile:", error)
        }
    }
    const computeAndSetNewHomeDistance = async (start, end) => {
        try {
            const distance = await computeDistance(start, end)
            setNewHomeDistance((prevDistance) => prevDistance + distance)
        } catch (error) {
            console.error('Erreur pour calculer la distance de la nouvelle adresse de domicile:', error)
        }
    }

    // Vérifie si le statut est déjà enregistré dans la base de données
    useEffect(() => {
        const checkStatusInDatabase = async () => {
            const salonId = selectedSalon.place_id || selectedSalon.id; // Utiliser place_id ou id selon le cas
        if (!salonId) {
            console.error("Le salon sélectionné n'a pas d'id valide", selectedSalon)
            return
        }
        const salonRef = doc(db, "salons", salonId)
        const salonSnapshot = await getDoc(salonRef)
        const salonData = salonSnapshot.data()

        if (salonData && salonData.status) {
            setStatus(salonData.status)
            setIsRadioVisible(false)
            setIsChecked(salonData.status === 'Prospect' || salonData.status === 'Client')
        }
        else {
            setStatus('')
            setIsRadioVisible(true)
            setIsChecked(false)
        }
        setStatusLoaded(true)
        }
        if (selectedSalon) { checkStatusInDatabase() }
    }, [selectedSalon])

    // Récupère l'adresse et la ville enregistré dans le document du user
    useEffect(() => {
        const fetchAdress = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", uid))
                if (userDoc.exists()) {
                    const data = userDoc.data() 
                    const fullAddress = `${data.adresse}, ${data.city}`
                    //console.log(fullAddress)
                    setUserAdresse(fullAddress)
                    setUserCity(data.city)
                    const location = await geocodeAddress(fullAddress)
                    //console.log(location)
                    setUserAddressLat(location.lat)
                    setUserAddressLng(location.lng)
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération de l'adresse :", error)
            }
        }
        fetchAdress()
    }, [uid])

    const handleAddressUpdate = async () => {
        if (!startAddress || !startCity) {
            setError("L'adresse de départ est obligatoire.")
            return
        }
        const fullAddress = `${startAddress}, ${startCity}`
        //console.log(fullAddress)
        const location = await geocodeAddress(fullAddress)
        console.log(location)
        setUserAddressLat(location.lat)
        setUserAddressLng(location.lng)
        setUserAdresse(fullAddress)
        setUpdatedAddress(fullAddress)
        setOpenNewUserAdresse(false)
        setError('')
        setShowConfirmButtons(false)
        setIsAddressConfirmed(true)
    }
    
    const fetchCitySuggestions = (input) => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({ input, componentRestrictions: { country: 'fr' }, types: ['(cities)'] 
        }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setCitySuggestions(predictions.map(prediction => prediction.description.split(',')[0]))
            } else {
                setCitySuggestions([])
            }
        })
    }
    
    const handleVisitsToday = async (response) => {
        setHasVisitsToday(response)
        if (response === false) { setIsParcoursStarted(false) }
        else {
            try { 
                const newDocumentData = {
                    date: new Date(),
                    isVisitsStarted: response,
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
    const handleStartParcours = async () => {
        if (!startCityParcours) { setErrorMessage("Veuillez saisir une ville.") } 
        else if (!isAddressConfirmed) { setErrorMessage("Veuillez confirmer l'adresse de départ.") } 
        else {
            const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId)
            await updateDoc(routeDocRef, { departureAddress: startAddress, city: startCity,  })
            startParcours()
        }
    }
    const startParcours = async () => {
        setIsParcoursStarted(true)
        handleSalonsNearBy()
        setStops([])      
    }
    const endParcours = async () => {
        setIsModalEndingOpen(false)
        setIsParcoursStarted(false)
        setIsParcoursEnded(true)
        await updateRouteWithStops()
    } 
    const updateRouteWithStops = async () => {
        try {
            const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId)
            const totalKm = getTotalStopDistances()
            const unit = totalKm < 1000 ? 'm' : 'km'
            await updateDoc(routeDocRef, {
                stops: stops, 
                totalKm: totalKm,
                unitTotalKm : unit,
                isClotured: false
            })
        } catch (e) { console.error("Erreur lors de la mise à jour des arrêts : ", e) }
    }

    const handleSalonsNearBy = async () => {
       try {
            const service = new window.google.maps.places.PlacesService(mapRef.current)
            service.nearbySearch({ location: currentPosition, type: 'hair_care', radius: 5000, },
                async (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        const salonsWithOpeningHours = []
                        for (let i = 0; i < results.length; i++) {
                            try {
                                const placeDetails = await new Promise((resolve, reject) => {
                                    service.getDetails({ placeId: results[i].place_id, },
                                        (place, status) => {
                                            if (status === window.google.maps.places.PlacesServiceStatus.OK) { resolve(place)} 
                                            else { reject(new Error('Erreur lors de la récupération des détails du salon'))}
                                        }
                                    )
                                })
                                if (placeDetails.opening_hours) {
                                    const city = await getCityFromCoords(placeDetails.geometry.location.lat(), placeDetails.geometry.location.lng());
                                    if (city && city.toLowerCase() === startCityParcours.toLowerCase()) {
                                        const distance = await computeDistance(currentPosition, { lat: placeDetails.geometry.location.lat(), lng: placeDetails.geometry.location.lng() })
                                        salonsWithOpeningHours.push({ ...results[i], opening_hours: placeDetails.opening_hours, distance: distance });
                                    }
                                }
                            } catch (error) { console.error(error) }
                        }
                        // Récupération des salons ajoutés manuellement par l'utilisateur depuis la base de données
                        const dbSalonsSnapshot = await getDocs(query(collection(db, 'salons'), where('manuallyAdded', '==', true)));
                        const manuallyAddedSalons = dbSalonsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                        // Vérification que chaque salon ajouté manuellement a les propriétés 'lat' et 'lng'
                        const validManuallyAddedSalons = manuallyAddedSalons.filter(salon => {
                            return salon.location && salon.location.lat && salon.location.lng && salon.name && salon.address;
                        })
                        // Fusion des salons de Google et ceux ajoutés manuellement
                        const allSalons = [...salonsWithOpeningHours, ...validManuallyAddedSalons]
                        const sortedSalons = allSalons.sort((a, b) => {
                            const distanceA = a.distance || Infinity; // Utilisation de distance ou Infinity si non défini
                            const distanceB = b.distance || Infinity; // Utilisation de distance ou Infinity si non défini
                            return distanceA - distanceB;
                        })
                        for (let i = 0; i < sortedSalons.length; i++) {
                            const place = sortedSalons[i];
                            new window.google.maps.marker.AdvancedMarkerElement({
                                position: {
                                    lat: place.geometry ? place.geometry.location.lat() : place.location.lat,
                                    lng: place.geometry ? place.geometry.location.lng() : place.location.lng
                                },
                                map: mapRef.current,
                                title: place.name,
                            })
                        }
                        setSalons(sortedSalons)
                    } else {
                        console.error('Erreur lors de la recherche des salons de coiffure', status);
                    }
                }
            )
        } catch (error) {
            console.error('Erreur lors de la récupération des coordonnées de la ville de l\'utilisateur :', error);
        }
    } 
    const getCityFromCoords = async (lat, lng) => {
        return new Promise((resolve, reject) => {
            const geocoder = new window.google.maps.Geocoder()
            const latlng = { lat, lng }  
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const addressComponents = results[0].address_components
                    for (let component of addressComponents) {
                        if (component.types.includes("locality")) { resolve(component.long_name); return }
                    }
                    resolve(null)
                } else { reject(status) }
            })
        })
    }
    const getPostalCodeFromCoords = async (lat, lng) => {
        return new Promise((resolve, reject) => {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const addressComponents = results[0].address_components;
                    for (let component of addressComponents) {
                        if (component.types.includes("postal_code")) {
                            resolve(component.long_name);
                            return;
                        }
                    }
                    resolve(null); // No postal code found
                } else {
                    reject("Failed to get postal code");
                }
            });
        });
    };
    
    const handleSelectSalon = async (salon) => {
        setIsTracking(false)
        setTotalDistance(0)
        setDistance(0)
        const salonLocation = salon.geometry?.location || salon.location
        if (salonLocation) {
            let startCoords
            if (stops.length === 0) {
                startCoords = await new Promise((resolve, reject) => {
                     const fullAddress = `${startAddress}, ${startCity}`
                    const geocoder = new window.google.maps.Geocoder()
                    geocoder.geocode({ address: fullAddress }, (results, status) => {
                        if (status === "OK" && results[0]) { resolve({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() })} 
                        else { reject(status) }
                    })
                })
            } else {
                const previousStop = stops[stops.length - 1]
                startCoords = { lat: previousStop.lat, lng: previousStop.lng }
            }
            try {
                const salonLat = typeof salonLocation.lat === 'function' ? salonLocation.lat() : salonLocation.lat
                const salonLng = typeof salonLocation.lng === 'function' ? salonLocation.lng() : salonLocation.lng
                const distance = await computeDistance(startCoords, { lat: salonLat, lng: salonLng })
                setDistance(distance)
                setSelectedSalon(salon)
                setIsModalCounterOpen(true) 
                const salonRef = doc(db, "salons", salon.place_id || salon.id)
                const salonSnapshot = await getDoc(salonRef)
                let city = ''

                if (salon.vicinity) { const parts = salon.vicinity.split(','); city = parts.length > 1 ? parts[parts.length - 1].trim() : ''} 
                else if (salon.address) { const parts = salon.address.split(','); city = parts.length > 1 ? parts[parts.length - 1].trim() : '' }
                const postalCode = await getPostalCodeFromCoords(salonLat, salonLng)
                if (!salonSnapshot.exists()) {
                    await setDoc(salonRef, {
                        name: salon.name,
                        address: salon.vicinity || salon.address,
                        city: city,
                        postalCode: postalCode || "",
                        status: "",
                    })
                    setIsRadioVisible(true)
                    setRecentlyAddedSalon(true)
                } else {
                    const salonData = salonSnapshot.data()
        
                    if (!salonData.status) { setIsRadioVisible(true) } 
                    else { setStatus(salonData.status); setIsRadioVisible(false) }
                    setRecentlyAddedSalon(false)
                }
            } catch (error) { console.error("Error computing distance:", error) }
        } else { console.error("Selected salon has no valid location", salon) }
    }
    const handleCancelStop = async () => {
        if (recentlyAddedSalon && selectedSalon) {
            const salonRef = doc(db, "salons", selectedSalon.place_id || selectedSalon.id);
            await deleteDoc(salonRef);
        }
        if (!recentlyAddedSalon && recentlyAddedAction) {
            const salonRef = doc(db, "salons", selectedSalon.place_id || selectedSalon.id);
            await updateDoc(salonRef, {
                status: initialStatus,
                historique: arrayRemove(recentlyAddedAction)
            });
        }
        setIsModalCounterOpen(false);
        setIsTracking(false);
        setStatus(initialStatus); // Restaure le statut initial dans l'état local
        setSelectedSalon(null); // Réinitialise le salon sélectionné
        setRecentlyAddedAction(null); // Réinitialise l'action récemment ajoutée
    };

    const handleStatusChange = async (e) => {
        const selectedStatus = e.target.value
        setStatus(selectedStatus)
        setIsChecked(selectedStatus === 'Prospect' || selectedStatus === 'Client')

        const logMessage = `Statut mis à jour : ${selectedStatus}`
        const salonRef = doc(db, "salons", selectedSalon.place_id )
        const action = {
            date: new Date(),
            action: logMessage,
            userId: uid
        };
        setRecentlyAddedAction(action);
        await updateDoc(salonRef, {
            status: selectedStatus,
            historique: arrayUnion(action)
        });
        setIsRadioVisible(false);
    }
    const handleStatusChange2 = async (e) => {
        const selectedStatus = e.target.value
        setStatus(selectedStatus)
        setIsCheckedNewSalon(selectedStatus === 'Prospect' || selectedStatus === 'Client')
    }

    const handleModalClose = () => {
        setIsModalCounterOpen(false)
        setStatus('')
        setIsChecked(false)
        setIsCheckedNewSalon(false)
        setIsRadioVisible(true)
    }    
    // Active le suivi de la position
    const handleStartTracking = () => {
        setIsTracking(true)
    } 

    let currentArrivalTime = null;
    let currentDepartureTime = null;

    const handleArrivalTime = () => {
        currentArrivalTime = getCurrentTime();
    };

    const handleDepartureTime = () => {
        currentDepartureTime = getCurrentTime();
        setIsModalTimeOpen(false);
        updateStopWithDepartureTime()
    };

    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleStopTracking = async () => {
        const unit = totalDistance < 1000 ? 'm' : 'km'
        const getLatLng = (value) => typeof value === 'function' ? value() : value
        const salonLat = getLatLng(selectedSalon.geometry?.location?.lat) || getLatLng(selectedSalon.location?.lat)
        const salonLng = getLatLng(selectedSalon.geometry?.location?.lng) || getLatLng(selectedSalon.location?.lng)
        const postalCode = await getPostalCodeFromCoords(salonLat, salonLng)

        handleArrivalTime();

            setStops((prevStops) => [ 
                ...prevStops,
                {
                    name: selectedSalon.name,
                    address: selectedSalon.vicinity || selectedSalon.address,
                    postalCode: postalCode,
                    distance: distance,
                    unitDistance: unit,
                    status: status,
                    arrivalTime: currentArrivalTime,  
                    departureTime: currentDepartureTime,
                    lat: salonLat,
                    lng: salonLng,
                },
            ])

        const salonId = selectedSalon.place_id || selectedSalon.id
        const logMessage = `Nouvelle visite`
        const salonRef = doc(db, "salons", salonId)
        await updateDoc(salonRef, {
            historique: arrayUnion({
                date: new Date(),
                action: logMessage,
                userId: uid,
            }),
        })
        currentArrivalTime = null;
        //currentDepartureTime = null;
        setIsTracking(false)
        setIsModalCounterOpen(false)
        setTotalDistance(0)  
        setDistance(0)
        setIsModalTimeOpen(true)  
    }
    const updateStopWithDepartureTime = () => {
        setStops((prevStops) => {
            const lastStop = prevStops[prevStops.length - 1];
            if (lastStop) {
                lastStop.departureTime = currentDepartureTime;
            }
            return [...prevStops];
        });
        currentArrivalTime = null;
        //currentDepartureTime = null;
    };
    const handleStartHomeTracking = () => {
        setIsHomeTracking(true)
        setHomeDistance(0)
        const lastStop = stops.length > 0 ? stops[stops.length - 1] : null
        if (lastStop) {computeAndSetHomeDistance({ lat: lastStop.lat, lng: lastStop.lng }, { lat: userAddressLat, lng: userAddressLng })}
    }
    const handleStartNewHomeTracking = () => {
        setIsNewHomeTracking(true)
        setNewHomeDistance(0)
        const lastStop = stops.length > 0 ? stops[stops.length - 1] : null
        if (lastStop) {computeAndSetNewHomeDistance({ lat: lastStop.lat, lng: lastStop.lng }, { lat: newHomeBackAddressLat, lng: newHomeBackAddressLng })}
    }
    const handleStopHomeTracking = () => {
        setIsHomeTracking(false);
        // Add home stop to stops array
        const unit = homeDistance < 1000 ? 'm' : 'km'
        setStops((prevStops) => [
            ...prevStops,
            {
                name: startAddress,
                address: startAddress, 
                city: startCity,
                distance: homeDistance,
                unitDistance: unit,
            },
        ])
        setIsModalHomeOpen(false)
    }
    const handleStopNewHomeTracking = () => {
        setIsNewHomeTracking(false)  
        setIsModalBackOpen(false)
        setIsModalConfirmHomeOpen(false)
        // Add home stop to stops array
        const unit = newHomeDistance < 1000 ? 'm' : 'km'
        setStops((prevStops) => [
            ...prevStops,
            {
                name: newHomeBackAddress,
                address: newHomeBackAddress, 
                city: newHomeBackCity,
                distance: newHomeDistance,
                unitDistance: unit,
            },
        ])
        setIsModalNewHomeOpen(false)
    }
    const handleNewHomeBackAddress = async () => { 
        if (!newHomeBackAddress || !newHomeBackCity) {
            setError("La nouvelle adresse de retour et la ville sont obligatoires.")
            return
        }
        const fullNewHomeBackAddress = `${newHomeBackAddress}, ${newHomeBackCity}`
        try {
            const location = await geocodeAddress(fullNewHomeBackAddress)
            setNewHomeBackAddressLat(location.lat)
            setNewHomeBackAddressLng(location.lng)
            setIsModalNewHomeOpen(true)
        } catch (error) {
            console.error("Erreur lors de la géolocalisation de la nouvelle adresse de retour :", error)
        }
    }
    const getTotalStopDistances = () => {
        return stops.reduce((total, stop) => total + stop.distance, 0)
    }
    // ajoute un nouveau salon manuellement
    const handleAddSalon = async (e) => {
        e.preventDefault()
        setIsTracking(true)
        let startCoords
        if (stops.length === 0) {
            startCoords = await new Promise((resolve, reject) => {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ address: startAddress }, (results, status) => {
                    if (status === "OK" && results[0]) {
                        const location = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() }
                        resolve(location)
                    } 
                    else {console.error("Error geocoding start address:", status); reject(status) }
                })
            })
        } else {
            const previousStop = stops[stops.length - 1];
            startCoords = { lat: previousStop.lat, lng: previousStop.lng };
        }
        const geocoder = new window.google.maps.Geocoder()
        const country = "France";  // Ajout du pays
        const newSalonFullAddress = `${newSalonAddress}, ${newSalonCity}, ${country}`
        const newSalonLocation = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: newSalonFullAddress }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const location = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() }
                    resolve(location)
                } 
                else { console.error("Error geocoding new salon address:", status); reject(status) }
            })
        })
        try {
            const distanceToNewSalon = await computeDistance(startCoords, newSalonLocation)
            const unitDistance = distanceToNewSalon < 1 ? 'm' : 'km'
            const distanceDisplay = distanceToNewSalon < 1 ? distanceToNewSalon * 1000 : distanceToNewSalon
            const postalCode = await getPostalCodeFromCoords(newSalonLocation.lat, newSalonLocation.lng);

            setStops((prevStops) => [
                ...prevStops,
                {
                    name: newSalonName,
                    address: `${newSalonAddress}, ${newSalonCity}`,
                    postalCode: postalCode,
                    city: `${newSalonCity}`,
                    distance: distanceDisplay,
                    unitDistance: unitDistance,
                    status: status,
                    lat: newSalonLocation.lat,
                    lng: newSalonLocation.lng,
                },
            ])
            const logMessage = 'Nouvelle visite'
            await addDoc(collection(db, 'salons'), {
                name: newSalonName,
                address: `${newSalonAddress}, ${newSalonCity}`,
                postalCode: postalCode,
                city: `${newSalonCity}`,
                status: status,
                lat: newSalonLocation.lat,
                lng: newSalonLocation.lng,
                manuallyAdded: true,
                location: newSalonLocation,
                historique: arrayUnion({
                    date: new Date(),
                    action: logMessage,
                    userId: uid,
                }),
            })
            handleSalonsNearBy()
            setIsModalSalonOpen(false)
            setStatus('')
            setIsChecked(false)
            setNewSalonAddress('')
            setNewSalonCity('')
            setNewSalonName('')
        } catch (error) { console.error('Erreur lors de l\'ajout du salon: ', error) }
    }
    

    const formatDistance = (distance) => {
        if (distance < 1000) { return `${distance.toFixed(0)} m` }
        return `${(distance / 1000).toFixed(2)} km`
    }

    const getNextCloseTime = (openingHours) => {
        const now = new Date();
        const today = now.getDay(); // Jour de la semaine actuel (0 pour dimanche, 1 pour lundi, etc.)
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const todayClosingTimes = openingHours.periods.filter(period => period.close && period.close.day === today)
        const sortedClosingTimes = todayClosingTimes.sort((a, b) => {
            const hourA = a.close.time.slice(0, 2);
            const minuteA = a.close.time.slice(2);
            const hourB = b.close.time.slice(0, 2);
            const minuteB = b.close.time.slice(2);
            const timeA = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourA, minuteA);
            const timeB = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourB, minuteB);
            return timeA - timeB;
        });
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
        const todayOpeningTimes = openingHours.periods.filter(period => period.open && period.open.day === today);
        const sortedOpeningTimes = todayOpeningTimes.sort((a, b) => {
            const hourA = a.open.time.slice(0, 2);
            const minuteA = a.open.time.slice(2);
            const hourB = b.open.time.slice(0, 2);
            const minuteB = b.open.time.slice(2);
            const timeA = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourA, minuteA);
            const timeB = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourB, minuteB);
            return timeA - timeB;
        });
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
            {/*showModal && (
                <div className="modal-clotured">
                    <div className="content">
                        <p>Pour démarrer une nouvelle journée, vous devez valider dernière feuille de route du jour.<br></br>Dirigez-vous vers  la section <em>Feuilles de route de la semaine</em> et clôturez votre fiche.</p>
                    </div>
                </div>
            )*/}
            <header className="geo-header">
                <h1>Map Salons de coiffure</h1> 
                {!isModalSalonOpen && (  
                     <div className="btns">
                        <img className="add" onClick={() => setIsModalSalonOpen(true)} src={plus} alt="Ajouter un salon"/> 
                        <button><img onClick={handleSalonsNearBy} src={refresh} alt="Actualiser" /></button>
                    </div>
                )}
            </header>
            <div className="geoloc-section">
                <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={currentPosition} options={options} onLoad={(map) => (mapRef.current = map)}></GoogleMap>

                {hasVisitsToday === null && (
                    <div className="start-tour">
                        <p>Avez-vous prévu des visites aujourd'hui ?</p>
                        <div>
                            <button onClick={() => handleVisitsToday(true)}>Oui</button>
                            <button onClick={() => handleVisitsToday(false)}>Non</button>
                        </div>
                    </div>
                )}
                {hasVisitsToday === true && !isParcoursStarted && !isParcoursEnded && (
                    <div className="start-adress" id="start-adress">
                        <p className="confirm">Confirmez-vous que l'adresse ci-dessous est bien votre adresse de départ ?</p>
                        <p className="adresse"><strong>{updatedAddress ? updatedAddress : userAdresse }</strong></p>
                        {showConfirmButtons && (
                            <div className="btns">
                                <button onClick={() => { setIsAddressConfirmed(true); setShowConfirmButtons(false); setStartAddress(updatedAddress ? updatedAddress + ", " + userCity : userAdresse + ", " + userCity);}}>Oui</button>
                                <button onClick={() => setOpenNewUserAdresse(true)}>Non</button>
                            </div>
                        )}
                        <input type="text" placeholder="Dans quelle ville sont prévues vos visites ?" value={startCityParcours} onChange={(e) => {setStartCityParcours(e.target.value); fetchCitySuggestions(e.target.value);}} />
                        {citySuggestions.length > 0 && (
                            <ul className="city-suggestions">
                                {citySuggestions.map((suggestion, index) => (
                                    <li key={index} onClick={() => { setStartCityParcours(suggestion); setCitySuggestions([]); }}>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <p className="info">Cliquer sur ce bouton lorsque vous êtes arrivé à votre point de départ</p>
                        <button className="button-colored" onClick={handleStartParcours}>Démarrer mon parcours</button>
                    </div>
                )}
                {openNewUserAdresse && (
                    <div className="modal">
                        <div className="modal-content">
                            <p>Veuillez entrer votre adresse de départ</p>
                            <input type="text" placeholder="Adresse" value={startAddress} onChange={(e) => setStartAddress(e.target.value)} />
                            <input type="text" placeholder="Ville" value={startCity} onChange={(e) => setStartCity(e.target.value)} />
                            {error && <p className="error-message">{error}</p>}
                            <button className="button-colored"  onClick={handleAddressUpdate}>Valider</button>
                            <button className="cancel" onClick={() => setOpenNewUserAdresse(false)}>Annuler</button>
                        </div>
                    </div>
                )}
                {hasVisitsToday === false && (
                    <div className="motif"><p className="congrats success">Enregistré avec succès. À bientôt !</p></div>
                )}
                {isParcoursStarted === true && (
                    <>
                        {isRetourVisible && (
                            <button className="button-colored back-home-btn" onClick={() => { setIsModalConfirmHomeOpen(true); setIsRetourVisible(false); setIsTerminerVisible(true); }}>Retour à mon domicile</button>
                        )}
                        {isTerminerVisible && (
                            <button className="button-colored xx" onClick={() => setIsModalEndingOpen(true)}>Terminer mon parcours</button>
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
                                            <p>{salon.vicinity || salon.address}</p> 
                                            {salon.opening_hours ? (
                                                salon.opening_hours.isOpen() ? (
                                                    <p><span className="open">Ouvert</span> - Ferme à : {getNextCloseTime(salon.opening_hours)}</p>
                                                ) : (
                                                    <p><span className="close">Fermé</span> - Ouvre à : {getNextOpenTime(salon.opening_hours)}</p>
                                                )
                                            ) : (
                                                <p>Heures d'ouverture inconnues</p>  
                                            )}
                                            {salon.manuallyAdded && (
                                                <p>Salon ajouté manuellement</p>
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
                            <p className="city">{selectedSalon.vicinity || selectedSalon.address}</p>
                            {statusLoaded && isRadioVisible && ( 
                                <div className="status">
                                    <input className="checkbox" type="checkbox" id="Prospect" name="status" value="Prospect" checked={status === "Prospect"} onChange={handleStatusChange} />
                                    <label htmlFor="prospect" className="prospect">Prospect</label>
                                    <input className="checkbox" type="checkbox" id="Client" name="status" value="Client" checked={status === "Client"} onChange={handleStatusChange} />
                                    <label htmlFor="client">Client</label>
                                </div>
                            )}
                            {!isRadioVisible && (
                                <p><span style={{fontWeight : "bold"}}>Statut</span>: {status}</p> 
                            )}
                            {isTracking ? (
                                <div>
                                    <p>Calcul en cours ...</p> 
                                    <p className="total"><strong>{formatDistance(distance)}</strong></p>
                                    <button className="button-colored" onClick={handleStopTracking}>Arrivé à destination</button>
                                    <button onClick={handleCancelStop}>Annuler</button>
                                </div>
                            ) : (
                                <>
                                <button className="button-colored" onClick={handleStartTracking} disabled={!isChecked}>Démarrer le compteur de km</button>
                                <button onClick={handleCancelStop}>Annuler</button>
                                </>
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
                        <button onClick={handleAddSalon} disabled={!isCheckedNewSalon} className="button-colored">Ajouter</button>
                        <button onClick={() => setIsModalSalonOpen(false)} className="btn-cancel">Annuler</button>  
                    </div>
                </ReactModal>
                <ReactModal isOpen={isModalTimeOpen} onRequestClose={() => setIsModalTimeOpen(false)} contentLabel="Heure de départ du salon" className="modale" >    
                    <div className="content">
                        <h2>Fin de visite</h2>  
                        <p>Cliquer sur ce bouton lorsque vous avez terminée votre visite</p>
                        <button onClick={handleDepartureTime} className="button-colored">Visite terminée</button>
                    </div>
                </ReactModal>
                <ReactModal isOpen={isModalConfirmHomeOpen} onRequestClose={() => setIsModalConfirmHomeOpen(false)} contentLabel="Confirmer l'adresse de retour" className="modale">
                    <div className="content">
                        <h2>Confirmer l'adresse de retour</h2>
                        <p>L'adresse de retour est-elle la même que l'adresse de départ ?</p>
                        <p className="city">{startAddress}</p>
                        <div className="btns">
                            <button onClick={()=> {setIsModalHomeOpen(true); setIsModalConfirmHomeOpen(false)}}>Oui</button>
                            <button onClick={() => setIsModalBackOpen(true)}>Non</button>
                        </div>
                    </div>
                </ReactModal>
                <ReactModal isOpen={isModalBackOpen} onRequestClose={() => setIsModalBackOpen(false)} contentLabel="Entrer une nouvelle adresse de retour" className="modale">
                    <div className="content">
                        <h2>Entrer une nouvelle adresse de retour</h2>
                        <input type="text" placeholder="Nouvelle adresse de retour" value={newHomeBackAddress} onChange={(e) => setNewHomeBackAddress(e.target.value)} />
                        <input type="text" placeholder="Nouvelle ville de retour" value={newHomeBackCity} onChange={(e) => setNewHomeBackCity(e.target.value)} />
                        <button onClick={handleNewHomeBackAddress}>Valider</button> 
                    </div>
                </ReactModal> 
                <ReactModal isOpen={isModalNewHomeOpen} onRequestClose={() => setIsModalNewHomeOpen(false)} contentLabel="Retour à mon domicile (nouveau)" className="modale">
                    <div className="content">
                                    <h2>Retour à mon domicile (new)</h2>
                                    <p className="city">{newHomeBackAddress}, {newHomeBackCity}</p>
                                    {isNewHomeTracking ? (
                                        <div>
                                            <p>Distance en cours : {formatDistance(newHomeDistance)}</p>  
                                            <button className="button-colored" onClick={handleStopNewHomeTracking}>Arrivé à destination</button>
                                        </div>
                                    ) : (
                                        <button className="button-colored" onClick={handleStartNewHomeTracking} >Démarrer le compteur de km</button>
                                    )}
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
                        <p className="error-message">N'oubliez pas de clôturer votre feuille de route de la journée avant ce soir 22h.</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default Geolocation 
