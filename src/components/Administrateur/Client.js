// ficheClient.js

import back                                                         from "../../assets/back.png"
import { useState, useRef, useEffect }                              from "react" 
import { db }                                                       from "../../firebase.config"
import { collection, query, where, getDocs, doc, addDoc, getDoc }   from "firebase/firestore"
import jsPDF                                                        from "jspdf"
import html2canvas                                                  from "html2canvas"
import ResultsFicheClient                                           from "../ResultsFicheClient" 

function Client({ onReturn, uid }) {
    const [searchSalon, setSearchSalon]                             = useState("")
    const [salonInfo, setSalonInfo]                                 = useState(null)
    const [suggestions, setSuggestions]                             = useState([])
    const [allFiches, setAllFiches]                                 = useState([])
    const [isAllFichesVisible, setIsAllFichesVisible]               = useState(false)
    const [startDate, setStartDate]                                 = useState('')
    const [endDate, setEndDate]                                     = useState('')
    const [isViewFilteredFichesOpen, setIsViewFilteredFichesOpen]   = useState(false)
    const [filteredFiches, setFilteredFiches]                       = useState([])
    const [formVisible, setFormVisible]                             = useState(true)
    const [fichesThisYear, setFichesThisYear]                       = useState([])
    const [thisYearOpen, setThisYearOpen]                           = useState(false)
    const [selectedSalon, setSelectedSalon]                         = useState('')
    const [currentYear, setCurrentYear]                             = useState("")
    const [usersMap, setUsersMap]                                   = useState({})
    const pageRef = useRef()
    const pageRef2 = useRef()
    const pageRef3 = useRef()

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
            } 
            catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs : ", error)
            }
        }
    
        fetchUsersData()
    }, [])

    const handleSearch = async (e) => {
        const searchValue = e.target.value
        setSearchSalon(searchValue)

        if (searchValue.length > 0) {
            try {
                const q = query(collection(db, "salons"), where("name", ">=", searchValue), where("name", "<=", searchValue + "\uf8ff"))
                const querySnapshot = await getDocs(q)
                const searchResults = []

                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    if (data.status === "Client") {
                        searchResults.push({ id: doc.id, ...data })
                    }
                })
                setSuggestions(searchResults)
            } 
            catch (error) {
                console.error("Erreur lors de la recherche du salon : ", error)
            }
        } else {
            setSuggestions([])
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

    const handleShowAllFiches = async () => {
        if (salonInfo) {
            try {
                const salonRef = doc(db, "salons", salonInfo.id)
                const salonSnapshot = await getDoc(salonRef)

                if (salonSnapshot.exists()) {
                    const salonData = salonSnapshot.data()

                    setAllFiches(salonData.suiviClient || [])
                    setIsAllFichesVisible(true)
                    setFormVisible(false)
                    setThisYearOpen(false)
                } else {
                    console.error("Document de salon non trouvé.")
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des fiches de suivi : ", error)
            }
        }
    }
    const handleFilterByDate = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id)
            const salonSnapshot = await getDoc(salonRef)
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data()
                const allFiches = salonData.suiviClient || []
                const start = new Date(startDate)
                const end = new Date(endDate)
    
                const filteredFiches = allFiches.filter((fiche) => {
                    const ficheDate = fiche.createdAt instanceof Date ? fiche.createdAt : fiche.createdAt.toDate()
                    return ficheDate >= start && ficheDate <= end
                })
    
                setFilteredFiches(filteredFiches)
                setIsViewFilteredFichesOpen(true)
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
    const handleViewFichesCurrentYear = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id)
            const salonSnapshot = await getDoc(salonRef)
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data()
                const allFiches = salonData.suiviClient || []
                const currentYear = new Date().getFullYear()

                setCurrentYear(currentYear)
    
                const currentYearFiches = allFiches.filter((fiche) => {
                    const ficheDate = fiche.createdAt instanceof Date ? fiche.createdAt : fiche.createdAt.toDate()
                    return ficheDate.getFullYear() === currentYear
                })
    
                setFichesThisYear(currentYearFiches)
                setIsViewFilteredFichesOpen(false)
                setThisYearOpen(true)
                setFormVisible(false)
            } else {
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
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const canvasWidth = canvas.width
            const canvasHeight = canvas.height
            const ratio = canvasWidth / canvasHeight
            const width = pdfWidth
            const height = width / ratio
    
            let position = 0
    
            const totalPages = height > pdfHeight
            ? Math.ceil(canvasHeight / (canvasWidth * pdfHeight / pdfWidth))
            : 1
    
            const addPageNumber = (pdf, pageNumber, totalPages) => {
                pdf.setFontSize(8)
                const pageNumText = `Page ${pageNumber} / ${totalPages}`
                pdf.text(pageNumText, pdfWidth - 15, pdfHeight - 10)
            }
    
            const addDateTime = (pdf, dateTime) => {
                pdf.setFontSize(8)
                pdf.text(dateTime, pdfWidth - 50, 5)
            }
    
            if (height > pdfHeight) {
                for (let i = 0; i < totalPages; i++) {
                    const pageCanvas = document.createElement('canvas')
                    pageCanvas.width = canvasWidth
                    pageCanvas.height = canvasWidth * pdfHeight / pdfWidth

                    const pageContext = pageCanvas.getContext('2d')
                    pageContext.drawImage(canvas, 0, position, canvasWidth, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height)

                    const pageImgData = pageCanvas.toDataURL('image/png')

                    if (i > 0) {
                        pdf.addPage()
                    }

                    pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                    addPageNumber(pdf, i + 1, totalPages)

                    if (i === 0) {
                        addDateTime(pdf, formattedDate)
                    }

                    position += pageCanvas.height
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height)
                addPageNumber(pdf, 1, totalPages)
                addDateTime(pdf, formattedDate)
            }
    
            pdf.save(filename)
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error)
        })
    }
    const downloadPDF = async () => {
        const input = pageRef.current;
        generatePDF(input, "fiche-client-all.pdf")

        try {
            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `Fiche de suivi client de ${selectedSalon} téléchargée`,
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'historique : ", error)
        }
    }
    const downloadPDF2 = async () => {
        const input = pageRef2.current;
        generatePDF(input, "fiche-client-periode.pdf")

        try {
            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `Fiche de suivi client de ${selectedSalon} téléchargée`,
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'historique : ", error)
        }
    }
    const downloadPDF3 = async () => {
        const input = pageRef3.current;
        generatePDF(input, "fiche-client-annee-en-cours.pdf")

        try {
            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `Fiche de suivi client de ${selectedSalon} téléchargée`,
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'historique : ", error)
        }
    }

    return (
        <div className="fiche-client-section">
            <div className="title-fiche">
                <h1>Fiche de suivi Client</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <div className="sugg">
                <input className="input-sugg" type="text" placeholder="Rechercher un salon par son nom" value={searchSalon} onChange={handleSearch} />
                <div className="select-sugg">
                    {suggestions.map((salon) => (
                        <div key={salon.id} onClick={() => handleSelectSuggestion(salon)}
                            style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }} >
                            {salon.name}
                        </div>
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
                        <div style={{marginLeft: "20px"}} className="filter-button">
                            <button style={{marginTop: "0px", padding: "10px", fontSize: "14px"}} className="button-colored" onClick={handleShowAllFiches}>Voir toutes les fiches enregistrées</button>
                            <button style={{padding: "10px", fontSize: "14px"}} onClick={handleViewFichesCurrentYear} className="button-colored">Voir les fiches de l'année en cours</button>
                        </div>
                        
                    </div> 
                    </>
                )} 

                {salonInfo && isAllFichesVisible  &&  (
                        <div className="all-fiches-client" > 
                            <button style={{margin: "20px", marginLeft: "40px", padding: "10px 30px", marginBottom: "10px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsAllFichesVisible(false)}} >Retour</button>
                            <button style={{ padding: "10px 30px" }} onClick={downloadPDF} className='button-colored'>Télécharger les fiches clients</button>
                            <div ref={pageRef} style={{paddingTop: "20px", fontSize: "16px"}}>
                            <h4 style={{textAlign: "center", fontSize: "20px", marginBottom: "20px"}}>Fiches de suivi client du salon {selectedSalon}</h4>  
                            <ul> 
                                {allFiches.map((fiche, index) => ( 
                                      <li key={index}>
                                      <div style={{paddingLeft: "100px"}}>Enregistré le : <strong>{formatDate(fiche.createdAt)}</strong>, par <strong>{usersMap[fiche.userId].firstname} {usersMap[fiche.userId].lastname}</strong></div>
                                      
                                      <ResultsFicheClient 
                                          data={{ 
                                              name: selectedSalon,
                                              adresse: salonInfo.address,
                                              city: salonInfo.city, 
                                              téléphoneDuSalon: salonInfo.phoneNumber,
                                              nomDuResponsable: fiche.nomDuResponsable,
                                              EmailDuResponsable: fiche.EmailDuResponsable, // ??
                                              portableDuResponsable: fiche.portableDuResponsable, // ??
                                              responsablePrésent: fiche.responsablePrésent,
                                              marquesEnPlace: fiche.marquesEnPlace,
                                              équipe: fiche.équipe,
                                              clientEnContrat: fiche.clientEnContrat,
                                              typeDeContrat: fiche.typeDeContrat,
                                              tarifSpécifique: fiche.tarifSpécifique,
                                              dateDeVisite: fiche.dateDeVisite,
                                              responsablePrésente: fiche.responsablePrésente,
                                              produitsProposés: fiche.produitsProposés, // ??
                                              animationProposée: fiche.animationProposée,
                                              pointsPourLaProchaineVisite: fiche.pointsPourLaProchaineVisite,
                                              priseDeCommande: fiche.priseDeCommande,
                                              gammesCommandées: fiche.gammesCommandées,
                                              autresPointsAbordés: fiche.autresPointsAbordés, // ?? 
                                              observations: fiche.observations,
                                          }}
                                      />
                                  </li>
                            
                                ))}
                            </ul>
                            </div>
                        </div> 
                    )}

                    {salonInfo && isViewFilteredFichesOpen  && (
                        <div className="all-fiches-client">
                            <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsViewFilteredFichesOpen(false)}} >Retour</button>
                            <button style={{ padding: "10px 30px" }} onClick={downloadPDF2} className='button-colored'>Télécharger les fiches clients</button>
                            <div ref={pageRef2} style={{paddingTop: "20px", fontSize: "16px"}}>
                               <h3  style={{textAlign: "center", fontSize: "20px", marginBottom: "20px"}}>Fiches de suivi client de{selectedSalon} enregistrées entre le {formatDate2(startDate)} et le {formatDate2(endDate)}</h3>
                               <ul> 
                                {filteredFiches.map((fiche, index) => (
                                    <li key={index}>
                                    <div style={{paddingLeft: "100px"}}>Enregistré le : <strong>{formatDate(fiche.createdAt)}</strong>, par <strong>{usersMap[fiche.userId].firstname} {usersMap[fiche.userId].lastname}</strong></div>
                                    
                                    <ResultsFicheClient 
                                        data={{ 
                                            name: selectedSalon,
                                            adresse: salonInfo.address,
                                            city: salonInfo.city, 
                                            téléphoneDuSalon: salonInfo.phoneNumber,
                                            nomDuResponsable: fiche.nomDuResponsable,
                                            EmailDuResponsable: fiche.EmailDuResponsable, // ??
                                            portableDuResponsable: fiche.portableDuResponsable, // ??
                                            marquesEnPlace: fiche.marquesEnPlace,
                                            équipe: fiche.équipe,
                                            clientEnContrat: fiche.clientEnContrat,
                                            typeDeContrat: fiche.typeDeContrat,
                                            tarifSpécifique: fiche.tarifSpécifique,
                                            dateDeVisite: fiche.dateDeVisite,
                                            responsablePrésente: fiche.responsablePrésente,
                                            produitsProposés: fiche.produitsProposés, // ??
                                            animationProposée: fiche.animationProposée,
                                            pointsPourLaProchaineVisite: fiche.pointsPourLaProchaineVisite,
                                            priseDeCommande: fiche.priseDeCommande,
                                            gammesCommandées: fiche.gammesCommandées,
                                            autresPointsAbordés: fiche.autresPointsAbordés, // ?? 
                                            observations: fiche.observations,
                                        }}
                                    />
                                </li>
                                ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {salonInfo && thisYearOpen  && (
                        <div className="all-fiches-client"> 
                            <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsViewFilteredFichesOpen(false); setThisYearOpen(false)}} >Retour</button>
                            <button style={{ padding: "10px 30px" }} onClick={downloadPDF3} className='button-colored'>Télécharger les fiches client de l'année en cours</button>
                            <div ref={pageRef3} style={{paddingTop: "20px", fontSize: "16px"}}>
                               <h3  style={{textAlign: "center", fontSize: "20px", marginBottom: "20px"}}>Fiches de suivi client du salon {selectedSalon} de l'année {currentYear} </h3>
                               <ul>
                                {fichesThisYear.map((fiche, index) => (
                                   <li key={index}>
                                   <div style={{paddingLeft: "100px"}}>Enregistré le : <strong>{formatDate(fiche.createdAt)}</strong>, par <strong>{usersMap[fiche.userId].firstname} {usersMap[fiche.userId].lastname}</strong></div>
                                   
                                   <ResultsFicheClient 
                                       data={{ 
                                           name: selectedSalon,
                                           adresse: salonInfo.address,
                                           city: salonInfo.city, 
                                           téléphoneDuSalon: salonInfo.phoneNumber,
                                           nomDuResponsable: fiche.nomDuResponsable,
                                           EmailDuResponsable: fiche.EmailDuResponsable, // ??
                                           portableDuResponsable: fiche.portableDuResponsable, // ??
                                           marquesEnPlace: fiche.marquesEnPlace,
                                           équipe: fiche.équipe,
                                           clientEnContrat: fiche.clientEnContrat,
                                           typeDeContrat: fiche.typeDeContrat,
                                           tarifSpécifique: fiche.tarifSpécifique,
                                           dateDeVisite: fiche.dateDeVisite,
                                           responsablePrésente: fiche.responsablePrésente,
                                           produitsProposés: fiche.produitsProposés, // ??
                                           animationProposée: fiche.animationProposée,
                                           pointsPourLaProchaineVisite: fiche.pointsPourLaProchaineVisite,
                                           priseDeCommande: fiche.priseDeCommande,
                                           gammesCommandées: fiche.gammesCommandées,
                                           autresPointsAbordés: fiche.autresPointsAbordés, // ?? 
                                           observations: fiche.observations,
                                       }}
                                   />
                               </li>
                                ))}
                            </ul>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    )
}

export default Client