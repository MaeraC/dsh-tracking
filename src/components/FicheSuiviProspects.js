
/// Fichier FicheSuiviProspects.js

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase.config.js"

function FicheSuiviProspects({ visitId }) {

    const [message, setMessage] = useState("")
    const [suiviList, setSuiviList] = useState([])
    const [salonData, setSalonData] = useState({})
    const [showForm, setShowForm] = useState(true)

    const [formData, setFormData] = useState({
        tenueSalon: "",
        salonAdresse: "",
        salonTel: "",
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
        commande: ""
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

    // gestion des inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const addFicheSuivi = async (e) => {
        e.preventDefault()

        try {
            // Récupére le document de visite correspondant au visitId
            const visitDocRef = doc(db, "visits", visitId)
            const visitDocSnapshot = await getDoc(visitDocRef)
           
            if (visitDocSnapshot.exists()) {
                
                const visitData = visitDocSnapshot.data()
                const updatedSuiviProspect = [...(visitData.suiviProspect || []), formData]
                await updateDoc(visitDocRef, { suiviProspect: updatedSuiviProspect })    
                
                setMessage("Formulaire enregistré avec succès")
                
                // Réinitialise le formulaire après soumission
                setFormData({
                    tenueSalon: "",
                    salonAdresse: "",
                    salonTel: "",
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
                    commande: ""
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
                const suiviProspectData = visitData.suiviProspect || []
    
                // Mets à jour la liste des formulaires saisis avec les données de Firebase
                setSuiviList(suiviProspectData.map((formData, index) => ({ id: index, data: formData })))
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

    return (
        <div>
            {showForm ? (
                <>
                    <form onSubmit={addFicheSuivi} className="form-FSP">
                            <h2>SALON DE COIFFURE / INSTITUT</h2>
                            <p><span className="bold">Nom du salon</span> : {salonData.salonName}</p>
                            <p><span className="bold">Ville</span> : {salonData.city}</p>
                            <input type="text" name="salonAdresse" placeholder="Adresse" value={formData.salonAdresse} onChange={handleInputChange} /><br></br>
                            <input type="text" name="salonTel" placeholder="Téléphone" value={formData.salonTel} onChange={handleInputChange} />
                    
                            <div className="space">
                                <label className="bold">Tenue du salon :</label>
                                <div>
                                    <label><input type="radio" name="tenueSalon" value="TB" checked={formData.tenueSalon === "TB"} onChange={handleInputChange} />TB</label><br></br>
                                    <label><input type="radio" name="tenueSalon" value="moyenne" checked={formData.tenueSalon === "moyenne"} onChange={handleInputChange} />moyenne</label><br></br>
                                    <label><input type="radio" name="tenueSalon" value="mauvaise" checked={formData.tenueSalon === "mauvaise"} onChange={handleInputChange} />mauvaise</label><br></br>
                                </div>
                            </div>
                
                        <div className="space">
                            <label className="bold">Tenu par :</label>
                            <div>
                                <label><input type="radio" name="tenuPar" value="Proprétaire" checked={formData.tenuPar === "Proprétaire"} onChange={handleInputChange} />Proprétaire</label><br></br>
                                <label><input type="radio" name="tenuPar" value="Salarié" checked={formData.tenuPar === "Salarié"} onChange={handleInputChange} />Salarié</label>
                            </div>
                        </div>
                
                        <input type="text" name="dept" placeholder="Dépt" value={formData.dept} onChange={handleInputChange} /> <br></br>
                        <input type="text" name="jFture" placeholder="J. Fture" value={formData.jFture} onChange={handleInputChange} /><br></br>
                        <input type="text" name="responsableNom" placeholder="Nom Prénom du responsable" value={formData.responsableNom} onChange={handleInputChange} />
                
                        <div>
                            <label className="bold">Age du responsable :</label>
                            <div>
                                <label><input type="radio" name="responsableAge" value="moins de 35 ans" checked={formData.responsableAge === "moins de 35 ans"} onChange={handleInputChange} />moins de 35 ans</label><br></br>
                                <label><input type="radio" name="responsableAge" value="de 35 ans à 50 ans" checked={formData.responsableAge === "de 35 ans à 50 ans"} onChange={handleInputChange} />entre 35 ans et 50 ans</label><br></br>
                                <label><input type="radio" name="responsableAge" value="plus de 50 ans" checked={formData.responsableAge === "plus de 50 ans"} onChange={handleInputChange} />plus de 50 ans</label>
                            </div>
                        </div>
                
                        <input type="text" name="numeroPortable" placeholder="Numéro de portable" value={formData.numeroPortable} onChange={handleInputChange} /><br></br>
                        <input type="email" name="adresseEmail" placeholder="Adresse email" value={formData.adresseEmail} onChange={handleInputChange} /><br></br>
                        <input type="url" name="facebook" placeholder="Facebook" value={formData.facebook} onChange={handleInputChange} /><br></br>
                        <input type="url" name="instagram" placeholder="Instagram" value={formData.instagram} onChange={handleInputChange} />
                
                        <div>
                            <label className="bold">Origine de la visite :</label>
                            <div>
                                <label><input type="radio" name="origineVisite" value="visite spontanée" checked={formData.origineVisite === "visite spontanée"} onChange={handleInputChange} />visite spontanée </label><br></br>
                                <label><input type="radio" name="origineVisite" value="S. recomm." checked={formData.origineVisite === "S. recomm."} onChange={handleInputChange} />S. recomm.</label><br></br>
                                <label><input type="radio" name="origineVisite" value="Ancien client" checked={formData.origineVisite === "Ancien client"} onChange={handleInputChange} />Ancien client </label><br></br>
                                <label><input type="radio" name="origineVisite" value="Prospection téléphonique" checked={formData.origineVisite === "Prospection téléphonique"} onChange={handleInputChange} />Prospection téléphonique</label>
                            </div>
                        </div>
                
                        <h3>MARQUES DE COLORATION PRESENTES</h3>
                        <div>
                            <h4>Colorations avec Ammoniaque :</h4>
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
                            <button type="button" onClick={handleAddColorationAmmoniaque}>Ajouter une coloration avec ammoniaque</button>
                        </div>
            
                        <div>
                            <h4>Colorations Sans ammoniaque :</h4>
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
                            <button type="button" onClick={handleAddColorationSansAmmoniaque}>Ajouter une coloration sans ammoniaque</button>
                        </div>
            
                        <div>
                            <h4>Colorations végétales :</h4>
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
                            <button type="button" onClick={handleAddColorationVegetale}>Ajouter une coloration végétale</button>
                        </div>
            
                        <div>
                            <h4>Autres marques :</h4>
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
            
                        <h3>Section suivante</h3>
                        <div>
                            <label className="bold">Date de visite :</label>
                            <input
                                type="date"
                                name="dateVisite"
                                value={formData.dateVisite}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="bold">Responsable présent :</label>
                            <div>
                                <label>
                                    <input type="radio" name="responsablePresent" value="OUI" checked={formData.responsablePresent === "OUI"} onChange={handleInputChange} />
                                    OUI
                                </label>
                                <label>
                                    <input type="radio" name="responsablePresent" value="NON" checked={formData.responsablePresent === "NON"} onChange={handleInputChange} />
                                    NON
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="bold">Quels ont été les concepts ou produits proposés ?</label><br></br>
                            <textarea
                                name="conceptsProposes"
                                value={formData.conceptsProposes}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="bold">Y a-t-il eu une animation proposée ? Si oui, laquelle ?</label><br></br>
                            <textarea
                                name="animationProposee"
                                value={formData.animationProposee}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="bold">Points à aborder lors de la prochaine visite :</label><br></br>
                            <textarea
                                name="pointsProchaineVisite"
                                value={formData.pointsProchaineVisite}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="bold">Intéressés par :</label><br></br>
                            <textarea
                                name="interessesPar"
                                value={formData.interessesPar}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="bold">Autres points à aborder :</label><br></br>
                            <textarea
                                name="autresPoints"
                                value={formData.autresPoints}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="bold">Observations (éléments à retenir) ou motifs si abandon :</label>
                            <textarea
                                name="observations"
                                value={formData.observations}
                                onChange={handleInputChange}
                            />
                        </div>
                    
                        <div>
                            <label>
                                <input type="radio" name="statut" value="ABANDON" checked={formData.statut === "ABANDON"} onChange={handleInputChange} />
                                ABANDON
                            </label>
                            <label>
                                <input type="radio" name="statut" value="A REVOIR" checked={formData.statut === "A REVOIR"} onChange={handleInputChange} />
                                A REVOIR
                            </label>
                        </div>
                        <div>
                            <label className="bold">RDV OK LE :</label>
                            <input
                                type="date"
                                name="rdvDate"
                                placeholder="RDV OK LE"
                                value={formData.rdvDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="bold">Pour :</label>
                            <select
                                name="rdvPour"
                                value={formData.rdvPour}
                                onChange={handleInputChange}
                            >
                                <option value="">Choisir</option>
                                <option value="presentation">presentation</option>
                                <option value="démo">démo</option>
                                <option value="formation">formation</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>
                        <div>
                            <label className="bold">Commande ? :</label>
                            <div>
                                <label>
                                    <input type="radio" name="commande" value="OUI" checked={formData.commande === "OUI"} onChange={handleInputChange} />
                                    OUI
                                </label>
                                <label>
                                    <input type="radio" name="commande" value="NON" checked={formData.commande === "NON"} onChange={handleInputChange} />
                                    NON
                                </label>
                            </div>
                        </div>
            
                        <button type="submit" className="button">Enregistrer</button>
                        <p>{message}</p>
                    </form>

                    <button onClick={showSuiviList}>Afficher les formulaires saisis</button>
                </>
             ) : (
                
                <>
                    <ul className="fsp-results">
                        {suiviList.map((suivi, index) => (
                            <li key={index}>
                                <h3>Formulaire {index + 1}</h3>
                                <p><strong>Nom du salon:</strong> {suivi.data.salonAdresse}</p>
                                <p><strong>Adresse:</strong> {suivi.data.salonAdresse}</p>
                                <p><strong>Téléphone:</strong> {suivi.data.salonTel}</p>
                                <p><strong>Tenue du salon:</strong> {suivi.data.tenueSalon}</p>
                                <p><strong>Tenu par:</strong> {suivi.data.tenuPar}</p>
                                <p><strong>Département:</strong> {suivi.data.dept}</p>
                                <p><strong>Jour future:</strong> {suivi.data.jFture}</p>
                                <p><strong>Nom du responsable:</strong> {suivi.data.responsableNom}</p>
                                <p><strong>Age du responsable:</strong> {suivi.data.responsableAge}</p>
                                <p><strong>Numéro de portable:</strong> {suivi.data.numeroPortable}</p>
                                <p><strong>Email:</strong> {suivi.data.adresseEmail}</p>
                                <p><strong>Facebook:</strong> {suivi.data.facebook}</p>
                                <p><strong>Instagram:</strong> {suivi.data.instagram}</p>
                                <p><strong>Origine de la visite:</strong> {suivi.data.origineVisite}</p>
                                
                                <h4>Colorations avec Ammoniaque:</h4>
                                {suivi.data.colorationsAmmoniaque.map((coloration, i) => (
                                    <div key={i}>
                                        <p><strong>Nom:</strong> {coloration.nom}</p>
                                        <p><strong>Prix:</strong> {coloration.prix}</p>
                                        <p><strong>ML:</strong> {coloration.ml}</p>
                                    </div>
                                ))}

                                <h4>Colorations Sans ammoniaque:</h4>
                                {suivi.data.colorationsSansAmmoniaque.map((coloration, i) => (
                                    <div key={i}>
                                        <p><strong>Nom:</strong> {coloration.nom}</p>
                                        <p><strong>Prix:</strong> {coloration.prix}</p>
                                        <p><strong>ML:</strong> {coloration.ml}</p>
                                    </div>
                                ))}

                                <h4>Colorations végétales:</h4>
                                {suivi.data.colorationsVegetale.map((coloration, i) => (
                                    <div key={i}>
                                        <p><strong>Nom:</strong> {coloration.nom}</p>
                                        <p><strong>Prix:</strong> {coloration.prix}</p>
                                        <p><strong>ML:</strong> {coloration.ml}</p>
                                    </div>
                                ))}

                                <h4>Autres marques:</h4>
                                <p><strong>Poudre:</strong> {suivi.data.autresMarques.poudre}</p>
                                <p><strong>Permanente:</strong> {suivi.data.autresMarques.permanente}</p>
                                <p><strong>BAC:</strong> {suivi.data.autresMarques.bac}</p>
                                <p><strong>Revente:</strong> {suivi.data.autresMarques.revente}</p>

                                <p><strong>Date de visite:</strong> {suivi.data.dateVisite}</p>
                                <p><strong>Responsable présent:</strong> {suivi.data.responsablePresent}</p>
                                <p><strong>Concepts proposés:</strong> {suivi.data.conceptsProposes}</p>
                                <p><strong>Animation proposée:</strong> {suivi.data.animationProposee}</p>
                                <p><strong>Points à aborder lors de la prochaine visite:</strong> {suivi.data.pointsProchaineVisite}</p>
                                <p><strong>Intéressés par:</strong> {suivi.data.interessesPar}</p>
                                <p><strong>Autres points:</strong> {suivi.data.autresPoints}</p>
                                <p><strong>Observations:</strong> {suivi.data.observations}</p>
                                <p><strong>Statut:</strong> {suivi.data.statut}</p>
                                <p><strong>RDV Date:</strong> {suivi.data.rdvDate}</p>
                                <p><strong>RDV Pour:</strong> {suivi.data.rdvPour}</p>
                                <p><strong>Commande:</strong> {suivi.data.commande}</p>
                            </li>
                        ))}
                    </ul>

                    <button onClick={() => setShowForm(true)}>Réafficher le formulaire</button>
                </>
            )}

            

            


        </div>
    )

    /*
    const [salonData, setSalonData] = useState({})
    const [message, setMessage] = useState("")
    const [formVisible, setFormVisible] = useState(true)


    const [formData, setFormData] = useState({
        tenueSalon: "",
        salonAdresse: "",
        salonTel: "",
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
        commande: ""
    })

    // Récupère les données du document salon sélectionné
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
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
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

    const addFicheSuivi = async (e) => {
        e.preventDefault()

        try {
            const visitDocRef = doc(db, "visits", visitId)
            await updateDoc(visitDocRef, { suiviProspect: formData }) // met à jour le document du salon avec les nouvelles infos

            setMessage("Les informations ont bien été enregistrées")
            setFormVisible(false) // ferme le formulaire

            //setListeFiches([...listeFiches, formData])
        } 
        catch (error) {
            console.error("Erreur lors de l'enregistrement des informations de suivi prospect : ", error)
        }
    }

    
    
    return (
        <div>

            {formVisible && (   
                <form onSubmit={addFicheSuivi} className="form-FSP">
                    <h2>SALON DE COIFFURE / INSTITUT</h2>
                    <p><span className="bold">Nom du salon</span> : {salonData.salonName}</p>
                    <p><span className="bold">Ville</span> : {salonData.city}</p>
                    <input type="text" name="salonAdresse" placeholder="Adresse" value={formData.salonAdresse} onChange={handleInputChange} /><br></br>
                    <input type="text" name="salonTel" placeholder="Téléphone" value={formData.salonTel} onChange={handleInputChange} />
            
                    <div className="space">
                        <label className="bold">Tenue du salon :</label>
                        <div>
                            <label><input type="radio" name="tenueSalon" value="TB" checked={formData.tenueSalon === "TB"} onChange={handleInputChange} />TB</label><br></br>
                            <label><input type="radio" name="tenueSalon" value="moyenne" checked={formData.tenueSalon === "moyenne"} onChange={handleInputChange} />moyenne</label><br></br>
                            <label><input type="radio" name="tenueSalon" value="mauvaise" checked={formData.tenueSalon === "mauvaise"} onChange={handleInputChange} />mauvaise</label><br></br>
                        </div>
                    </div>
        
                <div className="space">
                    <label className="bold">Tenu par :</label>
                    <div>
                        <label><input type="radio" name="tenuPar" value="Proprétaire" checked={formData.tenuPar === "Proprétaire"} onChange={handleInputChange} />Proprétaire</label><br></br>
                        <label><input type="radio" name="tenuPar" value="Salarié" checked={formData.tenuPar === "Salarié"} onChange={handleInputChange} />Salarié</label>
                    </div>
                </div>
        
                <input type="text" name="dept" placeholder="Dépt" value={formData.dept} onChange={handleInputChange} /> <br></br>
                <input type="text" name="jFture" placeholder="J. Fture" value={formData.jFture} onChange={handleInputChange} /><br></br>
                <input type="text" name="responsableNom" placeholder="Nom Prénom du responsable" value={formData.responsableNom} onChange={handleInputChange} />
        
                <div>
                    <label className="bold">Age du responsable :</label>
                    <div>
                        <label><input type="radio" name="responsableAge" value="moins de 35 ans" checked={formData.responsableAge === "moins de 35 ans"} onChange={handleInputChange} />moins de 35 ans</label><br></br>
                        <label><input type="radio" name="responsableAge" value="de 35 ans à 50 ans" checked={formData.responsableAge === "de 35 ans à 50 ans"} onChange={handleInputChange} />entre 35 ans et 50 ans</label><br></br>
                        <label><input type="radio" name="responsableAge" value="plus de 50 ans" checked={formData.responsableAge === "plus de 50 ans"} onChange={handleInputChange} />plus de 50 ans</label>
                    </div>
                </div>
        
                <input type="text" name="numeroPortable" placeholder="Numéro de portable" value={formData.numeroPortable} onChange={handleInputChange} /><br></br>
                <input type="email" name="adresseEmail" placeholder="Adresse email" value={formData.adresseEmail} onChange={handleInputChange} /><br></br>
                <input type="url" name="facebook" placeholder="Facebook" value={formData.facebook} onChange={handleInputChange} /><br></br>
                <input type="url" name="instagram" placeholder="Instagram" value={formData.instagram} onChange={handleInputChange} />
        
                <div>
                    <label className="bold">Origine de la visite :</label>
                    <div>
                        <label><input type="radio" name="origineVisite" value="visite spontanée" checked={formData.origineVisite === "visite spontanée"} onChange={handleInputChange} />visite spontanée </label><br></br>
                        <label><input type="radio" name="origineVisite" value="S. recomm." checked={formData.origineVisite === "S. recomm."} onChange={handleInputChange} />S. recomm.</label><br></br>
                        <label><input type="radio" name="origineVisite" value="Ancien client" checked={formData.origineVisite === "Ancien client"} onChange={handleInputChange} />Ancien client </label><br></br>
                        <label><input type="radio" name="origineVisite" value="Prospection téléphonique" checked={formData.origineVisite === "Prospection téléphonique"} onChange={handleInputChange} />Prospection téléphonique</label>
                    </div>
                </div>
        
                <h3>MARQUES DE COLORATION PRESENTES</h3>
                <div>
                    <h4>Colorations avec Ammoniaque :</h4>
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
                    <button type="button" onClick={handleAddColorationAmmoniaque}>Ajouter une coloration avec ammoniaque</button>
                </div>
    
                <div>
                    <h4>Colorations Sans ammoniaque :</h4>
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
                    <button type="button" onClick={handleAddColorationSansAmmoniaque}>Ajouter une coloration sans ammoniaque</button>
                </div>
    
                <div>
                    <h4>Colorations végétales :</h4>
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
                    <button type="button" onClick={handleAddColorationVegetale}>Ajouter une coloration végétale</button>
                </div>
    
                <div>
                    <h4>Autres marques :</h4>
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
    
                <h3>Section suivante</h3>
                <div>
                    <label className="bold">Date de visite :</label>
                    <input
                        type="date"
                        name="dateVisite"
                        value={formData.dateVisite}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="bold">Responsable présent :</label>
                    <div>
                        <label>
                            <input type="radio" name="responsablePresent" value="OUI" checked={formData.responsablePresent === "OUI"} onChange={handleInputChange} />
                            OUI
                        </label>
                        <label>
                            <input type="radio" name="responsablePresent" value="NON" checked={formData.responsablePresent === "NON"} onChange={handleInputChange} />
                            NON
                        </label>
                    </div>
                </div>
                <div>
                    <label className="bold">Quels ont été les concepts ou produits proposés ?</label><br></br>
                    <textarea
                        name="conceptsProposes"
                        value={formData.conceptsProposes}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="bold">Y a-t-il eu une animation proposée ? Si oui, laquelle ?</label><br></br>
                    <textarea
                        name="animationProposee"
                        value={formData.animationProposee}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="bold">Points à aborder lors de la prochaine visite :</label><br></br>
                    <textarea
                        name="pointsProchaineVisite"
                        value={formData.pointsProchaineVisite}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="bold">Intéressés par :</label><br></br>
                    <textarea
                        name="interessesPar"
                        value={formData.interessesPar}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="bold">Autres points à aborder :</label><br></br>
                    <textarea
                        name="autresPoints"
                        value={formData.autresPoints}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="bold">Observations (éléments à retenir) ou motifs si abandon :</label>
                    <textarea
                        name="observations"
                        value={formData.observations}
                        onChange={handleInputChange}
                    />
                </div>
               
                <div>
                    <label>
                        <input type="radio" name="statut" value="ABANDON" checked={formData.statut === "ABANDON"} onChange={handleInputChange} />
                        ABANDON
                    </label>
                    <label>
                        <input type="radio" name="statut" value="A REVOIR" checked={formData.statut === "A REVOIR"} onChange={handleInputChange} />
                        A REVOIR
                    </label>
                </div>
                <div>
                    <label className="bold">RDV OK LE :</label>
                    <input
                        type="date"
                        name="rdvDate"
                        placeholder="RDV OK LE"
                        value={formData.rdvDate}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="bold">Pour :</label>
                    <select
                        name="rdvPour"
                        value={formData.rdvPour}
                        onChange={handleInputChange}
                    >
                        <option value="">Choisir</option>
                        <option value="presentation">presentation</option>
                        <option value="démo">démo</option>
                        <option value="formation">formation</option>
                        <option value="Commercial">Commercial</option>
                    </select>
                </div>
                <div>
                    <label className="bold">Commande ? :</label>
                    <div>
                        <label>
                            <input type="radio" name="commande" value="OUI" checked={formData.commande === "OUI"} onChange={handleInputChange} />
                            OUI
                        </label>
                        <label>
                            <input type="radio" name="commande" value="NON" checked={formData.commande === "NON"} onChange={handleInputChange} />
                            NON
                        </label>
                    </div>
                </div>
    
                <button type="submit" className="button">Enregistrer</button>
                <p>{message}</p>
                </form>   
            )}
            
            {!formVisible && (
                <div>
                    <h2>Informations du questionnaire :</h2>

                    <p><span className="bold">Nom du salon</span> : {salonData.salonName}</p>
                    <p><span className="bold">Ville</span> : {salonData.city}</p>
                    <p><span className="bold">Adresse</span> : {formData.salonAdresse}</p>
                    <p><span className="bold">Téléphone</span> : {formData.salonTel}</p>
                    <p><span className="bold">Tenue du salon</span> : {formData.tenueSalon}</p>
                    <p><span className="bold">Tenu par</span> : {formData.tenuPar}</p>
                    <p><span className="bold">Département</span> : {formData.dept}</p>
                    <p><span className="bold">Jour de fermeture</span> : {formData.jFture}</p>
                    <p><span className="bold">Nom Prénom du responsable</span> : {formData.responsableNom}</p>
                    <p><span className="bold">Age du responsable</span> : {formData.responsableAge}</p>
                    <p><span className="bold">Numéro de portable</span> : {formData.numeroPortable}</p>
                    <p><span className="bold">Adresse email</span> : {formData.adresseEmail}</p>
                    <p><span className="bold">Facebook</span> : {formData.facebook}</p>
                    <p><span className="bold">Instagram</span> : {formData.instagram}</p>
                    <p><span className="bold">Origine de la visite</span> : {formData.origineVisite}</p>
                    <p><span className="bold">Colorations avec Ammoniaque</span> : {formData.colorationsAmmoniaque.map((coloration) => `${coloration.nom}, ${coloration.prix}, ${coloration.ml}`).join("; ")}</p>
                    <p><span className="bold">Colorations Sans Ammoniaque</span> : {formData.colorationsSansAmmoniaque.map((coloration) => `${coloration.nom}, ${coloration.prix}, ${coloration.ml}`).join("; ")}</p>
                    <p><span className="bold">Colorations Végétales</span> : {formData.colorationsVegetale.map((coloration) => `${coloration.nom}, ${coloration.prix}, ${coloration.ml}`).join("; ")}</p>
                    <p><span className="bold">Autres marques - Poudre</span> : {formData.autresMarques.poudre}</p>
                    <p><span className="bold">Autres marques - Permanente</span> : {formData.autresMarques.permanente}</p>
                    <p><span className="bold">Autres marques - BAC</span> : {formData.autresMarques.bac}</p>
                    <p><span className="bold">Autres marques - Revente</span> : {formData.autresMarques.revente}</p>
                    <p><span className="bold">Date de visite</span> : {formData.dateVisite}</p>
                    <p><span className="bold">Responsable présent</span> : {formData.responsablePresent}</p>
                    <p><span className="bold">Concepts proposés</span> : {formData.conceptsProposes}</p>
                    <p><span className="bold">Animation proposée</span> : {formData.animationProposee}</p>
                    <p><span className="bold">Points à aborder lors de la prochaine visite</span> : {formData.pointsProchaineVisite}</p>
                    <p><span className="bold">Intéressés par</span> : {formData.interessesPar}</p>
                    <p><span className="bold">Autres points à aborder</span> : {formData.autresPoints}</p>
                    <p><span className="bold">Observations</span> : {formData.observations}</p>
                    <p><span className="bold">Statut</span> : {formData.statut}</p>
                    <p><span className="bold">RDV OK LE</span> : {formData.rdvDate}</p>
                    <p><span className="bold">Pour</span> : {formData.rdvPour}</p>
                    <p><span className="bold">Commande</span> : {formData.commande}</p>

                    <button onClick={() => setFormVisible(true)} className="button">Ajouter une nouvelle Fiche de suivi de prospect</button>
                </div> 
            )}

            

        </div>  
    )
*/
} 

export default FicheSuiviProspects

  

            

