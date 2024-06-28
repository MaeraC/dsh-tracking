
// fichier FicheDemonstration.js

import React, { useState, useEffect, useCallback } from "react"
import { db } from "../firebase.config"
import { updateDoc, doc, getDoc, getDocs, query, collection, where, arrayUnion } from "firebase/firestore"
import back from "../assets/back.png"

function FicheDemonstration({ uid, onReturn }) {
    const [salons, setSalons] = useState([])
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [allCR, setAllCR] = useState([]);
    const [allFiches, setAllFiches] = useState([]);
    const [filteredFiches, setFilteredFiches] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState("")
    const [selectedDate, setSelectedDate] = useState("")

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
          autre: false,
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
          autre: false,
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

    const handleDemonstrationChange = (e) => {
            const { name, checked } = e.target;
            setFormData(prevState => ({...prevState, typeDeDémonstration: {...prevState.typeDeDémonstration, [name]: checked}}));
    };

    const handleIssueFavorableChange = (demo, value) => {
            setFormData(prevState => ({
                ...prevState,
                issueFavorable: {
                    ...prevState.issueFavorable,
                    [demo]: value,
                },
                issueDéfavorable: value === 'NON' ? {
                    ...prevState.issueDéfavorable,
                    [demo]: { motif: '', actions: '', préciser: '' }
                } : prevState.issueDéfavorable,
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
        setSalonInfo(salon);
        setSuggestions([]);
        const salonRef = doc(db, "salons", salon.id);
        const salonSnapshot = await getDoc(salonRef);
        if (salonSnapshot.exists()) {
            const data = salonSnapshot.data();
            const crDemonstration = data.crDemonstration ? data.crDemonstration[data.crDemonstration.length - 1] : {};

            setFormData({
                adresse: salon.address || "",
                city: salon.city || "",
                name: salon.name || "",
                nomPrenomDuResponsable: crDemonstration.nomPrenomDuResponsable || "",
                responsablePrésent: crDemonstration.responsablePrésent || "",
                téléphone: crDemonstration.téléphone || "",
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
                } else {
                    console.error("Document de salon non trouvé.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des fiches enregistrées :", error);
            }
        }
    };

    // Fonction pour récupérer tous les comptes rendus
    const fetchAllFiches = () => {
        let allFichesArray = [];

        salons.forEach(salon => {
           // console.log(salon)  
            if (salon.crDemonstration && Array.isArray(salon.crDemonstration)) {
                salon.crDemonstration.forEach(fiche => {
                    allFichesArray.push(fiche); // Ajoute chaque compte rendu à allFichesArray
                });
            }
        });

        setAllFiches(allFichesArray);
        setFilteredFiches(allFichesArray); // Initialise filteredFiches avec tous les comptes rendus
    };

    const filterByCurrentYear = () => {
        let allFichesArray = [];

        salons.forEach(salon => {
            if (salon.crDemonstration && Array.isArray(salon.crDemonstration)) {
                salon.crDemonstration.forEach(fiche => {
                    allFichesArray.push(fiche); // Ajoute chaque compte rendu à allFichesArray
                });
            }
        });

        setAllFiches(allFichesArray);

        const anneeEnCours = new Date().getFullYear();
        const filtered = allFiches.filter(fiche => { 
              
            const date = fiche.createdAt.toDate(); 
            return date.getFullYear() === anneeEnCours;
        });

        setFilteredFiches(filtered);
    }

    
    const filterByDateRange = () => {
        let allFichesArray = [];

        salons.forEach(salon => {
            if (salon.crDemonstration && Array.isArray(salon.crDemonstration)) {
                salon.crDemonstration.forEach(fiche => {
                    allFichesArray.push(fiche); // Ajoute chaque compte rendu à allFichesArray
                });
            }
        });

        setAllFiches(allFichesArray);

        const start = new Date(startDate);
        const end = new Date(endDate);

        const filtered = allFiches.filter(fiche => {
            const date = fiche.createdAt.toDate(); // Convertit le Timestamp en Date JavaScript

            // Compare les dates pour voir si elles sont dans la plage sélectionnée
            return date >= start && date <= end;
        });

        setFilteredFiches(filtered);
    };

    const filterBySelectedDate = () => {
        let allFichesArray = [];

        salons.forEach(salon => {
            if (salon.crDemonstration && Array.isArray(salon.crDemonstration)) {
                salon.crDemonstration.forEach(fiche => {
                    allFichesArray.push(fiche); // Ajoute chaque compte rendu à allFichesArray
                });
            }
        });

        setAllFiches(allFichesArray);
        console.log(allFiches)

        const formattedSelectedDate = new Date(selectedDate).setHours(0, 0, 0, 0);

        const filtered = allFiches.filter(fiche => {
            const date = fiche.createdAt.toDate().setHours(0, 0, 0, 0);
            return date === formattedSelectedDate
        });

        setFilteredFiches(filtered);
    }

    return (
        <div className="demonstration-section">
            <div className="title-fiche">
                <h1>Compte rendu de RDV de Démonstration</h1>
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

                {salonInfo && (
                     <>
                     <button onClick={handleShowAllCR}>Voir toutes les fiches enregistrées</button>

                    <form onSubmit={handleSubmit}>
                        <div className="form-CRD">
                            <h2>{salonInfo.name}</h2>
                            <p className="adress">{salonInfo.address}</p>
                            <p className="city">{salonInfo.ville}</p>
                            
                            <div className="space">
                                <p className="bold margin">Responsable présent :</p><br></br>
                                <label className="oui"><input className="checkbox" type="radio" name="responsablePrésent" value="oui" checked={formData.responsablePrésent === 'oui'} onChange={handleChange} />OUI</label>
                                <label><input className="checkbox" type="radio" name="responsablePrésent" value="non" checked={formData.responsablePrésent === 'non'} onChange={handleChange} />NON</label>
                            </div>
                            <input type="text" name="nomPrenomDuResponsable" placeholder="Nom Prénom du responsable" value={formData.nomPrenomDuResponsable} onChange={handleChange} /><br></br>
                            <input type="téléphone" name="téléphone" placeholder="Téléphone" value={formData.téléphone} onChange={handleChange} /><br></br>
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
                                <>
                                <label key={demo} className="margin">
                                    <input type="checkbox" name={demo} checked={formData.typeDeDémonstration[demo]} onChange={handleDemonstrationChange} className="checkbox" />
                                    {demo.charAt(0).toUpperCase() + demo.slice(1)}
                                </label><br></br>
                                </> 
                            ))}<br />       

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

                    {allCR.length > 0 && (
                        <div className="all-cr-list">
                            <h2>Toutes les fiches enregistrées :</h2>
                            {allCR.map((fiche, index) => (
                                <div key={index} className="fiche-details">
                                    <h3>Fiche {index + 1}</h3>
                                    <p><strong>Nom et prénom du responsable :</strong> {fiche.nomPrenomDuResponsable}</p>
                                    <p><strong>Responsable présent :</strong> {fiche.responsablePrésent}</p>
                                    <p><strong>Téléphone :</strong> {fiche.téléphone}</p>
                                    <p><strong>Email :</strong> {fiche.email}</p>
                                    <p><strong>Nombre de collaborateurs :</strong> {fiche.nombreDeCollaborateurs}</p>
                                    <p><strong>Type de démonstration :</strong> 
                                        {Object.keys(fiche.typeDeDémonstration)
                                            .filter(key => fiche.typeDeDémonstration[key])
                                            .map(key => (
                                                <span key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}, </span>
                                            ))}
                                    </p>
                                    <p><strong>Durée de la démonstration :</strong> {fiche.duréeDeLaDémonstration}</p>
                                    <p><strong>Technicienne présente :</strong> {fiche.techniciennePrésente}</p>
                                    {fiche.techniciennePrésente === 'oui' && (
                                        <>
                                            <p><strong>Avec la VRP :</strong> {fiche.avecLaVRP ? 'Oui' : 'Non'}</p>
                                            <p><strong>Seule :</strong> {fiche.seule ? 'Oui' : 'Non'}</p>
                                            <p><strong>Nom de la technicienne :</strong> {fiche.nomDeLaTechnicienne}</p>
                                        </>
                                    )}
                                    <p><strong>Issue favorable :</strong> 
                                        {Object.keys(fiche.issueFavorable)
                                            .filter(key => fiche.issueFavorable[key] === 'OUI')
                                            .map(key => (
                                                <span key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}, </span>
                                            ))}
                                    </p>
                                    <p><strong>Issue défavorable :</strong> 
                                        {Object.keys(fiche.issueDéfavorable)
                                            .filter(key => fiche.issueFavorable[key] === 'NON')
                                            .map(key => (
                                                <span key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}, </span>
                                            ))}
                                    </p>
                                    <p><strong>Actions :</strong></p>
                                    <ul>
                                        {Object.keys(fiche.actions).map(action => (
                                            <li key={action}><strong>{action} :</strong> {fiche.actions[action]}</li>
                                        ))}
                                    </ul>
                                    <p><strong>Précisions :</strong> {fiche.précisions}</p>
                                    <p><strong>Observations générales :</strong> {fiche.observationsGénérales}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    </>
                )}

                <button onClick={fetchAllFiches}>Voir tous les comptes rendus</button>
                <button onClick={filterByCurrentYear}>Voir tous les comptes rendus de l'année en cours</button>
                <br />
                <div> 
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    <button onClick={filterBySelectedDate}>Valider la date</button>
                </div> 
                <div>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    <button onClick={filterByDateRange}>Valider la période</button>
                </div>       
 
                {filteredFiches.map((fiche, index) => (
                    <div key={index} className="fiche-details">
                        <h3>Fiche {index + 1}</h3>  
                        <p><strong>Nom du salon :</strong> {fiche.name}</p>
                        <p><strong>Nom et prénom du responsable :</strong> {fiche.nomPrenomDuResponsable}</p>
                        <p><strong>Responsable présent :</strong> {fiche.responsablePrésent}</p>
                        <p><strong>Téléphone :</strong> {fiche.téléphone}</p>
                                    <p><strong>Email :</strong> {fiche.email}</p>
                                    <p><strong>Nombre de collaborateurs :</strong> {fiche.nombreDeCollaborateurs}</p>
                                    <p><strong>Type de démonstration :</strong> 
                                        {Object.keys(fiche.typeDeDémonstration)
                                            .filter(key => fiche.typeDeDémonstration[key])
                                            .map(key => (
                                                <span key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}, </span>
                                            ))}
                                    </p>
                                    <p><strong>Durée de la démonstration :</strong> {fiche.duréeDeLaDémonstration}</p>
                                    <p><strong>Technicienne présente :</strong> {fiche.techniciennePrésente}</p>
                                    {fiche.techniciennePrésente === 'oui' && (
                                        <>
                                            <p><strong>Avec la VRP :</strong> {fiche.avecLaVRP ? 'Oui' : 'Non'}</p>
                                            <p><strong>Seule :</strong> {fiche.seule ? 'Oui' : 'Non'}</p>
                                            <p><strong>Nom de la technicienne :</strong> {fiche.nomDeLaTechnicienne}</p>
                                        </>
                                    )}
                                    <p><strong>Issue favorable :</strong> 
                                        {Object.keys(fiche.issueFavorable)
                                            .filter(key => fiche.issueFavorable[key] === 'OUI')
                                            .map(key => (
                                                <span key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}, </span>
                                            ))}
                                    </p>
                                    <p><strong>Issue défavorable :</strong> 
                                        {Object.keys(fiche.issueDéfavorable)
                                            .filter(key => fiche.issueFavorable[key] === 'NON')
                                            .map(key => (
                                                <span key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}, </span>
                                            ))}
                                    </p>
                                    <p><strong>Actions :</strong></p>
                                    <ul>
                                        {Object.keys(fiche.actions).map(action => (
                                            <li key={action}><strong>{action} :</strong> {fiche.actions[action]}</li>
                                        ))}
                                    </ul>
                                    <p><strong>Précisions :</strong> {fiche.précisions}</p>
                                    <p><strong>Observations générales :</strong> {fiche.observationsGénérales}</p>
                                   
                </div>
            ))}

                {isModalOpen && (
                    <div className="modal-success">
                        <div className="content">
                            <p className="success">{message}</p>
                            <button onClick={() => setIsModalOpen(false)}>Fermer</button>
                        </div> 
                    </div>
                )}
            </div>

        </div>
    )
}

export default FicheDemonstration