
// fichier FicheDemonstration.js

import React, { useState, useEffect, useRef }                       from "react"
import { db }                                                       from "../../firebase.config"
import { doc, getDoc, getDocs, query, collection, where, addDoc }   from "firebase/firestore"
import back                                                         from "../../assets/back.png"
import jsPDF                                                        from "jspdf"
import html2canvas                                                  from "html2canvas" 
import ResultsFicheD                                                from "../ResultsFicheD" 

function Demonstration({ uid, onReturn }) {
    const [searchSalon, setSearchSalon]                             = useState("")
    const [salonInfo, setSalonInfo]                                 = useState(null)
    const [suggestions, setSuggestions]                             = useState([]) 
    const [allCR, setAllCR]                                         = useState([])
    const [showAllCR, setShowAllCr]                                 = useState(false)
    const [usersMap, setUsersMap]                                   = useState({})
    const [selectedAdress, setSelectedAdress]                       = useState("")
    const [selectedSalon, setSelectedSalon]                         = useState('')
    const pageRef                                                   = useRef()
 
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
        const searchValue = e.target.value
        setSearchSalon(searchValue)

        if (searchValue.length > 0) {
            try {
                const q = query(collection(db, "salons"), where("name", ">=", searchValue), where("name", "<=", searchValue + "\uf8ff"))
                const querySnapshot = await getDocs(q)
                const searchResults = []

                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    searchResults.push({ id: doc.id, ...data })
                })

                setSuggestions(searchResults)
            } 
            catch (error) {
                console.error("Erreur lors de la recherche du salon : ", error);
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
            setSelectedAdress(salon.address)
        }
    }  
    const handleShowAllCR = async () => {
        if (salonInfo) {
            try {
                const salonRef = doc(db, "salons", salonInfo.id)
                const salonSnapshot = await getDoc(salonRef)

                if (salonSnapshot.exists()) {
                    const data = salonSnapshot.data()
                    const allCR = data.crDemonstration || []

                    setAllCR(allCR)
                    setShowAllCr(true)
                } else {
                    console.error("Document de salon non trouvé.")
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des fiches enregistrées :", error)
            }
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

                    position += pageCanvas.height;
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
        const input = pageRef.current
        generatePDF(input, "crdemonstration-all.pdf")

        try {
            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `CR de Démonstration de ${selectedSalon} téléchargé`,
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'historique : ", error)
        }
    }

    return (
        <div className="demonstration-section">
            <div className="title-fiche">
                <h1>Formulaire du Compte rendu de RDV de Démonstration</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <div className="sugg">
                <input  className="input-sugg" type="text" placeholder="Rechercher un salon par son nom" value={searchSalon} onChange={handleSearch} />
                <div className="select-sugg">
                    {suggestions.map((salon) => (
                        <div key={salon.id} onClick={() => handleSelectSuggestion(salon)} style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }}>
                            {salon.name}
                        </div>
                    ))}
                </div>
            </div>

            {salonInfo && (
                <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px", marginBottom: "10px"}} className="button-colored" onClick={handleShowAllCR}>Voir toutes les fiches enregistrées de ce salon</button>
            )}

            {salonInfo && allCR.length > 0 && showAllCR && (
                    <div className="all-fiches-client">
                    <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setShowAllCr(false)}} >Retour</button>
                    <button style={{ padding: "10px 30px" }} onClick={downloadPDF} className='button-colored'>Télécharger les  CR de RDV</button>
                    <div ref={pageRef} style={{paddingTop: "20px", fontSize: "16px"}}>
                        <h4 style={{textAlign: "center", fontSize: "20px", marginBottom: "20px"}}>Comptes rendu de RDV de Démonstration du salon {selectedSalon}</h4>
                        {allCR.map((fiche, index) => (
                           <li key={index}>
                           <div style={{paddingLeft: "100px"}}>Enregistré le : <strong>{formatDate(fiche.createdAt)}</strong>, par <strong>{usersMap[fiche.userId].firstname} {usersMap[fiche.userId].lastname}</strong></div>
                           
                           <ResultsFicheD 
                               data={{ 
                                   name: selectedSalon,
                                   adresse: selectedAdress,
                                   city: salonInfo.city, 
                                   téléphone:  salonInfo?.phoneNumber || fiche.téléphone || "",
                                   nomPrenomDuResponsable: fiche.nomPrenomDuResponsable, 
                                   techniciennePrésente: fiche.techniciennePrésente, 
                                   nomDeLaTechnicienne: fiche.nomDeLaTechnicienne, 
                                   avecLaVRP: fiche.avecLaVRP, 
                                   seule: fiche.seule, 
                                   typeDeDémonstration: fiche.typeDeDémonstration, 
                                   duréeDeLaDémonstration: fiche.duréeDeLaDémonstration, 
                                   issueFavorable: fiche.issueFavorable, 
                                   issueDéfavorable: fiche.issueDéfavorable, 
                                   actions: fiche.actions, 
                                   précisions: fiche.précisions, 
                                   département: fiche.département, 
                                   responsablePrésent: fiche.responsablePrésent, 
                                   email: fiche.email, 
                                   nombreDeCollaborateurs: fiche.nombreDeCollaborateurs, 
                                  
                               }}
                           />
                       </li>
                            ))}
                    </div>
                </div>
            )}

        </div>
    )
}

export default Demonstration