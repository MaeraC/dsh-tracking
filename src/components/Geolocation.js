
// Fichier Geolocation.js

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet" 
import L from "leaflet"
import 'leaflet/dist/leaflet.css'
import marker from "../assets/marker.png"
//import marker2 from "../assets/marker2.png"



function Geolocation() {
    
    const [userLocation, setUserLocation] = useState({lat: 0, lng: 0})
    const [locationFound, setLocationFound] = useState(false)
    const [error, setError] = useState(null)
    const [isRequestingLocation, setIsRequestingLocation] = useState(false)
   
    const handleRequestLocation = () => {
        setIsRequestingLocation(true)
        getUserLocation()
    }

    const getUserLocation = () => {

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(position => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })

                setLocationFound(true)
                setIsRequestingLocation(false)
            },
            error => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        setError("User denied the request for Geolocation.")
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setError("Location information is unavailable.")
                        break;
                    case error.TIMEOUT:
                        setError("The request to get user location timed out.")
                        break;
                    case error.UNKNOWN_ERROR:
                        setError("ne erreur inconnue est survenue.")
                        break;
                    default:
                        setError("ne erreur inconnue est survenue.")
                }
                setIsRequestingLocation(false)
            })
        } 
        else {
            console.error("La géolocalisation n'est pas supportée par ce navigateur.");
        }
    }

    return ( 
        <div style={{ height: '400px', width: '100%' }}>

            {!locationFound && !isRequestingLocation && (
                <button onClick={handleRequestLocation}>
                    Activer la géolocalisation
                </button>
            )}

            {isRequestingLocation && <p>Demande de localisation en cours...</p>}

            {error && <p>{error}</p>}

            {locationFound && (
                <MapContainer center={userLocation} zoom={12} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={userLocation} icon={L.icon({ iconUrl: marker })}>
                        <Popup>Votre position</Popup>
                    </Marker>
                </MapContainer>
            )}

        </div>
    )

    
}

export default Geolocation
