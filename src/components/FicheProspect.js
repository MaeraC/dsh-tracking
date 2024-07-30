
// Fichier FicheProspect.js

import back                                                                     from "../assets/back.png"
import plus                                                         from "../assets/plusplus.png"
import { useState, useCallback, useRef, useEffect } from "react"
import { db } from "../firebase.config"
import { collection, query, where, getDocs, doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore"
import jsPDF from "jspdf"
import html2canvas from "html2canvas" 
import ResultsFiches from "./ResultsFiches"

function FicheProspect({uid, onReturn}) {
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [message, setMessage] = useState("")
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [allFiches, setAllFiches] = useState([])
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isViewAllFichesOpen, setIsViewAllFichesOpen] = useState(false)
    const [isViewFilteredFichesOpen, setIsViewFilteredFichesOpen] = useState(false)
    const [filteredFiches, setFilteredFiches] = useState([])
    // eslint-disable-next-line
    const [rdvPresentationCount, setRdvPresentationCount] = useState(0)
    const [formVisible, setFormVisible] = useState(true)
    const [fichesThisYear, setFichesThisYear] = useState([])
    const [thisYearOpen, setThisYearOpen] = useState(false)
    const [selectedSalon, setSelectedSalon] = useState('')
    const [currentYear, setCurrentYear] = useState("")
    const [usersMap, setUsersMap] = useState({})
    const [otherDemonstration, setOtherDemonstration] = useState('');
    const [isOtherChecked, setIsOtherChecked] = useState(false);
    
    const pageRef = useRef()
    const pageRef2 = useRef()
    const pageRef3 = useRef()

    const createdAt = new Date()

    const initialFormData = { 
        adresseDuSalon: "",
        téléphoneDuSalon: "",
        département: "",
        tenueDuSalon: "",
        salonTenuPar: "",
        nombreDePersonnes:  "",
        jFture: "",
        nomDuResponsable: "",
        âgeDuResponsable: "",
        numéroDuResponsable: "",
        emailDuResponsable: "",
        facebook: "",
        instagram: "",
        origineDeLaVisite: "",
        colorationsAvecAmmoniaque: [],
        colorationsSansAmmoniaque: [],
        colorationsVégétales: [],
        autresMarques: {
            poudre: "",
            permanente: "",
            bac: "",
            revente: ""
        },
        dateDeVisite: "",
        responsablePrésent: "",
        conceptsProposés: "",
        animationProposée: "",
        pointsPourLaProchaineVisite: "",
        intéressésPar: "",
        autresPoints: "",
        observations: "",
        statut: "",
        rdvObtenu: "",
        rdvPrévuLe: "",
        rdvPrévuPour: "",
        typeDeRdv: "",
        typeDeDémonstration: [],
        commande: "",
        createdAt: createdAt,
        typeOfForm: "Fiche de suivi Prospect",
        userId: uid,
    }
    const [formData, setFormData] = useState(initialFormData) 

    useEffect(() => {
        const fetchUsersData = async () => {
            const usersData = {};
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.forEach((doc) => {
                    const userData = doc.data();
                    usersData[doc.id] = { firstname: userData.firstname, lastname: userData.lastname, departments: userData.departments }; // Assurez-vous que les champs firstname et lastname existent
                });
                setUsersMap(usersData)
            } catch (error) {
                    console.error("Erreur lors de la récupération des utilisateurs : ", error);
            }
        };
    
        fetchUsersData()
    }, [])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            if (name === "otherDemonstrationCheckbox") {
                setIsOtherChecked(checked);
                if (!checked) {
                    setOtherDemonstration('');
                }
            } else {
                const newTypeDeDémonstration = checked
                    ? [...formData.typeDeDémonstration, value]
                    : formData.typeDeDémonstration.filter(item => item !== value);
                setFormData({ ...formData, typeDeDémonstration: newTypeDeDémonstration });
            }
        } else {
            let updatedFormData = { ...formData, [name]: value };
            
            // Reset typeDeDémonstration if typeDeRdv changes to anything other than "Démonstration"
            if (name === "typeDeRdv" && value !== "Démonstration") {
                updatedFormData.typeDeDémonstration = [];
            }
            
            setFormData(updatedFormData);
        }
    };
    
    const handleOtherDemonstrationChange = (e) => {
        setOtherDemonstration(e.target.value);
    };
    
    const handleOtherDemonstrationBlur = () => {
        if (isOtherChecked && otherDemonstration.trim() !== '') {
            setFormData({
                ...formData,
                typeDeDémonstration: [...formData.typeDeDémonstration, otherDemonstration.trim()]
            });
        }
    };
    
    const handleAddColorationAmmoniaque = () => {
        setFormData({
            ...formData,
            colorationsAvecAmmoniaque: [...formData.colorationsAvecAmmoniaque, { nom: "", prix: "", ml: "" }]
        })
    }
    const handleAddColorationSansAmmoniaque = () => {
        setFormData({
            ...formData,
            colorationsSansAmmoniaque: [...formData.colorationsSansAmmoniaque, { nom: "", prix: "", ml: "" }]
        })
    }
    const handleAddColorationVegetale = () => {
        setFormData({
            ...formData,
            colorationsVégétales: [...formData.colorationsVégétales, { nom: "", prix: "", ml: "" }]
        })
    }
    const handleColorationChange = (index, type, field, value) => {
        const newColorations = formData[type].map((coloration, i) => {
            if (i === index) {
                return { ...coloration, [field]: value }
            }
            return coloration;
        })

        setFormData({ ...formData, [type]: newColorations })
    }

    const normalizeString = (str) => {
        return str
            .replace(/département\s*/i, "")
            .toLowerCase()
            .trim()
    }

    const [buttonType, setButtonType] = useState("");

    const checkIfFicheExistsForToday = async (salonId) => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
    
        const salonRef = doc(db, "salons", salonId);
        const salonSnapshot = await getDoc(salonRef);
    
        if (salonSnapshot.exists()) { 
            const salonData = salonSnapshot.data();
            const suiviProspect = salonData.suiviProspect || [];
    
            return suiviProspect.find(fiche => {
                const ficheDate = fiche.createdAt.toDate(); // Assurez-vous que createdAt est un Timestamp
                return ficheDate >= todayStart && ficheDate <= todayEnd;
            });
        }
        return null;
    }

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
                        const salonDepartment = data.department || "" 
                        const userDepartments = usersMap[uid]?.departments || []

                        const normalizedDepartment = normalizeString(salonDepartment)
                        const normalizedUserDepartments = userDepartments.map(normalizeString)
                        
                        if (normalizedUserDepartments.includes(normalizedDepartment)) {
                            searchResults.push({ id: doc.id, ...data });
                        }
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
            const data = salonSnapshot.data()
            const suiviProspect = data.suiviProspect ? data.suiviProspect[data.suiviProspect.length - 1] : {}
            
            setFormData({
                adresse: salon.address || "",
                city: salon.city || "",
                name: salon.name || "",
                postalCode: salon.postalCode || "",
                département: salon.department || "",
                téléphoneDuSalon:  salon.phoneNumber || suiviProspect.téléphoneDuSalon ||  "",
                tenueDuSalon: suiviProspect.tenueDuSalon || "",
                salonTenuPar: suiviProspect.salonTenuPar || "",
                nombreDePersonnes: suiviProspect.nombreDePersonnes || "",
                jFture: suiviProspect.jFture || "",
                nomDuResponsable: suiviProspect.nomDuResponsable ||  "",
                âgeDuResponsable: suiviProspect.âgeDuResponsable || "",
                numéroDuResponsable: suiviProspect.numéroDuResponsable || "",
                emailDuResponsable: suiviProspect.emailDuResponsable || "",
                facebook: suiviProspect.facebook || "",
                instagram: suiviProspect.instagram || "",
                origineDeLaVisite:  "",
                colorationsAvecAmmoniaque:  [],
                colorationsSansAmmoniaque:  [],
                colorationsVégétales: [],
                autresMarques: {
                    poudre:   "",
                    permanente:   "",
                    bac:   "",
                    revente:  ""
                },
                dateDeVisite:  "",
                responsablePrésent:  "",
                conceptsProposés:  "",
                animationProposée: "",
                intéressésPar:  "",
                autresPoints: "",
                statut:  "",
                rdvObtenu:  "",
                rdvPrévuLe:  "",
                rdvPrévuPour:  "",
                typeDeRdv:  "",
                typeDeDémonstration:  [],
                commande:  "",
                pointsPourLaProchaineVisite:  "",
                observations:  "",
                createdAt: createdAt,
                typeOfForm: "Fiche de suivi Prospect",
                userId: uid,
            })

            const ficheExists = await checkIfFicheExistsForToday(salon.id);
            setButtonType(ficheExists ? "update" : "new");
        }
    }
    const updateSalonHistory = useCallback(async (updatedData) => {
        if (salonInfo) {
            try {
                const salonRef = doc(db, "salons", salonInfo.id);
                const salonSnapshot = await getDoc(salonRef);
    
                if (salonSnapshot.exists()) {
                    const salonData = salonSnapshot.data();
                    const newHistoryEntry = [
                        ...(salonData.historique || []),
                        {
                            date: new Date(), action: "Mise à jour de la Fiche de suivi Prospect", formData: updatedData, userId: uid
                        }
                    ];
    
                    await updateDoc(salonRef, { historique: newHistoryEntry });
                } else {
                    console.error("Document de visite non trouvé.");
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'historique du salon : ", error);
            }
        }
    }, [salonInfo, uid])

    const handleSubmit = async (e) => {
            e.preventDefault();
        
            try {
                const salonRef = doc(db, "salons", salonInfo.id);
                const salonSnapshot = await getDoc(salonRef);
        
                if (salonSnapshot.exists()) {
                    const salonData = salonSnapshot.data();
                    let updatedSuiviProspect;
        
                    if (buttonType === "new") {
                        // Enregistrer une nouvelle fiche
                        updatedSuiviProspect = [...(salonData.suiviProspect || []), formData];
                    } else if (buttonType === "update") {
                        // Mettre à jour la fiche existante pour aujourd'hui
                        updatedSuiviProspect = salonData.suiviProspect.map(fiche =>
                            fiche.createdAt.toDate().toDateString() === new Date().toDateString()
                                ? formData
                                : fiche
                        );
                    }
        
                    await updateDoc(salonRef, { suiviProspect: updatedSuiviProspect });
                    await updateSalonHistory(formData);
        
                    setMessage("Fiche de suivi Prospect " + (buttonType === "new" ? "enregistrée" : "mise à jour") + " avec succès !");
                    setIsModalOpen(true);
        
                    if (formData.commande === "OUI") {
                        await updateDoc(salonRef, { 
                            status: "Client",
                            historique: arrayUnion({ date: new Date(), action: "Status mis à jour : Client", userId: uid })
                        });
                        setIsOpenModal(true);
                        setIsModalOpen(false);
                    }
                } else {
                    console.error("Document de visite non trouvé.");
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour du salon : ", error);
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
            } else {
                console.error("Document de visite non trouvé.")
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error)
        }
    }
    const handleFilterByDate = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id);
            const salonSnapshot = await getDoc(salonRef);
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data();
                const allFiches = salonData.suiviProspect || [];
    
                  // Convertir les dates de début et de fin en objets Date
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  end.setHours(23, 59, 59, 999)
      
                  // Filtrer les fiches par période
                  const filteredFiches = allFiches.filter((fiche) => {
                      const ficheDate = fiche.createdAt instanceof Date ? fiche.createdAt : fiche.createdAt.toDate();
                      console.log("Date de la fiche : ", ficheDate);
                      return ficheDate >= start && ficheDate <= end;
                  });

                 // Calcul du nombre de rdv de présentation
                const rdvPresentationCount = filteredFiches.reduce((total, fiche) => {
                    return total + (fiche.crPresentation ? fiche.crPresentation.length : 0);
                }, 0);
    
                setFilteredFiches(filteredFiches);
                setIsViewFilteredFichesOpen(true);
                setRdvPresentationCount(rdvPresentationCount)
                setFormVisible(false)
                setThisYearOpen(false)
            } else {
                console.error("Document de visite non trouvé.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error);
        }
    }
    const handleViewFichesCurrentYear = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id);
            const salonSnapshot = await getDoc(salonRef);
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data();
                const allFiches = salonData.suiviProspect || []
                const currentYear = new Date().getFullYear();
                setCurrentYear(currentYear)
               const currentYearFiches = allFiches.filter((fiche) => {
                const ficheDate = fiche.createdAt instanceof Date ? fiche.createdAt : fiche.createdAt.toDate();
                return ficheDate.getFullYear() === currentYear;
            });
    
                setFichesThisYear(currentYearFiches); 
                setIsViewFilteredFichesOpen(false);
                setRdvPresentationCount(rdvPresentationCount)
                setFormVisible(false)
                setThisYearOpen(true)
            } else {
                console.error("Document de visite non trouvé.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error);
        }
    }
 
    const formatDate2 = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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
    const downloadPDF = () => {
        const input = pageRef.current;
        generatePDF(input, "fiche-prospect-all.pdf")
    }
    const downloadPDF2 = () => {
        const input = pageRef2.current;
        generatePDF(input, "fiche-prospect-periode.pdf")
    }
    const downloadPDF3 = () => {
        const input = pageRef3.current;
        generatePDF(input, "fiche-prospect-annee-en-cours.pdf")
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
                        <div key={salon.id} onClick={() => handleSelectSuggestion(salon)} style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }} >{salon.name + ", " + salon.city}</div>
                    ))}
                </div>

                {salonInfo && formVisible && (
                    <>
                    <p className="visible">Si vous souhaitez visionner les fiches enregistrées dans un format adapté, veuillez effectuer votre recherche sur un ordinateur.</p>
                    <div className="filter-client invisible">
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

                    <form onSubmit={handleSubmit}>
                        <div className="form-FSP">
                            <h2>{salonInfo.name}</h2>
                            <p className="adress">{salonInfo.address}</p>
                            <p className="city">{salonInfo.city}</p>
                            <p style={{color: "grey", textAlign: "center", textTransform: "uppercase", marginBottom: "30px", marginTop: "10px"}}>{salonInfo.department}</p>

                            <input type="text" name="téléphoneDuSalon" placeholder="Téléphone fixe" value={formData.téléphoneDuSalon} onChange={handleInputChange} />
                            <input type="text" name="jFture" placeholder="J.Fture" value={formData.jFture} onChange={handleInputChange} /><br></br><br></br>
                    
                            <div className="space">
                                <label className="bold margin">Tenue du salon :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="tenueDuSalon" value="Très bien" checked={formData.tenueDuSalon === "Très bien"} onChange={handleInputChange} />Très bien</label><br></br>
                                    <label className="margin" ><input className="checkbox" type="radio" name="tenueDuSalon" value="Moyenne" checked={formData.tenueDuSalon === "Moyenne"} onChange={handleInputChange} />Moyenne</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="tenueDuSalon" value="Mauvaise" checked={formData.tenueDuSalon === "Mauvaise"} onChange={handleInputChange} />Mauvaise</label><br></br>
                                </div>
                            </div><br></br>
                
                            <div className="space">
                                <label className="bold margin">Salon tenu par :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="salonTenuPar" value="Proprétaire" checked={formData.salonTenuPar === "Proprétaire"} onChange={handleInputChange} />Proprétaire</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="salonTenuPar" value="Salarié" checked={formData.salonTenuPar === "Salarié"} onChange={handleInputChange} />Salarié</label>
                                </div>
                            </div><br></br>
                            <input type="text" name="nombreDePersonnes" placeholder="Nombre de personnes" value={formData.nombreDePersonnes} onChange={handleInputChange} /><br></br><br></br>

                            <div className="space">
                                <label className="bold margin">Responsable présent :</label>
                                <div>
                                    <label className="oui">
                                        <input className="checkbox" type="radio" name="responsablePrésent" value="OUI" checked={formData.responsablePrésent === "OUI"} onChange={handleInputChange} />
                                        OUI
                                    </label>
                                    <label>
                                        <input className="checkbox" type="radio" name="responsablePrésent" value="NON" checked={formData.responsablePrésent === "NON"} onChange={handleInputChange} />
                                        NON
                                    </label>
                                </div>
                            </div><br></br><br></br>
                    
                            <input type="text" name="nomDuResponsable" placeholder="Nom Prénom du responsable" value={formData.nomDuResponsable} onChange={handleInputChange} />
                            <input type="text" name="numéroDuResponsable" placeholder="Numéro du responsable" value={formData.numéroDuResponsable} onChange={handleInputChange} /><br></br>
                            <input type="email" name="emailDuResponsable" placeholder="E-mail du responsable" value={formData.emailDuResponsable} onChange={handleInputChange} /><br></br>
                            <input type="text" name="facebook" placeholder="Facebook" value={formData.facebook} onChange={handleInputChange} /><br></br>
                            <input type="text" name="instagram" placeholder="Instagram" value={formData.instagram} onChange={handleInputChange} /><br></br><br></br>
                    
                            <div className="space">
                                <label className="bold margin">Âge du responsable :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="âgeDuResponsable" value="Moins de 35 ans" checked={formData.âgeDuResponsable === "Moins de 35 ans"} onChange={handleInputChange} />Moins de 35 ans</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="âgeDuResponsable" value="De 35 ans à 50 ans" checked={formData.âgeDuResponsable === "De 35 ans à 50 ans"} onChange={handleInputChange} />De 35 ans à 50 ans</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="âgeDuResponsable" value="Plus de 50 ans" checked={formData.âgeDuResponsable === "Plus de 50 ans"} onChange={handleInputChange} />Plus de 50 ans</label>
                                </div>
                            </div><br></br>
                            
                            <div className="space">
                                <label className="bold margin">Origine de la visite :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineDeLaVisite" value="Visite spontanée" checked={formData.origineDeLaVisite === "Visite spontanée"} onChange={handleInputChange} />Visite spontanée </label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineDeLaVisite" value="Sur recommandation" checked={formData.origineDeLaVisite === "Sur recommandation"} onChange={handleInputChange} />Sur recommandation</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineDeLaVisite" value="Ancien client" checked={formData.origineDeLaVisite === "Ancien client"} onChange={handleInputChange} />Ancien client </label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineDeLaVisite" value="Prospection téléphonique" checked={formData.origineDeLaVisite === "Prospection téléphonique"} onChange={handleInputChange} />Prospection téléphonique</label>
                                </div>
                            </div><br></br>
                
                            <p className="margin"><strong>Marques de coloration présentes</strong> :</p><br></br><br></br>
                            <div>
                                {formData.colorationsAvecAmmoniaque.map((coloration, index) => ( 
                                    <div key={index}>
                                        <input type="text" placeholder="Nom" value={coloration.nom}
                                            onChange={(e) => handleColorationChange(index, 'colorationsAvecAmmoniaque', 'nom', e.target.value)}
                                        /><br></br>
                                        <input type="text" placeholder="Prix" value={coloration.prix}
                                            onChange={(e) => handleColorationChange(index, 'colorationsAvecAmmoniaque', 'prix', e.target.value)}
                                        /><br></br>
                                        <input type="text" placeholder="ML" value={coloration.ml}
                                            onChange={(e) => handleColorationChange(index, 'colorationsAvecAmmoniaque', 'ml', e.target.value)}
                                        /><br></br><br></br>
                                    </div>
                                ))}
                                <button className="button-colored btn-plus-img" type="button" onClick={handleAddColorationAmmoniaque}>Coloration avec ammoniaque<img src={plus} alt="" /></button>
                            </div>
                            <div>
                                {formData.colorationsSansAmmoniaque.map((coloration, index) => (
                                    <div key={index}>
                                        <input className="marginT15" type="text" placeholder="Nom" value={coloration.nom}
                                            onChange={(e) => handleColorationChange(index, 'colorationsSansAmmoniaque', 'nom', e.target.value)}
                                        />
                                        <input type="text" placeholder="Prix" value={coloration.prix}
                                            onChange={(e) => handleColorationChange(index, 'colorationsSansAmmoniaque', 'prix', e.target.value)}
                                        />
                                        <input type="text" placeholder="ML" value={coloration.ml}
                                            onChange={(e) => handleColorationChange(index, 'colorationsSansAmmoniaque', 'ml', e.target.value)}
                                        /><br></br><br></br>
                                    </div>
                                ))}
                                <button className="button-colored btn-plus-img" type="button" onClick={handleAddColorationSansAmmoniaque}>Coloration sans ammoniaque<img src={plus} alt="" /></button>
                            </div>
                            <div>
                                {formData.colorationsVégétales.map((coloration, index) => (
                                    <div key={index}>
                                        <input className="marginT15" type="text" placeholder="Nom" value={coloration.nom}
                                            onChange={(e) => handleColorationChange(index, 'colorationsVégétales', 'nom', e.target.value)}
                                        />
                                        <input type="text" placeholder="Prix" value={coloration.prix}
                                            onChange={(e) => handleColorationChange(index, 'colorationsVégétales', 'prix', e.target.value)}
                                        />
                                        <input type="text" placeholder="ML" value={coloration.ml}
                                            onChange={(e) => handleColorationChange(index, 'colorationsVégétales', 'ml', e.target.value)}
                                        /><br></br><br></br>
                                    </div>
                                ))}
                                <button className="button-colored btn-plus-img" type="button" onClick={handleAddColorationVegetale}>Coloration végétale<img src={plus} alt="" /></button>
                            </div><br></br>
                            <div>
                                <p className="margin"><strong>Autres marques :</strong></p>
                                <input type="text" name="poudre" placeholder="Poudre" value={formData.autresMarques.poudre}
                                        onChange={(e) => setFormData({ ...formData, autresMarques: { ...formData.autresMarques, poudre: e.target.value } })}
                                    />
                                    <input type="text" name="permanente" placeholder="Permanente" value={formData.autresMarques.permanente}
                                        onChange={(e) => setFormData({ ...formData, autresMarques: { ...formData.autresMarques, permanente: e.target.value } })}
                                    />
                                    <input type="text" name="bac" placeholder="BAC" value={formData.autresMarques.bac}
                                        onChange={(e) => setFormData({ ...formData, autresMarques: { ...formData.autresMarques, bac: e.target.value } })}
                                    />
                                    <input type="text" name="revente" placeholder="Revente" value={formData.autresMarques.revente}
                                        onChange={(e) => setFormData({ ...formData, autresMarques: { ...formData.autresMarques, revente: e.target.value } })}
                                    />
                            </div><br></br>  
                            <div>
                                <label className="bold margin">Date de visite :</label>
                                <input type="date" name="dateDeVisite" value={formData.dateDeVisite} onChange={handleInputChange} className='custom-select' />
                            </div><br></br>
                            <div>
                                <label className="bold margin">Quels ont été les concepts ou produits proposés ?</label><br></br>
                                <textarea name="conceptsProposés" value={formData.conceptsProposés} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="bold margin">Y a-t-il eu une animation proposée ? Si oui, laquelle ?</label><br></br>
                                <textarea name="animationProposée" value={formData.animationProposée} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="bold margin">Points à aborder lors de la prochaine visite :</label><br></br>
                                <textarea name="pointsPourLaProchaineVisite" value={formData.pointsPourLaProchaineVisite} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="bold margin">Intéressés par :</label><br></br>
                                <textarea name="intéressésPar" value={formData.intéressésPar} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="bold margin">Autres points à aborder :</label><br></br>
                                <textarea name="autresPoints" value={formData.autresPoints} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="bold margin">Observations (éléments à retenir) ou motifs si abandon :</label>
                                <textarea name="observations" value={formData.observations} onChange={handleInputChange} />
                            </div>
                        
                            <div className="space">
                                <label className="margin">
                                    <input className="checkbox" type="radio" name="statut" value="ABANDON" checked={formData.statut === "ABANDON"} onChange={handleInputChange} />
                                    ABANDON
                                </label><br></br>
                                <label className="margin">
                                    <input className="checkbox" type="radio" name="statut" value="A REVOIR" checked={formData.statut === "A REVOIR"} onChange={handleInputChange} />
                                    A REVOIR
                                </label>
                            </div><br></br>
                            <div className="space">
                                <label className="bold margin">RDV obtenu :</label>
                                <div>
                                    <label className="oui">
                                        <input className="checkbox" type="radio" name="rdvObtenu" value="OUI" checked={formData.rdvObtenu === "OUI"} onChange={handleInputChange} />
                                        OUI
                                    </label>
                                    <label>
                                        <input className="checkbox" type="radio" name="rdvObtenu" value="NON" checked={formData.rdvObtenu === "NON"} onChange={handleInputChange} />
                                        NON
                                    </label>
                                </div>
                            </div><br></br>
                            {formData.rdvObtenu === "OUI" && (
                                <>
                                    <div>
                                        <label className="bold margin">Prévu pour le :</label>
                                        <input type="date"  className='custom-select' name="rdvPrévuLe" placeholder="Prévu pour le" value={formData.rdvPrévuLe} onChange={handleInputChange} />
                                    </div><br></br>
                                    <div>
                                        <label className="bold margin">Type de RDV :</label>
                                        <div>
                                            <label className="margin"><input className="checkbox" type="radio" name="typeDeRdv" value="Présentation" checked={formData.typeDeRdv === "Présentation"} onChange={handleInputChange} />Présentation</label><br></br>
                                            <label className="margin"><input className="checkbox" type="radio" name="typeDeRdv" value="Démonstration" checked={formData.typeDeRdv === "Démonstration"} onChange={handleInputChange} />Démonstration</label><br></br>
                                            <label className="margin"><input className="checkbox" type="radio" name="typeDeRdv" value="Formation" checked={formData.typeDeRdv === "Formation"} onChange={handleInputChange} />Formation</label><br></br>
                                            <label className="margin"><input className="checkbox" type="radio" name="typeDeRdv" value="Commercial" checked={formData.typeDeRdv === "Commercial"} onChange={handleInputChange} />Commercial</label><br></br>
                                            <label className="margin"><input className="checkbox" type="radio" name="typeDeRdv" value="Autre" checked={formData.typeDeRdv === "Autre"} onChange={handleInputChange} />Autre</label>
                                        </div>
                                    </div><br></br>
                                    {formData.typeDeRdv === "Démonstration" && (
                                        <div>
                                            <label className="bold margin">Type de démonstration :</label>
                                            <div>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="Microscopie" checked={formData.typeDeDémonstration.includes("Microscopie")} onChange={handleInputChange} />Microscopie</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="ColorationThalasso" checked={formData.typeDeDémonstration.includes("ColorationThalasso")} onChange={handleInputChange} />Coloration Thalasso</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="LaVégétale" checked={formData.typeDeDémonstration.includes("LaVégétale")} onChange={handleInputChange} />La Végétale</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="DécolorationPermanente" checked={formData.typeDeDémonstration.includes("DécolorationPermanente")} onChange={handleInputChange} />Décoloration permanente</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="ByDSH" checked={formData.typeDeDémonstration.includes("ByDSH")} onChange={handleInputChange} />By DSH</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="Olyzea" checked={formData.typeDeDémonstration.includes("Olyzea")} onChange={handleInputChange} />Olyzea</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="ThalassoBac" checked={formData.typeDeDémonstration.includes("ThalassoBac")} onChange={handleInputChange} />Thalasso Bac</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="ManufacturesABoucles" checked={formData.typeDeDémonstration.includes("ManufacturesABoucles")} onChange={handleInputChange} />Manufactures à boucles</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="DoubleLecture" checked={formData.typeDeDémonstration.includes("DoubleLecture")} onChange={handleInputChange} />Double lecture</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="StylingPro" checked={formData.typeDeDémonstration.includes("StylingPro")} onChange={handleInputChange} />Styling Pro</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="PersonalTouch" checked={formData.typeDeDémonstration.includes("PersonalTouch")} onChange={handleInputChange} />Personal Touch</label><br></br>
                                                <label className="margin">
                    <input className="checkbox" type="checkbox" name="otherDemonstrationCheckbox" checked={isOtherChecked} onChange={handleInputChange} />
                    Autre:
                    {isOtherChecked && (
                        <input
                            type="text"
                            name="otherDemonstration"
                            value={otherDemonstration}
                            onChange={handleOtherDemonstrationChange}
                            onBlur={handleOtherDemonstrationBlur}
                            placeholder="Précisez si autre"
                        />
                    )}
                </label>
                                            </div>
                                        </div>
                                    )}
                                </>  
                            )}
                            <div className="space"><br></br>
                                <label className="bold margin">Commande prévue :</label>
                                <div>
                                    <label className="oui">
                                        <input className="checkbox" type="radio" name="commande" value="OUI" checked={formData.commande === "OUI"} onChange={handleInputChange} />
                                        OUI
                                    </label>
                                    <label>
                                        <input className="checkbox" type="radio" name="commande" value="NON" checked={formData.commande === "NON"} onChange={handleInputChange} />
                                        NON
                                    </label>
                                </div>
                            </div>

                            {buttonType === "new" && (
                                <button type="submit" className="button-colored" onClick={() => setButtonType("new")}>Enregistrer une nouvelle fiche</button>
                            )}
                            {buttonType === "update" && (
                                <button type="submit" className="button-colored" onClick={() => setButtonType("update")}>Mettre à jour la fiche</button>
                            )}
                        </div>
                    </form>  
                    </>
                )}
            </div>  
            

                {salonInfo && isViewAllFichesOpen && (
                    <div className="all-fiches-client">
                        <button style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsViewAllFichesOpen(false)}} >Voir le formulaire</button>
                        <button style={{ padding: "10px 30px" }} onClick={downloadPDF} className='button-colored'>Télécharger les fiches prospect</button>
                        <div ref={pageRef} style={{paddingTop: "20px", fontSize: "16px"}}>
                            <h4 style={{textAlign: "center", fontSize: "18px", marginBottom: "20px"}}>Fiches de suivi prospect du salon {selectedSalon}</h4>
                            <ul>
                                {allFiches.map((fiche, index) => (
                                    <li key={index}>
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
                                            isFirstFiche={index === 0}
                                        />
                                    </li>
                                ))}
                            </ul> 
                        </div>
                    </div>
                )}

                {salonInfo && isViewFilteredFichesOpen && (
                    <div className="all-fiches-client">
                        <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsViewFilteredFichesOpen(false)}} >Voir le formulaire</button>
                        <button style={{ padding: "10px 30px" }} onClick={downloadPDF2} className='button-colored'>Télécharger les fiches prospect</button>
                        <div ref={pageRef2} style={{paddingTop: "20px", fontSize: "16px"}}>
                        <h3  style={{textAlign: "center", fontSize: "18px", marginBottom: "20px"}}>Fiches prospect du salon {selectedSalon} enregistrées entre le {formatDate2(startDate)} et le {formatDate2(endDate)}</h3>
                            <ul>
                                {filteredFiches.map((fiche, index) => (
                                    <li key={index}>
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
                                            isFirstFiche={index === 0}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>     
                    </div>
                )}

                {salonInfo  && thisYearOpen && (
                    <div className="all-fiches-client">
                        <button style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setThisYearOpen(false)}} >Voir le formulaire</button>
                        <button style={{ padding: "10px 30px" }} onClick={downloadPDF3} className='button-colored'>Télécharger les fiches prospect de l'année en cours</button>
                            <div ref={pageRef3} style={{paddingTop: "20px", fontSize: "16px"}}>
                            <h4 style={{textAlign: "center", fontSize: "18px", marginBottom: "20px"}}>Fiches de suivi prospect du salon {selectedSalon} du mois de {currentYear}</h4>
                            <ul>
                                {fichesThisYear.map((fiche, index) => (
                                    <li key={index}>
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
                                            isFirstFiche={index === 0}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {isOpenModal && (
                    <div className="modal-commande">
                        <div>
                            <p>Fiche enregistrée avec succès !<br></br><br></br> Dirigez-vous vers la section Fiche de suivi Client</p>
                            <button onClick={() => setIsOpenModal(false)}>Fermer</button>
                        </div>
                    </div>
                )}
                {isModalOpen && (
                    <div className="modal-success">
                        <div className="content">
                            <p className="success">{message}</p>
                            <button onClick={() => { onReturn() }}>Fermer</button>
                        </div> 
                    </div>
                )}
            
            </div>
    )
}

export default FicheProspect