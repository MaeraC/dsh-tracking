

// Fichier Geolocation.js

import { GoogleMap } from "@react-google-maps/api"
import { useState, useEffect, useRef } from "react"
import ReactModal from "react-modal"
import closeIcon from "../assets/close.png"

const mapContainerStyle = {
    width: '96vw',
    height: '60vh',
}
  
const options = {
    disableDefaultUI: true,
    zoomControl: true,
    mapId: "b3f2841793c037a8"
}

function Geolocation() {
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 })
    const [isLoaded, setIsLoaded] = useState(false)
    const mapRef = useRef(null)
    const markerRef = useRef(null)
    const [salons, setSalons] = useState([])
    const [selectedSalon, setSelectedSalon] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [distance, setDistance] = useState(0)
    const [showDistance, setShowDistance] = useState(false)
    const [isTracking, setIsTracking] = useState(false)
    const trackingRef = useRef({})
  
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
    }, [])
  
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
        setSelectedSalon(salon)
        setIsModalOpen(true)
    }

    const handleStartTracking = () => {
        setIsTracking(true)
        setDistance(0)
        setShowDistance(false)
        trackingRef.current.startPos = currentPosition
    }

    const handleStopTracking = () => {

        setIsTracking(false)

        const distanceCovered = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(trackingRef.current.startPos.lat, trackingRef.current.startPos.lng),
            new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng)
        ) / 1000

        const distanceInKm = distanceCovered / 1000

        setDistance(distanceInKm.toFixed(2))
        setShowDistance(true)
    }

    const formatDistance = (distance) => {

        if (distance < 1) {
            return `${(distance * 1000).toFixed(0)} m`
        }

        return `${distance.toFixed(2)} km`
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

            <button className="button-colored geoloc-button" onClick={handleSalonsNearby}>Afficher les salons de coiffure à proximité</button>

            <div className="geoloc-results">
                <ul>
                    {salons.map((salon, index) => (
                        <li key={index}>
                           <div>
                                <span>{salon.name}</span><br />

                                <p>Distance: {formatDistance(
                                    window.google.maps.geometry.spherical.computeDistanceBetween(
                                        new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                                        salon.geometry.location
                                    ) / 1000
                                )}</p>

                                <p>Adresse: {salon.vicinity}</p>
                           </div>
                            <button className="button-colored" onClick={() => handleSelectSalon(salon)}>Choisir</button>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedSalon && (
                    <ReactModal
                        isOpen={isModalOpen}
                        onRequestClose={() => setIsModalOpen(false)}
                        contentLabel="Salon Details"
                        className="modale" 
                    >
                        <div className="content">
                            <h2>{selectedSalon.name}</h2>
                            <p>Adresse: {selectedSalon.vicinity}</p>

                            {isTracking ? (
                                <div>
                                    <button className="button-colored" onClick={handleStopTracking}>Arrivé à destination</button>
                                    <p>Calcul des km parcourus en cours ...</p>
                                </div>
                            ) : (
                                <button className="button-colored" onClick={handleStartTracking}>Démarrer le compteur de km</button>
                            )}

                            {showDistance && (
                                <p>Distance parcourue: {formatDistance(distance)}</p>
                            )}
                        </div>

                        

                        <button onClick={() => setIsModalOpen(false)} className="close-btn"><img src={closeIcon} alt="fermer le compteur de km" /></button>
                    </ReactModal>
                )}
        </div>
        </>
        
    )  
}

export default Geolocation
