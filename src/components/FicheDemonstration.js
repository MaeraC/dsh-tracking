
// fichier FicheDemonstration.js

import React, { useState, useEffect, useCallback, useRef } from "react"
import { db } from "../firebase.config"
import { updateDoc, doc, getDoc, getDocs, query, collection, where, arrayUnion } from "firebase/firestore"
import back from "../assets/back.png"
import jsPDF from "jspdf"
import html2canvas from "html2canvas" 
import ResultsFicheD from "./ResultsFicheD" 

function FicheDemonstration({ uid, onReturn }) {
     // eslint-disable-next-line
    const [salons, setSalons] = useState([]) 
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([]) 
    const [message, setMessage] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [allCR, setAllCR] = useState([]);
    const [showAllCR, setShowAllCr] = useState(false)
    const [usersMap, setUsersMap] = useState({})
    const [selectedAdress, setSelectedAdress] = useState("")
    const [selectedSalon, setSelectedSalon] = useState('')
    const [showForm, setShowForm] = useState(false)
    const pageRef = useRef()
    
    const initialFormData = {
        nomPrenomDuResponsable: '',
        responsablePrésent: '',
        téléphone: '',
        email: '',
        nombreDeCollaborateurs: '',
        typeDeDémonstration: {
          luminacolor: false,
          veracolor: false,
          thalassoBAC: false,
          décoloration: false,
          ondulation: false,
          microscopie: false,
          draw: false,
          laVégétale: false,
          manufacturesABoucles: false,
          doubleLecture: false,
          stylingPro: false,
          personalTouch: false,
          autre: "",
        },
       
        duréeDeLaDémonstration: '',
        techniciennePrésente: '',
        avecLaVRP: false,
        seule: false,
        nomDeLaTechnicienne: '',
        issueFavorable: {
          luminacolor: null,
          veracolor: null,
          thalassoBAC: null,
          décoloration: null,
          ondulation: null,
          microscopie: null,
          draw: null,
          laVégétale: null,
          manufacturesABoucles: null,
          doubleLecture: null,
          stylingPro: null,
          personalTouch: null,
          autre: null,
        },
        issueDéfavorable: {
          luminacolor: '',
          veracolor: '',
          thalassoBAC: '',
          décoloration: '',
          ondulation: '',
          microscopie: '',
          draw: '',
          laVégétale: '',
          manufacturesABoucles: "",
          doubleLecture: "",
          stylingPro: "",
          personalTouch: "",
          autre: '',
        },
        actions: {
          abandon: "",
          aSuivre: "",
          aRetenter: "",
          adapterLePrix: "",
          attenteDeRéponse: "",
        },
        précisions: '',
        observationsGénérales: '',
        createdAt: new Date(),
        typeOfForm: "Compte rendu de RDV de Démonstration",
        userId: uid,
    }
    const [formData, setFormData] = useState(initialFormData) 

    useEffect(() => {
        const fetchSalons = async () => {
            try {
                const salonsCollection = collection(db, "salons")
                const q = query(salonsCollection); 
                const snapshot = await getDocs(q); 

                if (snapshot.empty) {
                    console.log('Aucun document trouvé dans la collection "salons".');
                    return;
                }

                const salonsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setSalons(salonsData);
            } catch (error) {
                console.error('Erreur lors de la récupération des salons :', error);
            }
        };

        fetchSalons();
    }, []);
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
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (type === 'checkbox') {
            setFormData(prevState => ({
                ...prevState,
                [name]: checked
            }))
        } 
        else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }))
        }
    }

    const handleOtherChange = (e) => {
        const { value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            typeDeDémonstration: {
                ...prevState.typeDeDémonstration,
                autre: value
            }
        }));
    };

    const handleDemonstrationChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            typeDeDémonstration: {
                ...prevState.typeDeDémonstration,
                [name]: checked
            },
            issueFavorable: {
                ...initialFormData.issueFavorable, 
            },
            issueDéfavorable: {
                ...initialFormData.issueDéfavorable, 
            },
            actions: { ...initialFormData.actions }, 
            précisions: initialFormData.précisions, 
        }));
    };

    const handleIssueFavorableChange = (demo, value) => {
        setFormData(prevState => ({
            ...prevState,
            issueFavorable: {
                ...prevState.issueFavorable,
                [demo]: value,
            },
        }));
    };

    const handleIssueDéfavorableMotifChange = (demo, value) => {
        setFormData(prevState => ({
            ...prevState,
            issueDéfavorable: {
                ...prevState.issueDéfavorable,
                [demo]: {
                    ...prevState.issueDéfavorable[demo],
                    motif: value,
                },
            },
        }));
    };

    const handleIssueDéfavorableActionsChange = (demo, value) => {
        setFormData(prevState => ({
            ...prevState,
            issueDéfavorable: {
                ...prevState.issueDéfavorable,
                [demo]: {
                    ...prevState.issueDéfavorable[demo],
                    actions: value,
                },
            },
        }));
    };

    const handleIssueDéfavorablePréciserChange = (demo, value) => {
        setFormData(prevState => ({
            ...prevState,
            issueDéfavorable: {
                ...prevState.issueDéfavorable,
                [demo]: {
                    ...prevState.issueDéfavorable[demo],
                    préciser: value,
                },
            },
        }));
    };
       
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
                    const salonDepartment = data.department || "" 
                    const userDepartments = usersMap[uid]?.departments || []

                        if (userDepartments.includes(salonDepartment)) {
                            searchResults.push({ id: doc.id, ...data });
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
        setSalonInfo(salon);
        setSuggestions([]);
        const salonRef = doc(db, "salons", salon.id);
        const salonSnapshot = await getDoc(salonRef);
        if (salonSnapshot.exists()) {
            setSelectedSalon(salon.name)
            setSelectedAdress(salon.address)
            const data = salonSnapshot.data();
            const crDemonstration = data.crDemonstration ? data.crDemonstration[data.crDemonstration.length - 1] : {};

            setFormData({
                adresse: salon.address || "",
                city: salon.city || "",
                name: salon.name || "",
                nomPrenomDuResponsable: crDemonstration.nomPrenomDuResponsable || "",
                responsablePrésent: crDemonstration.responsablePrésent || "",
                téléphone:  salon.phoneNumber || crDemonstration.téléphone || "",
                email: crDemonstration.email || "",
                nombreDeCollaborateurs: crDemonstration.nombreDeCollaborateurs || "",
                typeDeDémonstration: {
                    luminacolor: crDemonstration.typeDeDémonstration?.luminacolor || false,
                    veracolor: crDemonstration.typeDeDémonstration?.veracolor || false,
                    thalassoBAC: crDemonstration.typeDeDémonstration?.thalassoBAC || false,
                    décoloration: crDemonstration.typeDeDémonstration?.décoloration || false,
                    ondulation: crDemonstration.typeDeDémonstration?.ondulation || false,
                    microscopie: crDemonstration.typeDeDémonstration?.microscopie || false,
                    draw: crDemonstration.typeDeDémonstration?.draw || false,
                    laVégétale: crDemonstration.typeDeDémonstration?.laVégétale || false,
                    manufacturesABoucles: crDemonstration.typeDeDémonstration?.manufacturesABoucles || false,
                    doubleLecture: crDemonstration.typeDeDémonstration?.doubleLecture || false,
                    stylingPro: crDemonstration.typeDeDémonstration?.stylingPro || false,
                    personalTouch: crDemonstration.typeDeDémonstration?.personalTouch || false,
                    autre: crDemonstration.typeDeDémonstration?.autre || false,
                },
                duréeDeLaDémonstration: crDemonstration.duréeDeLaDémonstration || "",
                techniciennePrésente: crDemonstration.techniciennePrésente || "",
                avecLaVRP: crDemonstration.avecLaVRP || false,
                seule: crDemonstration.seule || false,
                nomDeLaTechnicienne: crDemonstration.nomDeLaTechnicienne || "",
                issueFavorable: {
                    luminacolor: crDemonstration.issueFavorable?.luminacolor || null,
                    veracolor: crDemonstration.issueFavorable?.veracolor || null,
                    thalassoBAC: crDemonstration.issueFavorable?.thalassoBAC || null,
                    décoloration: crDemonstration.issueFavorable?.décoloration || null,
                    ondulation: crDemonstration.issueFavorable?.ondulation || null,
                    microscopie: crDemonstration.issueFavorable?.microscopie || null,
                    draw: crDemonstration.issueFavorable?.draw || null,
                    laVégétale: crDemonstration.issueFavorable?.laVégétale || null,
                    autre: crDemonstration.issueFavorable?.autre || null,
                },
                issueDéfavorable: {
                    luminacolor: crDemonstration.issueDéfavorable?.luminacolor || "",
                    veracolor: crDemonstration.issueDéfavorable?.veracolor || "",
                    thalassoBAC: crDemonstration.issueDéfavorable?.thalassoBAC || "",
                    décoloration: crDemonstration.issueDéfavorable?.décoloration || "",
                    ondulation: crDemonstration.issueDéfavorable?.ondulation || "",
                    microscopie: crDemonstration.issueDéfavorable?.microscopie || "",
                    draw: crDemonstration.issueDéfavorable?.draw || "",
                    laVégétale: crDemonstration.issueDéfavorable?.laVégétale || "",
                    autre: crDemonstration.issueDéfavorable?.autre || "",
                },
                actions: {
                    abandon: crDemonstration.actions?.abandon || "",
                    aSuivre: crDemonstration.actions?.aSuivre || "",
                    aRetenter: crDemonstration.actions?.aRetenter || "",
                    adapterLePrix: crDemonstration.actions?.adapterLePrix || "",
                    attenteDeRéponse: crDemonstration.actions?.attenteDeRéponse || "",
                },
                précisions: crDemonstration.précisions || "",
                observationsGénérales: crDemonstration.observationsGénérales || "",
                createdAt: new Date(),
                typeOfForm: "CR de RDV de Démonstration",
                userId: uid,
            });
            setShowForm(true)
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
                            date: new Date(),
                            action: "Mise à jour du Compte rendu de RDV de Démonstration",
                            formData: updatedData,
                            userId: uid
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
    }, [salonInfo, uid]); 
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const salonRef = doc(db, "salons", salonInfo.id)
            const SalonSnapshot = await getDoc(salonRef)
            if (SalonSnapshot.exists()) {
                const salonData = SalonSnapshot.data()
                const updatedcrDemonstration = [...(salonData.crDemonstration || []), formData]
                await updateDoc(salonRef, { crDemonstration: updatedcrDemonstration })   
                await updateSalonHistory(formData)
                setMessage("Compte rendu de RDV de Démonstration enregistré avec succès !") 
                setIsModalOpen(true)

                if (formData.issueFavorable.luminacolor || formData.issueFavorable.veracolor || formData.issueFavorable.thalassoBAC || formData.issueFavorable.décoloration || formData.issueFavorable.ondulation || formData.issueFavorable.laVégétale || formData.issueFavorable.microscopie || formData.issueFavorable.draw || formData.issueFavorable.autre === "OUI") {
                    await updateDoc(salonRef, { 
                        status: "Client" ,  
                        historique: arrayUnion({ date: new Date(), action: "Status mis à jour : Client", userId: uid })
                    })
                }
            }
            else {
                console.error("Document de visite non trouvé.")
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du salon : ", error);
        }
    }
    const handleShowAllCR = async () => {
        if (salonInfo) {
            try {
                const salonRef = doc(db, "salons", salonInfo.id);
                const salonSnapshot = await getDoc(salonRef);
                if (salonSnapshot.exists()) {
                    const data = salonSnapshot.data();
                    const allCR = data.crDemonstration || [];
                    setAllCR(allCR);
                    setShowAllCr(true)
                    setShowForm(false)
                } else {
                    console.error("Document de salon non trouvé.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des fiches enregistrées :", error);
            }
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
    }

    return (
        <div className="demonstration-section">
            <div className="title-fiche">
                <h1>Formulaire du CR de RDV de Démonstration</h1>
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
                <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px", marginBottom: "10px"}} className="button-colored invisible" onClick={handleShowAllCR}>Voir toutes les fiches enregistrées de ce salon</button>
            )}

            {salonInfo && showForm && (
                <form style={{width: "90%"}} onSubmit={handleSubmit}>
                <div className="form-CRD">
                    <h2>{salonInfo?.name}</h2>
                    <p className="adress">{salonInfo?.address}</p> 
                    <p className="city">{salonInfo?.ville}</p>
                    
                    <div className="space">
                        <p className="bold margin">Responsable présent :</p><br></br>
                        <label className="oui"><input className="checkbox" type="radio" name="responsablePrésent" value="oui" checked={formData.responsablePrésent === 'oui'} onChange={handleChange} />OUI</label>
                        <label><input className="checkbox" type="radio" name="responsablePrésent" value="non" checked={formData.responsablePrésent === 'non'} onChange={handleChange} />NON</label><br></br>
                    </div><br></br>
                    <input type="text" name="nomPrenomDuResponsable" placeholder="Nom Prénom du responsable" value={formData.nomPrenomDuResponsable} onChange={handleChange} /><br></br>
                    <input type="téléphone" name="téléphone" placeholder="Téléphone" value={salonInfo.phoneNumber} onChange={handleChange} /><br></br>
                    <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} /><br></br>
                    <input type="text" name="nombreDeCollaborateurs" placeholder="Nombre de collaborateurs" value={formData.nombreDeCollaborateurs} onChange={handleChange} /><br></br>
                    <input type="text" name="duréeDeLaDémonstration" placeholder="Durée de la démonstration" value={formData.duréeDeLaDémonstration} onChange={handleChange} /><br></br><br></br>
                    
                    <div className="display space">
                        <p className="bold margin">Présence d'une technicienne :</p><br></br>
                        <label className="oui">
                            <input type="radio" className="checkbox" name="techniciennePrésente" value="oui"
                                checked={formData.techniciennePrésente === 'oui'} onChange={handleChange}/>
                            OUI
                        </label>
                        <label>
                            <input type="radio" className="checkbox" name="techniciennePrésente" value="non"
                                checked={formData.techniciennePrésente === 'non'} onChange={handleChange}/>
                            NON
                        </label>
                    </div><br></br>
                    {formData.techniciennePrésente === 'oui' && (
                        <>
                        <label className="space oui">
                            <input type="checkbox" className="checkbox" name="avecLaVRP" checked={formData.avecLaVRP} onChange={handleChange} />
                            Avec la VRP
                        </label>
                        <label className="space">
                            <input type="checkbox" className="checkbox" name="seule" checked={formData.seule} onChange={handleChange} />
                            Seule
                        </label><br></br>
                        <input type="text" name="nomDeLaTechnicienne" placeholder="Nom de la technicienne" value={formData.nomDeLaTechnicienne} onChange={handleChange} />
                        </>
                    )}
                    <br></br>
                    <br></br>

                    <p className="bold margin">La démonstration portait sur :</p><br></br>
                    {Object.keys(formData.typeDeDémonstration).map(demo => (
                        demo !== 'autre' ? (
                            <>
                                <label className="margin">
                                    <input type="checkbox" name={demo} checked={formData.typeDeDémonstration[demo]} onChange={handleDemonstrationChange} className="checkbox" />
                                    {demo.charAt(0).toUpperCase() + demo.slice(1)}
                                </label>
                                <br />
                            </>
                        ) : (
                            <label key={demo} style={{ display: "flex", alignItems: "center" }}>
                                Autre: <input className="inputt" style={{ padding: "10px", marginLeft: "20px", marginBottom: "0 !important" }} type="text" value={formData.typeDeDémonstration.autre} onChange={handleOtherChange} />
                            </label>
                        )
                    ))}     

                    {Object.keys(formData.typeDeDémonstration).some(demo => formData.typeDeDémonstration[demo]) && (
                        <div>
                            {Object.keys(formData.typeDeDémonstration).map(demo => (
                                formData.typeDeDémonstration[demo] && (
                                    <div key={demo}>
                                        <p className="bold margin">{demo.charAt(0).toUpperCase() + demo.slice(1)} Issue favorable ?</p><br></br>
                                        <label className="oui margin">
                                            <input className="checkbox" type="radio" name={`issueFavorable-${demo}`} value="OUI" checked={formData.issueFavorable[demo] === 'OUI'} onChange={() => handleIssueFavorableChange(demo, 'OUI')} /> OUI
                                        </label><br></br>
                                        <label>
                                            <input className="checkbox" type="radio" name={`issueFavorable-${demo}`} value="NON" checked={formData.issueFavorable[demo] === 'NON'} onChange={() => handleIssueFavorableChange(demo, 'NON')} /> NON
                                        </label><br></br><br></br>
                                        {formData.issueFavorable[demo] === 'NON' && (
                                            <div className="marginLeft">
                                                <p className="bold margin">Motif de l'issue défavorable :</p><br></br>
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-motif`} value="Trop complexe" checked={formData.issueDéfavorable[demo].motif === 'Trop complexe'} onChange={() => handleIssueDéfavorableMotifChange(demo, 'Trop complexe')} /> Trop complexe
                                                </label><br />
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-motif`} value="Réalisation ratée" checked={formData.issueDéfavorable[demo].motif === 'Réalisation ratée'} onChange={() => handleIssueDéfavorableMotifChange(demo, 'Réalisation ratée')} /> Réalisation ratée
                                                </label><br />
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-motif`} value="Ne correspond pas aux attentes" checked={formData.issueDéfavorable[demo].motif === 'Ne correspond pas aux attentes'} onChange={() => handleIssueDéfavorableMotifChange(demo, 'Ne correspond pas aux attentes')} /> Ne correspond pas aux attentes
                                                </label><br />
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-motif`} value="Implantation concurrente récente" checked={formData.issueDéfavorable[demo].motif === 'Implantation concurrente récente'} onChange={() => handleIssueDéfavorableMotifChange(demo, 'Implantation concurrente récente')} /> Implantation concurrente récente
                                                </label><br />
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-motif`} value="Prix" checked={formData.issueDéfavorable[demo].motif === 'Prix'} onChange={() => handleIssueDéfavorableMotifChange(demo, 'Prix')} /> Prix
                                                </label><br />
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-motif`} value="Souhaite réfléchir" checked={formData.issueDéfavorable[demo].motif === 'Souhaite réfléchir'} onChange={() => handleIssueDéfavorableMotifChange(demo, 'Souhaite réfléchir')} /> Souhaite réfléchir
                                                </label><br /><br></br>

                                                <p className="bold margin">Actions suite à l'issue défavorable :</p><br></br>
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-actions`} value="Abandon" checked={formData.issueDéfavorable[demo].actions === 'Abandon'} onChange={() => handleIssueDéfavorableActionsChange(demo, 'Abandon')} /> Abandon
                                                </label><br />
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-actions`} value="À suivre" checked={formData.issueDéfavorable[demo].actions === 'À suivre'} onChange={() => handleIssueDéfavorableActionsChange(demo, 'À suivre')} /> À suivre
                                                </label><br />
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-actions`} value="À retenter" checked={formData.issueDéfavorable[demo].actions === 'À retenter'} onChange={() => handleIssueDéfavorableActionsChange(demo, 'À retenter')} /> À retenter
                                                </label><br />
                                                <label className="margin">
                                                    <input className="checkbox" type="radio" name={`${demo}-actions`} value="Adapter le prix" checked={formData.issueDéfavorable[demo].actions === 'Adapter le prix'} onChange={() => handleIssueDéfavorableActionsChange(demo, 'Adapter le prix')} /> Adapter le prix
                                                </label><br />
                                                <label className="margin">
                                                    <input                                 className="checkbox" type="radio" name={`${demo}-actions`} value="Attente de réponse" checked={formData.issueDéfavorable[demo].actions === 'Attente de réponse'} onChange={() => handleIssueDéfavorableActionsChange(demo, 'Attente de réponse')} /> Attente de réponse
                                                </label><br /><br></br>
                                                <label className="bold">Préciser :</label><br />
                                                <textarea style={{ marginTop: "10px" }} name={`${demo}-preciser`} value={formData.issueDéfavorable[demo].préciser} onChange={(e) => handleIssueDéfavorablePréciserChange(demo, e.target.value)}></textarea>
                                            </div>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    <label className="bold margin">Observations générales:</label><br></br>
                    <textarea name="observationsGénérales" value={formData.observationsGénérales} onChange={handleChange}></textarea>
                    <br></br>
                    <button type="submit" className="button-colored">Envoyer</button>
                </div>
                </form>
            )} 

            {salonInfo && allCR.length > 0 && showAllCR && (
                    <div className="all-fiches-client">
                    <button  style={{margin: "20px", marginLeft: "40px", padding: "10px 30px"}} className="button-colored" onClick={() => {setShowForm(true) ;setShowAllCr(false)}} >Voir le formulaire</button>
                    <button style={{ padding: "10px 30px" }} onClick={downloadPDF} className='button-colored'>Télécharger les fiches </button>
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

            {isModalOpen && (
                    <div className="modal-success">
                        <div className="content">
                            <p className="success">{message}</p>
                            <button onClick={() => setIsModalOpen(false)}>Fermer</button>
                        </div> 
                    </div>
            )}

        </div>
    )
}

export default FicheDemonstration