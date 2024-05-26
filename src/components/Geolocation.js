
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
            navigator.permissions.query({ name: "geolocation" })
            .then(function (result) {
                console.log(result);
                if (result.state === "granted") {
                    navigator.geolocation.getCurrentPosition(
                        position => {
                            setUserLocation({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            });
                            setLocationFound(true);
                            setIsRequestingLocation(false);
                        },
                        error => {
                            console.error("Error getting location:", error);
                            setError("Erreur lors de la récupération de la localisation.");
                            setIsRequestingLocation(false);
                        }
                    );
                } else if (result.state === "prompt") {
                    setError("L'autorisation de géolocalisation est requise.");
                    setIsRequestingLocation(false);
                } else if (result.state === "denied") {
                    setError("L'autorisation de géolocalisation a été refusée.");
                    setIsRequestingLocation(false);
                }
            });
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
