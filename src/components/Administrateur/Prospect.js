
// Fichier Prospect.js

import back                                                         from "../../assets/back.png"
import { useState, useRef, useEffect }                              from "react"
import { db }                                                       from "../../firebase.config"
import { collection, query, where, getDocs, doc, addDoc, getDoc }   from "firebase/firestore"
import jsPDF                                                        from "jspdf"
import html2canvas                                                  from "html2canvas" 
import ResultsFiches                                                from "../ResultsFiches"

function Prospect({uid, onReturn}) {
    const [searchSalon, setSearchSalon]                             = useState("")
    const [salonInfo, setSalonInfo]                                 = useState(null)
    const [suggestions, setSuggestions]                             = useState([])
    const [allFiches, setAllFiches]                                 = useState([])
    const [startDate, setStartDate]                                 = useState('')
    const [endDate, setEndDate]                                     = useState('')
    const [isViewAllFichesOpen, setIsViewAllFichesOpen]             = useState(false)
    const [isViewFilteredFichesOpen, setIsViewFilteredFichesOpen]   = useState(false)
    const [filteredFiches, setFilteredFiches]                       = useState([])
    const [formVisible, setFormVisible]                             = useState(true)
    const [fichesThisYear, setFichesThisYear]                       = useState([])
    const [thisYearOpen, setThisYearOpen]                           = useState(false)
    const [selectedSalon, setSelectedSalon]                         = useState('')
    const [currentYear, setCurrentYear]                             = useState("")
    const [usersMap, setUsersMap]                                   = useState({})
    
    const pageRef                                                   = useRef()
    const pageRef2                                                  = useRef()
    const pageRef3                                                  = useRef()

    const createdAt                                                 = new Date()

    useEffect(() => {
        const fetchUsersData = async () => {
            const usersData = {}

            try {
                const usersSnapshot = await getDocs(collection(db, 'users'))

                usersSnapshot.forEach((doc) => {
                    const userData = doc.data()
                    usersData[doc.id] = { firstname: userData.firstname, lastname: userData.lastname }
                })

                setUsersMap(usersData)
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs : ", error)
            }
        }
    
        fetchUsersData()
    }, [])

    const handleSearch = async (e) => {
        const searchValue = e.target.value;
        setSearchSalon(searchValue);

        if (searchValue.length > 0) {
            try {
                const q = query(collection(db, "salons"), where("name", ">=", searchValue), where("name", "<=", searchValue + "\uf8ff"));
                const querySnapshot = await getDocs(q);
                const searchResults = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.status === "Prospect") {
                        searchResults.push({ id: doc.id, ...data });
                    }
                }); 
                setSuggestions(searchResults);
                
            } catch (error) {
                console.error("Erreur lors de la recherche du salon : ", error);
            }
        } else {
            setSuggestions([]);
        }
    }
    const handleSelectSuggestion = async (salon) => {
        setSalonInfo(salon)
        setSuggestions([])

        const salonRef = doc(db, "salons", salon.id)
        const salonSnapshot = await getDoc(salonRef)

        if (salonSnapshot.exists()) {
            setSelectedSalon(salon.name)
        }
    }

    const handleViewAllFiches = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id)
            const SalonSnapshot = await getDoc(salonRef)
            
            if (SalonSnapshot.exists()) {
                const salonData = SalonSnapshot.data()
                const allFiches = salonData.suiviProspect || [] 

                setAllFiches(allFiches)
                setIsViewAllFichesOpen(true)
                setFormVisible(false)
                setThisYearOpen(false)
            } 
            else {
                console.error("Document de visite non trouvé.")
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error)
        }
    }
    const handleFilterByDate = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id)
            const salonSnapshot = await getDoc(salonRef)
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data()
                const allFiches = salonData.suiviProspect || []
                const start = new Date(startDate)
                const end = new Date(endDate)
      
                const filteredFiches = allFiches.filter((fiche) => {
                    const ficheDate = fiche.createdAt instanceof Date ? fiche.createdAt : fiche.createdAt.toDate()
                    console.log("Date de la fiche : ", ficheDate)
                    return ficheDate >= start && ficheDate <= end
                })
    
                setFilteredFiches(filteredFiches)
                setIsViewFilteredFichesOpen(true)
                setFormVisible(false)
                setThisYearOpen(false)
            } else {
                console.error("Document de visite non trouvé.")
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error)
        }
    }
    const handleViewFichesCurrentYear = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id)
            const salonSnapshot = await getDoc(salonRef)
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data()
                const allFiches = salonData.suiviProspect || []
                const currentYear = new Date().getFullYear()
                
                setCurrentYear(currentYear)

                const currentYearFiches = allFiches.filter((fiche) => {
                const ficheDate = fiche.createdAt instanceof Date ? fiche.createdAt : fiche.createdAt.toDate()
                    return ficheDate.getFullYear() === currentYear
                })
    
                setFichesThisYear(currentYearFiches)
                setIsViewFilteredFichesOpen(false)
                setFormVisible(false)
                setThisYearOpen(true)
            } 
            else {
                console.error("Document de visite non trouvé.")
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error)
        }
    }
    const formatDate = (date) => {
        if (!date || !date.seconds) {
            return 'Date non disponible'
        }

        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

        const d = new Date(date.seconds * 1000)
        const dayName = days[d.getUTCDay()]
        const day = d.getUTCDate()
        const month = months[d.getUTCMonth()]
        const year = d.getUTCFullYear()

        return `${dayName} ${day} ${month} ${year}`
    }
    const formatDate2 = (dateStr) => {
        const date = new Date(dateStr)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()

        return `${day}/${month}/${year}`
    }

    const generatePDF = (input, filename) => {
        if (!input) {
            console.error('Erreur : référence à l\'élément non valide')
            return
        }
    
        const currentDate = new Date()
        const formattedDate = `Téléchargé le ${currentDate.toLocaleDateString()} à ${currentDate.toLocaleTimeString()}`
    
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
    
            const totalPages = height > pdfHeight
                ? Math.ceil(canvasHeight / (canvasWidth * pdfHeight / pdfWidth))
                : 1;
    
            const addPageNumber = (pdf, pageNumber, totalPages) => {
                pdf.setFontSize(8);
                const pageNumText = `Page ${pageNumber} / ${totalPages}`;
                pdf.text(pageNumText, pdfWidth - 15, pdfHeight - 10);
            };
    
            const addDateTime = (pdf, dateTime) => {
                pdf.setFontSize(8);
                pdf.text(dateTime, pdfWidth - 50, 5);
            };
    
            if (height > pdfHeight) {
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
                    addPageNumber(pdf, i + 1, totalPages);
                    if (i === 0) {
                        addDateTime(pdf, formattedDate);
                    }
                    position += pageCanvas.height;
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
                addPageNumber(pdf, 1, totalPages);
                addDateTime(pdf, formattedDate);
            }
    
            pdf.save(filename);
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    }
    const downloadPDF = async () => {
        const input = pageRef.current;
        generatePDF(input, "fiche-prospect-all.pdf")

        try {
            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `Fiche de suivi prospect de ${selectedSalon} téléchargée`,
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'historique : ", error)
        }
    }
    const downloadPDF2 = async () => {
        const input = pageRef2.current;
        generatePDF(input, "fiche-prospect-periode.pdf")

        try {
            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `Fiche de suivi prospect de ${selectedSalon} téléchargée`,
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'historique : ", error)
        }
    }
    const downloadPDF3 = async () => {
        const input = pageRef3.current;
        generatePDF(input, "fiche-prospect-annee-en-cours.pdf")

        try {
            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `Fiche de suivi prospect de ${selectedSalon} téléchargée`,
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'historique : ", error)
        }
    }
    
    return (
        <div className="fiche-prospect-section">
            <div className="title-fiche">
                <h1>Fiche de suivi Prospect</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>
            <div className="sugg">
                <input  className="input-sugg" type="text" placeholder="Rechercher un salon par son nom" value={searchSalon} onChange={handleSearch} />
                <div  className="select-sugg">
                    {suggestions.map((salon) => (
                        <div key={salon.id} onClick={() => handleSelectSuggestion(salon)} style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }} >{salon.name}</div>
                    ))}
                </div>

                {salonInfo && formVisible && (
                    <>
                    <div className="filter-client">
                        <div className="filter-input">
                            <div>
                                <label className="label">Date de début</label><br></br>
                                <input type="date" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Date de fin</label><br></br>
                                <input type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            
                            <button className="button-colored" onClick={handleFilterByDate}>Filtrer par période</button>
                        </div>
                        <div className="filter-button">
                            <button style={{marginTop: "0px", padding: "10px", fontSize: "14px"}} className="button-colored" onClick={handleViewAllFiches}>Voir toutes les fiches enregistrées</button>
                            <button style={{padding: "10px", fontSize: "14px"}} onClick={handleViewFichesCurrentYear} className="button-colored">Voir les fiches de l'année en cours</button>
                        </div>
                    </div> 
                    </>
                )}
            </div>  
            {salonInfo && isViewAllFichesOpen && (
                    <div className="all-fiches-client">
                        <button style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsViewAllFichesOpen(false)}} >Retour</button>
                        <button style={{ padding: "10px 30px" }} onClick={downloadPDF} className='button-colored'>Télécharger les fiches prospect</button>
                        <div ref={pageRef} style={{paddingTop: "20px", fontSize: "16px"}}>
                            <h4 style={{textAlign: "center", fontSize: "20px", marginBottom: "20px"}}>Fiches de suivi prospect du salon {selectedSalon}</h4>
                            <ul>
                                {allFiches.map((fiche, index) => (
                                    <li key={index}>
                                        <div style={{paddingLeft: "100px"}}>Enregistré le : <strong>{formatDate(fiche.createdAt)}</strong>, par <strong>{usersMap[fiche.userId].firstname} {usersMap[fiche.userId].lastname}</strong></div>
                                        
                                        <ResultsFiches 
                                            data={{ 
                                                name: selectedSalon,
                                                adresse: salonInfo.address,
                                                city: salonInfo.city, 
                                                département: salonInfo.department, 
                                                téléphoneDuSalon:  salonInfo.phoneNumber || fiche.téléphoneDuSalon,
                                                tenueDuSalon: fiche.tenueDuSalon,
                                                salonTenuPar: fiche.salonTenuPar,
                                                nombreDePersonnes: fiche.nombreDePersonnes, // à ajouter 
                                                jFture: fiche.jFture,
                                                responsablePrésent: fiche.responsablePrésent,
                                                nomDuResponsable: fiche.nomDuResponsable,
                                                âgeDuResponsable: fiche.âgeDuResponsable,
                                                numéroDuResponsable: fiche.numéroDuResponsable,
                                                emailDuResponsable: fiche.emailDuResponsable,
                                                facebook: fiche.facebook,
                                                instagram: fiche.instagram,
                                                dateDeVisite: fiche.dateDeVisite,
                                                origineDeLaVisite: fiche.origineDeLaVisite,
                                                conceptsProposés: fiche.conceptsProposés,
                                                animationProposée: fiche.animationProposée,
                                                pointsPourLaProchaineVisite: fiche.pointsPourLaProchaineVisite,
                                                intéressésPar: fiche.intéressésPar,

                                                colorationsAvecAmmoniaque: fiche.colorationsAvecAmmoniaque,
                                                colorationsSansAmmoniaque: fiche.colorationsSansAmmoniaque,
                                                colorationsVégétales: fiche.colorationsVégétales,
                                                autresMarques: fiche.autresMarques,

                                                autresPoints: fiche.autresPoints,
                                                observations: fiche.observations,
                                                statut: fiche.statut,
                                                aRevoir: fiche.aRevoir, // ?? 
                                                rdvObtenu: fiche.rdvObtenu,
                                                rdvPrévuLe: fiche.rdvPrévuLe,
                                                typeDeRdv: fiche.typeDeRdv,
                                                typeDeDémonstration: fiche.typeDeDémonstration,
                                                commande: fiche.commande,
                                                savedAt: createdAt,
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul> 
                        </div>
                    </div>
            )}

            {salonInfo && isViewFilteredFichesOpen && (
                    <div className="all-fiches-client">
                        <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsViewFilteredFichesOpen(false)}} >Retour</button>
                        <button style={{ padding: "10px 30px" }} onClick={downloadPDF2} className='button-colored'>Télécharger les fiches prospect</button>
                        <div ref={pageRef2} style={{paddingTop: "20px", fontSize: "16px"}}>
                        <h3  style={{textAlign: "center", fontSize: "20px", marginBottom: "20px"}}>Fiches prospect du salon {selectedSalon} enregistrées entre le {formatDate2(startDate)} et le {formatDate2(endDate)}</h3>
                            <ul>
                                {filteredFiches.map((fiche, index) => (
                                    <li key={index}>
                                    <div style={{paddingLeft: "100px"}}>Enregistré le : <strong>{formatDate(fiche.createdAt)}</strong>, par <strong>{usersMap[fiche.userId].firstname} {usersMap[fiche.userId].lastname}</strong></div>
                                    
                                    <ResultsFiches 
                                        data={{ 
                                            name: selectedSalon,
                                            adresse: salonInfo.address,
                                            city: salonInfo.city, 
                                            département: salonInfo.department, 
                                            téléphoneDuSalon:  salonInfo.phoneNumber || fiche.téléphoneDuSalon,
                                            tenueDuSalon: fiche.tenueDuSalon,
                                            salonTenuPar: fiche.salonTenuPar,
                                            nombreDePersonnes: fiche.nombreDePersonnes, // à ajouter 
                                            jFture: fiche.jFture,
                                            responsablePrésent: fiche.responsablePrésent,
                                            nomDuResponsable: fiche.nomDuResponsable,
                                            âgeDuResponsable: fiche.âgeDuResponsable,
                                            numéroDuResponsable: fiche.numéroDuResponsable,
                                            emailDuResponsable: fiche.emailDuResponsable,
                                            facebook: fiche.facebook,
                                            instagram: fiche.instagram,
                                            dateDeVisite: fiche.dateDeVisite,
                                            origineDeLaVisite: fiche.origineDeLaVisite,
                                            conceptsProposés: fiche.conceptsProposés,
                                            animationProposée: fiche.animationProposée,
                                            pointsPourLaProchaineVisite: fiche.pointsPourLaProchaineVisite,
                                            intéressésPar: fiche.intéressésPar,

                                            colorationsAvecAmmoniaque: fiche.colorationsAvecAmmoniaque,
                                            colorationsSansAmmoniaque: fiche.colorationsSansAmmoniaque,
                                            colorationsVégétales: fiche.colorationsVégétales,
                                            autresMarques: fiche.autresMarques,

                                            autresPoints: fiche.autresPoints,
                                            observations: fiche.observations,
                                            statut: fiche.statut,
                                            aRevoir: fiche.aRevoir, // ?? 
                                            rdvObtenu: fiche.rdvObtenu,
                                            rdvPrévuLe: fiche.rdvPrévuLe,
                                            typeDeRdv: fiche.typeDeRdv,
                                            typeDeDémonstration: fiche.typeDeDémonstration,
                                            commande: fiche.commande,
                                            savedAt: createdAt,
                                        }}
                                    />
                                </li>
                                ))}
                            </ul>
                        </div>     
                    </div>
            )}

            {salonInfo  && thisYearOpen && (
                    <div className="all-fiches-client">
                        <button style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setThisYearOpen(false)}} >Retour</button>
                        <button style={{ padding: "10px 30px" }} onClick={downloadPDF3} className='button-colored'>Télécharger les fiches prospect de l'année en cours</button>
                            <div ref={pageRef3} style={{paddingTop: "20px", fontSize: "16px"}}>
                            <h4 style={{textAlign: "center", fontSize: "20px", marginBottom: "20px"}}>Fiches de suivi prospect du salon {selectedSalon} du mois de {currentYear}</h4>
                            <ul>
                                {fichesThisYear.map((fiche, index) => (
                                  <li key={index}>
                                  <div style={{paddingLeft: "100px"}}>Enregistré le : <strong>{formatDate(fiche.createdAt)}</strong>, par <strong>{usersMap[fiche.userId].firstname} {usersMap[fiche.userId].lastname}</strong></div>
                                  
                                  <ResultsFiches 
                                      data={{ 
                                          name: selectedSalon,
                                          adresse: salonInfo.address,
                                          city: salonInfo.city, 
                                          département: salonInfo.department, 
                                          téléphoneDuSalon:  salonInfo.phoneNumber || fiche.téléphoneDuSalon,
                                          tenueDuSalon: fiche.tenueDuSalon,
                                          salonTenuPar: fiche.salonTenuPar,
                                          nombreDePersonnes: fiche.nombreDePersonnes, // à ajouter 
                                          jFture: fiche.jFture,
                                          responsablePrésent: fiche.responsablePrésent,
                                          nomDuResponsable: fiche.nomDuResponsable,
                                          âgeDuResponsable: fiche.âgeDuResponsable,
                                          numéroDuResponsable: fiche.numéroDuResponsable,
                                          emailDuResponsable: fiche.emailDuResponsable,
                                          facebook: fiche.facebook,
                                          instagram: fiche.instagram,
                                          dateDeVisite: fiche.dateDeVisite,
                                          origineDeLaVisite: fiche.origineDeLaVisite,
                                          conceptsProposés: fiche.conceptsProposés,
                                          animationProposée: fiche.animationProposée,
                                          pointsPourLaProchaineVisite: fiche.pointsPourLaProchaineVisite,
                                          intéressésPar: fiche.intéressésPar,

                                          colorationsAvecAmmoniaque: fiche.colorationsAvecAmmoniaque,
                                          colorationsSansAmmoniaque: fiche.colorationsSansAmmoniaque,
                                          colorationsVégétales: fiche.colorationsVégétales,
                                          autresMarques: fiche.autresMarques,

                                          autresPoints: fiche.autresPoints,
                                          observations: fiche.observations,
                                          statut: fiche.statut,
                                          aRevoir: fiche.aRevoir, // ?? 
                                          rdvObtenu: fiche.rdvObtenu,
                                          rdvPrévuLe: fiche.rdvPrévuLe,
                                          typeDeRdv: fiche.typeDeRdv,
                                          typeDeDémonstration: fiche.typeDeDémonstration,
                                          commande: fiche.commande,
                                          savedAt: createdAt,
                                      }}
                                  />
                              </li>
                                ))}
                            </ul>
                        </div>
                    </div>
            )}
            
        </div>
    )
}

export default Prospect