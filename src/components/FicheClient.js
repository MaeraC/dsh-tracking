
// ficheClient.js

import back from "../assets/back.png"
import { useState, useCallback } from "react" 
import { db } from "../firebase.config"
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"

function FicheClient({ onReturn, uid }) {
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [message, setMessage] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [allFiches, setAllFiches] = useState([]);
    const [isAllFichesVisible, setIsAllFichesVisible] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isViewFilteredFichesOpen, setIsViewFilteredFichesOpen] = useState(false)
    const [filteredFiches, setFilteredFiches] = useState([])
    const [rdvPresentationCount, setRdvPresentationCount] = useState(0)

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
            stylPro: false,
            persTou: false,
        },
        équipe: [],
        clientEnContrat: "",
        typeDeContrat: "",
        tarifSpécifique: "",
        dateDeVisite: "",
        responsablePrésent: "",
        priseDeCommande: "",
        gammesCommandées: "",
        animationProposée: "",
        produitsProposés: "",
        autresPointsAbordés: "",
        pointsPourLaProchaineVisite: "",
        observations: "",
        createdAt: createdAt,
        typeOfForm: "Fiche de suivi Client",
        userId: uid,
    }

    const [formData, setFormData] = useState(initialFormData)

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

    // Recherche d'une fiche client par le nom du salon 
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
                        searchResults.push({ id: doc.id, ...data })
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
            const data = salonSnapshot.data();
            const suiviClient = data.suiviClient ? data.suiviClient[data.suiviClient.length - 1] : {}

            setFormData({
                adresse: salon.address || "",
                city: salon.city || "",
                name: salon.name || "",
                téléphoneDuSalon: suiviClient.téléphoneDuSalon || "",
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
                    stylPro: suiviClient.marquesEnPlace?.stylPro || false,
                    persTou: suiviClient.marquesEnPlace?.persTou || false,
                },
                équipe: suiviClient.équipe || [],
                clientEnContrat: suiviClient.clientEnContrat || "",
                typeDeContrat: suiviClient.typeDeContrat || "",
                tarifSpécifique: suiviClient.tarifSpécifique || "",
                dateDeVisite: suiviClient.dateDeVisite || "",
                responsablePrésent: suiviClient.responsablePrésent || "",
                priseDeCommande: suiviClient.priseDeCommande || "",
                gammesCommandées: suiviClient.gammesCommandées || "",
                animationProposée: suiviClient.animationProposée || "",
                produitsProposés: suiviClient.produitsProposés || "",
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
                } else {
                    console.error("Document de salon non trouvé.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des fiches de suivi : ", error);
            }
        }
    };

    const handleFilterByDate = async () => {
        try {
            const salonRef = doc(db, "salons", salonInfo.id);
            const salonSnapshot = await getDoc(salonRef);
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data();
                const allFiches = salonData.suiviClient || [];
    
                // Filtrer les fiches par période
                const filteredFiches = allFiches.filter((fiche) => {
                    const ficheDate = new Date(fiche.dateDeVisite); /// à modifier 
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
                const allFiches = salonData.suiviClient || [];
    
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

                {salonInfo && (
                    <>
                    <button style={{marginTop: "20px"}} className="button-colored" onClick={handleShowAllFiches}>Voir toutes les fiches enregistrées</button>
                    <button onClick={handleViewFichesCurrentYear} className="button-colored">Voir les fiches de l'année en cours</button>
                    
                    <div>
                        <label>Sélectionner une période :</label>
                        <input type="date" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <button onClick={handleFilterByDate}>Filtrer par période</button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-FSC">
                            <h2>{salonInfo.name}</h2>
                            <p className="adress">{salonInfo.address}</p>
                            <input type="text" name="téléphoneDuSalon" placeholder="Téléphone du salon" value={formData.téléphoneDuSalon} onChange={handleInputChange} /><br></br><br></br>

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

                            <p><strong>Marques en place</strong></p><br></br>
                            <div className="marques">
                                <label><input className="checkbox" type="checkbox" name="systemeDsh" checked={formData.marquesEnPlace.systemeDsh} onChange={handleCheckboxChange} /> Système DSH</label><br />
                                <label><input className="checkbox" type="checkbox" name="colorationThalasso" checked={formData.marquesEnPlace.colorationThalasso} onChange={handleCheckboxChange} /> Coloration Thalasso</label><br />
                                <label><input className="checkbox" type="checkbox" name="mechesThalasso" checked={formData.marquesEnPlace.mechesThalasso} onChange={handleCheckboxChange} /> Mèches Thalasso</label><br />
                                <label><input className="checkbox" type="checkbox" name="ondThalassoPermanente" checked={formData.marquesEnPlace.ondThalassoPermanente} onChange={handleCheckboxChange} /> Ond. Thalasso / Permanente</label><br />
                                <label><input className="checkbox" type="checkbox" name="laVégétale" checked={formData.marquesEnPlace.laVégétale} onChange={handleCheckboxChange} /> La Végétale</label><br />
                                <label><input className="checkbox" type="checkbox" name="byDsh" checked={formData.marquesEnPlace.byDsh} onChange={handleCheckboxChange} /> By DSH</label><br />
                                <label><input className="checkbox" type="checkbox" name="olyzea" checked={formData.marquesEnPlace.olyzea} onChange={handleCheckboxChange} /> Olyzea</label><br />
                                <label><input className="checkbox" type="checkbox" name="stylPro" checked={formData.marquesEnPlace.stylPro} onChange={handleCheckboxChange} /> Styl Pro</label><br />
                                <label><input className="checkbox" type="checkbox" name="persTou" checked={formData.marquesEnPlace.persTou} onChange={handleCheckboxChange} /> Pers. Tou.</label><br />
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

                            <p><strong>Client en contrat</strong></p><br></br>
                            <div>
                                <label className="oui"><input className="checkbox radio" type="radio" name="clientEnContrat" value="Oui" checked={formData.clientEnContrat === "Oui"} onChange={handleInputChange} /> Oui</label>
                                <label><input className="checkbox radio" type="radio" name="clientEnContrat" value="Non" checked={formData.clientEnContrat === "Non"} onChange={handleInputChange} /> Non</label>
                            </div>
                            {formData.clientEnContrat === "Oui" && (
                                <div>
                                    <input type="text" className="type-contrat" name="typeDeContrat" placeholder="Lequel" value={formData.typeDeContrat} onChange={handleInputChange} />
                                    <input type="text" name="tarifSpécifique" placeholder="Tarif spécifique" value={formData.tarifSpécifique} onChange={handleInputChange} /><br />
                                </div>
                            )}
                            <br></br><br></br>
                            <div className="div-space">
                                <label className="label-space"><strong>Date de visite</strong> :</label><br></br>
                                <input type="date"  className='custom-select' name="dateDeVisite" value={formData.dateDeVisite} onChange={handleInputChange} />
                            </div>

                            <input type="text" name="priseDeCommande" placeholder="Prise de commande" value={formData.priseDeCommande} onChange={handleInputChange} />
                            <input type="text" name="gammesCommandées" placeholder="Gammes commandées" value={formData.gammesCommandées} onChange={handleInputChange} />
                            <input type="text" name="animationProposée" placeholder="Animation proposée" value={formData.animationProposée} onChange={handleInputChange} />
                            <input type="text" name="produitsProposés" placeholder="Produits proposés" value={formData.produitsProposés} onChange={handleInputChange} /><br></br><br></br>
                            
                            <div>
                                <label className="label-space"><strong>Autres points abordés</strong> :</label><br></br>
                                <textarea name="autresPointsAbordés" value={formData.autresPointsAbordés} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="label-space"><strong>Points pour la prochaine visite</strong> :</label><br></br>
                                <textarea name="pointsPourLaProchaineVisite" value={formData.pointsPourLaProchaineVisite} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="label-space"><strong>Observations</strong> :</label><br></br>
                                <textarea name="observations" value={formData.observations} onChange={handleInputChange} />
                            </div>
                            <button className="button-colored" type="submit">ENREGISTRER</button>
                        </div>
                    </form>
                    {isAllFichesVisible && (
                        <div>
                            <h4>Fiches de suivi enregistrées :</h4>
                            <ul>
                                {allFiches.map((fiche, index) => (
                                    <li key={index}>
                                        <div>Adresse : {fiche.adresse}</div>
                                        <div>Téléphone du salon : {fiche.téléphoneDuSalon}</div>
                                        <div>Nom du responsable : {fiche.nomDuResponsable}</div>
                                        <div>Portable du responsable : {fiche.portableDuResponsable}</div>
                                        <div>Email du responsable : {fiche.EmailDuResponsable}</div>
                                        <div>
                                            <h5>Marques en place :</h5>
                                            {Object.entries(fiche.marquesEnPlace).map(([key, value]) => (
                                                <div key={key}>{key} : {value ? 'Oui' : 'Non'}</div>
                                            ))}
                                        </div>
                                        <div>
                                            <h5>Équipe :</h5>
                                            {fiche.équipe.map((member, idx) => (
                                                <div key={idx}>
                                                    <div>Nom Prénom : {member.nomPrenom}</div>
                                                    <div>Rôle : {member.role}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div>Client en contrat : {fiche.clientEnContrat}</div>
                                        <div>Type de contrat : {fiche.typeDeContrat}</div>
                                        <div>Tarif spécifique : {fiche.tarifSpécifique}</div>
                                        <div>Date de visite : {fiche.dateDeVisite}</div>
                                        <div>Responsable présent : {fiche.responsablePrésent}</div>
                                        <div>Prise de commande : {fiche.priseDeCommande}</div>
                                        <div>Gammes commandées : {fiche.gammesCommandées}</div>
                                        <div>Animation proposée : {fiche.animationProposée}</div>
                                        <div>Produits proposés : {fiche.produitsProposés}</div>
                                        <div>Autres points abordés : {fiche.autresPointsAbordés}</div>
                                        <div>Points pour la prochaine visite : {fiche.pointsPourLaProchaineVisite}</div>
                                        <div>Observations : {fiche.observations}</div>
                                    </li>
                                ))}
                            </ul>
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

export default FicheClient