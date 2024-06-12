
// ficheClient.js

import back from "../assets/back.png"
import { useState, useCallback } from "react" 
import { db } from "../firebase.config"
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"

function FicheClient({ onReturn, uid }) {
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])

    const createdAt = new Date()
    
    const initialFormData = {
        salonName: "",
        city: "",
        salonAdresse: "",
        salonTel: "",
        responsableNomPrenom: "",
        responsablePortable: "",
        responsableEmail: "",
        marquesEnPlace: {
            systemeDsh: false,
            colorationThalasso: false,
            mechesThalasso: false,
            ondThPerm: false,
            laVegetale: false,
            byDsh: false,
            oyzea: false,
            stylPro: false,
            persTou: false,
        },
        equipe: [],
        clientEnContrat: "",
        contratLequel: "",
        tarifSpecifique: "",
        dateVisite: "",
        responsablePresent: "",
        priseDeCommande: "",
        gammesCommande: "",
        animationProposee: "",
        produitsProposes: "",
        autresPointsAbordes: "",
        pointsProchaineVisite: "",
        observations: "",
        createdAt: createdAt,
        typeOfForm: "Fiche de suivi Client",
        userId: uid,
    }

    const [formData, setFormData] = useState(initialFormData)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            marquesEnPlace: { ...formData.marquesEnPlace, [name]: checked }
        });
    }

    const handleAddEquipeMember = () => {
        setFormData({
            ...formData,
            equipe: [...formData.equipe, { nomPrenom: "", role: "" }]
        });
    }

    const handleEquipeChange = (index, field, value) => {
        const newEquipe = formData.equipe.map((member, i) => {
            if (i === index) {
                return { ...member, [field]: value };
            }
            return member;
        });

        setFormData({ ...formData, equipe: newEquipe });
    }

    // Recherche d'une fiche client par le nom du salon 
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
                    if (data.status === "Client") {
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
        setSalonInfo(salon);
        setSuggestions([]);

        const salonRef = doc(db, "salons", salon.id);
        const salonSnapshot = await getDoc(salonRef);

        if (salonSnapshot.exists()) {
            const data = salonSnapshot.data();
            const suiviClient = data.suiviClient ? data.suiviClient[data.suiviClient.length - 1] : {};

            setFormData({
                salonName: salon.name || "",
                city: suiviClient.city || "",
                salonAdresse: salon.address || "",
                salonTel: suiviClient.salonTel || "",
                responsableNomPrenom: suiviClient.responsableNomPrenom || "",
                responsablePortable: suiviClient.responsablePortable || "",
                responsableEmail: suiviClient.responsableEmail || "",
                marquesEnPlace: {
                    systemeDsh: suiviClient.marquesEnPlace?.systemeDsh || false,
                    colorationThalasso: suiviClient.marquesEnPlace?.colorationThalasso || false,
                    mechesThalasso: suiviClient.marquesEnPlace?.mechesThalasso || false,
                    ondThPerm: suiviClient.marquesEnPlace?.ondThPerm || false,
                    laVegetale: suiviClient.marquesEnPlace?.laVegetale || false,
                    byDsh: suiviClient.marquesEnPlace?.byDsh || false,
                    oyzea: suiviClient.marquesEnPlace?.oyzea || false,
                    stylPro: suiviClient.marquesEnPlace?.stylPro || false,
                    persTou: suiviClient.marquesEnPlace?.persTou || false,
                },
                equipe: suiviClient.equipe || [],
                clientEnContrat: suiviClient.clientEnContrat || "",
                contratLequel: suiviClient.contratLequel || "",
                tarifSpecifique: suiviClient.tarifSpecifique || "",
                dateVisite: suiviClient.dateVisite || "",
                responsablePresent: suiviClient.responsablePresent || "",
                priseDeCommande: suiviClient.priseDeCommande || "",
                gammesCommande: suiviClient.gammesCommande || "",
                animationProposee: suiviClient.animationProposee || "",
                produitsProposes: suiviClient.produitsProposes || "",
                autresPointsAbordes: suiviClient.autresPointsAbordes || "",
                pointsProchaineVisite: suiviClient.pointsProchaineVisite || "",
                observations: suiviClient.observations || "",
                createdAt: createdAt,
                typeOfForm: "Fiche de suivi Client",
                userId: uid,
            });
        }
        
    };

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
                            action: "Mise à jour de la Fiche de suivi Client",
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
                const updatedSuiviClient = [...(salonData.suiviClient || []), formData]
                await updateDoc(salonRef, { suiviClient: updatedSuiviClient })   

                // Met à jour l'historique du salon
                await updateSalonHistory(formData)
            }
            else {
                console.error("Document de visite non trouvé.")
            }

        } catch (error) {
            console.error("Erreur lors de la mise à jour du salon : ", error);
        }
    };

    return (
        <div className="fiche-client-section">
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
                        <div className="form-FSC">
                            <h2>{salonInfo.name}</h2>
                            <p>{salonInfo.address}</p>
                            <input type="text" name="salonTel" placeholder="Téléphone" value={formData.salonTel} onChange={handleInputChange} /><br />

                            <p><strong>Responsable du salon</strong></p><br></br>
                            <input type="text" name="responsableNomPrenom" placeholder="Nom Prénom" value={formData.responsableNomPrenom} onChange={handleInputChange} /><br />
                            <input type="text" name="responsablePortable" placeholder="Portable" value={formData.responsablePortable} onChange={handleInputChange} /><br />
                            <input type="email" name="responsableEmail"  placeholder="Email" value={formData.responsableEmail} onChange={handleInputChange} /><br />

                            <p><strong>Marques en place</strong></p><br></br>
                            <div className="marques">
                                <label><input className="checkbox" type="checkbox" name="systemeDsh" checked={formData.marquesEnPlace.systemeDsh} onChange={handleCheckboxChange} /> Système DSH</label><br />
                                <label><input className="checkbox" type="checkbox" name="colorationThalasso" checked={formData.marquesEnPlace.colorationThalasso} onChange={handleCheckboxChange} /> Coloration Thalasso</label><br />
                                <label><input className="checkbox" type="checkbox" name="mechesThalasso" checked={formData.marquesEnPlace.mechesThalasso} onChange={handleCheckboxChange} /> Mèches Thalasso</label><br />
                                <label><input className="checkbox" type="checkbox" name="ondThPerm" checked={formData.marquesEnPlace.ondThPerm} onChange={handleCheckboxChange} /> Ond Th/Perm</label><br />
                                <label><input className="checkbox" type="checkbox" name="laVegetale" checked={formData.marquesEnPlace.laVegetale} onChange={handleCheckboxChange} /> La Végétale</label><br />
                                <label><input className="checkbox" type="checkbox" name="byDsh" checked={formData.marquesEnPlace.byDsh} onChange={handleCheckboxChange} /> By DSH</label><br />
                                <label><input className="checkbox" type="checkbox" name="oyzea" checked={formData.marquesEnPlace.oyzea} onChange={handleCheckboxChange} /> Oyzea</label><br />
                                <label><input className="checkbox" type="checkbox" name="stylPro" checked={formData.marquesEnPlace.stylPro} onChange={handleCheckboxChange} /> Styl Pro</label><br />
                                <label><input className="checkbox" type="checkbox" name="persTou" checked={formData.marquesEnPlace.persTou} onChange={handleCheckboxChange} /> Pers Tou</label><br />
                            </div>
                            <br></br>

                            <p><strong>Équipe</strong></p><br></br>
                            {formData.equipe.map((member, index) => (
                                <div key={index}>
                                    <input type="text" placeholder="Nom Prénom" value={member.nomPrenom} onChange={(e) => handleEquipeChange(index, 'nomPrenom', e.target.value)} /><br />
                                    <div>
                                        <label className="radio-equipe"><input className="checkbox radio" type="radio" name={`role${index}`} value="Coiffeur/se" checked={member.role === "Coiffeur/se"} onChange={(e) => handleEquipeChange(index, 'role', e.target.value)} /> Coiffeur/se</label><br />
                                        <label className="radio-equipe"><input className="checkbox radio" type="radio" name={`role${index}`} value="Apprenti(e)" checked={member.role === "Apprenti(e)"} onChange={(e) => handleEquipeChange(index, 'role', e.target.value)} /> Apprenti(e)</label><br />
                                    </div>
                                </div>
                            ))}
                            <button className="button-colored" type="button" onClick={handleAddEquipeMember}>Ajouter un membre de l'équipe</button>

                            <p><strong>Client en contrat</strong></p><br></br>
                            <div>
                                <label className="oui"><input className="checkbox radio" type="radio" name="clientEnContrat" value="Oui" checked={formData.clientEnContrat === "Oui"} onChange={handleInputChange} /> Oui</label>
                                <label><input className="checkbox radio" type="radio" name="clientEnContrat" value="Non" checked={formData.clientEnContrat === "Non"} onChange={handleInputChange} /> Non</label>
                            </div>
                            {formData.clientEnContrat === "Oui" && (
                                <div>
                                    <input type="text" name="contratLequel" placeholder="Lequel" value={formData.contratLequel} onChange={handleInputChange} /><br />
                                    <input type="text" name="tarifSpecifique" placeholder="Tarif spécifique" value={formData.tarifSpecifique} onChange={handleInputChange} /><br />
                                </div>
                            )}

                            <br></br>
                            <div className="div-space">
                                <label className="label-space"><strong>Date de visite</strong> :</label><br></br>
                                <input type="date" name="dateVisite" value={formData.dateVisite} onChange={handleInputChange} />
                            </div>
                            <div className="div-space">
                                <label className="label-space"><strong>Responsable présent</strong> :</label><br></br>
                                <input type="text" name="responsablePresent" placeholder="Responsable présent" value={formData.responsablePresent} onChange={handleInputChange} />
                            </div>
                            <div className="div-space">
                                <label className="label-space"><strong>Prise de commande</strong> :</label><br></br>
                                <input type="text" name="priseDeCommande" placeholder="Prise de commande" value={formData.priseDeCommande} onChange={handleInputChange} />
                            </div>
                            <div className="div-space">
                                <label className="label-space"><strong>Gammes commandées </strong> :</label><br></br>
                                <input type="text" name="gammesCommande" placeholder="Gammes commandées" value={formData.gammesCommande} onChange={handleInputChange} />
                            </div>
                            <div className="div-space">
                                <label className="label-space"><strong>Animation proposée</strong> :</label><br></br>
                                <input type="text" name="animationProposee" placeholder="Animation proposée" value={formData.animationProposee} onChange={handleInputChange} />
                            </div>
                            <div className="div-space">
                                <label className="label-space"><strong>Produits proposés</strong> :</label><br></br>
                                <input type="text" name="produitsProposes" placeholder="Produits proposés" value={formData.produitsProposes} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="label-space"><strong>Autres points abordés</strong> :</label><br></br>
                                <textarea name="autresPointsAbordes" value={formData.autresPointsAbordes} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="label-space"><strong>Points pour la prochaine visite</strong> :</label><br></br>
                                <textarea name="pointsProchaineVisite" value={formData.pointsProchaineVisite} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="label-space"><strong>Observations</strong> :</label><br></br>
                                <textarea name="observations" value={formData.observations} onChange={handleInputChange} />
                            </div>
                            <button className="button-colored" type="submit">ENREGISTRER</button>

                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default FicheClient