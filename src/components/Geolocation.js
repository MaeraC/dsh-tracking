

// Fichier Geolocation.js

import { GoogleMap } from "@react-google-maps/api"
import { useState, useEffect, useRef } from "react"

const mapContainerStyle = {
    width: '96vw',
    height: '70vh',
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
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
            },
            () => {
                console.error('Error fetching location')
            }
        )
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
        // Votre code pour rechercher les salons de coiffure à proximité et les afficher sur la carte
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
                            <span>{salon.name}</span><br></br><p>Distance :{" "}
                            {(
                                window.google.maps.geometry.spherical.computeDistanceBetween(
                                    new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                                    salon.geometry.location
                                ) / 1000
                            ).toFixed(2)}{" "} km</p>

                            
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        </>
        
    )  
}

export default Geolocation
