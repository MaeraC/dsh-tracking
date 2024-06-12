
// Fichier FicheProspect.js

import back from "../assets/back.png"
import { useState, useCallback } from "react"
import { db } from "../firebase.config"
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"

function FicheProspect({uid, onReturn}) {
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])

    const createdAt = new Date()
    
    const initialFormData = { 
        salonName: "",
        city: "", 
        salonAdresse: "",
        salonTel: "",

        tenueSalon: "",
        tenuPar: "",
        dept: "",
        jFture: "",

        responsableNom: "",
        responsableAge: "",
        numeroPortable: "",
        adresseEmail: "",

        facebook: "",
        instagram: "",
        origineVisite: "",

        colorationsAmmoniaque: [],
        colorationsSansAmmoniaque: [],
        colorationsVegetale: [],
        autresMarques: {
            poudre: "",
            permanente: "",
            bac: "",
            revente: ""
        },
        dateVisite: "",

        responsablePresent: "",
        conceptsProposes: "",
        animationProposee: "",
        pointsProchaineVisite: "",
        interessesPar: "",
        autresPoints: "",
        observations: "",
        statut: "",
        rdvDate: "",
        rdvPour: "",
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
            colorationsAmmoniaque: [...formData.colorationsAmmoniaque, { nom: "", prix: "", ml: "" }]
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
                salonName: salon.name || "",
                city: suiviProspect.city || "",
                salonAdresse: salon.address || "",
                salonTel: suiviProspect.salonTel || "",
    
                tenueSalon: suiviProspect.tenuSalon || "",
                tenuPar: suiviProspect.tenuPar || "",
                dept: suiviProspect.dept || "",
                jFture: suiviProspect.jFture || "",
    
                responsableNom: suiviProspect.responsableNom ||  "",
                responsableAge: suiviProspect.responsableAge || "",
                numeroPortable: suiviProspect.numeroPortable || "",
                adresseEmail: suiviProspect.adresseEmail || "",
    
                facebook: suiviProspect.facebook || "",
                instagram: suiviProspect.instagram || "",
                origineVisite: suiviProspect.origineVisite || "",
                
                colorationsAmmoniaque: suiviProspect.colorationsAmmoniaque || [],
                colorationsSansAmmoniaque: suiviProspect.colorationsSansAmmoniaque || [],
                colorationsVegetale: suiviProspect.colorationsVegetale || [],
                autresMarques: {
                    poudre: (suiviProspect.autresMarques && suiviProspect.autresMarques.poudre) || "",
                    permanente: (suiviProspect.autresMarques && suiviProspect.autresMarques.permanente) || "",
                    bac: (suiviProspect.autresMarques && suiviProspect.autresMarques.bac) || "",
                    revente: (suiviProspect.autresMarques && suiviProspect.autresMarques.revente) || ""
                },
                dateVisite: suiviProspect.dateVisite || "",
    
                responsablePresent: suiviProspect.responsablePresent || "",
                conceptsProposes: suiviProspect.conceptsProposes || "",
                animationProposee: suiviProspect.animationProposee || "",
                interessesPar: suiviProspect.interessesPar || "",
                autresPoints: suiviProspect.autresPoints ||"",
                statut: suiviProspect.statut || "",
                rdvDate: suiviProspect.rdvDate || "",
                rdvPour: suiviProspect.rdvPour || "",
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
                            date: new Date(),
                            action: "Mise à jour de la Fiche de suivi Prospect",
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

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // Mets à jour le document du salon avec les nouvelles informations
            const salonRef = doc(db, "salons", salonInfo.id)
            const SalonSnapshot = await getDoc(salonRef)
           
            if (SalonSnapshot.exists()) {
                const salonData = SalonSnapshot.data()
                const updatedSuiviProspect = [...(salonData.suiviProspect || []), formData]
                await updateDoc(salonRef, { suiviProspect: updatedSuiviProspect })   

                // Met à jour l'historique du salon
                await updateSalonHistory(formData)
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

            <div>
                <input type="text" placeholder="Rechercher un salon par son nom" value={searchSalon} onChange={handleSearch} />
                <div>
                    {suggestions.map((salon) => (
                        <div
                            key={salon.id}
                            onClick={() => handleSelectSuggestion(salon)}
                            style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }}
                        >
                            {salon.name}
                        </div>
                    ))}
                </div>

                {salonInfo && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-FSP">
                            <h2>{salonInfo.name}</h2>
                            <p className="adresse">{salonInfo.address}</p>

                            <input type="text" name="city" placeholder="Ville" value={formData.city} onChange={handleInputChange} required />
                            <input type="text" name="salonTel" placeholder="Téléphone" value={formData.salonTel} onChange={handleInputChange} />
                    
                            <div className="space">
                                <label className="bold margin">Tenue du salon :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="tenueSalon" value="Très bien" checked={formData.tenueSalon === "Très bien"} onChange={handleInputChange} />Très bien</label><br></br>
                                    <label className="margin" ><input className="checkbox" type="radio" name="tenueSalon" value="Moyenne" checked={formData.tenueSalon === "Moyenne"} onChange={handleInputChange} />Moyenne</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="tenueSalon" value="Mauvaise" checked={formData.tenueSalon === "Mauvaise"} onChange={handleInputChange} />Mauvaise</label><br></br>
                                </div>
                            </div><br></br>
                
                            <div className="space">
                                <label className="bold margin">Tenu par :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="tenuPar" value="Proprétaire" checked={formData.tenuPar === "Proprétaire"} onChange={handleInputChange} />Proprétaire</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="tenuPar" value="Salarié" checked={formData.tenuPar === "Salarié"} onChange={handleInputChange} />Salarié</label>
                                </div>
                            </div>
                    
                            <input type="text" name="dept" placeholder="Département" value={formData.dept} onChange={handleInputChange} /> <br></br>
                            <input type="text" name="jFture" placeholder="J.Fture" value={formData.jFture} onChange={handleInputChange} /><br></br>
                            <input type="text" name="responsableNom" placeholder="Nom Prénom du responsable" value={formData.responsableNom} onChange={handleInputChange} />
                    
                            <div className="space">
                                <label className="bold margin">Âge du responsable :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="responsableAge" value="Moins de 35 ans" checked={formData.responsableAge === "Moins de 35 ans"} onChange={handleInputChange} />Moins de 35 ans</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="responsableAge" value="De 35 ans à 50 ans" checked={formData.responsableAge === "De 35 ans à 50 ans"} onChange={handleInputChange} />De 35 ans à 50 ans</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="responsableAge" value="Plus de 50 ans" checked={formData.responsableAge === "Plus de 50 ans"} onChange={handleInputChange} />Plus de 50 ans</label>
                                </div>
                            </div>
                    
                            <input type="text" name="numeroPortable" placeholder="Numéro de portable" value={formData.numeroPortable} onChange={handleInputChange} /><br></br>
                            <input type="email" name="adresseEmail" placeholder="Adresse e-mail" value={formData.adresseEmail} onChange={handleInputChange} /><br></br>
                            <input type="url" name="facebook" placeholder="Facebook" value={formData.facebook} onChange={handleInputChange} /><br></br>
                            <input type="url" name="instagram" placeholder="Instagram" value={formData.instagram} onChange={handleInputChange} /><br></br>
                    
                            <div className="space">
                                <label className="bold margin">Origine de la visite :</label>
                                <div>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineVisite" value="Visite spontanée" checked={formData.origineVisite === "visite spontanée"} onChange={handleInputChange} />Visite spontanée </label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineVisite" value="S. recomm." checked={formData.origineVisite === "S. recomm."} onChange={handleInputChange} />S. recomm.</label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineVisite" value="Ancien client" checked={formData.origineVisite === "Ancien client"} onChange={handleInputChange} />Ancien client </label><br></br>
                                    <label className="margin"><input className="checkbox" type="radio" name="origineVisite" value="Prospection téléphonique" checked={formData.origineVisite === "Prospection téléphonique"} onChange={handleInputChange} />Prospection téléphonique</label>
                                </div>
                            </div>
                
                            <p className="margin"><strong>Marques de coloration présentes</strong> :</p>
                            <div>
                                {formData.colorationsAmmoniaque.map((coloration, index) => (
                                    <div key={index}>
                                        <input
                                            type="text"
                                            placeholder="Nom"
                                            value={coloration.nom}
                                            onChange={(e) => handleColorationChange(index, 'colorationsAmmoniaque', 'nom', e.target.value)}
                                        /><br></br>
                                        <input
                                            type="text"
                                            placeholder="Prix"
                                            value={coloration.prix}
                                            onChange={(e) => handleColorationChange(index, 'colorationsAmmoniaque', 'prix', e.target.value)}
                                        /><br></br>
                                        <input
                                            type="text"
                                            placeholder="ML"
                                            value={coloration.ml}
                                            onChange={(e) => handleColorationChange(index, 'colorationsAmmoniaque', 'ml', e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button className="button-colored" type="button" onClick={handleAddColorationAmmoniaque}>Ajouter une coloration avec ammoniaque</button>
                            </div>
                
                            <div>
                                {formData.colorationsSansAmmoniaque.map((coloration, index) => (
                                    <div key={index}>
                                        <input
                                            type="text"
                                            placeholder="Nom"
                                            value={coloration.nom}
                                            onChange={(e) => handleColorationChange(index, 'colorationsSansAmmoniaque', 'nom', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Prix"
                                            value={coloration.prix}
                                            onChange={(e) => handleColorationChange(index, 'colorationsSansAmmoniaque', 'prix', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="ML"
                                            value={coloration.ml}
                                            onChange={(e) => handleColorationChange(index, 'colorationsSansAmmoniaque', 'ml', e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button className="button-colored" type="button" onClick={handleAddColorationSansAmmoniaque}>Ajouter une coloration sans ammoniaque</button>
                            </div>
                
                            <div>
                                {formData.colorationsVegetale.map((coloration, index) => (
                                    <div key={index}>
                                        <input
                                            type="text"
                                            placeholder="Nom"
                                            value={coloration.nom}
                                            onChange={(e) => handleColorationChange(index, 'colorationsVegetale', 'nom', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Prix"
                                            value={coloration.prix}
                                            onChange={(e) => handleColorationChange(index, 'colorationsVegetale', 'prix', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="ML"
                                            value={coloration.ml}
                                            onChange={(e) => handleColorationChange(index, 'colorationsVegetale', 'ml', e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button className="button-colored" type="button" onClick={handleAddColorationVegetale}>Ajouter une coloration végétale</button>
                            </div>
                
                            <div>
                                <p className="margin"><strong>Autres marques :</strong></p>
                                <input
                                        type="text"
                                        name="poudre"
                                        placeholder="Poudre"
                                        value={formData.autresMarques.poudre}
                                        onChange={(e) => setFormData({ ...formData, autresMarques: { ...formData.autresMarques, poudre: e.target.value } })}
                                    />
                                    <input
                                        type="text"
                                        name="permanente"
                                        placeholder="Permanente"
                                        value={formData.autresMarques.permanente}
                                        onChange={(e) => setFormData({ ...formData, autresMarques: { ...formData.autresMarques, permanente: e.target.value } })}
                                    />
                                    <input
                                        type="text"
                                        name="bac"
                                        placeholder="BAC"
                                        value={formData.autresMarques.bac}
                                        onChange={(e) => setFormData({ ...formData, autresMarques: { ...formData.autresMarques, bac: e.target.value } })}
                                    />
                                    <input
                                        type="text"
                                        name="revente"  
                                        placeholder="Revente"
                                        value={formData.autresMarques.revente}
                                        onChange={(e) => setFormData({ ...formData, autresMarques: { ...formData.autresMarques, revente: e.target.value } })}
                                    />
                            </div>
                
                            <div>
                                <label className="bold margin">Date de visite :</label>
                                <input
                                    type="date"
                                    name="dateVisite"
                                    value={formData.dateVisite}
                                    onChange={handleInputChange}
                                />
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
                                <textarea
                                    name="conceptsProposes"
                                    value={formData.conceptsProposes}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="bold margin">Y a-t-il eu une animation proposée ? Si oui, laquelle ?</label><br></br>
                                <textarea
                                    name="animationProposee"
                                    value={formData.animationProposee}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="bold margin">Points à aborder lors de la prochaine visite :</label><br></br>
                                <textarea
                                    name="pointsProchaineVisite"
                                    value={formData.pointsProchaineVisite}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="bold margin">Intéressés par :</label><br></br>
                                <textarea
                                    name="interessesPar"
                                    value={formData.interessesPar}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="bold margin">Autres points à aborder :</label><br></br>
                                <textarea
                                    name="autresPoints"
                                    value={formData.autresPoints}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="bold margin">Observations (éléments à retenir) ou motifs si abandon :</label>
                                <textarea
                                    name="observations"
                                    value={formData.observations}
                                    onChange={handleInputChange}
                                />
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
                            </div>
                            <div>
                                <label className="bold margin">RDV OK LE :</label>
                                <input type="date" name="rdvDate" placeholder="RDV OK LE" value={formData.rdvDate} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="bold margin">Pour :</label>
                                <select name="rdvPour" value={formData.rdvPour} onChange={handleInputChange}>
                                    <option value="">Choisir</option>
                                    <option value="Présentation">Présentation</option>
                                    <option value="Démo">Démo</option>
                                    <option value="Formation">Formation</option>
                                    <option value="Commercial">Commercial</option>
                                </select>
                            </div>
                            <div className="space">
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
                )}
            </div>
        </div>
    )
}

export default FicheProspect