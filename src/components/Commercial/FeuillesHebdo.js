
// fichier FeuillesHebdo.js

import React, { useEffect, useState, useRef } from 'react'
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from "../../firebase.config"
import back from "../../assets/back.png"
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
    const [timeErrorMsg, setTimeErrorMsg] = useState('') 
    const [downloadDone, setDownloadDone] = useState(false)
    const [isFinalModal, setIsFinalModal] = useState(false)
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
        fetchFeuillesRoute()
        // eslint-disable-next-line
    }, [uid])
    const fetchFeuillesRoute = async () => {
        const feuillesRouteRef = collection(db, 'feuillesDeRoute')
        const q = query(feuillesRouteRef, where('userId', '==', uid))
        const querySnapshot = await getDocs(q)
    
        const feuillesRouteData = querySnapshot.docs.map(doc => ({
            id: doc.id, ...doc.data(),
        }))
    
        setFeuillesRoute(feuillesRouteData)
    }

    const getDayName = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('fr-FR', { weekday: 'long' }).charAt(0).toUpperCase() + date.toLocaleDateString('fr-FR', { weekday: 'long' }).slice(1);
    }  
    const getStartOfWeek = (date) => {
        const day = date.getDay();
        const diffToMonday = day === 0 ? 6 : day - 1;
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0); // Lundi 00h00
        return startOfWeek;
    }
    const getEndOfWeek = (startOfWeek) => {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 4); // Dimanche 23h59 voir si faut remettre sur 6 ou 5
        endOfWeek.setHours(23, 59, 59, 999);
        return endOfWeek;
    }; 
    const groupStopsByWeek = () => {
        const currentWeek = {};
        const weeks = {};

        feuillesRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000);
            const startOfWeek = getStartOfWeek(date);
            const endOfWeek = getEndOfWeek(startOfWeek);
            const weekKey = `${startOfWeek.toISOString().split('T')[0]}_${endOfWeek.toISOString().split('T')[0]}`;

            if (!weeks[weekKey]) {
                weeks[weekKey] = { startOfWeek, endOfWeek, stopsByDay: {}, totalKmByDay: {}, motifsByDay: {}};
  
                days.forEach(day => {
                    weeks[weekKey].stopsByDay[day] = [];
                    weeks[weekKey].totalKmByDay[day] = 0;
                    weeks[weekKey].motifsByDay[day] = [];
                });
            }

            const dayName = getDayName(feuille.date);
        if (weeks[weekKey].stopsByDay.hasOwnProperty(dayName)) {
            if (feuille.isVisitsStarted === false && feuille.motif) {
                weeks[weekKey].motifsByDay[dayName].push(feuille.motif);
            }

            feuille?.stops?.forEach(stop => {
                weeks[weekKey].stopsByDay[dayName].push({ ...stop, dayName });
                weeks[weekKey].totalKmByDay[dayName] += stop.distance || 0;
            });
        }

            // Check if feuille belongs to the current week
            if (isCurrentWeek(startOfWeek, endOfWeek)) { 
                currentWeek[weekKey] = weeks[weekKey];
            }
        })
        
        if (Object.keys(currentWeek).length === 0) {
            // Initialiser currentWeek avec des jours vides pour la semaine actuelle
            const today = new Date();
            const startOfWeek = getStartOfWeek(today);
            const endOfWeek = getEndOfWeek(startOfWeek);
            const weekKey = `${startOfWeek.toISOString().split('T')[0]}_${endOfWeek.toISOString().split('T')[0]}`;
    
            currentWeek[weekKey] = { startOfWeek, endOfWeek, stopsByDay: {}, totalKmByDay: {}, motifsByDay: {} };
            days.forEach(day => {
                currentWeek[weekKey].stopsByDay[day] = [];
                currentWeek[weekKey].totalKmByDay[day] = 0;
                currentWeek[weekKey].motifsByDay[day] = [];
            });
        }

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
    }
    const visitCounts = getVisitCounts();
    
    const formatDate = (date) => date?.toLocaleDateString('fr-FR', {
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

        /*
        if (day === 5 && hours >= 5 && hours <= 23) { // vendredi = 5 entre 17h et 22H 
            setIsModalOpen(true)
            setTimeErrorMsg("")
        }*/
            if ((day === 2 && hours >= 7) || (day === 6) || (day === 0)) { // Vendredi après 17h, Samedi, Dimanche
                setIsModalOpen(true)
                setTimeErrorMsg("") 
            }
        else {
            setTimeErrorMsg("Vous pouvez signer votre feuille de route chaque vendredi entre 17h et 23h.")
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
                setMessage("Veuillez télécharger votre feuille de route.")
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

    const generatePDF = (input, filename, signatureUrl) => {
        if (!input) {
            console.error('Erreur : référence à l\'élément non valide');
            return;
        }
    
        html2canvas(input, {
            useCORS: true,
            scale: 2, 
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
    
            const addSignatureAndPageNumberToPDF = (pdf, pageHeight, pageNumber, totalPages) => {
                if (signatureUrl) {
                    const signatureImg = new Image();
                    signatureImg.src = signatureUrl;
                    const signatureWidth = 15
                    const signatureHeight = 10
                    const xPos = pdfWidth - signatureWidth - 10
                    const yPos = pageHeight - signatureHeight - 10
                    pdf.addImage(signatureImg, 'PNG', xPos, yPos, signatureWidth, signatureHeight)
                }
                pdf.setFontSize(10)
                pdf.text(`Page ${pageNumber} / ${totalPages}`, pdfWidth / 2, pageHeight - 10, { align: 'center' })
            }
    
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
                    addSignatureAndPageNumberToPDF(pdf, pdfHeight, i + 1, totalPages);
                    position += pageCanvas.height;
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
                addSignatureAndPageNumberToPDF(pdf, height, 1, 1);
            }
    
            pdf.save(filename);
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    };
    
    const downloadPDF = () => {
        const input = pageRef.current;
        const signatureUrl = signatureData ? signatureData.url : null;
        generatePDF(input, "feuille-hebdomadaire.pdf", signatureUrl);
    };
    
    const handleDownloadDoc = () => {
        setIsDownloadDisplay(false)
        setTimeout(() => {
            downloadPDF()
        }, 1000)
        
        setTimeout(() => {
            setDownloadDone(true)
        }, 3000)
        //setIsSendMailOpen(true)
    }
    
    return (
        <div style={{ position: "relative" }}>
            <div className='titre-fiche'> 
                <h1>Feuille de route hebdomadaire</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <div className='hebdo-stats' style={{ marginBottom: '20px' , background: "#DCF1F2", borderRadius: "20px", display: "flex", padding: "10px 20px"}}>
                    <p style={{marginRight: "10px"}}>Nombre total de visites cette semaine <span>{visitCounts.totalVisits}</span></p>
                    <p style={{marginRight: "10px"}}>Nombre de visites clients cette semaine <span>{visitCounts.clientVisits}</span></p>
                    <p style={{marginRight: "10px"}}>Nombre de visites prospects cette semaine <span>{visitCounts.prospectVisits}</span></p>
                </div>

                {Object.keys(currentWeek).map(weekKey => {
                const { startOfWeek, endOfWeek, stopsByDay, totalKmByDay, motifsByDay } = currentWeek[weekKey];
                const totalKmAll = Object.values(totalKmByDay).reduce((acc, km) => acc + km, 0);
                const maxRows = Math.max(1, ...Object.values(stopsByDay).map(stops => stops.length),  ...days.map(day => motifsByDay[day].length > 0 ? 1 : 0));
                return (
                    <div className='hebdo' key={weekKey}>
                        <h2>{`Semaine du ${formatDate(startOfWeek)} au ${formatDate(endOfWeek)}`}</h2>
                        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: "20px", fontSize: "15px" }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '10%', background: "#3D9B9B", color: "white" }}>Total <strong>{formatDistance(totalKmAll)}</strong></th>
                                    {days.map(day => (
                                        <th key={day} style={{ width: '18%', background: "#c7c7c7" }}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: maxRows }).map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td style={{ verticalAlign: 'top', background: "#c7c7c7" }}>
                                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px" }}>
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
                                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px", height: "100%", fontSize: "14px" }}>
                                                        <p><strong>{stopsByDay[day][rowIndex].name}</strong></p><br />
                                                        <p>{stopsByDay[day][rowIndex].status}</p><br />
                                                        <p>{stopsByDay[day][rowIndex].address} {stopsByDay[day][rowIndex].postalCode} {stopsByDay[day][rowIndex].city}</p><br />
                                                        <p>{formatDistance(stopsByDay[day][rowIndex].distance)}</p><br />
                                                        <p>{stopsByDay[day][rowIndex].arrivalTime}</p><br />
                                                        <p>{stopsByDay[day][rowIndex].departureTime}</p><br />
                                                    </div>
                                                ) : (
                                                    <div style={{ height: "220px", background: "#e0e0e0", padding: "10px", textAlign: "center" }}>
                                                        {rowIndex === 0 && motifsByDay[day].length > 0 && (
                                                            <div>
                                                                <p style={{marginBottom: "5px"}}>Pas de déplacements</p>
                                                                <p>Motif : <strong>{motifsByDay[day][0]}</strong></p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
                                        <strong>Total km</strong>
                                    </td>
                                    {days.map(day => (
                                        <td key={day} style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
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
                <div  style={{ position: "absolute", width: "100%", height: "100%", background: "white", top: "0", left: "0", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className='print-page' ref={pageRef} style={{padding: "50px", display: "flex", flexDirection: "column", alignItems: "center",  width: "60%"}}>  
                    <h1 style={{ fontSize: "20px", marginBottom: "30px", marginTop: "30px", textAlign: "center" }}>Validation de la feuille de route hebdomadaire</h1>
                    <p className='soussigne' style={{ lineHeight: "25px", marginBottom: "30px", textAlign: "center", width: "70%" }}>
                        Je soussigné(e) <strong>{usersMap[feuillesRoute[0]?.userId]?.firstname} {usersMap[feuillesRoute[0]?.userId]?.lastname}</strong>, certifie l’authenticité des informations figurant sur la feuille de route ci-dessous qui rend compte des déplacements professionnels que j’ai effectué concernant la semaine du <strong>{formatDate(currentWeek[Object.keys(currentWeek)[0]]?.startOfWeek)}</strong> au <strong>{formatDate(currentWeek[Object.keys(currentWeek)[0]]?.endOfWeek)}</strong>.
                    </p>
                    
                    {Object.keys(currentWeek).map(weekKey => {
                        const { startOfWeek, endOfWeek, stopsByDay, totalKmByDay, motifsByDay } = currentWeek[weekKey];
                        const totalKmAll = Object.values(totalKmByDay).reduce((acc, km) => acc + km, 0);
                        const maxRows = Math.max(1, ...Object.values(stopsByDay).map(stops => stops.length),  ...days.map(day => motifsByDay[day].length > 0 ? 1 : 0));
                        return (
                            <div style={{width: "100%"}} className='hebdo' key={weekKey}>
                                <h2>{`Semaine du ${formatDate(startOfWeek)} au ${formatDate(endOfWeek)}`}</h2>
                                <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: "20px" }}>
                                    <thead style={{fontSize: "10px"}}>
                                        <tr>
                                            <th style={{ width: '10%', background: "#3D9B9B", color: "white" }}>Total <strong>{formatDistance(totalKmAll)}</strong></th>
                                            {days.map(day => (
                                                <th key={day} style={{ width: '18%', background: "#c7c7c7" }}>{day}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody style={{fontSize: "10px"}}>
                                        {Array.from({ length: maxRows }).map((_, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <td style={{ verticalAlign: 'top', background: "#c7c7c7" }}>
                                                    <div style={{ display: "flex", flexDirection: "column", padding: "5px" }}>
                                                        <strong>Nom</strong> 
                                                        <strong>Km</strong>
                                                    </div>
                                                </td>
                                                {days.map(day => (
                                                    <td key={day} style={{ verticalAlign: 'top', fontSize: "10px" }}>
                                                        {stopsByDay[day][rowIndex] ? (
                                                            <div style={{ display: "flex", fontSize: "10px", flexDirection: "column", padding: "5px", height: "100%"}}>
                                                                <p><strong>{stopsByDay[day][rowIndex].name}</strong></p>
                                                                <p>{formatDistance(stopsByDay[day][rowIndex].distance)}</p>
                                                            </div>
                                                        ) : (
                                                            <div style={{  fontSize: "10px", background: "#e0e0e0", padding: "10px", textAlign: "center" }}>
                                                                {rowIndex === 0 && motifsByDay[day].length > 0 && (
                                                                    <div>
                                                                        <p style={{marginBottom: "5px"}}>Pas de déplacements</p>
                                                                        <p>Motif : <strong>{motifsByDay[day][0]}</strong></p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr>
                                            <td style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
                                                <strong>Total km</strong>
                                            </td>
                                            {days.map(day => (
                                                <td key={day} style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
                                                    <strong>{formatDistance(totalKmByDay[day])}</strong>
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                    <div className='hebdo-stats-print'>
                        <p>Nombre total de visites <span>{visitCounts.totalVisits}</span></p>
                        <p>Nombre de visites clients <span>{visitCounts.clientVisits}</span></p>
                        <p>Nombre de visites prospects <span>{visitCounts.prospectVisits}</span></p>
                    </div>
                   
                    {signatureData ? (
                        <div>
                            <img style={{marginBottom: "20px", marginTop: "30px"}} src={signatureData.url} alt="Signature" />
                            <p style={{marginBottom: "20px"}}>Signé le <strong>{formatDate(new Date(signatureData.timestamp))}</strong> à <strong>{new Date(signatureData.timestamp).toLocaleTimeString('fr-FR')}</strong></p>
                        </div>
                    )  : (   
                        <div className='signature'>
                            <p style={{marginBottom : "5px", marginTop: "10px"}} className='error-message'>Veuillez signer votre feuille de route hebdomadaire dans le cadre ci-dessous.</p>
                            <p className='error-message'>{errorNoSignature}</p>
                            <ReactSignatureCanvas ref={signatureCanvasRef} canvasProps={{ width: 200, height: 120, className: 'signature-fdr' }} />
                            <button style={{width: "200px"}} className='button-colored' onClick={handleSignFiche}>Valider</button>
                        </div>
                    )}
                    {isDownloadDisplay && (
                        <div className='modal'>
                        <div className='modal-content'>
                            <button style={{marginBottom: "20px"}} onClick={handleDownloadDoc} className='button-colored'>Télécharger</button>
                            <p style={{marginBottom: "10px", background: "red", color: "white", padding: "5px"}}>{message}</p>
                        </div>
                        </div>
                        
                    )}

                    {downloadDone && (
                        <button className='button-colored' onClick={() => setIsFinalModal(true)} >Terminer</button>
                    )}

                    {isFinalModal && (
                        <div className='modal'>
                        <div className='modal-content'>
                        <p style={{marginBottom: "20px"}}>N'oubliez pas d'envoyer votre feuilles de route hebdomadaire par e-mail à l'adresse suivante : </p>
                            <p style={{marginBottom: "30px", fontWeight: "bold"}}>fdr@dsh-application.com</p>
                            <button style={{marginBottom: "20px"}} onClick={onReturn} className='button-colored'>Fermer</button> 
                        </div>
                        </div>
                    )} 
                    </div> 
                </div>
            )}
           
        </div>
    )
}

export default FeuillesHebdo