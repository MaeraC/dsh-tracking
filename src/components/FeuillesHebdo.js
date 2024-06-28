
// fichier FeuillesHebdo.js

import React, { useEffect, useState, useRef } from 'react'
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from "../firebase.config"
import back from "../assets/back.png"
import ReactSignatureCanvas from 'react-signature-canvas'
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";

function FeuillesHebdo({ uid, onReturn }) {
    const [feuillesRoute, setFeuillesRoute] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalPrintOpen, setIsModalPrintOpen] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [errorNoSignature, setErrorNoSignature] = useState("")
    const [password, setPassword] = useState('')
    const [usersMap, setUsersMap] = useState({})
    const [signatureData, setSignatureData] = useState(null)
    const [message, setMessage] = useState("")
    const [isDownloadDisplay, setIsDownloadDisplay] = useState(false)
    const [isSendMailOpen, setIsSendMailOpen] = useState(false)
    const [timeErrorMsg, setTimeErrorMsg] = useState('')
    const signatureCanvasRef = useRef({}) 
    const pageRef = useRef()

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

    useEffect(() => {
        const fetchUsersData = async () => {
            const usersData = {};
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.forEach((doc) => {
                        usersData[doc.id] = doc.data();
                });
                setUsersMap(usersData);
            } catch (error) {
                    console.error("Erreur lors de la récupération des utilisateurs : ", error);
            }
        };
    
        fetchUsersData();
    }, []);

    useEffect(() => {
        if (!uid) return;
    
        const fetchFeuillesRoute = async () => {
            const feuillesRouteRef = collection(db, 'feuillesDeRoute')
            const q = query(feuillesRouteRef, where('userId', '==', uid))
            const querySnapshot = await getDocs(q)
        
            const feuillesRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id, ...doc.data(),
            }))
        
            setFeuillesRoute(feuillesRouteData)
        }
        fetchFeuillesRoute()
    }, [uid])

    const getDayName = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('fr-FR', { weekday: 'long' }).charAt(0).toUpperCase() + date.toLocaleDateString('fr-FR', { weekday: 'long' }).slice(1);
    }  
    const groupStopsByWeek = () => {
        const currentWeek = {};
        const weeks = {};

        feuillesRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000);
            const day = date.getDay();
            const diffToMonday = day === 0 ? 6 : day - 1;
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - diffToMonday);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 4);

            const weekKey = `${startOfWeek.toISOString().split('T')[0]}_${endOfWeek.toISOString().split('T')[0]}`;

            if (!weeks[weekKey]) {
                weeks[weekKey] = { startOfWeek, endOfWeek, stopsByDay: {}, totalKmByDay: {}};

                days.forEach(day => {
                    weeks[weekKey].stopsByDay[day] = [];
                    weeks[weekKey].totalKmByDay[day] = 0;
                });
            }

            feuille.stops.forEach((stop, index) => {
                const dayName = getDayName(feuille.date);
                if (weeks[weekKey].stopsByDay.hasOwnProperty(dayName)) {
                    weeks[weekKey].stopsByDay[dayName].push({ ...stop, dayName });
                    weeks[weekKey].totalKmByDay[dayName] += stop.distance || 0;

                    
                }
            });

            // Check if feuille belongs to the current week
            if (isCurrentWeek(startOfWeek, endOfWeek)) {
                currentWeek[weekKey] = weeks[weekKey];
            }
        });

        return currentWeek;
    }
    const isCurrentWeek = (startOfWeek, endOfWeek) => {
        const today = new Date();
        const startOfWeekDate = new Date(startOfWeek);
        const endOfWeekDate = new Date(endOfWeek);

        return today >= startOfWeekDate && today <= endOfWeekDate;
    }
    
    const currentWeek = groupStopsByWeek()

    const getVisitCounts = () => {
        const currentWeekKey = Object.keys(currentWeek)[0]; // Prend la première semaine dans l'objet currentWeek (semaine en cours)
        let totalVisits = 0;
        let clientVisits = 0;
        let prospectVisits = 0;
    
        if (currentWeekKey) {
            const { stopsByDay } = currentWeek[currentWeekKey];
    
            days.forEach(day => {
                stopsByDay[day].forEach(stop => {
                    if (stop && stop.status) {
                        totalVisits++;
                        if (stop.status === "Client") {
                            clientVisits++;
                        } else if (stop.status === "Prospect") {
                            prospectVisits++;
                        }
                    }
                });
            });
        }
    
        return { totalVisits, clientVisits, prospectVisits };
    };
    
    const visitCounts = getVisitCounts();
    
    const formatDate = (date) => date.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    })
    const formatDistance = (distance) => {
        if (distance < 1000) {
          return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    }

    const handleValidate = () => {
        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();

        if (day === 4 && hours >= 7 && hours <= 23) { // vendredi = 5 entre 17h et 22H 
            setIsModalOpen(true)
            setTimeErrorMsg("")
        }
        else {
            setTimeErrorMsg("Vous pourrez signer votre feuille de route vendredi entre 17h et 22H.")
        }
    }
    const handlePassword = async (e) => {
        e.preventDefault()
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, auth.currentUser.email, password)
            const user = userCredential.user
            
            if (user.uid === uid) {
                setIsModalOpen(false)
                setIsModalPrintOpen(true)
            } else {
                setErrorMsg('Erreur de validation de mot de passe.')
            }
        } catch (error) {
            console.error("Erreur de validation:", error.message)
            setErrorMsg('Mot de passe incorrect')
        }
    }

    const handleSignFiche = async () => {
        if (!signatureCanvasRef.current.isEmpty()) {
            try {
                const signatureDataUrl = signatureCanvasRef.current.getTrimmedCanvas().toDataURL('image/png')
                const timestamp = new Date()
                const newDoc = { date: timestamp, userId: uid, signature: signatureDataUrl }
    
                await addDoc(collection(db, 'fdrSemaine'), newDoc)
                setSignatureData({ url: signatureDataUrl, timestamp })
                setMessage("Veuillez télécharger votre feuille de route et l'envoyer par e-mail.")
                setIsDownloadDisplay(true)
            } 
            catch (error) {
                console.error("Erreur lors de l'ajout du document : ", error);
                setErrorNoSignature("Erreur lors de la sauvegarde de la signature. Veuillez réessayer.");
            }
        }
        else {
            setErrorMsg("Veuillez remplir et signer votre fiche");
        }
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
        const input = pageRef.current;
        generatePDF(input, "feuille-du-jour-hebdomadaire.pdf")
    }
    const handleDownloadDoc = () => {
        downloadPDF()
        setIsSendMailOpen(true)
    }
    
    return (
        <div style={{ position: "relative" }}>
            <div className='titre-fiche'> 
                <h1>Feuille de route hebdomadaire</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <div className='hebdo-stats' style={{ marginBottom: '20px' }}>
                    <p>Nombre total de visites cette semaine <span>{visitCounts.totalVisits}</span></p>
                    <p>Nombre de visites clients cette semaine <span>{visitCounts.clientVisits}</span></p>
                    <p>Nombre de visites prospects cette semaine <span>{visitCounts.prospectVisits}</span></p>
                </div>

                {Object.keys(currentWeek).map(weekKey => {
                const { startOfWeek, endOfWeek, stopsByDay, totalKmByDay} = currentWeek[weekKey];
                const totalKmAll = Object.values(totalKmByDay).reduce((acc, km) => acc + km, 0);

                return (
                    <div className='hebdo' key={weekKey}>
                        <h2>{`Semaine du ${formatDate(startOfWeek)} au ${formatDate(endOfWeek)}`}</h2>
                        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' , marginBottom: "20px", fontSize: "15px"}}>
                            <thead>
                                <tr>
                                    <th style={{ width: '10%', background: "#3D9B9B", color: "white"  }}>Total <strong>{formatDistance(totalKmAll)}</strong></th>
                                    
                                    {days.map(day => (
                                        <th key={day} style={{ width: '18%', background: "#c7c7c7" }}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                            {Array.from({ length: Math.max(...Object.values(stopsByDay).map(stops => stops.length), 0) }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td style={{ verticalAlign: 'top', background: "#c7c7c7" }}> 
                                        <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px"}}> 
                                            <strong>Nom:</strong> <br />
                                            <strong>Prosp/Clt:</strong> <br />
                                            <strong>Ville:</strong><br />
                                            <strong>Km:</strong><br />
                                            <strong>Arrivée:</strong><br />
                                            <strong>Départ:</strong>
                                        </div>
                                    </td>
                                    {days.map(day => (
                                        <td key={day} style={{ verticalAlign: 'top' }}>
                                            {stopsByDay[day][rowIndex] ? (
                                                <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px", height: "100%", fontSize: "14px"}}>
                                                    <p>{stopsByDay[day][rowIndex].name}</p><br />
                                                    <p>{stopsByDay[day][rowIndex].status}</p><br />
                                                    <p>{stopsByDay[day][rowIndex].address} {stopsByDay[day][rowIndex].city}</p><br />
                                                    <p>{formatDistance(stopsByDay[day][rowIndex].distance)}</p><br />
                                                    <p>{stopsByDay[day][rowIndex].arrivalTime}</p><br />
                                                    <p>{stopsByDay[day][rowIndex].departureTime}</p><br />
                                                </div>
                                            ) : null}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
                                    <strong>Total km</strong>
                                </td>
                                {days.map(day => (
                                    <td key={day} style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white"   }}>
                                        <strong>{formatDistance(totalKmByDay[day])}</strong>
                                    </td>
                                ))}
                            </tr>
                            </tbody>
                        </table>
                    </div>
                );
                })}
                <button onClick={handleValidate} className='button-colored'>Valider les déplacements de la semaine</button>
                {timeErrorMsg && <p style={{ color: 'red', textAlign: "center", marginTop: "20px" }}>{timeErrorMsg}</p>} 
            </div>

            {isModalOpen && (
                <div className='modal' style={{position: "fixed", top: "0", left: "0", width: "100%", height: "100%", background: "#b4b4b48a", display: "flex", justifyContent: "center", alignItems: "center"}}>  
                    <div className='modal-content' style={{background: "white", padding: "40px", paddingBottom: "20px", textAlign: "center", borderRadius: "20px"}}> 
                        <form onSubmit={handlePassword}>
                            <p style={{paddingBottom: "30px"}}>Veuillez confirmez votre mot de passe.</p>
                            <input type="password" placeholder="Votre mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button style={{marginTop: "10px"}}  type="submit" className='button-colored'>confirmer</button>
                            <p onClick={() => setIsModalOpen(false)} style={{fontSize: "14px", marginTop: "20px", color: "#3D9B9B", cursor: "pointer"}}>Annuler</p>
                            {errorMsg && <p>{errorMsg}</p>}
                        </form>
                    </div>  
                </div>
            )} 
            {isModalPrintOpen && ( 
                <div ref={pageRef} style={{ position: "fixed", width: "100%", height: "100vh", background: "white", top: "0", left: "0", padding: "20px", display: "flex", flexDirection: "column",  justifyContent: "center", paddingBottom: "150px", paddingTop: "0px", overflowY: "scroll" }}>
                    <h1 style={{ fontSize: "20px", marginBottom: "20px", marginTop: "30px" }}>Validation de la feuille de route hebdomadaire</h1>
                    <p style={{ lineHeight: "25px", marginBottom: "20px", textAlign: "center" }}>
                        Je soussigné(e) <strong>{usersMap[feuillesRoute[0]?.userId]?.firstname} {usersMap[feuillesRoute[0]?.userId]?.lastname}</strong>, certifie l’authenticité des informations figurant sur la feuille de route ci-dessous qui rend compte des déplacements professionnels que j’ai effectué concernant la semaine du <strong>{formatDate(currentWeek[Object.keys(currentWeek)[0]].startOfWeek)}</strong> au <strong>{formatDate(currentWeek[Object.keys(currentWeek)[0]].endOfWeek)}</strong>.
                    </p>
                    {Object.keys(currentWeek).map(weekKey => {
                        const { stopsByDay, totalKmByDay } = currentWeek[weekKey];
                        const totalKmAll = Object.values(totalKmByDay).reduce((acc, km) => acc + km, 0);

                        return (
                            <div key={weekKey} style={{ width: "100%" }}>
                                <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: "20px" }}>
                                    <thead style={{ fontSize: "10px" }}>
                                        <tr>
                                            <th style={{ width: '10%' }}>Total <strong>{formatDistance(totalKmAll)}</strong></th>
                                            {days.map(day => (
                                                <th key={day} style={{ width: '18%' }}>{day}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: "10px" }}>
                                        {Array.from({ length: Math.max(...Object.values(stopsByDay).map(stops => stops.length), 0) }).map((_, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <td style={{ verticalAlign: 'top' }}>
                                                    <div>
                                                        <strong>Nom:</strong> <br />
                                                        <strong>Prosp/Clt:</strong> <br />
                                                        <strong>Ville:</strong><br />
                                                        <strong>Km:</strong><br />
                                                        <strong>Arrivée:</strong><br />
                                                        <strong>Départ:</strong>
                                                    </div>
                                                </td>
                                                {days.map(day => (
                                                    <td key={day} style={{ verticalAlign: 'top' }}>
                                                        {stopsByDay[day][rowIndex] ? (
                                                            <div>
                                                                <p>{stopsByDay[day][rowIndex].name}</p>
                                                                <p>{stopsByDay[day][rowIndex].status}</p>
                                                                <p>{stopsByDay[day][rowIndex].address} {stopsByDay[day][rowIndex].city}</p>
                                                                <p>{formatDistance(stopsByDay[day][rowIndex].distance)}</p>
                                                                <p>{stopsByDay[day][rowIndex].arrivalTime}</p>
                                                                <p>{stopsByDay[day][rowIndex].departureTime}</p>
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr>
                                            <td style={{ verticalAlign: 'top' }}><strong>Total km</strong></td>
                                            {days.map(day => (
                                                <td key={day} style={{ verticalAlign: 'top' }}><strong>{formatDistance(totalKmByDay[day])}</strong></td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                    {message && ( 
                        <p>{message}</p>
                    )}
                    {isDownloadDisplay && (
                        <button onClick={handleDownloadDoc} className='button-colored'>Télécharger la feuille de route</button>
                    )}
                    {isSendMailOpen && (
                        <>
                        <a href="mailto:fdr@dsh-application.com" className='button-colored'>Envoyer la feuille de route par email</a>
                        <button onClick={() => setIsModalPrintOpen(false)} className='button-colored'>Terminer</button>
                        </>
                    )}
                    {signatureData ? (
                        <div>
                            <img src={signatureData.url} alt="Signature" />
                            <p>Signé le {formatDate(new Date(signatureData.timestamp))} à {new Date(signatureData.timestamp).toLocaleTimeString('fr-FR')}</p>
                        </div>
                    )  : (
                        <div className='signature'>
                            <p className='error-message'>Veuillez signer votre feuille de route hebdomadaire dans le cadre ci-dessous.</p>
                            <p className='error-message'>{errorNoSignature}</p>
                            <ReactSignatureCanvas ref={signatureCanvasRef} canvasProps={{ width: 200, height: 150, className: 'signature-fdr' }} />
                            <button className='button-colored' onClick={handleSignFiche}>Valider</button>
                        </div>
                    )}
                </div>
            )}
           
        </div>
    )
}

export default FeuillesHebdo