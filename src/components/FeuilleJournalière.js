import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db , auth } from "../firebase.config";
import back from "../assets/back.png"
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";
import download from "../assets/download.png"   
import SearchFeuillesDuJourCom from './SearchFeuillesDuJourCom';

function FeuilleJournalière({ uid, onReturn }) { 
    
    const [feuilleDuJour, setFeuilleDuJour] = useState(null);
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState(''); 
    // eslint-disable-next-line
    const [signature, setSignature] = useState('');
    const [errorMsg, setErrorMsg] = useState("")
    const fdrJourRef = useRef()

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
        return stops.length > 1 ? stops.length - 1 : 0
    }
    const countVisitesByStatus = (stops, status) => {
        return stops.filter(stop => stop.status === status).length 
    }

    const generatePDF = (input, filename) => {
        if (!input) {
            console.error('Erreur : référence à l\'élément non valide');
            return;
        }

        html2canvas(input, {
            useCORS: true,
            scale: 2, // Augmente la résolution du canvas pour une meilleure qualité
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth;
            const height = width / ratio;

            let position = 0;

            if (height > pdfHeight) {
                const totalPages = Math.ceil(canvasHeight / (canvasWidth * pdfHeight / pdfWidth));
                for (let i = 0; i < totalPages; i++) {
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvasWidth;
                    pageCanvas.height = canvasWidth * pdfHeight / pdfWidth;
                    const pageContext = pageCanvas.getContext('2d');
                    pageContext.drawImage(canvas, 0, position, canvasWidth, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);
                    const pageImgData = pageCanvas.toDataURL('image/png');
                    if (i > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    position += pageCanvas.height;
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
            }

            pdf.save(filename);
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    }
    const downloadPDF = () => {
        const input = fdrJourRef.current
        generatePDF(input, "feuille-du-jour.pdf")
    }

    return (
        <div className='fdr-section'>
            
            <div className='titre-fiche'> 
                <h1>Feuilles de route journalières</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>
            <div className='fdr-content' style={{display: "flex", justifyContent: "space-around", padding: "0 20px"}}>  
            {feuilleDuJour ? (
                <div style={{width: "30%"}} className='feuille-du-jour feuille-this-day' ref={fdrJourRef}> 
                        <button className="download button-colored" onClick={downloadPDF}><img src={download} alt="Télécharger la feuille de route du jour" /></button>
                        <h3 style={{textAlign: "center", marginBottom: "10px"}}>Feuille du jour</h3>
                        <p style={{ textAlign: "center", color: "grey", fontSize: "15px", fontStyle: "italic", marginBottom: "20px" }}>{formatDate(today)}</p>  

                        {feuilleDuJour.stops.map((stop, idx) => (
                            <>
                            {idx < feuilleDuJour.stops.length - 1 ? (
                                <p style={{ background: "white", display: "inline-block", padding: "5px", marginTop: "20px" }}><strong>Visite n°{idx + 1}</strong></p>
                            ) : (
                                <p style={{ background: "white", display: "inline-block", padding: "5px", marginTop: "20px" }}><strong>Retour</strong></p>
                            )}
                            <div className='visites' key={idx}>
                            {stop.name && (
                                    <div>
                                        <p className='titre'>Nom</p>
                                        <p className='texte'>{stop.name}</p>
                                    </div>
                                )}
                                {stop.status && (
                                    <div>
                                        <p className='titre'>Statut</p>
                                        <p className='texte'>{stop.status}</p>
                                    </div>
                                )}
                                {stop.address && (
                                    <div>
                                        <p className='titre'>Adresse</p>
                                        <p className='texte'>{stop.address}</p>
                                    </div>
                                )}
                                {stop.postalCode && stop.city && (
                                    <div>
                                        <p className='titre'>Ville</p>
                                        <p className='texte'>{stop.postalCode} {stop.city}</p>
                                    </div>
                                )}
                                {stop.distance !== undefined && (
                                    <div>
                                        <p className='titre'>Km parcourus</p>
                                        <p className='texte'>{formatDistance(stop.distance)}</p>
                                    </div>
                                )}
                                {stop.arrivalTime && (
                                    <div>
                                        <p className='titre'>Heure d'arrivée</p>
                                        <p className='texte'>{stop.arrivalTime}</p>
                                    </div>
                                )}
                                {stop.departureTime && (
                                    <div>
                                        <p className='titre'>Heure de départ</p>
                                        <p className='texte'>{stop.departureTime}</p>
                                    </div>
                                )}
                            </div>
                            </>
                        ))}

                        <p style={{marginTop: "20px"}}><strong>Total de la distance parcourue </strong>: {formatDistance(feuilleDuJour.totalKm)}</p>
                        <p style={{ marginTop: "5px" }}><strong>Total des visites effectuées </strong>: {getNombreDeVisites(feuilleDuJour.stops)}</p>
                        <p style={{ marginTop: "5px" }}><strong>Visites client </strong>: {countVisitesByStatus(feuilleDuJour.stops, 'Client')}</p>
                        <p style={{ marginTop: "5px" }}><strong>Visites prospect </strong>: {countVisitesByStatus(feuilleDuJour.stops, 'Prospect')}</p>

                        {!feuilleDuJour.isClotured && (
                            <button style={{marginTop: "20px"}} onClick={() => setIsModalOpen(true)} className='button-colored'>Signer la feuille</button>
                        )}
                        {feuilleDuJour.isClotured && (
                            <p style={{marginTop: "20px"}}>Validé le {feuilleDuJour.signatureDate}</p>  
                        )}
                        {isModalOpen && (
                            <div>  
                                <div> 
                                    <h2>Validation par mot de passe</h2>
                                    <form onSubmit={handleSignerFiche}>
                                        <label>Mot de passe</label>
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        <button type="submit" className='button-colored'>Signer la feuille</button>
                                        {errorMsg && <p>{errorMsg}</p>}
                                    </form>
                                </div>  
                            </div>
                        )} 
                        {message && <p>{message}</p>} 
                </div>
            ) : (
                <p style={{display: "inline-block", background: "#DCF1F2", padding: "30px 20px", borderRadius: "20px", margin: "30px 0", height: "fit-content"}}>Aucune feuille de route enregistrée aujourd'hui.</p> 
            )} 

            <SearchFeuillesDuJourCom uid={uid} />
            </div>
        </div>
    )
}

export default FeuilleJournalière
