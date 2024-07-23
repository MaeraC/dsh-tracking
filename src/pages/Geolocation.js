
// Fichier Geolocation.js

import { GoogleMap }                                    from "@react-google-maps/api" 
import {  useState, useEffect, useRef }                 from "react"
import ReactModal                                       from "react-modal"
import loader                                           from "../assets/loader.gif"
import startIcon                                        from "../assets/start.png" 
import plus                                             from "../assets/plus.png"
import refresh                                          from "../assets/refresh.png"
import { db }                                           from "../firebase.config"
import deleteIcon                                       from "../assets/delete.png" 
import { collection, addDoc, setDoc, doc, getDoc,getDocs, updateDoc, query, where, arrayUnion, deleteDoc, arrayRemove, increment } from "firebase/firestore"

const mapContainerStyle = { width: '100vw', height: '55vh' }
const options = { disableDefaultUI: true, zoomControl: true, mapId: "2e40262607617060" }
ReactModal.setAppElement('#root') 

const computeDistance = async (start, end) => {
    const directionsService = new window.google.maps.DirectionsService()

    const request = {
        origin: new window.google.maps.LatLng(start.lat, start.lng),
        destination: new window.google.maps.LatLng(end.lat, end.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
    }

    return new Promise((resolve, reject) => {
        directionsService.route(request, (response, status) => {
            if (status === 'OK') {
                const route = response.routes[0]
                let totalDistance = 0

                for (let i = 0; i < route.legs.length; i++) {
                    totalDistance += route.legs[i].distance.value;
                }
                resolve(totalDistance)
            } 
            else { reject(status) }
        })
    })
}

function Geolocation({ uid }) {
    const [currentPosition, setCurrentPosition]         = useState({ lat: 0, lng: 0 })
    const [isLoaded, setIsLoaded]                       = useState(false)
    const [hasVisitsToday, setHasVisitsToday]           = useState(null) 
    const [startAddress, setStartAddress]               = useState('')
    const [startCity, setStartCity]                     = useState('') 
    // eslint-disable-next-line
    const [userAdresse, setUserAdresse]                 = useState("")
    const [userAdresses, setUserAdresses]                = useState([])
    // eslint-disable-next-line
    const [userCity, setUserCity]                       = useState("")
    const [openNewUserAdresse, setOpenNewUserAdresse]   = useState(false)
    // eslint-disable-next-line
    const [updatedAddress, setUpdatedAddress]           = useState('')
    // eslint-disable-next-line
    const [updateCity, setUpdateCity]                   = useState('')
    const [isAddressConfirmed, setIsAddressConfirmed]   = useState(false)
    const [error, setError]                             = useState('')
    const [showConfirmButtons, setShowConfirmButtons]   = useState(true)
    const [citySuggestions, setCitySuggestions]         = useState([])
    const [currentRouteId, setCurrentRouteId]           = useState(null)
    const [salons, setSalons]                           = useState([])
    const [selectedSalon, setSelectedSalon]             = useState(null)
    const [recentlyAddedSalon, setRecentlyAddedSalon]   = useState(false);
    const [recentlyAddedAction, setRecentlyAddedAction] = useState(false)
    // eslint-disable-next-line
    const [initialStatus, setInitialStatus]             = useState("");  
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
    const [isModalNewHomeOpen, setIsModalNewHomeOpen]   = useState(false) 
    const [isHomeTracking, setIsHomeTracking]           = useState(false)
    const [isNewHomeTracking, setIsNewHomeTracking]     = useState(false) 
    const [homeDistance, setHomeDistance]               = useState(0)
     // eslint-disable-next-line
    const [userAddressLat, setUserAddressLat]           = useState(null)
     // eslint-disable-next-line
    const [userAddressLng, setUserAddressLng]               = useState(null)
    const [newHomeBackAddressLat, setNewHomeBackAddressLat] = useState(null)
    const [newHomeBackAddressLng, setNewHomeBackAddressLng] = useState(null)
    const [newHomeDistance, setNewHomeDistance]         = useState(0) 
    const [newHomeBackAddress, setNewHomeBackAddress]   = useState('')
    const [newHomeBackCity, setNewHomeBackCity]         = useState('')
    const [isModalBackOpen, setIsModalBackOpen]         = useState(false)
    const [message, setMessage]                         = useState("")
    const [isRetourVisible, setIsRetourVisible]         = useState(true)
    const [isTerminerVisible, setIsTerminerVisible]     = useState(false)
    const [errorMessage, setErrorMessage]               = useState("")
    const [feuilleDuJour, setFeuilleDuJour]             = useState(null)   
    const [isModalTimeOpen,  setIsModalTimeOpen ]       = useState(false)
    // eslint-disable-next-line
    const [showModal, setShowModal]                     = useState(false)
    const [motif, setMotif]                             = useState("")
    const [showMotifModal , setShowMotifModal]          = useState(false)
    const mapRef                                        = useRef(null)
    const markerRef                                     = useRef(null)
    const previousPosition                              = useRef(null)
    const [isSalonsLoading, setIsSalonsLoading]         = useState(false)
    const [addressSuggestions, setAddressSuggestions]   = useState([])
    const [showFirstAdresseModal, setShowFirstAdresseModal] = useState(false)
    const [newSalonDepartment, setNewSalonDepartment]   = useState('')
    const [departmentSuggestions, setDepartmentSuggestions] = useState([])
    const [showContinue, setShowContinue]               = useState(false)
    const [isButtonShow, setIsButtonShow]               = useState(false)
    //const [logs, setLogs] = useState([]);

    /*const addLog = (message) => {
        setLogs((prevLogs) => [...prevLogs, message]);
    };*/

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
                    //const currentHour = today.getHours()
                    
                    if (!feuille.isClotured && feuille.isEnded &&
                        feuilleDate.getDate() === today.getDate() &&
                        feuilleDate.getMonth() === today.getMonth() &&
                        feuilleDate.getFullYear() === today.getFullYear()) {
                            setFeuilleDuJour(feuille)
                            setShowModal(true)
                            
                    }
                    if (!feuille.isEnded &&  
                        feuilleDate.getDate() === today.getDate() &&
                        feuilleDate.getMonth() === today.getMonth() &&
                        feuilleDate.getFullYear() === today.getFullYear()) {
                            setFeuilleDuJour({ ...feuille, id: doc.id }) // inclure l'ID du document
                            setShowContinue(true)
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

    useEffect(() => {
        const checkStatusInDatabase = async () => {
            const salonID = selectedSalon.place_id || selectedSalon.id
            if (!salonID) {
                console.error("Le salon sélectionné n'a pas d'id valide", selectedSalon)
                return
            }
            const salonRef = doc(db, "salons", salonID)
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

    useEffect(() => {
        const fetchAdresses = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", uid));

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const adresses = data.adresses || [];
                    setUserAdresses(adresses);

                    if (adresses.length > 0) {
                        setStartAddress(adresses[0].address);
                        setStartCity(adresses[0].city);
                        setShowFirstAdresseModal(false);
                    } else {
                        setShowFirstAdresseModal(true);
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des adresses :", error);
            }
        };

        fetchAdresses();
    }, [uid])

    const handleAddressUpdate = async () => {
        if (!startAddress || !startCity) {
            setError("L'adresse de départ est obligatoire.")
            return
        }
        const fullAddress = `${startAddress}, ${startCity}`
        const newAddress = startAddress
        const newCity = startCity
        const location = await geocodeAddress(fullAddress)
        setUserAddressLat(location.lat)
        setUserAddressLng(location.lng)
        setUserAdresse(newAddress)
        setUpdatedAddress(newAddress)
        setUserCity(newCity)
        setUpdateCity(newCity)
        setOpenNewUserAdresse(false)
        setError('')
        setShowConfirmButtons(false)
        setIsAddressConfirmed(true)
    }
    
    const fetchCitySuggestions = (input, setCitySuggestions) => {
        const service = new window.google.maps.places.AutocompleteService()

        service.getPlacePredictions({
            input,
            componentRestrictions: { country: 'fr' },
            types: ['(cities)']
        }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setCitySuggestions(predictions.map(prediction => prediction.description.split(',')[0]))
            } else {
                setCitySuggestions([])
            }
        })
    }
    const fetchAddressSuggestions = (input, setAddressSuggestions) => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({ input, componentRestrictions: { country: 'fr' } }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                const filteredPredictions = predictions.map(prediction => {
                    const description = prediction.description.replace(', France', '')
                    return {
                        description: description,
                        place_id: prediction.place_id
                    };
                })
                setAddressSuggestions(filteredPredictions);
            } else {
                setAddressSuggestions([]);
            }
        });
    }
    const fetchDepartmentSuggestions = (input, setDepartmentSuggestions) => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({ input, componentRestrictions: { country: 'fr' }, types: ['(regions)'] }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setDepartmentSuggestions(predictions.map(prediction => prediction.description));
            } else {
                setDepartmentSuggestions([]);
            }
        })
    }
    const handleAddressSelectWithDepartment = (placeId, setAddress, setCity, setDepartment, setAddressSuggestions) => {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails({ placeId }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const addressComponents = place.address_components;
                let streetNumber = '';
                let route = '';
                let selectedCity = '';
                let selectedDepartment = '';
    
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
                    if (types.includes('administrative_area_level_2')) {
                        selectedDepartment = component.long_name;
                    }
                });
    
                const selectedAddress = `${streetNumber} ${route}`.trim();
                setAddress(selectedAddress);
                setCity(selectedCity);
                setDepartment(selectedDepartment);
                setAddressSuggestions([]);
            }
        });
    }
    
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
    }
    const handleAddressChange = (e) => {
        const selectedAddress = userAdresses.find(address => address.address === e.target.value);
        if (selectedAddress) {
            setStartAddress(selectedAddress.address);
            setStartCity(selectedAddress.city);
        }
    }
    
    const handleVisitsToday = async (response) => {
        setHasVisitsToday(response)
        if (response === false) { 
            setShowMotifModal(true)
            setIsParcoursStarted(false) 
        }
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
    const handleValidateMotif = async () => {
        try { 
            const newDocumentData = {
                date: new Date(),
                isVisitsStarted: false,
                motif: motif,
                isClotured: "",
                userId: uid
            }
            const docRef = await addDoc(collection(db, "feuillesDeRoute"), newDocumentData)
            setCurrentRouteId(docRef.id)
            setShowMotifModal(false)
            setMessage("Enregistré avecc succès. À bientôt !")
        } 
        catch (e) {
            console.error("Erreur lors de l'enregistrement de la réponse : ", e)
        }
    }
    const handleStartParcours = async () => {
        if (!isAddressConfirmed) { 
            setErrorMessage("Veuillez confirmer l'adresse de départ.") 
        } 
        else {
            const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId)

            await updateDoc(routeDocRef, { departureAddress: startAddress, city: startCity,  })

            const fullAddress = `${startAddress}, ${startCity}`
            const location = await geocodeAddress(fullAddress)

            setUserAddressLat(location.lat)
            setUserAddressLng(location.lng)
            startParcours()
        }
    }
    const startParcours = async () => {
        setIsParcoursStarted(true)
        setIsSalonsLoading(true)
        await handleSalonsNearBy()
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
                isClotured: false,
                isEnded: true,
            })
        } catch (e) { console.error("Erreur lors de la mise à jour des arrêts : ", e) }
    }

    const normalizeString = (str) => {
        return str
            .replace(/département\s*/i, "")
            .toLowerCase()
            .trim()
    }

    const handleSalonsNearBy = async () => {
        setIsSalonsLoading(true)
       try {
            const userDocSnapshot = await getDoc(doc(db, 'users', uid))
            const userDepartments = userDocSnapshot.exists() ? userDocSnapshot.data().departments : []

            const service = new window.google.maps.places.PlacesService(mapRef.current)

            const results = await new Promise((resolve, reject) => {
                service.nearbySearch(
                    { location: currentPosition, type: 'hair_care', radius: 5000 },
                    (results, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                            resolve(results)
                        } else {
                            reject(new Error('Erreur lors de la recherche des salons de coiffure: ' + status));
                        }
                    }
                )
            })

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
                        const department = await getDepartmentFromCoords(placeDetails.geometry.location.lat(), placeDetails.geometry.location.lng())
                        //addLog("Département detecté : " + department)
                        //addLog("Départements du VRP : " + userDepartments)
                        const normalizedDepartment = normalizeString(department);
                        const normalizedUserDepartments = userDepartments.map(normalizeString);
                        //addLog("Département detecté normalize : " + normalizedDepartment)
                        //addLog("Départements du VRP normalize : " + normalizedUserDepartments)
                        if (normalizedDepartment && normalizedUserDepartments.includes(normalizedDepartment)) {
                            const distance = await computeDistance(currentPosition, { lat: placeDetails.geometry.location.lat(), lng: placeDetails.geometry.location.lng() })
                            salonsWithOpeningHours.push({ ...results[i], opening_hours: placeDetails.opening_hours, distance: distance, phone_number: placeDetails.formatted_phone_number, department  });
                        }
                    }
                } catch (error) { console.error(error) }
            }
            
            const dbSalonsSnapshot = await getDocs(query(collection(db, 'salons'), where('manuallyAdded', '==', true)))
            const manuallyAddedSalons = dbSalonsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
            
            
        const validManuallyAddedSalonsWithDistance = await Promise.all(manuallyAddedSalons.map(async salon => {
            if (salon.location && salon.location.lat && salon.location.lng) {
                const department = await getDepartmentFromCoords(salon.location.lat, salon.location.lng)
                const normalizedDepartment = normalizeString(department);
                        const normalizedUserDepartments = userDepartments.map(normalizeString);
                        if (normalizedDepartment && normalizedUserDepartments.includes(normalizedDepartment)) {
                    const distance = await computeDistance(currentPosition, { lat: salon.location.lat, lng: salon.location.lng })
                    return { ...salon, distance: distance }
                }
            }
            return null;
        }));

        const filteredManuallyAddedSalons = validManuallyAddedSalonsWithDistance.filter(salon => salon !== null);

        const allSalons = [...salonsWithOpeningHours, ...filteredManuallyAddedSalons];
            const sortedSalons = allSalons.sort((a, b) => {
                const distanceA = a.distance || Infinity
                const distanceB = b.distance || Infinity
                return distanceA - distanceB
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
        } catch (error) {
            console.error('Erreur lors de la récupération des coordonnées de la ville de l\'utilisateur :', error);
        } 
        finally {
            setIsSalonsLoading(false)
        }
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
    }
    const getDepartmentFromCoords = async (lat, lng) => {
        return new Promise((resolve, reject) => {
            const geocoder = new window.google.maps.Geocoder();
            const latlng = { lat, lng };
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const addressComponents = results[0].address_components;
                    for (let component of addressComponents) {
                        if (component.types.includes("administrative_area_level_2")) {
                            resolve(component.long_name)
                            return
                        }
                    }
                    resolve(null)
                } else {
                    reject("Failed to get department");
                }
            });
        });
    }
    
    const handleSelectSalon = async (salon) => {
        setIsTracking(true)
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

                if (salon.vicinity) { 
                    const parts = salon.vicinity.split(','); city = parts.length > 1 ? parts[parts.length - 1].trim() : ''
                } 
                else if (salon.address) { 
                    const parts = salon.address.split(','); city = parts.length > 1 ? parts[parts.length - 1].trim() : '' 
                }

                const postalCode = await getPostalCodeFromCoords(salonLat, salonLng)
                const department = await getDepartmentFromCoords(salonLat, salonLng)

                const counterDoc = doc(db, 'counters', 'salonCounter')

                await updateDoc(counterDoc, {
                    counter: increment(1)
                })

                const counterSnapshot = await getDoc(counterDoc)
                const counterValue = counterSnapshot.data().counter

                if (!salonSnapshot.exists()) {

                    await setDoc(salonRef, {
                        salonId: `ID${counterValue}`,
                        name: `${salon.name} ID${counterValue}`,
                        address: salon.vicinity || salon.address,
                        city: city,
                        postalCode: postalCode || "",
                        department: department || "",
                        phoneNumber: salon.phone_number || "",
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
    const handleBack = async () => {
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
        setIsModalCounterOpen(false)
        setIsTracking(false)
        setStatus(initialStatus)
        setSelectedSalon(null)
        setRecentlyAddedAction(null)
    }
    const handleStatusChange = async (e) => {
        const selectedStatus = e.target.value;
        setStatus(selectedStatus);
        setIsChecked(selectedStatus === 'Prospect' || selectedStatus === 'Client')
    
        const logMessage = `Statut mis à jour : ${selectedStatus}`
        
        if (selectedSalon && selectedSalon.place_id) {
            const salonRef = doc(db, "salons", selectedSalon.place_id)
    
            const action = {
                date: new Date(),
                action: logMessage,
                userId: uid
            }
            setRecentlyAddedAction(action)
            
            try {
                await updateDoc(salonRef, {
                    status: selectedStatus,
                    historique: arrayUnion(action)
                });
                setIsRadioVisible(false);
            } catch (error) {
                console.error("Error updating salon status:", error);
            }
        } else {
            console.error("Selected salon or place_id is undefined", selectedSalon);
        }
    }    
    const handleStatusChange2 = async (e) => {
        const selectedStatus = e.target.value
        setStatus(selectedStatus)
        setIsCheckedNewSalon(selectedStatus === 'Prospect' || selectedStatus === 'Client') 
    }   

    const handleStartTracking = async () => {    
        //setIsTracking(true)
        const unit = totalDistance < 1000 ? 'm' : 'km'
        const getLatLng = (value) => typeof value === 'function' ? value() : value
        const salonLat = getLatLng(selectedSalon.geometry?.location?.lat) || getLatLng(selectedSalon.location?.lat)
        const salonLng = getLatLng(selectedSalon.geometry?.location?.lng) || getLatLng(selectedSalon.location?.lng)
        const postalCode = await getPostalCodeFromCoords(salonLat, salonLng)

        handleArrivalTime();
        
        setStops((prevStops) => {
                const updatedStops = [
                    ...prevStops,
                    {
                        name: selectedSalon.name,
                        salonId: `ID${selectedSalon.counterValue}`,
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
                ];
        
                const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId)
                updateDoc(routeDocRef, {
                    stops: updatedStops, 
                    isClotured: false,
                    isEnded: false,
                }).catch((error) => console.error("Erreur lors de la mise à jour de la feuille de route :", error));
        
                return updatedStops;
        })

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
        setStatus('')
        setIsChecked(false)
        setIsCheckedNewSalon(false)
        setIsRadioVisible(true)
    } 

    let currentArrivalTime = null
    let currentDepartureTime = null

    const handleArrivalTime = () => {
        currentArrivalTime = getCurrentTime();
    }
    const handleDepartureTime = () => {
        currentDepartureTime = getCurrentTime();
        setIsModalTimeOpen(false);
        updateStopWithDepartureTime(currentDepartureTime) //
    }
    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
/*
    const handleStopTracking = async () => {
        const unit = totalDistance < 1000 ? 'm' : 'km'
        const getLatLng = (value) => typeof value === 'function' ? value() : value
        const salonLat = getLatLng(selectedSalon.geometry?.location?.lat) || getLatLng(selectedSalon.location?.lat)
        const salonLng = getLatLng(selectedSalon.geometry?.location?.lng) || getLatLng(selectedSalon.location?.lng)
        const postalCode = await getPostalCodeFromCoords(salonLat, salonLng)

        handleArrivalTime();
        
        setStops((prevStops) => {
                const updatedStops = [
                    ...prevStops,
                    {
                        name: selectedSalon.name,
                        salonId: `ID${selectedSalon.counterValue}`,
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
                ];
        
                const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId)
                updateDoc(routeDocRef, {
                    stops: updatedStops, 
                    isClotured: false,
                    isEnded: false,
                }).catch((error) => console.error("Erreur lors de la mise à jour de la feuille de route :", error));
        
                return updatedStops;
        })

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
        setStatus('')
        setIsChecked(false)
        setIsCheckedNewSalon(false)
        setIsRadioVisible(true)
    }*/
    const updateStopWithDepartureTime = async (departureTime) => {
        setStops((prevStops) => {
            const updatedStops = [...prevStops];
            if (updatedStops.length > 0) {
                const lastStop = { ...updatedStops[updatedStops.length - 1] };
                lastStop.departureTime = departureTime;
                updatedStops[updatedStops.length - 1] = lastStop;
    
                // Mettre à jour la base de données ici
                const routeDocRef = doc(db, "feuillesDeRoute", currentRouteId);
                updateDoc(routeDocRef, {
                    stops: updatedStops,
                }).catch((error) => console.error("Error updating stops:", error));
            }
            return updatedStops;
        });
    }
    const handleYesHome = async () => {
        setIsHomeTracking(true)
        setHomeDistance(0)
        setIsModalHomeOpen(true)
        setIsModalConfirmHomeOpen(false) 
        
        const fullAddress = `${startAddress}, ${startCity}`
        const location = await geocodeAddress(fullAddress)
        const lastStop = stops.length > 0 ? stops[stops.length - 1] : null 

        if (lastStop) {
            computeAndSetHomeDistance(
                { lat: lastStop.lat, lng: lastStop.lng }, 
                { lat: location.lat, lng: location.lng }
        )} 
    }
    const handleStartHomeTracking = async () => {
        setIsHomeTracking(false)

        const unit = homeDistance < 1000 ? 'm' : 'km'
        setStops((prevStops) => [
            ...prevStops,
            {
                name: startAddress + ", " + startCity ,
                address: startAddress + ", " + startCity, 
                city: startCity,
                distance: homeDistance,
                unitDistance: unit,
            },
        ])
        setIsModalHomeOpen(false)
    }
    const handleStartNewHomeTracking = () => {
        setIsNewHomeTracking(true)
        setNewHomeDistance(0)
        const lastStop = stops.length > 0 ? stops[stops.length - 1] : null
        if (lastStop) {computeAndSetNewHomeDistance({ lat: lastStop.lat, lng: lastStop.lng }, { lat: newHomeBackAddressLat, lng: newHomeBackAddressLng })}
    }
    /*
    const handleStopHomeTracking = () => {
        setIsHomeTracking(false);
       
        const unit = homeDistance < 1000 ? 'm' : 'km'
        setStops((prevStops) => [
            ...prevStops,
            {
                name: startAddress + ", " + startCity ,
                address: startAddress + ", " + startCity, 
                city: startCity,
                distance: homeDistance,
                unitDistance: unit,
            },
        ])
        setIsModalHomeOpen(false)
    }*/
    const handleStopNewHomeTracking = () => {
        setIsNewHomeTracking(false)  
        setIsModalBackOpen(false)
        setIsModalConfirmHomeOpen(false)
        // Add home stop to stops array
        const unit = newHomeDistance < 1000 ? 'm' : 'km'
        setStops((prevStops) => [
            ...prevStops,
            {
                name: newHomeBackAddress + ", " + newHomeBackCity ,
                address: newHomeBackAddress + ", " + newHomeBackCity, 
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

    const handleAddSalon = async (e) => {
        e.preventDefault()
        setErrorMessage("")

        if (!newSalonName || !newSalonAddress || !newSalonCity) {
            setErrorMessage('Veuillez remplir tous les champs et sélectionner un statut.')
            return
        }

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
            const previousStop = stops[stops.length - 1]
            // eslint-disable-next-line 
            startCoords = { lat: previousStop.lat, lng: previousStop.lng }
        }
        
        const geocoder = new window.google.maps.Geocoder()
        const country = "France"
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
            const postalCode = await getPostalCodeFromCoords(newSalonLocation.lat, newSalonLocation.lng)
            const counterDoc = doc(db, 'counters', 'salonCounter')

            await updateDoc(counterDoc, {
                counter: increment(1)
            })
    
            const counterSnapshot = await getDoc(counterDoc)
            const counterValue = counterSnapshot.data().counter

            await addDoc(collection(db, 'salons'), {
                salonId: `ID${counterValue}`,
                name: `${newSalonName} ID${counterValue}`,
                address: `${newSalonAddress}, ${newSalonCity}`,
                postalCode: postalCode,
                city: `${newSalonCity}`,
                department: newSalonDepartment,
                status: status,
                lat: newSalonLocation.lat,
                lng: newSalonLocation.lng,
                manuallyAdded: true,
                location: newSalonLocation,
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

    const handleRemoveStop = (index) => {
        setStops((prevStops) => prevStops.filter((_, i) => i !== index))
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

    const handleContinueParcours = () => {
        if (feuilleDuJour) {
            setStartAddress(feuilleDuJour.departureAddress)
            setStartCity(feuilleDuJour.city)
            setStops(feuilleDuJour.stops)
            setCurrentRouteId(feuilleDuJour.id)
            setIsParcoursStarted(true)
            setIsButtonShow(true)
            handleSalonsNearBy()
        }
        
    }
   
    return (
        <>
            {showModal && (
                <div className="modal-clotured">
                    <div className="content">
                        <p>Veuillez valider votre  feuille de route.<br></br>Dirigez-vous vers  la section <em>Feuilles de route journalières</em> et clôturez votre fiche.</p>
                    </div>
                </div>
            )}

            {showFirstAdresseModal && (
                <div className="modal-clotured">
                    <div className="content">
                        <p>Pour démarrer votre parcours, vous devez saisir votre adresse de domicile.<br></br>Veuillez vous diriger vers  l'onglet <em>Mon compte</em> et enregistrez votre adresse de départ.</p>
                    </div>
                </div>
            )}

            <header className="geo-header">
                <h1>Mon parcours</h1> 
                {!isModalSalonOpen && (  
                     <div className="btns">
                        <img className="add" onClick={() => {setIsModalSalonOpen(true); setIsCheckedNewSalon(false)}} src={plus} alt="Ajouter un salon"/> 
                        <button><img onClick={handleSalonsNearBy} src={refresh} alt="Actualiser" /></button>
                    </div>
                )}
            </header>

            <div className="geoloc-section">
                <div>
                    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={currentPosition} options={options} onLoad={(map) => (mapRef.current = map)}></GoogleMap>
                    
                    {message &&  <p className="congrats success">{message}</p>}

                    {showContinue && !isButtonShow && (
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <button style={{width: "95%"}} onClick={handleContinueParcours} className="button-colored">Reprendre mon parcours</button>
                        </div>

                    )}

                    {hasVisitsToday === null && !showContinue && (
                        <div className="start-tour">
                            <p style={{textAlign: "center"}}>Avez-vous prévu des visites aujourd'hui ?</p>
                            <div className="mini-buttons">
                                <button onClick={() => handleVisitsToday(true)}>Oui</button>
                                <button onClick={() => handleVisitsToday(false)}>Non</button>
                            </div>
                        </div>
                    )}

                    {hasVisitsToday === true && !isParcoursStarted && !isParcoursEnded && (
                        <div className="start-adress" id="start-adress">
                            <p className="confirm">Confirmez-vous que l'adresse ci-dessous est bien votre adresse de départ ?</p>
                            <p className="adresse"><strong>{startAddress + ", " + startCity}</strong></p>
                            {showConfirmButtons && (
                                <div className="mini-buttons">
                                    <button onClick={() => { setIsAddressConfirmed(true); setShowConfirmButtons(false); setUserAdresse(startAddress); setUserCity(startCity) }}>Oui</button>
                                    <button onClick={() => setOpenNewUserAdresse(true)}>Non</button>
                                </div>
                            )}
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                            <p className="info">Cliquer sur ce bouton lorsque vous êtes arrivé à votre point de départ</p>
                            <button className="button-colored démarrer" onClick={handleStartParcours}>Démarrer mon parcours</button>
                        </div>
                    )}
                
                    {openNewUserAdresse && (
                        <div className="modal">
                            <div className="modal-content" >
                                <p>Veuillez entrer votre adresse de départ</p>
                                {userAdresses.length > 0 && (
                                    <select onChange={handleAddressChange}>
                                        {userAdresses.map((address, index) => (
                                            <option key={index} value={address.address}>
                                                {address.address}, {address.city}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <input type="text" placeholder="Adresse" value={startAddress} onChange={(e) => { setStartAddress(e.target.value); fetchAddressSuggestions(e.target.value, setAddressSuggestions); }} />
                                {addressSuggestions.length > 0 && (
                                    <ul className="city-suggestions" style={{ width: "100%" }}>
                                        {addressSuggestions.map((suggestion, index) => (
                                            <li key={index} onClick={() => handleAddressSelect(suggestion.place_id, setStartAddress, setStartCity, setAddressSuggestions)}> 
                                                {suggestion.description}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <input type="text" placeholder="Ville" value={startCity} onChange={(e) => { setStartCity(e.target.value); fetchCitySuggestions(e.target.value, setCitySuggestions); }} />
                                {citySuggestions.length > 0 && (
                                    <ul className="city-suggestions">
                                        {citySuggestions.map((suggestion, index) => (
                                            <li key={index} onClick={() => { setStartCity(suggestion); setCitySuggestions([]); }}>
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {error && <p className="error-message">{error}</p>}
                                <button className="button-colored" onClick={handleAddressUpdate}>Valider</button>
                                <button className="cancel" onClick={() => setOpenNewUserAdresse(false)}>Annuler</button>
                            </div>
                        </div>
                    )}
                    {showMotifModal && (
                        <div className="modal">
                            <div className="modal-content">
                                <p>Vous n'effectuez pas de déplacements aujourd'hui. Veuillez fournir un motif :</p>
                                <input placeholder="Mon motif" onChange={(e) => setMotif(e.target.value)} />
                                <button onClick={handleValidateMotif} className="button-colored">Valider</button>
                                <button onClick={() => { setShowMotifModal(false); setHasVisitsToday(null)}} className="cancel">Annuler</button>
                            </div>
                        </div>
                    )}
                </div>

                {isParcoursStarted === true &&  (
                    <div className="parcours">
                        {isRetourVisible && (
                            <button style={{width: "95%"}} className="button-colored back-home-btn" onClick={() => { setIsModalConfirmHomeOpen(true); setIsRetourVisible(false); setIsTerminerVisible(true); }}>Retour à mon domicile</button>
                        )}
                        {isTerminerVisible && (
                            <button style={{width: "95%"}} className="button-colored xx" onClick={() => setIsModalEndingOpen(true)}>Terminer mon parcours</button>
                        )}                       
                        <div className="distance-results">
                            <p className="total"><strong>{formatDistance(getTotalStopDistances())}</strong> kilomètres parcourus aujourd'hui</p>
                            <div className="arrets">
                                <p className="point">Distance entre chaque point d'arrêt</p>
                                <ul>
                                    {stops.map((stop, index) => ( 
                                        <li key={index}>
                                            
                                            {index === 0 ? (
                                                <p className="btn-test"><strong>{formatDistance(stop.distance)}</strong>De <em style={{marginRight: "5px", marginLeft: "5px"}}> {startAddress}, {startCity} </em> à <em style={{marginLeft: "5px"}}> {stop.name} </em><button style={{margin: "0"}} className="button-delete" onClick={() => handleRemoveStop(index)}><img src={deleteIcon} alt="" /></button></p>
                                            ) : (
                                                <p className="btn-test"><strong>{formatDistance(stop.distance)}</strong>De <em style={{marginRight: "5px", marginLeft: "5px"}}>{stops[index - 1].name}</em> à <em style={{marginLeft: "5px"}}>{stop.name}</em><button style={{margin: "0"}} className="button-delete" onClick={() => handleRemoveStop(index)}><img src={deleteIcon} alt="" /></button></p>
                                            )}
                                             
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                            {/*logs.map((log, index) => (
                                <p key={index}>{log}</p>
                            ))*/}
                            </div>
                        </div>
                        {isModalHomeOpen && (
                            <ReactModal isOpen={isModalHomeOpen} onRequestClose={() => setIsModalHomeOpen(false)} contentLabel="Retour à mon domicile" className="modal">
                                <div className="modal-content">
                                    <h2 style={{marginBottom: "30px", fontSize: "20px"}}>Retour à mon domicile</h2>
                                    <p style={{marginBottom: "30px", color: "grey", fontStyle: "italic"}} className="city">{startAddress}, {startCity}</p>
                                    <p style={{marginBottom: "30px"}}>Distance <strong style={{background: "#3D9B9B", color: "white", padding: "5px 10px", borderRadius: "5px", marginLeft: "10px"}}>{formatDistance(homeDistance)}</strong></p>  
                                    {isHomeTracking && (
                                        <button className="button-colored" onClick={handleStartHomeTracking} >Arrivé au domicile</button>
                                    )}
                                </div>
                            </ReactModal>
                        )}
                        {isSalonsLoading && (
                            <div style={{display: "flex", justifyContent: "center"}}>
                                {<img src={loader} alt='chargement en cours' />}
                            </div>
                        )}
                        {!isSalonsLoading && (
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
                                        </div>
                                        <button className="button-colored btn" onClick={() => handleSelectSalon(salon)}><img src={startIcon} alt="choisir ce salon"/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}
                        
                    </div>
                )}

                {selectedSalon && isModalCounterOpen && (
                    <div className="modal" > 
                        <div className="modal-content">
                            <h2 style={{marginBottom: "0", fontSize: "20px"}}>{selectedSalon.name}</h2>
                            <p style={{marginBottom: "0px", color: "grey", fontStyle: "italic"}} className="city">{selectedSalon.vicinity || selectedSalon.address}</p>
                            {statusLoaded && isRadioVisible && ( 
                                <div style={{marginBottom: "20px"}} className="status">
                                    <input className="checkbox" type="checkbox" id="Prospect" name="status" value="Prospect" checked={status === "Prospect"} onChange={handleStatusChange} />
                                    <label htmlFor="prospect" className="prospect">Prospect</label>
                                    <input className="checkbox" type="checkbox" id="Client" name="status" value="Client" checked={status === "Client"} onChange={handleStatusChange} />
                                    <label htmlFor="client">Client</label>
                                </div>
                            )}
                            {!isRadioVisible && (
                                <p style={{marginBottom: "20px"}}><span style={{fontWeight : "bold"}}>Statut </span>: {status}</p> 
                            )}
                            <p style={{marginBottom: "20px"}} className="total">Distance <strong style={{background: "#3D9B9B", color: "white", padding: "5px 10px", borderRadius: "5px", marginLeft: "10px"}}>{formatDistance(distance)}</strong></p>
                            <p style={{color: "grey", fontSize: "13px", lineHeight: "15px"}}>Si vous souhaitez visiter ce salon, commencez votre trajet puis cliquez sur le bouton ci-dessous lorsque vous êtes arrivé à destination OU cliquez sur Annuler et sélectionnez un autre salon a visité.</p>
                            {isTracking && (
                                <>
                                <button style={{marginBottom: "20px"}} className="button-colored" onClick={handleStartTracking} disabled={!isChecked}>Je débute ma visite</button>
                                <button className="cancel"  onClick={handleBack}>Annuler</button>
                                </>
                            )} 
                            {/*isTracking ? (
                                <div>
                                    <p style={{marginBottom: "30px"}} className="total">Distance <strong style={{background: "#3D9B9B", color: "white", padding: "5px 10px", borderRadius: "5px", marginLeft: "10px"}}>{formatDistance(distance)}</strong></p>
                                    <button className="button-colored" onClick={handleStopTracking}>Arrivé à destination</button>
                                    <button className="cancel" onClick={handleBack}>Annuler</button>
                                </div>
                            ) : (
                                <>
                                <button style={{marginBottom: "20px"}} className="button-colored" onClick={handleStartTracking} disabled={!isChecked}>Démarrer le compteur de km</button>
                                <button className="cancel"  onClick={handleBack}>Annuler</button>
                                </>
                            )*/} 
                        </div>
                    </div>
                )}

                <ReactModal isOpen={isModalSalonOpen} onRequestClose={() => setIsModalSalonOpen(false)} contentLabel="Ajouter un nouveau salon" className="modal" >    
                    <div className="new-salon modal-content">
                        <h2>Ajouter un nouveau salon</h2>
                        <input type="text" placeholder="Nom du salon" value={newSalonName} onChange={(e) => setNewSalonName(e.target.value)} /><br></br>
                        <input type="text" placeholder="Adresse du salon" value={newSalonAddress} onChange={(e) => { setNewSalonAddress(e.target.value); fetchAddressSuggestions(e.target.value, setAddressSuggestions); }} /><br></br>
                        {addressSuggestions.length > 0 && (
                            <ul className="city-suggestions" style={{ width: "100%" }}>
                                {addressSuggestions.map((suggestion, index) => (
                                    <li key={index} onClick={() => handleAddressSelectWithDepartment(suggestion.place_id, setNewSalonAddress, setNewSalonCity, setNewSalonDepartment, setAddressSuggestions)}>
                                        {suggestion.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <input type="text" placeholder="Ville du salon" value={newSalonCity}  onChange={(e) => { setNewSalonCity(e.target.value); fetchCitySuggestions(e.target.value, setCitySuggestions); }} /><br></br>
                        {citySuggestions.length > 0 && (
                            <ul className="city-suggestions">
                                {citySuggestions.map((suggestion, index) => (
                                    <li key={index} onClick={() => { setNewSalonCity(suggestion); setCitySuggestions([]); }}>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                       <input type="text" placeholder="Département du salon" value={newSalonDepartment} onChange={(e) => { setNewSalonDepartment(e.target.value); fetchDepartmentSuggestions(e.target.value, setDepartmentSuggestions); }} /><br />
                        {departmentSuggestions.length > 0 && (
                            <ul className="department-suggestions">
                                {departmentSuggestions.map((suggestion, index) => (
                                    <li key={index} onClick={() => { setNewSalonDepartment(suggestion); setDepartmentSuggestions([]); }}>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div style={{marginBottom: "20px"}} className="status"> 
                            <input className="checkbox" type="checkbox" id="Prospect" name="status" value="Prospect" checked={status === "Prospect"} onChange={handleStatusChange2} />
                            <label htmlFor="Prospect">Prospect</label>

                            <input className="checkbox" type="checkbox" id="Client" name="status" value="Client" checked={status === "Client"} onChange={handleStatusChange2} />
                            <label htmlFor="Client">Client</label>
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <button onClick={handleAddSalon} disabled={!isCheckedNewSalon} className="button-colored">Ajouter</button>
                        <button style={{cursor: "pointer"}} onClick={() => setIsModalSalonOpen(false)} className="btn-cancel">Annuler</button>  
                    </div>
                </ReactModal>

               {isModalTimeOpen && (
                    <div className="modal" >    
                        <div className="modal-content">
                            <h2 style={{marginBottom: "20px", fontSize: "20px"}}>Fin de visite</h2>  
                            <p style={{marginBottom: "20px"}}>Cliquer sur ce bouton lorsque vous avez terminée votre visite</p>
                            <button onClick={handleDepartureTime} className="button-colored">Visite terminée</button>
                        </div>
                    </div>
               )}

                <ReactModal isOpen={isModalConfirmHomeOpen} onRequestClose={() => setIsModalConfirmHomeOpen(false)} contentLabel="Confirmer l'adresse de retour" className="modal">
                    <div className="modal-content">
                        <h2 style={{marginBottom: "20px", fontSize: "20px"}}>Confirmer l'adresse de retour</h2>
                        <p style={{marginBottom: "20px"}}>L'adresse de retour est-elle la même que l'adresse de départ ?</p>
                        <p style={{marginBottom: "30px", color: "grey", fontStyle: "italic"}} className="city">{startAddress}, {startCity}</p>
                        <div className="mini-buttons">
                            <button onClick={handleYesHome}>Oui</button>
                            <button onClick={() => setIsModalBackOpen(true)}>Non</button>
                        </div>
                        <button className="cancel" onClick={() =>{ setIsModalConfirmHomeOpen(false); setIsRetourVisible(true); setIsTerminerVisible(false); }}>Annuler</button> 
                    </div>
                </ReactModal>

                <ReactModal isOpen={isModalBackOpen} onRequestClose={() => setIsModalBackOpen(false)} contentLabel="Entrer une nouvelle adresse de retour" className="modal">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: "30px", fontSize: "20px" }}>Entrer une nouvelle adresse de retour</h2>
                        {userAdresses.length > 0 && (
                            <select onChange={(e) => {
                                const selectedAddress = userAdresses.find(address => address.address === e.target.value);
                                if (selectedAddress) {
                                    setNewHomeBackAddress(selectedAddress.address);
                                    setNewHomeBackCity(selectedAddress.city);
                                }
                            }}>
                                <option value="">Sélectionner une adresse enregistrée</option>
                                {userAdresses.map((address, index) => (
                                    <option key={index} value={address.address}>
                                        {address.address}, {address.city}
                                    </option>
                                ))}
                            </select>
                        )}
                        <input type="text" placeholder="Nouvelle adresse de retour" value={newHomeBackAddress} onChange={(e) => { setNewHomeBackAddress(e.target.value); fetchAddressSuggestions(e.target.value, setAddressSuggestions); }} />
                        {addressSuggestions.length > 0 && (
                            <ul className="city-suggestions" style={{ width: "100%" }}>
                                {addressSuggestions.map((suggestion, index) => (
                                    <li key={index} onClick={() => handleAddressSelect(suggestion.place_id, setNewHomeBackAddress, setNewHomeBackCity, setAddressSuggestions)}>
                                        {suggestion.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <input type="text" placeholder="Nouvelle ville de retour" value={newHomeBackCity} onChange={(e) => { setNewHomeBackCity(e.target.value); fetchCitySuggestions(e.target.value, setCitySuggestions); }} />
                        {citySuggestions.length > 0 && (
                            <ul className="city-suggestions">
                                {citySuggestions.map((suggestion, index) => (
                                    <li key={index} onClick={() => { setNewHomeBackCity(suggestion); setCitySuggestions([]); }}>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {error && <p className="error-message">{error}</p>}
                        <button className="button-colored" onClick={handleNewHomeBackAddress}>Valider</button>
                        <button className="cancel" onClick={() => setIsModalBackOpen(false)}>Annuler</button>
                    </div>
                </ReactModal>

                <ReactModal isOpen={isModalNewHomeOpen} onRequestClose={() => setIsModalNewHomeOpen(false)} contentLabel="Retour à mon domicile (nouveau)" className="modal">
                    <div className="modal-content">
                                    <h2 style={{marginBottom: "20px"}}>Retour à mon domicile</h2>
                                    <p style={{marginBottom: "30px"}} className="city">{newHomeBackAddress}, {newHomeBackCity}</p>
                                    {isNewHomeTracking ? (
                                        <div>
                                            <p style={{marginBottom: "30px"}}>Distance <strong style={{background: "#3D9B9B", color: "white", padding: "5px 10px", borderRadius: "5px", marginLeft: "10px"}}>{formatDistance(newHomeDistance)}</strong></p>  
                                            <button className="button-colored" onClick={handleStopNewHomeTracking}>Arrivé à destination</button>
                                        </div>
                                    ) : (
                                        <button className="button-colored" onClick={handleStartNewHomeTracking} >Démarrer le compteur de km</button>
                                    )}
                                </div>
                </ReactModal>
                
                <ReactModal isOpen={isModalEndingOpen} onRequestClose={() => setIsModalEndingOpen(false)} contentLabel="Terminer mon parcours" className="modal" >   
                    <div className="modal-content">
                        <p style={{marginBottom: "20px"}}>Êtes-vous sûr de vouloir terminer votre parcours ?</p>
                        <div className="mini-buttons">
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
