// Fichier Geolocation.js

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import marker from "../assets/marker.png";



function Geolocation() {
    const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 })
    const [locationFound, setLocationFound] = useState(false)

    useEffect(() => {
        getUserLocation()
    }, [])

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    setLocationFound(true)
                },
                error => {
                    console.error("Error getting user location:", error)
                }
            )
        } else {
            console.error("Geolocation is not supported by this browser.")
        }
    }

    const handleGetLocation = () => {
        getUserLocation()
    }

    return (
        <div style={{ height: '400px', width: '100%' }}>
            {locationFound ? (
                <MapContainer center={userLocation} zoom={16} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={userLocation} icon={L.icon({ iconUrl: marker })}>
                        <Popup>Votre position</Popup>
                    </Marker>
                </MapContainer>
            ) : (
                <div>
                    <p>Vous n'avez pas encore autorisé l'accès à votre position.</p>
                    <button onClick={handleGetLocation}>Autoriser la géolocalisation</button>
                </div>
            )}
        </div>
    )
}

export default Geolocation

/**
 * 
 * 
 * // Définir getUserLocation en dehors du composant Geolocation
const getUserLocation = (setUserLocation, setLocationFound, setError, setIsRequestingLocation) => {
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' })
            .then(permissionStatus => {
                if (permissionStatus.state === 'granted') {
                    handleRequestLocation(setUserLocation, setLocationFound, setIsRequestingLocation);
                } else if (permissionStatus.state === 'prompt') {
                    setError("L'autorisation de géolocalisation est requise.");
                    setIsRequestingLocation(false);
                } else if (permissionStatus.state === 'denied') {
                    setError("L'autorisation de géolocalisation a été refusée.");
                    setIsRequestingLocation(false);
                }
            })
            .catch(error => {
                console.error("Error querying permission:", error);
                setError("Erreur lors de la récupération de l'autorisation de géolocalisation.");
                setIsRequestingLocation(false);
            });
    } else {
        console.error("Geolocation permissions API not supported.");
        setError("API des permissions de géolocalisation non prise en charge.");
        setIsRequestingLocation(false);
    }
};

// Définir handleRequestLocation en dehors du composant Geolocation
const handleRequestLocation = (setUserLocation, setLocationFound, setIsRequestingLocation, setError) => {
    setIsRequestingLocation(true);
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
};


 * 
 * function Geolocation() {
    const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
    const [locationFound, setLocationFound] = useState(false);
    const [error, setError] = useState(null);
    const [isRequestingLocation, setIsRequestingLocation] = useState(false);

    useEffect(() => {
        getUserLocation(setUserLocation, setLocationFound, setError, setIsRequestingLocation);
    }, []);

    return (
        <div style={{ height: '400px', width: '100%' }}>
            {!locationFound && !isRequestingLocation && (
                <button onClick={() => handleRequestLocation(setUserLocation, setLocationFound, setIsRequestingLocation)}>
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
    );
}

export default Geolocation;
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 // Fichier Geolocation.js

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet" 
import L from "leaflet"
import 'leaflet/dist/leaflet.css'
import marker from "../assets/marker.png"
//import marker2 from "../assets/marker2.png"



function Geolocation() {
    
    const [userLocation, setUserLocation] = useState({lat: 0, lng: 0})
    const [locationFound, setLocationFound] = useState(false)
   
    useEffect(() => {
        getUserLocation()

    }, [])

    const getUserLocation = () => {

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(position => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })

                setLocationFound(true)
            })
        } 
        else {
            console.error("Geolocation is not supported by this browser.");
        }
    }

    return ( 
        <div style={{ height: '400px', width: '100%' }}>
            
            {locationFound && (
                <MapContainer center={userLocation} zoom={16} style={{ height: '400px', width: '100%' }}>
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
 */