

// Fichier Geolocation.js

import { GoogleMap } from "@react-google-maps/api"
import { useState, useEffect, useRef } from "react"
import ReactModal from "react-modal"
import closeIcon from "../assets/close.png"
import infoIcon from "../assets/info.png"

const mapContainerStyle = {
    width: '96vw',
    height: '60vh',
}
  
const options = {
    disableDefaultUI: true,
    zoomControl: true,
    mapId: "b3f2841793c037a8"
}

ReactModal.setAppElement('#root');

function Geolocation() {
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 })
    const [isLoaded, setIsLoaded] = useState(false)
    const mapRef = useRef(null)
    const markerRef = useRef(null)
    const [salons, setSalons] = useState([])
    const [selectedSalon, setSelectedSalon] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [distance, setDistance] = useState(0)
    const [isTracking, setIsTracking] = useState(false)
    const [stops, setStops] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0)
    const trackingRef = useRef({})
    const [isTourStarted, setIsTourStarted] = useState(false)

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
    }, [])

    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }
                setCurrentPosition(newPosition)

                if (isTracking && trackingRef.current.startPos) {
                    const distanceCovered = window.google.maps.geometry.spherical.computeDistanceBetween(
                        new window.google.maps.LatLng(trackingRef.current.startPos.lat, trackingRef.current.startPos.lng),
                        new window.google.maps.LatLng(newPosition.lat, newPosition.lng)
                    )

                    const distanceInKm = distanceCovered / 1000
                    setDistance(distanceInKm)
                }
            },
            () => {
                console.error('Erreur lors de la récupération de votre position')
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        )

        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }, [isTracking])

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
            markerRef.current = new AdvancedMarkerElement({
                position: currentPosition,
                map: mapRef.current,
                content: markerIcon,
            })

            // Centre la carte sur la nouvelle position
            mapRef.current.setCenter(currentPosition)
        }
    }, [isLoaded, currentPosition])

    const handleSalonsNearby = () => {
        // Recherche les salons de coiffure à proximité
        const service = new window.google.maps.places.PlacesService(mapRef.current)
        service.nearbySearch({
            location: currentPosition,
            radius: 5000, // Rayon de recherche en mètres (ajustez selon vos besoins)
            type: 'hair_care' // Type de lieu que vous souhaitez rechercher
        }, 
        (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {

                const sortedSalons = results.sort((a, b) => {
                    const distanceA = window.google.maps.geometry.spherical.computeDistanceBetween(
                        new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                        a.geometry.location
                    );
                    const distanceB = window.google.maps.geometry.spherical.computeDistanceBetween(
                        new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                        b.geometry.location
                    );
                    return distanceA - distanceB;
                });
                for (let i = 0; i < sortedSalons.length; i++) {
                    const place = sortedSalons[i];
                    new window.google.maps.marker.AdvancedMarkerElement({
                        position: place.geometry.location,
                        map: mapRef.current,
                        title: place.name,
                    });
                }
                setSalons(sortedSalons);
            } 
            else {
                console.error('Erreur lors de la recherche des salons de coiffure', status)
            }
        })
    }

    const handleSelectSalon = (salon) => {
        console.log("Selected salon", salon);
        if (salon.geometry && salon.geometry.location) {
            setSelectedSalon(salon);
            setIsModalOpen(true);
    
            const newStop = {
                name: salon.name,
                position: {
                    lat: salon.geometry.location.lat(),
                    lng: salon.geometry.location.lng()
                },
                address: salon.vicinity,
            }

            setStops((prevStops) => [...prevStops, newStop])

        } else {
            console.error("Selected salon has no valid location", salon)
        }
    
        /*
        setSelectedSalon(salon)
        setIsModalOpen(true)

        // Ajouter la position du salon sélectionné à la liste des arrêts
        const newStop = {
            name: salon.name,
            position: salon.geometry.location,
            address: salon.vicinity,
        };

        setStops((prevStops) => [...prevStops, newStop]);*/
    }

    const handleStartTour = () => {
        handleSalonsNearby()
        setIsTourStarted(true);
        setTotalDistance(0);
        setStops([]);
        setIsTracking(false);
        setDistance(0)
    };

    const handleEndTour = () => {
        setIsTourStarted(false)
        setIsTracking(false)
    };

    const handleStartTracking = () => {
        setIsTracking(true)
        setDistance(0)
        trackingRef.current.startPos = currentPosition
    }

    const handleStopTracking = () => {
        setIsTracking(false)

        // Calculer la distance entre les arrêts
        if (stops.length > 0) {

            const lastStop = stops[stops.length - 1]

            const distanceCovered = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(lastStop.position.lat, lastStop.position.lng),
                new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng)
            )

            const distanceInKm = distanceCovered / 1000

            // Ajouter la distance au total
            setTotalDistance((prevTotal) => prevTotal + distanceInKm);

            // Mettre à jour la liste des arrêts avec la nouvelle distance
            setStops((prevStops) => {
                const updatedStops = [...prevStops]

                updatedStops[updatedStops.length - 1] = {
                    ...lastStop,
                    distance: distanceInKm,
                }

                return updatedStops
            })
        }

        setIsModalOpen(false)
    }

    const formatDistance = (distance) => {
        if (distance < 1) {
            return `${(distance * 1000).toFixed(0)} m`;
        }
        return `${distance.toFixed(2)} km`;
    }

    if (!isLoaded) return <div>Loading Maps...</div>

    return (
        <>
            <header className="geo-header">
                <h1>Geolocalisation</h1>
            </header>
            <div className="geoloc-section">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={15}
                    center={currentPosition}
                    options={options}
                    onLoad={(map) => (mapRef.current = map)}
                >
                </GoogleMap>
    
                {!isTourStarted && (
                    <button className="button-colored" onClick={handleStartTour}>Démarrer une nouvelle tournée</button>
                )}
    
                {isTourStarted && (
                    <>
                        <button className="button-colored" onClick={handleEndTour}>Terminer la tournée</button>

                        <div className="distance-results">
                            {stops.length > 0 && (
                                <p>Total distance parcourue : {formatDistance(totalDistance)}</p>
                            )}

                            {stops.length > 0 && (
                                <div>
                                    <p>Distance entre chaque point d'arrêt :</p>

                                    <ul>
                                        {stops.map((stop, index) => {
                                            if (index === 0 ) { 
                                                const distanceToFirstStop = window.google.maps.geometry.spherical.computeDistanceBetween(
                                                    new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                                                    new window.google.maps.LatLng(stop.position.lat, stop.position.lng)
                                                ) / 1000

                                                return (
                                                    <li key={index}>
                                                        <p>De <strong> Domicile </strong> à <strong> {stop.name} </strong> = {formatDistance(distanceToFirstStop)}</p>
                                                    </li>
                                                )
                                            } 

                                            const previousStop = stops[index - 1]

                                            const distanceBetweenStops = window.google.maps.geometry.spherical.computeDistanceBetween(
                                                new window.google.maps.LatLng(previousStop.position.lat, previousStop.position.lng),
                                                new window.google.maps.LatLng(stop.position.lat, stop.position.lng)
                                            ) / 1000

                                            return (
                                                <li key={index}>
                                                    <p>De <strong> {previousStop.name} </strong> à <strong> {stop.name} </strong>  = {formatDistance(distanceBetweenStops)}</p>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <div className="info">
                                        <img src={infoIcon} alt="info" />
                                        <p>N'oubliez pas de noter les kilomètres parcouru dans votre feuille de route</p>
                                    </div>
                                    
                                </div>
                            )}
                        </div>
                        <div className="geoloc-results">
                            <ul>
                                {salons.map((salon, index) => (
                                    <li key={index}>
                                        <div>
                                            <span>{salon.name}</span><br />
                                            <p className="distance">Distance : {formatDistance(
                                                window.google.maps.geometry.spherical.computeDistanceBetween(
                                                    new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                                                    salon.geometry.location
                                                ) / 1000
                                            )}</p>
                                            <p>{salon.vicinity}</p>
                                        </div>
                                        <button className="button-colored" onClick={() => handleSelectSalon(salon)}>Choisir</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
    
                {selectedSalon && (
                    <ReactModal
                        isOpen={isModalOpen}
                        onRequestClose={() => setIsModalOpen(false)}
                        contentLabel="Salon Details"
                        className="modale"
                    >
                        <div className="content">
                            <h2>{selectedSalon.name}</h2>
                            <p>{selectedSalon.vicinity}</p>

                            {isTracking && (
                                <p>Calcul en cours : {formatDistance(distance)}</p>
                            )}

                            {isTracking ? (
                                <div>
                                    <button className="button-colored" onClick={handleStopTracking}>Arrivé à destination</button>
                                </div>
                            ) : (
                                <button className="button-colored" onClick={handleStartTracking}>Démarrer le compteur de km</button>
                            )}
                            
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="close-btn"><img src={closeIcon} alt="fermer le compteur de km" /></button>
                    </ReactModal>
                )}
            </div>
        </>
    );
    
}

export default Geolocation;


