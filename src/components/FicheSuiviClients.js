
// Fichier FicheSuiviClients.js

import { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config.js"
import back from "../assets/back.png"
import { useNavigate } from "react-router-dom"

function FicheSuiviClients({ visitId }) {

    const navigate = useNavigate()
    const [message, setMessage] = useState("")
    const [suiviList, setSuiviList] = useState([])
    const [showForm, setShowForm] = useState(true)

    const createdAt = new Date()

    const [formData, setFormData] = useState({
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
        typeOfForm: "Fiche de suivi Client"
    })

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
                    typeOfForm: "Fiche de suivi Client"
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
                console.log(suiviList)
            } 
            else {
                console.error("Document de visite non trouvé.")
            }
        } 
        catch (error) {
            console.error("Erreur lors de la récupération des formulaires : ", error)
        }
    }

    const handleBackClick = () => {
        navigate("/tableau-de-bord-commercial/questionnaires");
        window.location.reload()
    }

    return (
        <div>
            <button onClick={handleBackClick} className="button-back"><img src={back} alt="retour" /></button>
        
            {showForm ? (
                <>
                    <button className="button-colored fsc-btn" onClick={showSuiviList}>Afficher les formulaires enregistrés</button>
                    <p className="success">{message}</p>

                    <form onSubmit={addFicheSuivi} className="form-FSC">
                        
                    <input type="text" name="salonName" placeholder="Nom du salon" value={formData.salonName} onChange={handleInputChange} required />
                            <input type="text" name="city" placeholder="Ville" value={formData.city} onChange={handleInputChange} required />
            
                        <input type="text" name="salonAdresse" placeholder="Adresse" value={formData.salonAdresse} onChange={handleInputChange} /><br />
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
                    </form>

                    
                </>
            ) : (
                <>
                    <ul className="fsc-results">
                    <button onClick={() => setShowForm(true)} className="button-colored">Réafficher le formulaire</button>
               
                        {suiviList.map((suivi, index) => (
                            <li className="fsc-saved" key={index}>

                                <p><span className="bold">{suivi.data.typeOfForm} </span>n° {index +1}</p>
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
                                <br></br>

                                <p><span className="bold">Équipe :</span></p>

                                <ul>
                                    {suivi.data.equipe.map((member, i) => (
                                        <li key={i}><span className="bold">Membre {i + 1} :</span> {member.nomPrenom}, {member.role}</li>
                                    ))}
                                </ul>
                                <br></br>

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
                     </>
            )}
        </div>
    )
}

export default FicheSuiviClients
