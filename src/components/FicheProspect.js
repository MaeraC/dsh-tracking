
// Fichier FicheProspect.js

import back from "../assets/back.png"
import { useState, useCallback } from "react"
import { db } from "../firebase.config"
import { collection, query, where, getDocs, doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore"

function FicheProspect({uid, onReturn}) {
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [message, setMessage] = useState("")
    const [isOpenModal, setIsOpenModal] = useState(false)

    const createdAt = new Date()
    
    const initialFormData = { 
        nomDuSalon: "",
        ville: "", 
        adresseDuSalon: "",
        telephoneDuSalon: "",
        tenueDuSalon: "",
        salonTenuPar: "",
        departement: "",
        jFture: "",
        nomDuResponsable: "",
        ageDuResponsable: "",
        numeroduResponsable: "",
        emailDuResponsable: "",
        facebook: "",
        instagram: "",
        origineDeLaVisite: "",
        colorationsAvecAmmoniaque: [],
        colorationsSansAmmoniaque: [],
        colorationsVegetale: [],
        autresMarques: {
            poudre: "",
            permanente: "",
            bac: "",
            revente: ""
        },
        dateDeVisite: "",
        responsablePresent: "",
        conceptsProposes: "",
        animationProposee: "",
        pointsProchaineVisite: "",
        interessesPar: "",
        autresPoints: "",
        observations: "",
        statut: "",
        rdvObtenu: "",
        rdvPrevuLe: "",
        rdvPrevuPour: "",
        rdvType: "",
        typeDeDemonstration: [],
        commande: "",
        createdAt: createdAt,
        typeOfForm: "Fiche de suivi Prospect",
        userId: uid,
    }

    const [formData, setFormData] = useState(initialFormData) 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

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
            colorationsVegetale: [...formData.colorationsVegetale, { nom: "", prix: "", ml: "" }]
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
                nomDuSalon: salon.name || "",
                ville: suiviProspect.ville || "",
                adresseDuSalon: salon.address || "",
                telephoneDuSalon: suiviProspect.telephoneDuSalon || "",
                tenueDuSalon: suiviProspect.tenuSalon || "",
                salonTenuPar: suiviProspect.salonTenuPar || "",
                departement: suiviProspect.departement || "",
                jFture: suiviProspect.jFture || "",
                nomDuResponsable: suiviProspect.nomDuResponsable ||  "",
                ageDuResponsable: suiviProspect.ageDuResponsable || "",
                numeroduResponsable: suiviProspect.numeroduResponsable || "",
                emailDuResponsable: suiviProspect.emailDuResponsable || "",
                facebook: suiviProspect.facebook || "",
                instagram: suiviProspect.instagram || "",
                origineDeLaVisite: suiviProspect.origineDeLaVisite || "",
                colorationsAvecAmmoniaque: suiviProspect.colorationsAvecAmmoniaque || [],
                colorationsSansAmmoniaque: suiviProspect.colorationsSansAmmoniaque || [],
                colorationsVegetale: suiviProspect.colorationsVegetale || [],
                autresMarques: {
                    poudre: (suiviProspect.autresMarques && suiviProspect.autresMarques.poudre) || "",
                    permanente: (suiviProspect.autresMarques && suiviProspect.autresMarques.permanente) || "",
                    bac: (suiviProspect.autresMarques && suiviProspect.autresMarques.bac) || "",
                    revente: (suiviProspect.autresMarques && suiviProspect.autresMarques.revente) || ""
                },
                dateDeVisite: suiviProspect.dateDeVisite || "",
                responsablePresent: suiviProspect.responsablePresent || "",
                conceptsProposes: suiviProspect.conceptsProposes || "",
                animationProposee: suiviProspect.animationProposee || "",
                interessesPar: suiviProspect.interessesPar || "",
                autresPoints: suiviProspect.autresPoints ||"",
                statut: suiviProspect.statut || "",
                rdvObtenu: suiviProspect.rdvObtenu || "",
                rdvPrevuLe: suiviProspect.rdvPrevuLe || "",
                rdvPrevuPour: suiviProspect.rdvPrevuPour || "",
                rdvType: suiviProspect.rdvType || "",
                typeDeDemonstration: suiviProspect.typeDeDemonstration || [],
                commande: suiviProspect.commande || "",
                pointsProchaineVisite: suiviProspect.pointsProchaineVisite || "",
                observations: suiviProspect.observations || "",
                createdAt: createdAt,
                typeOfForm: "Fiche de suivi Client",
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

                if (formData.commande === "OUI") {
                    await updateDoc(salonRef, { 
                        status: "Client" ,
                        historique: arrayUnion({ date: new Date(), action: "Status mis à jour : Client", userId: uid })
                    })
                    setIsOpenModal(true)
                } 
                else {
                    setMessage("Fiche de suivi Prospect enregistré avec succès !");
                }
            }
            else {
                console.error("Document de visite non trouvé.")
            }

        } catch (error) {
            console.error("Erreur lors de la mise à jour du salon : ", error);
        }
    }

    return (
        <div className="fiche-prospect-section">
            <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            <div className="sugg">
                <input  className="input-sugg" type="text" placeholder="Rechercher un salon par son nom" value={searchSalon} onChange={handleSearch} />
                <div  className="select-sugg">
                    {suggestions.map((salon) => (
                        <div key={salon.id} onClick={() => handleSelectSuggestion(salon)} style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }} >{salon.name}</div>
                    ))}
                </div>

                {salonInfo && (
                    <>
                    <p className="success">{message}</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-FSP">
                            <h2>{salonInfo.name}</h2>
                            <p className="adress">{salonInfo.address}</p>

                            <input type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleInputChange} required />
                            <input type="text" name="telephoneDuSalon" placeholder="Téléphone fixe" value={formData.telephoneDuSalon} onChange={handleInputChange} />
                    
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
                            </div>
                    
                            <input type="text" name="departement" placeholder="departement" value={formData.departement} onChange={handleInputChange} /> <br></br>
                            <input type="text" name="jFture" placeholder="J.Fture" value={formData.jFture} onChange={handleInputChange} /><br></br>
                            <input type="text" name="nomDuResponsable" placeholder="Nom Prénom du responsable" value={formData.nomDuResponsable} onChange={handleInputChange} />
                    
                            <div className="space">
                                <label className="bold margin">Âge du responsable :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="ageDuResponsable" value="Moins de 35 ans" checked={formData.ageDuResponsable === "Moins de 35 ans"} onChange={handleInputChange} />Moins de 35 ans</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="ageDuResponsable" value="De 35 ans à 50 ans" checked={formData.ageDuResponsable === "De 35 ans à 50 ans"} onChange={handleInputChange} />De 35 ans à 50 ans</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="ageDuResponsable" value="Plus de 50 ans" checked={formData.ageDuResponsable === "Plus de 50 ans"} onChange={handleInputChange} />Plus de 50 ans</label>
                                </div>
                            </div>
                    
                            <input type="text" name="numeroduResponsable" placeholder="Numéro du responsable" value={formData.numeroduResponsable} onChange={handleInputChange} /><br></br>
                            <input type="email" name="emailDuResponsable" placeholder="E-mail du responsable" value={formData.emailDuResponsable} onChange={handleInputChange} /><br></br>
                            <input type="text" name="facebook" placeholder="Facebook" value={formData.facebook} onChange={handleInputChange} /><br></br>
                            <input type="text" name="instagram" placeholder="Instagram" value={formData.instagram} onChange={handleInputChange} /><br></br>
                    
                            <div className="space">
                                <label className="bold margin">Origine de la visite :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineDeLaVisite" value="Visite spontanée" checked={formData.origineDeLaVisite === "Visite spontanée"} onChange={handleInputChange} />Visite spontanée </label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineDeLaVisite" value="S. recomm." checked={formData.origineDeLaVisite === "S. recomm."} onChange={handleInputChange} />S. recomm.</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineDeLaVisite" value="Ancien client" checked={formData.origineDeLaVisite === "Ancien client"} onChange={handleInputChange} />Ancien client </label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineDeLaVisite" value="Prospection téléphonique" checked={formData.origineDeLaVisite === "Prospection téléphonique"} onChange={handleInputChange} />Prospection téléphonique</label>
                                </div>
                            </div><br></br>
                
                            <p className="margin"><strong>Marques de coloration présentes</strong> :</p>
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
                                        />
                                    </div>
                                ))}
                                <button className="button-colored" type="button" onClick={handleAddColorationAmmoniaque}>Ajouter une coloration avec ammoniaque</button>
                            </div>
                            <div>
                                {formData.colorationsSansAmmoniaque.map((coloration, index) => (
                                    <div key={index}>
                                        <input type="text" placeholder="Nom" value={coloration.nom}
                                            onChange={(e) => handleColorationChange(index, 'colorationsSansAmmoniaque', 'nom', e.target.value)}
                                        />
                                        <input type="text" placeholder="Prix" value={coloration.prix}
                                            onChange={(e) => handleColorationChange(index, 'colorationsSansAmmoniaque', 'prix', e.target.value)}
                                        />
                                        <input type="text" placeholder="ML" value={coloration.ml}
                                            onChange={(e) => handleColorationChange(index, 'colorationsSansAmmoniaque', 'ml', e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button className="button-colored" type="button" onClick={handleAddColorationSansAmmoniaque}>Ajouter une coloration sans ammoniaque</button>
                            </div>
                            <div>
                                {formData.colorationsVegetale.map((coloration, index) => (
                                    <div key={index}>
                                        <input type="text" placeholder="Nom" value={coloration.nom}
                                            onChange={(e) => handleColorationChange(index, 'colorationsVegetale', 'nom', e.target.value)}
                                        />
                                        <input type="text" placeholder="Prix" value={coloration.prix}
                                            onChange={(e) => handleColorationChange(index, 'colorationsVegetale', 'prix', e.target.value)}
                                        />
                                        <input type="text" placeholder="ML" value={coloration.ml}
                                            onChange={(e) => handleColorationChange(index, 'colorationsVegetale', 'ml', e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button className="button-colored" type="button" onClick={handleAddColorationVegetale}>Ajouter une coloration végétale</button>
                            </div>
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
                            </div>
                            <div>
                                <label className="bold margin">Date de visite :</label>
                                <input type="date" name="dateDeVisite" value={formData.dateDeVisite} onChange={handleInputChange} className='custom-select' />
                            </div>
                            <div className="space">
                                <label className="bold margin">Responsable présent :</label>
                                <div>
                                    <label className="oui">
                                        <input className="checkbox" type="radio" name="responsablePresent" value="OUI" checked={formData.responsablePresent === "OUI"} onChange={handleInputChange} />
                                        OUI
                                    </label>
                                    <label>
                                        <input className="checkbox" type="radio" name="responsablePresent" value="NON" checked={formData.responsablePresent === "NON"} onChange={handleInputChange} />
                                        NON
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="bold margin">Quels ont été les concepts ou produits proposés ?</label><br></br>
                                <textarea name="conceptsProposes" value={formData.conceptsProposes} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="bold margin">Y a-t-il eu une animation proposée ? Si oui, laquelle ?</label><br></br>
                                <textarea name="animationProposee" value={formData.animationProposee} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="bold margin">Points à aborder lors de la prochaine visite :</label><br></br>
                                <textarea name="pointsProchaineVisite" value={formData.pointsProchaineVisite} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="bold margin">Intéressés par :</label><br></br>
                                <textarea name="interessesPar" value={formData.interessesPar} onChange={handleInputChange} />
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
                                        <input type="date"  className='custom-select' name="rdvPrevuLe" placeholder="Prévu pour le" value={formData.rdvPrevuLe} onChange={handleInputChange} />
                                    </div>
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
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDemonstration" value="Microscopie" checked={formData.typeDeDemonstration.includes("Microscopie")} onChange={handleInputChange} />Microscopie</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDemonstration" value="ColorationThalasso" checked={formData.typeDeDemonstration.includes("ColorationThalasso")} onChange={handleInputChange} />Coloration Thalasso</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDemonstration" value="LaVégétale" checked={formData.typeDeDemonstration.includes("LaVégétale")} onChange={handleInputChange} />La Végétale</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDemonstration" value="DécolorationPermanente" checked={formData.typeDeDemonstration.includes("DécolorationPermanente")} onChange={handleInputChange} />Décoloration permanente</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDemonstration" value="ByDSH" checked={formData.typeDeDemonstration.includes("ByDSH")} onChange={handleInputChange} />By DSH</label><br></br>
                                                <label className="margin"><input className="checkbox" type="checkbox" name="typeDeDemonstration" value="Olyzea" checked={formData.typeDeDemonstration.includes("Olyzea")} onChange={handleInputChange} />Olyzea</label>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="space"><br></br>
                                <label className="bold margin">Commande ? :</label>
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
                    <p className="success">{message}</p>
                    </>
                )}
                </div> 
                {isOpenModal && (
                    <div className="modal-commande">
                        <div>
                            <p>Fiche enregistrée avec succès !<br></br> Dirigez-vous vers la section Fiche de suivi Client</p>
                            <button onClick={() => setIsOpenModal(false)}>Fermer</button>
                        </div>
                    </div>
                )}
            
            </div>
    )
}

export default FicheProspect