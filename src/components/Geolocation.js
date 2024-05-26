
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
