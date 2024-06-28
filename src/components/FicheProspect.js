
// Fichier FicheProspect.js

import back from "../assets/back.png"
import plus from "../assets/plusplus.png"
import { useState, useCallback } from "react"
import { db } from "../firebase.config"
import { collection, query, where, getDocs, doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore"

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
    const [rdvPresentationCount, setRdvPresentationCount] = useState(0)

    const createdAt = new Date()

    const initialFormData = { 
        adresseDuSalon: "",
        téléphoneDuSalon: "",
        tenueDuSalon: "",
        salonTenuPar: "",
        département: "",
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
        rdvType: "",
        typeDeDémonstration: [],
        commande: "",
        createdAt: createdAt,
        typeOfForm: "Fiche de suivi Prospect",
        userId: uid,
    }
    const [formData, setFormData] = useState(initialFormData) 

    const handleInputChange = (e) => {
            const { name, value, type, checked } = e.target;
            if (type === "checkbox") {
                const newTypeDeDémonstration = checked
                    ? [...formData.typeDeDémonstration, value]
                    : formData.typeDeDémonstration.filter(item => item !== value);
                setFormData({ ...formData, typeDeDémonstration: newTypeDeDémonstration });
            } else {
                setFormData({ ...formData, [name]: value });
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

    // Recherche d'une fiche prospect par le nom du salon 
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
            const data = salonSnapshot.data()
            const suiviProspect = data.suiviProspect ? data.suiviProspect[data.suiviProspect.length - 1] : {}

            setFormData({
                adresse: salon.address || "",
                city: salon.city || "",
                name: salon.name || "",
                téléphoneDuSalon: suiviProspect.téléphoneDuSalon || "",
                tenueDuSalon: suiviProspect.tenueDuSalon || "",
                salonTenuPar: suiviProspect.salonTenuPar || "",
                département: suiviProspect.département || "",
                jFture: suiviProspect.jFture || "",
                nomDuResponsable: suiviProspect.nomDuResponsable ||  "",
                âgeDuResponsable: suiviProspect.âgeDuResponsable || "",
                numéroDuResponsable: suiviProspect.numéroDuResponsable || "",
                emailDuResponsable: suiviProspect.emailDuResponsable || "",
                facebook: suiviProspect.facebook || "",
                instagram: suiviProspect.instagram || "",
                origineDeLaVisite: suiviProspect.origineDeLaVisite || "",
                colorationsAvecAmmoniaque: suiviProspect.colorationsAvecAmmoniaque || [],
                colorationsSansAmmoniaque: suiviProspect.colorationsSansAmmoniaque || [],
                colorationsVégétales: suiviProspect.colorationsVégétales || [],
                autresMarques: {
                    poudre: (suiviProspect.autresMarques && suiviProspect.autresMarques.poudre) || "",
                    permanente: (suiviProspect.autresMarques && suiviProspect.autresMarques.permanente) || "",
                    bac: (suiviProspect.autresMarques && suiviProspect.autresMarques.bac) || "",
                    revente: (suiviProspect.autresMarques && suiviProspect.autresMarques.revente) || ""
                },
                dateDeVisite: suiviProspect.dateDeVisite || "",
                responsablePrésent: suiviProspect.responsablePrésent || "",
                conceptsProposés: suiviProspect.conceptsProposés || "",
                animationProposée: suiviProspect.animationProposée || "",
                intéressésPar: suiviProspect.intéressésPar || "",
                autresPoints: suiviProspect.autresPoints ||"",
                statut: suiviProspect.statut || "",
                rdvObtenu: suiviProspect.rdvObtenu || "",
                rdvPrévuLe: suiviProspect.rdvPrévuLe || "",
                rdvPrévuPour: suiviProspect.rdvPrévuPour || "",
                typeDeRdv: suiviProspect.typeDeRdv || "",
                typeDeDémonstration: suiviProspect.typeDeDémonstration || [],
                commande: suiviProspect.commande || "",
                pointsPourLaProchaineVisite: suiviProspect.pointsPourLaProchaineVisite || "",
                observations: suiviProspect.observations || "",
                createdAt: createdAt,
                typeOfForm: "Fiche de suivi Prospect",
                userId: uid,
            })
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
    }, [salonInfo, uid]); 

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault()
  
        try {
            const salonRef = doc(db, "salons", salonInfo.id)
            const SalonSnapshot = await getDoc(salonRef)
           
            if (SalonSnapshot.exists()) {
                const salonData = SalonSnapshot.data()
                const modifiedFields = {};
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== salonData[key]) {
                        modifiedFields[key] = formData[key];
                    }
                });

                const updatedSuiviProspect = [...(salonData.suiviProspect || []), modifiedFields]
                await updateDoc(salonRef, { suiviProspect: updatedSuiviProspect })   
                await updateSalonHistory(modifiedFields)
                setMessage("Fiche de suivi Prospect enregistré avec succès !") 
                setIsModalOpen(true)

                if (formData.commande === "OUI") {
                    await updateDoc(salonRef, { 
                        status: "Client" ,
                        historique: arrayUnion({ date: new Date(), action: "Status mis à jour : Client", userId: uid })
                    })
                    setIsOpenModal(true)
                    setIsModalOpen(false)
                } 
                else {
                    setMessage("Fiche de suivi Prospect enregistrée avec succès !");
                }
            }
            else {
                console.error("Document de visite non trouvé.")
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
    
                // Filtrer les fiches par période
                const filteredFiches = allFiches.filter((fiche) => {
                    const ficheDate = new Date(fiche.dateDeVisite);
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    return ficheDate >= start && ficheDate <= end;
                });

                 // Calcul du nombre de rdv de présentation
                const rdvPresentationCount = filteredFiches.reduce((total, fiche) => {
                    return total + (fiche.crPresentation ? fiche.crPresentation.length : 0);
                }, 0);
    
                setFilteredFiches(filteredFiches);
                setIsViewFilteredFichesOpen(true);
                setRdvPresentationCount(rdvPresentationCount)
            } else {
                console.error("Document de visite non trouvé.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error);
        }
    };

    const handleViewFichesCurrentYear = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id);
            const salonSnapshot = await getDoc(salonRef);
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data();
                const allFiches = salonData.suiviProspect || [];
    
                // Récupérer l'année en cours
                const currentYear = new Date().getFullYear();
    
                // Filtrer les fiches pour l'année en cours
                const currentYearFiches = allFiches.filter((fiche) => {
                    const ficheDate = new Date(fiche.dateDeVisite);
                    return ficheDate.getFullYear() === currentYear;
                });

                 // Calcul du nombre de rdv de présentation
                const rdvPresentationCount = filteredFiches.reduce((total, fiche) => {
                    return total + (fiche.crPresentation ? fiche.crPresentation.length : 0);
                }, 0);
    
                setFilteredFiches(currentYearFiches);
                setIsViewFilteredFichesOpen(true);
                setRdvPresentationCount(rdvPresentationCount)
            } else {
                console.error("Document de visite non trouvé.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error);
        }
    };
    
    const handleCloseFilteredFiches = () => {
        setIsViewFilteredFichesOpen(false);
        setFilteredFiches([]);
    };

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

                {salonInfo && (
                    <>
                    <div style={{display: "flex", margin: "20px 0", justifyContent: "center"}}>  
                        <button onClick={handleViewAllFiches} style={{marginRight: "20px"}} className="button-colored">Toutes les fiches enregistrées</button>
                        <button onClick={handleViewFichesCurrentYear} className="button-colored">Fiches de l'année en cours</button>
                    </div>
                    
                    <div style={{padding: "20px", boxShadow: "2px 2px 15px #cfcfcf", borderRadius: "20px", marginBottom: "10px"}}>
                        <label className="label">Date de début</label>
                        <input type="date" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <label className="label">Date de fin</label>
                        <input type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <button onClick={handleFilterByDate} style={{width: "100%"}} className="button-colored">Filtrer par période</button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-FSP">
                            <h2>{salonInfo.name}</h2>
                            <p className="adress">{salonInfo.address}</p>
                            <p className="city">{salonInfo.city}</p>

                            <input type="text" name="téléphoneDuSalon" placeholder="Téléphone fixe" value={formData.téléphoneDuSalon} onChange={handleInputChange} />
                            <input type="text" name="département" placeholder="Département" value={formData.département} onChange={handleInputChange} /> <br></br>
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
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDémonstration" value="Olyzea" checked={formData.typeDeDémonstration.includes("Olyzea")} onChange={handleInputChange} />Olyzea</label>
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
                            <button type="submit" className="button-colored">Enregistrer</button>
                        </div>
                    </form>  

                    {isViewAllFichesOpen && (
                        <div className="modal-fiches">
                            <div className="content">
                                <h2>Toutes les fiches enregistrées</h2>
                                {allFiches.map((fiche, index) => (
                                    <div key={index} className="fiche-item">
                                        <h3>Fiche {index + 1}</h3>
                                        <p><strong>Adresse du salon :</strong> {fiche.adresseDuSalon}</p>
                                        <p><strong>Téléphone du salon :</strong> {fiche.téléphoneDuSalon}</p>
                                        <p><strong>Tenue du salon :</strong> {fiche.tenueDuSalon}</p>
                                        <p><strong>Salon tenu par :</strong> {fiche.salonTenuPar}</p>
                                        <p><strong>Département :</strong> {fiche.département}</p>
                                        <p><strong>J.Fture :</strong> {fiche.jFture}</p>
                                        <p><strong>Nom du responsable :</strong> {fiche.nomDuResponsable}</p>
                                        <p><strong>Âge du responsable :</strong> {fiche.âgeDuResponsable}</p>
                                        <p><strong>Numéro du responsable :</strong> {fiche.numéroDuResponsable}</p>
                                        <p><strong>E-mail du responsable :</strong> {fiche.emailDuResponsable}</p>
                                        <p><strong>Facebook :</strong> {fiche.facebook}</p>
                                        <p><strong>Instagram :</strong> {fiche.instagram}</p>
                                        <p><strong>Origine de la visite :</strong> {fiche.origineDeLaVisite}</p>
                                        
                                        <p><strong>Colorations avec ammoniaque :</strong></p>
                                        <ul>
                                            {fiche.colorationsAvecAmmoniaque.map((coloration, idx) => (
                                                <li key={idx}>{coloration.nom}, Prix: {coloration.prix}, ML: {coloration.ml}</li>
                                            ))}
                                        </ul>

                                        <p><strong>Colorations sans ammoniaque :</strong></p>
                                        <ul>
                                            {fiche.colorationsSansAmmoniaque.map((coloration, idx) => (
                                                <li key={idx}>{coloration.nom}, Prix: {coloration.prix}, ML: {coloration.ml}</li>
                                            ))}
                                        </ul>

                                        <p><strong>Colorations végétales :</strong></p>
                                        <ul>
                                            {fiche.colorationsVégétales.map((coloration, idx) => (
                                                <li key={idx}>{coloration.nom}, Prix: {coloration.prix}, ML: {coloration.ml}</li>
                                            ))}
                                        </ul>

                                        <p><strong>Autres marques :</strong></p>
                                        <p>Poudre: {fiche.autresMarques.poudre}</p>
                                        <p>Permanente: {fiche.autresMarques.permanente}</p>
                                        <p>BAC: {fiche.autresMarques.bac}</p>
                                        <p>Revente: {fiche.autresMarques.revente}</p>

                                        <p><strong>Date de visite :</strong> {fiche.dateDeVisite}</p>
                                        <p><strong>Responsable présent :</strong> {fiche.responsablePrésent}</p>
                                        <p><strong>Concepts proposés :</strong> {fiche.conceptsProposés}</p>
                                        <p><strong>Animation proposée :</strong> {fiche.animationProposée}</p>
                                        <p><strong>Points pour la prochaine visite :</strong> {fiche.pointsPourLaProchaineVisite}</p>
                                        <p><strong>Intéressés par :</strong> {fiche.intéressésPar}</p>
                                        <p><strong>Autres points à aborder :</strong> {fiche.autresPoints}</p>
                                        <p><strong>Observations :</strong> {fiche.observations}</p>
                                        <p><strong>Statut :</strong> {fiche.statut}</p>
                                        <p><strong>RDV obtenu :</strong> {fiche.rdvObtenu}</p>
                                        {fiche.rdvObtenu === "OUI" && (
                                            <>
                                                <p><strong>RDV prévu le :</strong> {fiche.rdvPrévuLe}</p>
                                                <p><strong>Type de RDV :</strong> {fiche.typeDeRdv}</p>
                                                {fiche.typeDeRdv === "Démonstration" && (
                                                    <p><strong>Type de démonstration :</strong> {fiche.typeDeDémonstration.join(', ')}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => setIsViewAllFichesOpen(false)}>Fermer</button>
                            </div>
                        </div>
                    )}

                    {isViewFilteredFichesOpen && (
                        <div className="modal-fiches">
                            <div className="content">
                                <h2>Fiches filtrées</h2>
                                <p>Nombre de RDV de présentation : {rdvPresentationCount}</p>
                                {filteredFiches.map((fiche, index) => (
                                    <div key={index} className="fiche-item">
                                        <p><strong>Adresse du salon :</strong> {fiche.adresseDuSalon}</p>
                                        <p><strong>Téléphone du salon :</strong> {fiche.téléphoneDuSalon}</p>
                                        <p><strong>Tenue du salon :</strong> {fiche.tenueDuSalon}</p>
                                        <p><strong>Salon tenu par :</strong> {fiche.salonTenuPar}</p>
                                        <p><strong>Département :</strong> {fiche.département}</p>
                                        <p><strong>J.Fture :</strong> {fiche.jFture}</p>
                                        <p><strong>Nom du responsable :</strong> {fiche.nomDuResponsable}</p>
                                        <p><strong>Âge du responsable :</strong> {fiche.âgeDuResponsable}</p>
                                        <p><strong>Numéro du responsable :</strong> {fiche.numéroDuResponsable}</p>
                                        <p><strong>E-mail du responsable :</strong> {fiche.emailDuResponsable}</p>
                                        <p><strong>Facebook :</strong> {fiche.facebook}</p>
                                        <p><strong>Instagram :</strong> {fiche.instagram}</p>
                                        <p><strong>Origine de la visite :</strong> {fiche.origineDeLaVisite}</p>
                                        
                                        <p><strong>Colorations avec ammoniaque :</strong></p>
                                        <ul>
                                            {fiche.colorationsAvecAmmoniaque.map((coloration, idx) => (
                                                <li key={idx}>{coloration.nom}, Prix: {coloration.prix}, ML: {coloration.ml}</li>
                                            ))}
                                        </ul>

                                        <p><strong>Colorations sans ammoniaque :</strong></p>
                                        <ul>
                                            {fiche.colorationsSansAmmoniaque.map((coloration, idx) => (
                                                <li key={idx}>{coloration.nom}, Prix: {coloration.prix}, ML: {coloration.ml}</li>
                                            ))}
                                        </ul>

                                        <p><strong>Colorations végétales :</strong></p>
                                        <ul>
                                            {fiche.colorationsVégétales.map((coloration, idx) => (
                                                <li key={idx}>{coloration.nom}, Prix: {coloration.prix}, ML: {coloration.ml}</li>
                                            ))}
                                        </ul>

                                        <p><strong>Autres marques :</strong></p>
                                        <p>Poudre: {fiche.autresMarques.poudre}</p>
                                        <p>Permanente: {fiche.autresMarques.permanente}</p>
                                        <p>BAC: {fiche.autresMarques.bac}</p>
                                        <p>Revente: {fiche.autresMarques.revente}</p>

                                        <p><strong>Date de visite :</strong> {fiche.dateDeVisite}</p>
                                        <p><strong>Responsable présent :</strong> {fiche.responsablePrésent}</p>
                                        <p><strong>Concepts proposés :</strong> {fiche.conceptsProposés}</p>
                                        <p><strong>Animation proposée :</strong> {fiche.animationProposée}</p>
                                        <p><strong>Points pour la prochaine visite :</strong> {fiche.pointsPourLaProchaineVisite}</p>
                                        <p><strong>Intéressés par :</strong> {fiche.intéressésPar}</p>
                                        <p><strong>Autres points à aborder :</strong> {fiche.autresPoints}</p>
                                        <p><strong>Observations :</strong> {fiche.observations}</p>
                                        <p><strong>Statut :</strong> {fiche.statut}</p>
                                        <p><strong>RDV obtenu :</strong> {fiche.rdvObtenu}</p>
                                        {fiche.rdvObtenu === "OUI" && (
                                            <>
                                                <p><strong>RDV prévu le :</strong> {fiche.rdvPrévuLe}</p>
                                                <p><strong>Type de RDV :</strong> {fiche.typeDeRdv}</p>
                                                {fiche.typeDeRdv === "Démonstration" && (
                                                    <p><strong>Type de démonstration :</strong> {fiche.typeDeDémonstration.join(', ')}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                                <button onClick={handleCloseFilteredFiches}>Fermer</button>
                            </div>
                        </div>
                    )}


                    </>
                )}
                </div> 
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
                            <button onClick={() => setIsModalOpen(false)}>Fermer</button>
                        </div> 
                    </div>
                )}
            
            </div>
    )
}

export default FicheProspect