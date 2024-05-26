
// Fichier FicheSuiviClients.js

import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config.js";

function FicheSuiviClients({ visitId }) {

    const [message, setMessage] = useState("")
    const [suiviList, setSuiviList] = useState([])
    const [salonData, setSalonData] = useState({})
    const [showForm, setShowForm] = useState(true)

    const [formData, setFormData] = useState({
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
        observations: ""
    })

    // Récupère les infos de la visite enregistré qui correspond
    useEffect(() => {
        const fetchData = async () => {
            try {
                const visitDocRef = doc(db, "visits", visitId)
                const visitSnapshot = await getDoc(visitDocRef)

                if (visitSnapshot.exists()) {
                    setSalonData(visitSnapshot.data())
                } 
                else {
                    console.error("Cette visite n'existe pas.")
                }
            } 
            catch (error) {
                console.error("Erreur lors de la récupération des données de la visite : ", error)
            }
        }

        fetchData()

    }, [visitId])

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

    const addFicheSuivi = async (e) => {
        e.preventDefault()

        try {
            // Récupére le document de visite correspondant au visitId
            const visitDocRef = doc(db, "visits", visitId)
            const visitDocSnapshot = await getDoc(visitDocRef)
           
            if (visitDocSnapshot.exists()) {
                
                const visitData = visitDocSnapshot.data()
                const updatedSuiviClient = [...(visitData.suiviClient || []), formData]
                await updateDoc(visitDocRef, { suiviClient: updatedSuiviClient })    
                
                setMessage("Formulaire enregistré avec succès")
                
                // Réinitialise le formulaire après soumission
                setFormData({
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
                    observations: ""
                })
            } 
            else {
                console.error("Document de visite non trouvé.")
                setMessage("Une erreur s'est produite lors de l'enregistrement du formulaire")
            }
        } 
        catch (error) {
            console.error("Erreur lors de l'ajout du formulaire : ", error)
            setMessage("Une erreur s'est produite lors de l'enregistrement du formulaire")
        }
    }

    const showSuiviList = async () => {
        try {
            const visitDocRef = doc(db, "visits", visitId)
            const visitDocSnapshot = await getDoc(visitDocRef)
    
            if (visitDocSnapshot.exists()) {
                const visitData = visitDocSnapshot.data()
                const suiviClientData = visitData.suiviClient || []
    
                // Mets à jour la liste des formulaires saisis avec les données de Firebase
                setSuiviList(suiviClientData.map((formData, index) => ({ id: index, data: formData })))
                setShowForm(false)
            } 
            else {
                console.error("Document de visite non trouvé.")
            }
        } 
        catch (error) {
            console.error("Erreur lors de la récupération des formulaires : ", error)
        }
    }

    return (
        <div>
            {showForm ? (
                <>
                <p>{message}</p>
                    <form onSubmit={addFicheSuivi} className="form-FSC">
                        <h2>SALON DE COIFFURE / INSTITUT</h2>
                        <p><span className="bold">Nom du salon</span> : {salonData.salonName}</p>
                        <p><span className="bold">Ville</span> : {salonData.city}</p>
                        <input
                            type="text"
                            name="salonAdresse"
                            placeholder="Adresse"
                            value={formData.salonAdresse}
                            onChange={handleInputChange}
                        /><br />
                        <input
                            type="text"
                            name="salonTel"
                            placeholder="Téléphone"
                            value={formData.salonTel}
                            onChange={handleInputChange}
                        /><br />

                        <h3>Responsable du salon</h3>
                        <input
                            type="text"
                            name="responsableNomPrenom"
                            placeholder="Nom Prénom"
                            value={formData.responsableNomPrenom}
                            onChange={handleInputChange}
                        /><br />
                        <input
                            type="text"
                            name="responsablePortable"
                            placeholder="Portable"
                            value={formData.responsablePortable}
                            onChange={handleInputChange}
                        /><br />
                        <input
                            type="email"
                            name="responsableEmail"
                            placeholder="Email"
                            value={formData.responsableEmail}
                            onChange={handleInputChange}
                        /><br />

                        <h3>Marques en place</h3>
                        <div>
                            <label><input type="checkbox" name="systemeDsh" checked={formData.marquesEnPlace.systemeDsh} onChange={handleCheckboxChange} /> Système DSH</label><br />
                            <label><input type="checkbox" name="colorationThalasso" checked={formData.marquesEnPlace.colorationThalasso} onChange={handleCheckboxChange} /> Coloration Thalasso</label><br />
                            <label><input type="checkbox" name="mechesThalasso" checked={formData.marquesEnPlace.mechesThalasso} onChange={handleCheckboxChange} /> Mèches Thalasso</label><br />
                            <label><input type="checkbox" name="ondThPerm" checked={formData.marquesEnPlace.ondThPerm} onChange={handleCheckboxChange} /> Ond Th/Perm</label><br />
                            <label><input type="checkbox" name="laVegetale" checked={formData.marquesEnPlace.laVegetale} onChange={handleCheckboxChange} /> La Végétale</label><br />
                            <label><input type="checkbox" name="byDsh" checked={formData.marquesEnPlace.byDsh} onChange={handleCheckboxChange} /> By DSH</label><br />
                            <label><input type="checkbox" name="oyzea" checked={formData.marquesEnPlace.oyzea} onChange={handleCheckboxChange} /> Oyzea</label><br />
                            <label><input type="checkbox" name="stylPro" checked={formData.marquesEnPlace.stylPro} onChange={handleCheckboxChange} /> Styl Pro</label><br />
                            <label><input type="checkbox" name="persTou" checked={formData.marquesEnPlace.persTou} onChange={handleCheckboxChange} /> Pers Tou</label><br />
                        </div>

                        <h3>Équipe</h3>
                        {formData.equipe.map((member, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    placeholder="Nom Prénom"
                                    value={member.nomPrenom}
                                    onChange={(e) => handleEquipeChange(index, 'nomPrenom', e.target.value)}
                                /><br />
                                <div>
                                    <label><input type="radio" name={`role${index}`} value="Coiffeur/se" checked={member.role === "Coiffeur/se"} onChange={(e) => handleEquipeChange(index, 'role', e.target.value)} /> Coiffeur/se</label><br />
                                    <label><input type="radio" name={`role${index}`} value="Apprenti(e)" checked={member.role === "Apprenti(e)"} onChange={(e) => handleEquipeChange(index, 'role', e.target.value)} /> Apprenti(e)</label><br />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddEquipeMember}>Ajouter un membre de l'équipe</button>

                        <h3>Client en contrat</h3>
                        <div>
                            <label><input type="radio" name="clientEnContrat" value="OUI" checked={formData.clientEnContrat === "OUI"} onChange={handleInputChange} /> OUI</label>
                            <label><input type="radio" name="clientEnContrat" value="NON" checked={formData.clientEnContrat === "NON"} onChange={handleInputChange} /> NON</label>
                        </div>
                        {formData.clientEnContrat === "OUI" && (
                            <div>
                                <input
                                    type="text"
                                    name="contratLequel"
                                    placeholder="Lequel"
                                    value={formData.contratLequel}
                                    onChange={handleInputChange}
                                /><br />
                                <input
                                    type="text"
                                    name="tarifSpecifique"
                                    placeholder="Tarif spécifique"
                                    value={formData.tarifSpecifique}
                                    onChange={handleInputChange}
                                /><br />
                            </div>
                        )}

                        <h3>Visite</h3>
                        <div>
                            <label>Date de visite :</label>
                            <input
                                type="date"
                                name="dateVisite"
                                value={formData.dateVisite}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Responsable présent :</label>
                            <input
                                type="text"
                                name="responsablePresent"
                                placeholder="Responsable présent"
                                value={formData.responsablePresent}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Prise de commande :</label>
                            <input
                                type="text"
                                name="priseDeCommande"
                                placeholder="Prise de commande"
                                value={formData.priseDeCommande}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Gammes commandées :</label>
                            <input
                                type="text"
                                name="gammesCommande"
                                placeholder="Gammes commandées"
                                value={formData.gammesCommande}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Animation proposée :</label>
                            <input
                                type="text"
                                name="animationProposee"
                                placeholder="Animation proposée"
                                value={formData.animationProposee}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Produits proposés :</label>
                            <input
                                type="text"
                                name="produitsProposes"
                                placeholder="Produits proposés"
                                value={formData.produitsProposes}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Autres points abordés :</label>
                            <textarea
                                name="autresPointsAbordes"
                                placeholder="Autres points abordés"
                                value={formData.autresPointsAbordes}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Points pour la prochaine visite :</label>
                            <textarea
                                name="pointsProchaineVisite"
                                placeholder="Points pour la prochaine visite"
                                value={formData.pointsProchaineVisite}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Observations :</label>
                            <textarea
                                name="observations"
                                placeholder="Observations"
                                value={formData.observations}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button type="submit">Enregistrer</button>
                    </form>

                    <button onClick={showSuiviList}>Afficher les formulaires saisis</button>
                </>
            ) : (
                <>
                    <ul className="fsp-results">
                        {suiviList.map((suivi, index) => (
                            <li key={index}>
                                <h3>Formulaire {index + 1}</h3>

                                <p><span className="bold">Nom du salon :</span> {suivi.data.salonName}</p>
                                <p><span className="bold">Ville :</span> {suivi.data.city}</p>
                                <p><span className="bold">Adresse :</span> {suivi.data.salonAdresse}</p>
                                <p><span className="bold">Téléphone :</span> {suivi.data.salonTel}</p>
                                <p><span className="bold">Responsable du salon :</span> {suivi.data.responsableNomPrenom}</p>
                                <p><span className="bold">Portable du responsable :</span> {suivi.data.responsablePortable}</p>
                                <p><span className="bold">Email du responsable :</span> {suivi.data.responsableEmail}</p>
                                <p><span className="bold">Marques en place :</span></p>

                                <ul>
                                    {suivi.data.marquesEnPlace && suivi.data.marquesEnPlace.systemeDsh && <li>Système DSH</li>}
                                    {suivi.data.marquesEnPlace && suivi.data.marquesEnPlace.colorationThalasso && <li>Coloration Thalasso</li>}
                                    {suivi.data.marquesEnPlace && suivi.data.marquesEnPlace.mechesThalasso && <li>Mèches Thalasso</li>}
                                    {suivi.data.marquesEnPlace && suivi.data.marquesEnPlace.ondThPerm && <li>Ond Th/Perm</li>}
                                    {suivi.data.marquesEnPlace && suivi.data.marquesEnPlace.laVegetale && <li>La Végétale</li>}
                                    {suivi.data.marquesEnPlace && suivi.data.marquesEnPlace.byDsh && <li>By DSH</li>}
                                    {suivi.data.marquesEnPlace && suivi.data.marquesEnPlace.oyzea && <li>Oyzea</li>}
                                    {suivi.data.marquesEnPlace && suivi.data.marquesEnPlace.stylPro && <li>Styl Pro</li>}
                                    {suivi.data.marquesEnPlace && suivi.data.marquesEnPlace.persTou && <li>Pers Tou</li>}
                                </ul>
                                    
                                <p><span className="bold">Équipe :</span></p>

                                <ul>
                                    {suivi.data.equipe.length > 0 && (
                                        <li><span className="bold">Membre 1 :</span> {suivi.data.equipe[0].nomPrenom}, {formData.equipe[0].role}</li>
                                    )}
                                    {suivi.data.equipe.length > 1 && (
                                        <li><span className="bold">Membre 2 :</span> {suivi.data.equipe[1].nomPrenom}, {formData.equipe[1].role}</li>
                                    )}
                                    {suivi.data.equipe.length > 2 && (
                                        <li><span className="bold">Membre 3 :</span> {suivi.data.equipe[2].nomPrenom}, {formData.equipe[2].role}</li>
                                    )}
                                    {/* Ajoutez des conditions supplémentaires pour plus de membres si nécessaire */}
                                </ul>

                                <p><span className="bold">Client en contrat :</span> {suivi.data.clientEnContrat}</p>

                                {suivi.data.clientEnContrat === "OUI" && (
                                    <div>
                                        <p><span className="bold">Lequel :</span> {suivi.data.contratLequel}</p>
                                        <p><span className="bold">Tarif spécifique :</span> {suivi.data.tarifSpecifique}</p>
                                    </div>
                                )}

                                <p><span className="bold">Date de visite :</span> {suivi.data.dateVisite}</p>
                                <p><span className="bold">Responsable présent :</span> {suivi.data.responsablePresent}</p>
                                <p><span className="bold">Prise de commande :</span> {suivi.data.priseDeCommande}</p>
                                <p><span className="bold">Gammes commandées :</span> {suivi.data.gammesCommande}</p>
                                <p><span className="bold">Animation proposée :</span> {suivi.data.animationProposee}</p>
                                <p><span className="bold">Produits proposés :</span> {suivi.data.produitsProposes}</p>
                                <p><span className="bold">Autres points abordés :</span> {suivi.data.autresPointsAbordes}</p>
                                <p><span className="bold">Points pour la prochaine visite :</span> {suivi.data.pointsProchaineVisite}</p>
                                <p><span className="bold">Observations :</span> {suivi.data.observations}</p>
                            </li>  
                        ))}                 
                    </ul>
                    <button onClick={() => setShowForm(true)}>Réafficher le formulaire</button>
                </>
            )}
        </div>
    )
}

export default FicheSuiviClients
