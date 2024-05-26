// Fichier Geolocation.js

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import marker from "../assets/marker.png";
import marker2 from "../assets/marker2.png";



function Geolocation() {
    const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 })
    const [locationFound, setLocationFound] = useState(false)
    const [hairSalons, setHairSalons] = useState([])

    useEffect(() => {
        getUserLocation()
    }, [])

    const getUserLocation = () => {

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(

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
        } 
        else {
            console.error("Geolocation is not supported by this browser.")
        }
    }

    const handleGetLocation = () => {
        getUserLocation()
    }

    const locateHairSalons = async () => {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];node[shop=hairdresser](around:30000,${userLocation.lat},${userLocation.lng});out;`)
        const data = await response.json()
        const salons = data.elements.map(element => ({ 
            lat: element.lat, 
            lng: element.lon ,
            tags: element.tags
        }))

        console.log(hairSalons.map(salon => salon))
        setHairSalons(salons)
    }

    return (
        <div style={{ height: '400px', width: '100%' }}>

            <button onClick={locateHairSalons}>
                Localiser les salons de coiffure autour de moi
            </button>

            {locationFound ? (

                <MapContainer center={userLocation} zoom={16} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={userLocation} icon={L.icon({ iconUrl: marker })}>
                        <Popup>Votre position</Popup>
                    </Marker>

                    {/* Afficher les marqueurs des salons de coiffure */}
                    {hairSalons.map((salon, index) => (
                        <Marker key={index} position={salon} icon={L.icon({ iconUrl: marker2 })} >
                            <Popup>
                                <div>
                                    <h2>Salon de coiffure</h2>
                                    <p>Nom: {salon.tags.name}</p>
                                    {salon.tags['addr:street'] && <p>Adresse: {salon.tags['addr:housenumber']} {salon.tags['addr:street']}, {salon.tags['addr:postcode']}</p>}
                                </div>
                            </Popup>
                        </Marker>
                    ))}

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
