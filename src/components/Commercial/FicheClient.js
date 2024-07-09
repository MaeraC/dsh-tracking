
// ficheClient.js

import back from "../../assets/back.png"
import { useState, useCallback, useRef, useEffect } from "react" 
import { db } from "../../firebase.config"
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";
import ResultsFicheClient from "../ResultsFicheClient"

function FicheClient({ onReturn, uid }) {
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [message, setMessage] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [allFiches, setAllFiches] = useState([]);
    const [isAllFichesVisible, setIsAllFichesVisible] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('')
    const [isViewFilteredFichesOpen, setIsViewFilteredFichesOpen] = useState(false)
    const [filteredFiches, setFilteredFiches] = useState([])
    // eslint-disable-next-line
    const [rdvPresentationCount, setRdvPresentationCount] = useState(0)
    const [formVisible, setFormVisible] = useState(true)
    const [fichesThisYear, setFichesThisYear] = useState([])
    const [thisYearOpen, setThisYearOpen] = useState(false)
    const [selectedSalon, setSelectedSalon] = useState('');
    const [currentYear, setCurrentYear] = useState("")
    const [usersMap, setUsersMap] = useState({})
    const [otherBrand, setOtherBrand] = useState('');

    const pageRef = useRef()
    const pageRef2 = useRef()
    const pageRef3 = useRef()

    const createdAt = new Date()
    
    const initialFormData = {
        adresse: "",
        téléphoneDuSalon: "",
        nomDuResponsable: "",
        portableDuResponsable: "",
        EmailDuResponsable: "",
        marquesEnPlace: {
            systemeDsh: false,
            colorationThalasso: false,
            mechesThalasso: false,
            ondThalassoPermanente: false,
            laVégétale: false,
            byDsh: false,
            olyzea: false,
            stylingPro: false,
            personalTouch: false,
            thalassoBac: false, 
            manufacturesABoucles: false, 
            doubleLecture: false,
            autre: '' 
        },
        équipe: [],
        clientEnContrat: "",
        typeDeContrat: "",
        specificites: [],
        dateDeVisite: "",
        responsablePrésent: "",
        priseDeCommande: "",
        gammesCommandées: "",
        animationProposée: "",
        produitsProposés: [],
        autresPointsAbordés: "",
        pointsPourLaProchaineVisite: "",
        observations: "",
        createdAt: createdAt,
        typeOfForm: "Fiche de suivi Client",
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

    const handleOtherBrandChange = (e) => {
        setOtherBrand(e.target.value);
        setFormData({ ...formData, marquesEnPlace: { ...formData.marquesEnPlace, autre: e.target.value } });
    }
    
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, marquesEnPlace: { ...formData.marquesEnPlace, [name]: checked } })
    }
    const handleAddEquipeMember = () => {
        setFormData({ ...formData, équipe: [...formData.équipe, { nomPrenom: "", role: "" }] })
    }
    const handleEquipeChange = (index, field, value) => {
        const newéquipe = formData.équipe.map((member, i) => {
            if (i === index) {
                return { ...member, [field]: value };
            }
            return member
        })
        setFormData({ ...formData, équipe: newéquipe });
    }
    const handleAddSpecificite = () => {
        setFormData({ ...formData, specificites: [...formData.specificites, ""] });
    }
    const handleSpecificiteChange = (index, value) => {
        const newSpecificites = formData.specificites.map((specificite, i) => {
            if (i === index) {
                return value;
            }
            return specificite;
        });
        setFormData({ ...formData, specificites: newSpecificites });
    }
    const handleAddProduits = () => {
        setFormData({ ...formData, produitsProposés: [...formData.produitsProposés, ""] });
    }
    const handleProduitsChange = (index, value) => {
        const newProduit = formData.produitsProposés.map((produit, i) => {
            if (i === index) {
                return value;
            }
            return produit; 
        }); 
        setFormData({ ...formData, produitsProposés: newProduit });
    }

    const handleSearch = async (e) => {
        const searchValue = e.target.value
        setSearchSalon(searchValue)

        if (searchValue.length > 0) {
            try {
                const q = query(collection(db, "salons"), where("name", ">=", searchValue), where("name", "<=", searchValue + "\uf8ff"));
                const querySnapshot = await getDocs(q)
                const searchResults = []

                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    if (data.status === "Client") {
                        const salonDepartment = data.department || "" 
                        const userDepartments = usersMap[uid]?.departments || []

                        if (userDepartments.includes(salonDepartment)) {
                            searchResults.push({ id: doc.id, ...data });
                        }
                    }
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
            const data = salonSnapshot.data();
            const suiviClient = data.suiviClient ? data.suiviClient[data.suiviClient.length - 1] : {}

            setFormData({
                adresse: salon.address || "",
                city: salon.city || "",
                name: salon.name || "",
                téléphoneDuSalon: salon.phoneNumber || "",
                nomDuResponsable: suiviClient.nomDuResponsable || "",
                portableDuResponsable: suiviClient.portableDuResponsable || "",
                EmailDuResponsable: suiviClient.EmailDuResponsable || "",
                marquesEnPlace: {
                    systemeDsh: suiviClient.marquesEnPlace?.systemeDsh || false,
                    colorationThalasso: suiviClient.marquesEnPlace?.colorationThalasso || false,
                    mechesThalasso: suiviClient.marquesEnPlace?.mechesThalasso || false,
                    ondThalassoPermanente: suiviClient.marquesEnPlace?.ondThalassoPermanente || false,
                    laVégétale: suiviClient.marquesEnPlace?.laVégétale || false,
                    byDsh: suiviClient.marquesEnPlace?.byDsh || false,
                    olyzea: suiviClient.marquesEnPlace?.olyzea || false,
                    stylingPro: suiviClient.marquesEnPlace?.stylingPro || false,
                    personalTouch: suiviClient.marquesEnPlace?.personalTouch || false,
                    manufacturesABoucles: suiviClient.marquesEnPlace?.manufacturesABoucles || false,
                    doubleLecture: suiviClient.marquesEnPlace?.doubleLecture || false,
                    autre: suiviClient.marquesEnPlace?.autre || '' 
                },
                équipe: suiviClient.équipe || [],
                clientEnContrat: suiviClient.clientEnContrat || "",
                typeDeContrat: suiviClient.typeDeContrat || "",
                specificites: suiviClient.specificites || [],
                dateDeVisite: suiviClient.dateDeVisite || "",
                responsablePrésent: suiviClient.responsablePrésent || "",
                priseDeCommande: suiviClient.priseDeCommande || "",
                gammesCommandées: suiviClient.gammesCommandées || "",
                animationProposée: suiviClient.animationProposée || "",
                produitsProposés: suiviClient.produitsProposés || [],
                autresPointsAbordés: suiviClient.autresPointsAbordés || "",
                pointsPourLaProchaineVisite: suiviClient.pointsPourLaProchaineVisite || "",
                observations: suiviClient.observations || "",
                createdAt: createdAt,
                typeOfForm: "Fiche de suivi Client",
                userId: uid,
            })
        }
    }

    const updateSalonHistory = useCallback(async (updatedData) => {
        if (salonInfo) {
            try {
                const salonRef = doc(db, "salons", salonInfo.id)
                const salonSnapshot = await getDoc(salonRef)
    
                if (salonSnapshot.exists()) {
                    const salonData = salonSnapshot.data()
                    const newHistoryEntry = [
                        ...(salonData.historique || []),
                        {
                            date: new Date(),
                            action: "Mise à jour de la Fiche de suivi Client",
                            formData: updatedData,
                            userId: uid
                        }
                    ]
                    await updateDoc(salonRef, { historique: newHistoryEntry })
                } 
                else {
                    console.error("Document de visite non trouvé.")
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'historique du salon : ", error)
            }
        }
    }, [salonInfo, uid])
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const salonRef = doc(db, "salons", salonInfo.id)
            const SalonSnapshot = await getDoc(salonRef)
           
            if (SalonSnapshot.exists()) {
                const salonData = SalonSnapshot.data()
                const updatedSuiviClient = [...(salonData.suiviClient || []), formData]
                await updateDoc(salonRef, { suiviClient: updatedSuiviClient })  
                await updateSalonHistory(formData)

                setMessage("Fiche de suivi Client enregistré avec succès !")
                setIsModalOpen(true)
            }
            else {
                console.error("Document de visite non trouvé.")
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du salon : ", error);
        }
    }

    const handleShowAllFiches = async () => {
        if (salonInfo) {
            try {
                const salonRef = doc(db, "salons", salonInfo.id);
                const salonSnapshot = await getDoc(salonRef);

                if (salonSnapshot.exists()) {
                    const salonData = salonSnapshot.data();
                    setAllFiches(salonData.suiviClient || []);
                    setIsAllFichesVisible(true);
                    setFormVisible(false)
                    setThisYearOpen(false)
                } else {
                    console.error("Document de salon non trouvé.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des fiches de suivi : ", error);
            }
        }
    }
    const handleFilterByDate = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id);
            const salonSnapshot = await getDoc(salonRef);
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data();
                const allFiches = salonData.suiviClient || [];

                 // Convertir les dates de début et de fin en objets Date
                const start = new Date(startDate);
                const end = new Date(endDate);
    
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
                const allFiches = salonData.suiviClient || []
                const currentYear = new Date().getFullYear();
                setCurrentYear(currentYear)
    
                const currentYearFiches = allFiches.filter((fiche) => {
                    const ficheDate = fiche.createdAt instanceof Date ? fiche.createdAt : fiche.createdAt.toDate();
                    return ficheDate.getFullYear() === currentYear;
                });
    
                setFichesThisYear(currentYearFiches);
                setIsViewFilteredFichesOpen(false);
                setThisYearOpen(true)
                setRdvPresentationCount(rdvPresentationCount)
                setFormVisible(false)
            } else {
                console.error("Document de visite non trouvé.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error);
        }
    }

    const formatDate = (date) => {
        if (!date || !date.seconds) {
            return 'Date non disponible';
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
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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
        generatePDF(input, "fiche-client-all.pdf")
    }
    const downloadPDF2 = () => {
        const input = pageRef2.current;
        generatePDF(input, "fiche-client-periode.pdf")
    }
    const downloadPDF3 = () => {
        const input = pageRef3.current;
        generatePDF(input, "fiche-client-annee-en-cours.pdf")
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
                        <div style={{marginLeft: "20px"}} className="filter-button">
                            <button style={{marginTop: "0px", padding: "10px", fontSize: "14px"}} className="button-colored" onClick={handleShowAllFiches}>Voir toutes les fiches enregistrées</button>
                            <button style={{padding: "10px", fontSize: "14px"}} onClick={handleViewFichesCurrentYear} className="button-colored">Voir les fiches de l'année en cours</button>
                        </div>
                        
                    </div> 
                    <form onSubmit={handleSubmit}>
                        <div className="form-FSC">
                            <h2>{salonInfo.name}</h2>
                            <p className="adress">{salonInfo.address}</p>
                            
                            <p><strong>Responsable du salon</strong></p><br></br>
                            <input type="text" name="nomDuResponsable" placeholder="Nom Prénom" value={formData.nomDuResponsable} onChange={handleInputChange} /><br />
                            <input type="text" name="portableDuResponsable" placeholder="Portable" value={formData.portableDuResponsable} onChange={handleInputChange} /><br />
                            <input type="email" name="EmailDuResponsable"  placeholder="Email" value={formData.EmailDuResponsable} onChange={handleInputChange} /><br /><br></br>
                            
                            <div className="div-space">
                                <label className="label-space"><strong>Responsable présent</strong> :</label><br></br>
                                <div>
                                    <label className="oui"><input className="checkbox radio" type="radio" name="responsablePrésent" value="Oui" checked={formData.responsablePrésent === "Oui"} onChange={handleInputChange} /> Oui</label>
                                    <label><input className="checkbox radio" type="radio" name="responsablePrésent" value="Non" checked={formData.responsablePrésent === "Non"} onChange={handleInputChange} /> Non</label>
                                </div>
                            </div><br></br>

                            <input type="text" name="téléphoneDuSalon" placeholder="Téléphone du salon" value={formData.téléphoneDuSalon} onChange={handleInputChange} /><br></br><br></br>

                            <p><strong>Marques en place</strong></p><br></br>
                            <div className="marques">
                                <label><input className="checkbox" type="checkbox" name="systemeDsh" checked={formData.marquesEnPlace.systemeDsh} onChange={handleCheckboxChange} /> Système DSH</label><br />
                                <label><input className="checkbox" type="checkbox" name="colorationThalasso" checked={formData.marquesEnPlace.colorationThalasso} onChange={handleCheckboxChange} /> Coloration Thalasso</label><br />
                                <label><input className="checkbox" type="checkbox" name="mechesThalasso" checked={formData.marquesEnPlace.mechesThalasso} onChange={handleCheckboxChange} /> Mèches Thalasso</label><br />
                                <label><input className="checkbox" type="checkbox" name="ondThalassoPermanente" checked={formData.marquesEnPlace.ondThalassoPermanente} onChange={handleCheckboxChange} /> Ond. Thalasso / Permanente</label><br />
                                <label><input className="checkbox" type="checkbox" name="laVégétale" checked={formData.marquesEnPlace.laVégétale} onChange={handleCheckboxChange} /> La Végétale</label><br />
                                <label><input className="checkbox" type="checkbox" name="byDsh" checked={formData.marquesEnPlace.byDsh} onChange={handleCheckboxChange} /> By DSH</label><br />
                                <label><input className="checkbox" type="checkbox" name="olyzea" checked={formData.marquesEnPlace.olyzea} onChange={handleCheckboxChange} /> Olyzea</label><br />
                                <label><input className="checkbox" type="checkbox" name="stylingPro" checked={formData.marquesEnPlace.stylingPro} onChange={handleCheckboxChange} /> Styling Pro</label><br />
                                <label><input className="checkbox" type="checkbox" name="thalassoBac" checked={formData.marquesEnPlace.thalassoBac} onChange={handleCheckboxChange} /> Thalasso Bac</label><br />
                                <label><input className="checkbox" type="checkbox" name="manufacturesABoucles" checked={formData.marquesEnPlace.manufacturesABoucles} onChange={handleCheckboxChange} /> Manufactures à boucles</label><br />
                                <label><input className="checkbox" type="checkbox" name="doubleLecture" checked={formData.marquesEnPlace.doubleLecture} onChange={handleCheckboxChange} /> Double lecture</label><br />
                                <label style={{display: "flex", alignItems: "center"}}>Autre: <input className="inputt" style={{padding: "10px", marginLeft: "20px", marginBottom: "0 !important"}} type="text" value={otherBrand} onChange={handleOtherBrandChange} /></label><br />
                            </div>
                            <br></br>  

                            <p><strong>Équipe</strong></p>
                            {formData.équipe.map((member, index) => (
                                <div key={index}>
                                    <input className="input10" type="text" placeholder="Nom Prénom" value={member.nomPrenom} onChange={(e) => handleEquipeChange(index, 'nomPrenom', e.target.value)} /><br />
                                    <div>
                                        <label className="radio-equipe"><input className="checkbox radio" type="radio" name={`role${index}`} value="Coiffeur/se" checked={member.role === "Coiffeur/se"} onChange={(e) => handleEquipeChange(index, 'role', e.target.value)} /> Coiffeur/se</label><br />
                                        <label className="radio-equipe"><input className="checkbox radio" type="radio" name={`role${index}`} value="Apprenti(e)" checked={member.role === "Apprenti(e)"} onChange={(e) => handleEquipeChange(index, 'role', e.target.value)} /> Apprenti(e)</label><br />
                                    </div>
                                </div>
                            ))}
                            <button className="button-colored input20B" type="button" onClick={handleAddEquipeMember}>Ajouter un membre de l'équipe</button><br></br><br></br>

                            <p><strong>Client en contrat ?</strong></p><br></br>
                            <div>
                                <label className="oui"><input className="checkbox radio" type="radio" name="clientEnContrat" value="Oui" checked={formData.clientEnContrat === "Oui"} onChange={handleInputChange} /> Oui</label>
                                <label><input className="checkbox radio" type="radio" name="clientEnContrat" value="Non" checked={formData.clientEnContrat === "Non"} onChange={handleInputChange} /> Non</label>
                            </div>
                            {formData.clientEnContrat === "Oui" && (
                                <div>
                                    <input type="text" className="type-contrat" name="typeDeContrat" placeholder="Si Oui, lequel ?" value={formData.typeDeContrat} onChange={handleInputChange} />
                                    <p><strong>Tarif spécifique ?</strong></p><br></br>
                                    {formData.specificites.map((specificite, index) => (
                                        <div key={index}>
                                            <input type="text" placeholder={`Spécificité ${index + 1}`} value={specificite} onChange={(e) => handleSpecificiteChange(index, e.target.value)} />
                                        </div> 
                                    ))}
                                    <button type="button" className="button-colored" onClick={handleAddSpecificite}>Ajouter un tarif spécifique</button>
                                </div>
                            )}
                            <br></br><br></br>
                            <div className="div-space">
                                <label className="label-space"><strong>Date de visite</strong> :</label><br></br>
                                <input type="date"  className='custom-select' name="dateDeVisite" value={formData.dateDeVisite} onChange={handleInputChange} />
                            </div>

                            <p><strong>Prise de commande ?</strong></p><br></br>
                            <div>
                                <label className="oui"><input className="checkbox radio" type="radio" name="priseDeCommande" value="Oui" checked={formData.priseDeCommande === "Oui"} onChange={handleInputChange} /> Oui</label>
                                <label><input className="checkbox radio" type="radio" name="priseDeCommande" value="Non" checked={formData.priseDeCommande === "Non"} onChange={handleInputChange} /> Non</label>
                            </div><br></br>

                            <input type="text" name="gammesCommandées" placeholder="Si Oui, quelles gammes ?" value={formData.gammesCommandées} onChange={handleInputChange} />
                            
                            {formData.produitsProposés.map((produit, index) => (
                                <div key={index}>
                                    <input type="text" placeholder={`Produit proposé ${index + 1}`} value={produit} onChange={(e) => handleProduitsChange(index, e.target.value)} />
                                </div>  
                            ))}
                            <button type="button" className="button-colored" onClick={handleAddProduits}>Ajouter un produit proposé</button><br></br><br></br>
                            <div>
                                <label className="label-space"><strong>Y'a t-il eu une animation proposée ? Si Oui, laquelle ?</strong></label><br></br>
                                <textarea name="animationProposée" value={formData.animationProposée} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="label-space"><strong>Autres points abordés ? Lesquels ?</strong></label><br></br>
                                <textarea name="autresPointsAbordés" value={formData.autresPointsAbordés} onChange={handleInputChange} />
                            </div>
                            
                            <div>
                                <label className="label-space"><strong>Points à aborder lors de la prochaine visite</strong> :</label><br></br>
                                <textarea name="pointsPourLaProchaineVisite" value={formData.pointsPourLaProchaineVisite} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="label-space"><strong>Observations (éléments à retenir)</strong> :</label><br></br>
                                <textarea name="observations" value={formData.observations} onChange={handleInputChange} />
                            </div>
                            <button className="button-colored" type="submit">ENREGISTRER</button>
                        </div>
                    </form>
                    
                    </>
                )} 

                {salonInfo && isAllFichesVisible  &&  (
                        <div className="all-fiches-client" > 
                            <button style={{margin: "20px", marginLeft: "40px", padding: "10px 30px", marginBottom: "10px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsAllFichesVisible(false)}} >Voir le formulaire</button>
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
                                              specificites: fiche.specificites,
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
                            <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsViewFilteredFichesOpen(false)}} >Voir le formulaire</button>
                            <button style={{ padding: "10px 30px" }} onClick={downloadPDF2} className='button-colored'>Télécharger les fiches clients</button>
                            <div ref={pageRef2} style={{paddingTop: "20px", fontSize: "16px"}}>
                               <h3  style={{textAlign: "center", fontSize: "20px", marginBottom: "20px"}}>Fiches de suivi client du salon {selectedSalon} enregistrées entre le {formatDate2(startDate)} et le {formatDate2(endDate)}</h3>
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
                                            specificites: fiche.specificites,
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
                            <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setFormVisible(true); setIsViewFilteredFichesOpen(false)}} >Voir le formulaire</button>
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
                                           specificites: fiche.specificites,
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
                    

                   
                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <p className="success">{message}</p>
                            <button className="button-colored" onClick={() => setIsModalOpen(false)}>Fermer</button>
                        </div> 
                    </div>
                )}
            </div>
        </div>
    )
}

export default FicheClient