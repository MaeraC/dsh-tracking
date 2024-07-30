import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { db , auth } from "../../firebase.config"
import back from "../../assets/back.png"  
import SearchFeuillesDuJourCom from './SearchFeuillesDuJourCom'
import exportToExcel from '../ExportToExcel'

function FeuilleJournalière({ uid, onReturn }) { 
    
    const [feuilleDuJour, setFeuilleDuJour] = useState(null);
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState(''); 
    // eslint-disable-next-line
    const [signature, setSignature] = useState('');
    const [errorMsg, setErrorMsg] = useState("")
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [showUpdateButton, setShowUpdateButton] = useState(true); 

    useEffect(() => {
        if (!uid) return;

        const fetchFeuilleDuJour = async () => {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
            const q = query(feuillesDeRouteRef, where('userId', '==', uid), orderBy('date'));
            const querySnapshot = await getDocs(q);  
            const feuillesDeRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            const today = new Date();
            const todayDate = today.toISOString().split('T')[0];
            const feuille = feuillesDeRouteData.find(feuille => {
                if (!feuille.date) {
                    return false;
                }
                const feuilleDate = new Date(feuille.date.seconds * 1000).toISOString().split('T')[0];
                return feuilleDate === todayDate;
            });

            setFeuilleDuJour(feuille || null)
        };

        fetchFeuilleDuJour();
    }, [uid]);

    const handleSignerFiche = async (e) => {
        e.preventDefault();
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, auth.currentUser.email, password);
            const user = userCredential.user;
            
            if (user.uid === uid) {
                const feuilleRef = doc(db, 'feuillesDeRoute', feuilleDuJour.id);
                const now = new Date();
                const dateHeure = `${formatDate(now)} à ${now.toLocaleTimeString()}`;

                await updateDoc(feuilleRef, {
                    isClotured: true,
                    signatureDate: dateHeure,
                });

                setFeuilleDuJour(prev => ({ ...prev, isClotured: true, signatureDate: dateHeure }));
                setIsModalOpen(false);
                setSignature(dateHeure)
                setMessage('Feuille de route signée avec succès !');
            } else {
                setErrorMsg('Erreur de validation de mot de passe.');
            }
        } catch (error) {
            console.error("Erreur de validation:", error.message);
            setErrorMsg('Mot de passe incorrect');
        }
    }
    const handleUpdateFeuille = async (e) => {
        e.preventDefault();
        try {
            const feuilleRef = doc(db, 'feuillesDeRoute', feuilleDuJour.id);
            const updatedStops = feuilleDuJour.stops.map((stop, idx) => {
                // Mise à jour des champs sauf pour le dernier arrêt
                if (idx < feuilleDuJour.stops.length - 1) {
                    return {
                        name: formData[`stop_${idx}_name`] || stop.name,
                        address: stop.address,
                        distance:  stop?.distance,
                        postalCode: stop.postalCode,
                        arrivalTime: stop.arrivalTime,
                        departureTime:  stop.departureTime,
                        status: formData[`stop_${idx}_status`] || stop.status,
                    };
                }
               
                return {
                    ...stop,
                };
            });
    
            await updateDoc(feuilleRef, { stops: updatedStops });
    
            setFeuilleDuJour(prev => ({ ...prev, stops: updatedStops }));
            setIsEditing(false);
            setShowUpdateButton(false);
        } catch (error) {
            console.error("Erreur de mise à jour:", error.message);
        }
    }
    
    const formatDate = (date) => {
        if (!date) {
            return 'Date non disponible';
        }

        let d;
        if (date instanceof Date) {
            d = date;
        } else if (date.seconds) {
            d = new Date(date.seconds * 1000);
        } else {
            return 'Date non disponible';
        }

        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        const dayName = days[d.getUTCDay()];
        const day = d.getUTCDate();
        const month = months[d.getUTCMonth()];
        const year = d.getUTCFullYear();

        return `${dayName} ${day} ${month} ${year}`;
    }
    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    }
    const today = new Date();

    const getNombreDeVisites = (stops) => {
        return stops?.length > 1 ? stops?.length - 1 : 0
    }
    const countVisitesByStatus = (stops, status) => {
        return stops?.filter(stop => stop?.status === status).length 
    }    

    const handleExport = () => {
        const feuilleData = feuilleDuJour.stops.map((stop, idx) => ({
            "Visite N°": idx < feuilleDuJour.stops.length - 1 ? idx + 1 : "Retour",
            "Nom": stop.name || '',
            "Statut": stop.status || '',
            "Adresse": stop.address || '',
            "Code Postal": stop.postalCode || '',
            "Km Parcourus": stop.distance !== undefined ? (stop.distance < 1000 ? `${stop.distance.toFixed(0)} m` : `${(stop.distance / 1000).toFixed(2)} km`) : '',
            "Heure d'Arrivée": idx < feuilleDuJour.stops.length - 1 ? stop.arrivalTime || '' : '',
            "Heure de Départ": idx < feuilleDuJour.stops.length - 1 ? stop.departureTime || '' : ''
        }))
    
        const recapData = [
            ["Total de la distance parcourue", `${feuilleDuJour.totalKm < 1000 ? feuilleDuJour.totalKm.toFixed(0) + ' m' : (feuilleDuJour.totalKm / 1000).toFixed(2) + ' km'}`],
            ["Total des visites effectuées", feuilleDuJour.stops.length - 1],
            ["Visites client", feuilleDuJour.stops.filter(stop => stop.status === 'Client').length],
            ["Visites prospect", feuilleDuJour.stops.filter(stop => stop.status === 'Prospect').length],
            ["Validé le", feuilleDuJour.signatureDate || '']
        ]

        exportToExcel([].concat(feuilleData, recapData), `Feuille_de_route_du_${formatDate(today)}.xlsx`, ['Feuille du jour', 'Récapitulatif'], [feuilleData, recapData]);
    };


   return (
        <div className='fdr-section'>
            <div className='titre-fiche'>
                <h1>Feuilles de route journalières</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button> 
            </div>

            <div className='fdr-content' style={{ display: "flex", justifyContent: "space-around", padding: "0 20px" }}>
                {feuilleDuJour ? (
                    <div style={{ width: "20%", fontSize: "14px" }} className='feuille-du-jour feuille-this-day'>
                        <button onClick={handleExport} className='button-colored'>Télécharger</button>
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Feuille du jour</h3>
                        <p style={{ textAlign: "center", color: "grey", fontSize: "14px", fontStyle: "italic", marginBottom: "20px" }}>{formatDate(today)}</p>
                        {feuilleDuJour.stops?.map((stop, idx) => (
                            <div key={idx} className='visites' style={{marginBottom: "20px"}}>
                                {idx < feuilleDuJour.stops.length - 1 ? (
                                    <p style={{ background: "white", display: "inline-block", padding: "5px",  fontSize: "14px" }}><strong>Visite n°{idx + 1}</strong></p>
                                ) : (
                                    <p style={{ background: "white", display: "inline-block", padding: "5px", fontSize: "14px" }}><strong>Retour</strong></p>
                                )}
                                {isEditing ? (
                                    <>
                                        <div style={{ fontSize: "14px", flexDirection:"column", alignItems: "start" }}>       
                                            <p style={{background: "none", width: "100%"}} className='titre'>Nom</p>   
                                            <input style={{padding: "5px 10px", fontSize: "14px", marginBottom: "0"}} type="text" value={formData[`stop_${idx}_name`] || stop.name} onChange={(e) => setFormData({ ...formData, [`stop_${idx}_name`]: e.target.value })} />
                                        </div><br></br> 
                                        {idx < feuilleDuJour.stops.length - 1 && (
                                            <div style={{ fontSize: "14px", flexDirection:"column", alignItems: "start" }}>
                                                <p style={{background: "none", width: "100%"}} className='titre'>Statut</p>
                                                <input style={{padding: "5px 10px", fontSize: "14px", marginBottom: "0"}} type="text" value={formData[`stop_${idx}_status`] || stop.status} onChange={(e) => setFormData({ ...formData, [`stop_${idx}_status`]: e.target.value })} />
                                            </div>
                                        )}<br></br> 
                                        {stop.address && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Adresse</p>
                                                <p className='texte'>{stop.address}</p>
                                            </div>
                                        )}
                                        {stop.postalCode  && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Code postal</p>
                                                <p className='texte'>{stop.postalCode} </p>
                                            </div>
                                        )}
                                        {stop.distance !== undefined && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Km parcourus</p>
                                                <p className='texte'>{formatDistance(stop.distance)}</p>
                                            </div>
                                        )}
                                        {idx < feuilleDuJour.stops.length - 1 && stop.arrivalTime && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Heure d'arrivée</p>
                                                <p className='texte'>{stop.arrivalTime}</p>
                                            </div>
                                        )}
                                        {idx < feuilleDuJour.stops.length - 1 && stop.departureTime && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Heure de départ</p>
                                                <p className='texte'>{stop.departureTime}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {stop.name && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Nom</p>
                                                <p className='texte'>{stop.name}</p>
                                            </div>
                                        )}
                                        {idx < feuilleDuJour.stops.length - 1 && stop.status && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Statut</p>
                                                <p className='texte'>{stop.status}</p>
                                            </div>
                                        )}
                                        {stop.address && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Adresse</p>
                                                <p className='texte'>{stop.address}</p>
                                            </div>
                                        )}
                                        {stop.postalCode  && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Code postal</p>
                                                <p className='texte'>{stop.postalCode} </p>
                                            </div>
                                        )}
                                        {stop.distance !== undefined && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Km parcourus</p>
                                                <p className='texte'>{formatDistance(stop.distance)}</p>
                                            </div>
                                        )}
                                        {idx < feuilleDuJour.stops.length - 1 && stop.arrivalTime && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Heure d'arrivée</p>
                                                <p className='texte'>{stop.arrivalTime}</p>
                                            </div>
                                        )}
                                        {idx < feuilleDuJour.stops.length - 1 && stop.departureTime && (
                                            <div style={{ fontSize: "14px" }}>
                                                <p className='titre'>Heure de départ</p>
                                                <p className='texte'>{stop.departureTime}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))} 

                        {feuilleDuJour.stops?.length > 0 && (
                            <>
                            <div style={{background: "white", padding: "10px"}}>
                                <p style={{ marginTop: "5px" }}><strong>Total de la distance parcourue </strong>: {formatDistance(feuilleDuJour?.totalKm)}</p>
                                <p style={{ marginTop: "5px" }}><strong>Total des visites effectuées </strong>: {getNombreDeVisites(feuilleDuJour?.stops)}</p>
                                <p style={{ marginTop: "5px" }}><strong>Visites client </strong>: {countVisitesByStatus(feuilleDuJour?.stops, 'Client')}</p>
                                <p style={{ marginTop: "5px" }}><strong>Visites prospect </strong>: {countVisitesByStatus(feuilleDuJour?.stops, 'Prospect')}</p>
                            </div> 

                            {!feuilleDuJour.isClotured && !isEditing && showUpdateButton && ( 
                            <>
                                <button style={{ marginTop: "20px" }} onClick={() => setIsModalOpen(true)} className='button-colored'>Signer la feuille</button>
                                <button style={{ marginTop: "20px", marginLeft: "10px" }} onClick={() => setIsEditing(true)} className='button-colored'>Mettre à jour</button>
                            </>
                            )}
                            {!showUpdateButton && !feuilleDuJour.isClotured && (    
                                <button style={{ marginTop: "20px" }} onClick={() => setIsModalOpen(true)} className='button-colored'>Signer la feuille</button>
                            )}
                            {feuilleDuJour.isClotured && (
                                <p style={{ marginTop: "30px", fontWeight: "bold" }}>Validé le {feuilleDuJour?.signatureDate}</p>
                            )}
                            {isEditing && (
                                <form onSubmit={handleUpdateFeuille}>
                                    <button type="submit" style={{ marginTop: "20px" }} className='button-colored'>Mettre à jour</button>
                                </form>
                            )}
                            </>
                        )}

                        {feuilleDuJour.isVisitsStarted === false && (
                            <div style={{background: "white", padding: "20px"}}>
                                <p style={{marginBottom: "10px"}}><strong>Aucun déplacement effectué</strong></p>
                                <p><strong>Motif</strong> : {feuilleDuJour.motif}</p>
                            </div>
                        )} 
                        
                        
                        {message && <p style={{ marginTop: "20px" }} className='success'>{message}</p>}

                        {isModalOpen && (
                            <div className='modal' style={{zIndex: "99"}}>  
                                <div className='modal-content'  > 
                                    <h2 style={{fontSize: "22px"}}>Validation par mot de passe</h2>
                                    <form onSubmit={handleSignerFiche}>
                                        <input className='input-mdp' style={{margin: "20px 0", marginBottom: "20px"}} placeholder="Votre mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        <button type="submit" className='button-colored'>Signer la feuille</button>
                                        <button className="cancel" onClick={() => setIsModalOpen(false)}>Annuler</button> 
                                        {errorMsg && <p>{errorMsg}</p>}
                                    </form>
                                </div>  
                            </div>
                        )} 
                    </div>
                ) : (
                    <p className='msg-no-feuille' style={{ display: "inline-block", background: "#DCF1F2", padding: "30px 20px", borderRadius: "20px", margin: "30px 0", height: "fit-content", textAlign: "center" }}>Aucune feuille de route enregistrée aujourd'hui.</p>
                )}
                <SearchFeuillesDuJourCom uid={uid} />
            </div>
        </div>
    );
}

export default FeuilleJournalière
