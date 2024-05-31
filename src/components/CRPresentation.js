
// Fichier CRPresentation.js

import { useState } from 'react'
import { updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.config'

import back from "../assets/back.png"

const CRPresentation = ({ uid , visitId, onReturn }) => {

    const [message, setMessage] = useState("")
    const [suiviList, setSuiviList] = useState([])
    const [showForm, setShowForm] = useState(true)

    const createdAt = new Date()

    const [formData, setFormData] = useState({
        salonName: '',
        ville: '',
        departement: '',
        presenceResponsable: '',
        nomPrenomResponsable: '',
        ageResponsable: '',
        email: '',
        tel: '',
        tenueSalon: '',
        visite: '',
        marquesColoration: [],
        marquesRevente: [],
        marquesBacTech: [],
        conceptsDSH: {
        microscopie: false,
        couleur: false,
        deco: false,
        permanente: false,
        prGale: false
        },
        revoirConceptsDSH: '',
        dateRevoirConceptsDSH: '',
        interet: {
        microscopie: false,
        couleur: false,
        deco: false,
        permanente: false,
        autre: false
        },
        revoirInteret: '',
        dateRevoirInteret: '',
        dateRdvDemoFormation: '',
        observationPreparation: '',
        motifRefus: '',
        createdAt: createdAt,
        typeOfForm: "Compte rendu de RDV de Présentation",
        userId: uid,
    })

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleRadioChange = (e) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target

        setFormData({
            ...formData,
            [name]: checked
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const visitDocRef = doc(db, "visits", visitId)
            const visitDocSnapshot = await getDoc(visitDocRef)

            if (visitDocSnapshot.exists()) {

                const visitData = visitDocSnapshot.data()

                const updatedcrPresentation = Array.isArray(visitData.crPresentation) 
                    ? [...visitData.crPresentation, formData]
                    : [formData];

                await updateDoc(visitDocRef, { crPresentation: updatedcrPresentation }) 
                
                setMessage("Formulaire enregistré avec succès")

                setFormData({
                    salonName: '',
                    ville: '',
                    departement: '',
                    presenceResponsable: '',
                    nomPrenomResponsable: '',
                    ageResponsable: '',
                    email: '',
                    tel: '',
                    tenueSalon: '',
                    visite: '',
                    marquesColoration: [],
                    marquesRevente: [],
                    marquesBacTech: [],
                    conceptsDSH: {
                    microscopie: false,
                    couleur: false,
                    deco: false,
                    permanente: false,
                    prGale: false
                    },
                    revoirConceptsDSH: '',
                    dateRevoirConceptsDSH: '',
                    interet: {
                    microscopie: false,
                    couleur: false,
                    deco: false,
                    permanente: false,
                    autre: false
                    },
                    revoirInteret: '',
                    dateRevoirInteret: '',
                    dateRdvDemoFormation: '',
                    observationPreparation: '',
                    motifRefus: '',
                    createdAt: createdAt,
                    typeOfForm: "Compte rendu de RDV de Présentation",
                    userId: uid,
                })
            }
            else {
                console.error("Document de visite non trouvé.")
                setMessage("Une erreur s'est produite lors de l'enregistrement du formulaire")
            }
        } 
        catch (error) {
            console.error("Erreur lors de la soumission du CRPresentation :", error);
        }
    }

    const showSuiviList = async () => {
        try {
            const visitDocRef = doc(db, "visits", visitId)
            const visitDocSnapshot = await getDoc(visitDocRef)
    
            if (visitDocSnapshot.exists()) {
                const visitData = visitDocSnapshot.data()
                const presentationData = visitData.crPresentation || []
    
                // Mets à jour la liste des formulaires saisis avec les données de Firebase
                setSuiviList(presentationData.map((formData, index) => ({ id: index, data: formData })))
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
        <>
        <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
        
        {showForm ? (
            <>
            <button className="button-colored btn-crp" onClick={showSuiviList}>Afficher les formulaires enregistrés</button>
            <p className="success">{message}</p>

            <form onSubmit={handleSubmit} className='form-crp'>
            <input type="text" name="salonName" placeholder="Nom du salon" value={formData.salonName} onChange={handleChange} /><br></br>
            <input type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} /><br></br>
            <input type="text" name="departement" placeholder='Département' value={formData.departement} onChange={handleChange} /><br></br>
            
            <div className='space'>
                <p className='bold margin'>Présence de la responsable:</p><br></br>
                <>
                <input className='space checkbox' type="radio" name="presenceResponsable" value="OUI" onChange={handleRadioChange} />
                <label>OUI</label>     
                <input className='space checkbox' type="radio" name="presenceResponsable" value="NON" onChange={handleRadioChange} />
                <label>NON</label>
                </>
            </div>
            
            <input type="text" name="nomPrenomResponsable" placeholder='Nom du responsable' value={formData.nomPrenomResponsable} onChange={handleChange} />
            
            <div className="space">
                <p className='bold margin'>Âge du responsable :</p><br></br>
                <div className="margin">
                    <input className="checkbox" type="radio" name="ageResponsable" value="moins de 30 ans" onChange={handleRadioChange} />
                    <label>moins de 30 ans</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="radio" name="ageResponsable" value="de 30 à 50 ans" onChange={handleRadioChange} />
                    <label>de 30 à 50 ans</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="radio" name="ageResponsable" value="plus de 50 ans" onChange={handleRadioChange} />
                    <label>plus de 50 ans</label>
                </div>
            </div>

            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} /><br></br>
            <input type="tel" name="tel" placeholder="Téléphone" value={formData.tel} onChange={handleChange} />
            
            <div className="space">
                <p className='bold margin'>Tenue du salon :</p><br></br>
                <div>
                    <input className="checkbox" type="radio" name="tenueSalon" value="TB" onChange={handleRadioChange} />
                    <label className="margin">TB</label>
                </div>
                <div>
                    <input className="checkbox" type="radio" name="tenueSalon" value="MOY" onChange={handleRadioChange} />
                    <label className="margin">MOY</label>
                </div>
                <div>
                    <input className="checkbox" type="radio" name="tenueSalon" value="MAUVAIS" onChange={handleRadioChange} />
                    <label>MAUVAIS</label>
                </div>
            </div><br></br>
            <div className="space">
                <p className="margin"><strong>Visite :</strong></p><br></br>
                <div>
                    <input className="checkbox" type="radio" name="visite" value="spontanee" onChange={handleRadioChange} />
                    <label className="margin">Spontanée</label>
                </div>
                <div>
                    <input className="checkbox" type="radio" name="visite" value="sur_recommandation" onChange={handleRadioChange} />
                    <label className="margin">Sur recommandation</label>
                </div>
                <div>
                    <input className="checkbox" type="radio" name="visite" value="ancienne_client" onChange={handleRadioChange} />
                    <label className="margin">Ancienne cliente</label>
                </div>
                <div>
                    <input className="checkbox" type="radio" name="visite" value="prospection_telephonique" onChange={handleRadioChange} />
                    <label>Prospection téléphonique</label>
                </div>
            </div>
            <div className="space">
                {formData.marquesColoration.map((marque, index) => (
                    <div key={index}>
                        <input type="text" value={marque} onChange={(e) => handleChange(e)} />
                    </div>
                ))}
                <button className="button-colored" type="button" onClick={() => setFormData({...formData, marquesColoration: [...formData.marquesColoration, '']})}>Ajouter une marque de coloration</button>
            </div>
            <div className="space">
                {formData.marquesRevente.map((marque, index) => (
                <div key={index}>
                    <input type="text" value={marque} onChange={(e) => handleChange(e)} />
                </div>
                ))}
                <button className="button-colored" type="button" onClick={() => setFormData({...formData, marquesRevente: [...formData.marquesRevente, '']})}>Ajouter une marque de revente</button>
            </div>
            <div className="space">
                {formData.marquesBacTech.map((marque, index) => (
                <div key={index}>
                <input type="text" value={marque} onChange={(e) => handleChange(e)} />
                </div>
                ))}
                <button className="button-colored" type="button" onClick={() => setFormData({...formData, marquesBacTech: [...formData.marquesBacTech, '']})}>Ajouter une marque BAC/TECH</button>
            </div><br></br><br></br>
            <div>
                <p className="margin"><strong>Concepts DSH abordés :</strong></p><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="conceptsDSH" value="microscopie" onChange={handleCheckboxChange} />
                    <label>Microscopie</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="conceptsDSH" value="couleur" onChange={handleCheckboxChange} />
                    <label>Couleur</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="conceptsDSH" value="deco" onChange={handleCheckboxChange} />
                    <label>Déco</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="conceptsDSH" value="permanente" onChange={handleCheckboxChange} />
                    <label>Permanente</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="conceptsDSH" value="prGale" onChange={handleCheckboxChange} />
                    <label>PR. Gale</label>
                </div><br></br>
            </div><br></br>
            <div className="space">
                <p className="margin"><strong>A revoir ou abandon :</strong></p><br></br>
                <div className="margin">
                    <input className="checkbox" type="radio" name="revoirConceptsDSH" value="a_revoir" onChange={handleRadioChange} />
                    <label>À revoir</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="radio" name="revoirConceptsDSH" value="abandon" onChange={handleRadioChange} />
                    <label>Abandon</label>
                </div><br></br><br></br>
                
                {formData.revoirConceptsDSH === 'a_revoir' && (
                <div>
                    <p className="margin"><strong>RDV prévu pour quelle date :</strong></p><br></br>
                    <input type="date" name="dateRevoirConceptsDSH" value={formData.dateRevoirConceptsDSH} onChange={handleChange} />
                </div>
                )}
            </div>
            <div>
                <p className="margin"><strong>Intéressé par :</strong></p><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="interet" value="microscopie" onChange={handleCheckboxChange} />
                    <label>Microscopie</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="interet" value="couleur" onChange={handleCheckboxChange} />
                    <label>Couleur</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="interet" value="deco" onChange={handleCheckboxChange} />
                    <label>Déco</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="interet" value="permanente" onChange={handleCheckboxChange} />
                    <label>Permanente</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="checkbox" name="interet" value="autre" onChange={handleCheckboxChange} />
                    <label>Autre</label>
                </div><br></br>
            </div><br></br>
            <div>
                <p className="margin"><strong>A revoir ou abandon :</strong></p><br></br>
                <div className="margin">
                    <input className="checkbox" type="radio" name="revoirInteret" value="a_revoir" onChange={handleRadioChange} />
                    <label>À revoir</label>
                </div><br></br>
                <div className="margin">
                    <input className="checkbox" type="radio" name="revoirInteret" value="abandon" onChange={handleRadioChange} />
                    <label>Abandon</label>
                </div><br></br><br></br>
                
                {formData.revoirInteret === 'a_revoir' && (
                    <div>
                        <label className="margin bold">RDV prévu pour quelle date:</label>
                        <input type="date" name="dateRevoirInteret" value={formData.dateRevoirInteret} onChange={handleChange} />
                        <label className="margin bold">RDV pour démo / formation:</label>
                        <input type="date" name="dateRdvDemoFormation" value={formData.dateRdvDemoFormation} onChange={handleChange} />
                    </div>
                )}
            </div>
            <br></br>
            <div>
                <label className="margin bold">Si à revoir, observation à préparer pour la prochaine visite:</label>
                <textarea name="observationPreparation" value={formData.observationPreparation} onChange={handleChange}></textarea>
            </div>
            <div>
                <label className="margin bold">Si refus, motif:</label>
                <textarea name="motifRefus" value={formData.motifRefus} onChange={handleChange}></textarea>
            </div>
            <button className="button-colored" type="submit">Enregistrer</button>
        </form>
        </>
        ) : (
            <>
            <button className="button-colored btn-crp" onClick={() => setShowForm(true)}>Réafficher le formulaire</button>

            <ul className="crp-results">
            {suiviList.map((item, index) => ( 
                <li key={item.id}>
                    <p><span className="bold">{item.data.typeOfForm} </span>n° {index +1}</p>
                    <p><strong>Nom du salon:</strong> {item.data.salonName}</p>
                    <p><strong>Ville:</strong> {item.data.ville}</p>
                    <p><strong>Département:</strong> {item.data.departement}</p>
                    <p><strong>Présence du responsable:</strong> {item.data.presenceResponsable}</p>
                    <p><strong>Nom et prénom du responsable:</strong> {item.data.nomPrenomResponsable}</p>
                    <p><strong>Âge du responsable:</strong> {item.data.ageResponsable}</p>
                    <p><strong>Email:</strong> {item.data.email}</p>
                    <p><strong>Téléphone:</strong> {item.data.tel}</p>
                    <p><strong>Tenue du salon:</strong> {item.data.tenueSalon}</p>
                    <p><strong>Visite:</strong> {item.data.visite}</p>
                    <p><strong>Marques de coloration:</strong></p>
                    <ul>
                        {item.data.marquesColoration.map((marque, index) => (
                            <li key={index}>{marque}</li>
                        ))}
                    </ul>
                    <p><strong>Marques de revente:</strong></p>
                    <ul>
                        {item.data.marquesRevente.map((marque, index) => (
                            <li key={index}>{marque}</li>
                        ))}
                    </ul>
                    <p><strong>Marques BAC/TECH:</strong></p>
                    <ul>
                        {item.data.marquesBacTech.map((marque, index) => (
                            <li key={index}>{marque}</li>
                        ))}
                    </ul>
                    <p><strong>Concepts DSH abordés:</strong></p>
                    <ul>
                        {Object.keys(item.data.conceptsDSH).map(concept => (
                            item.data.conceptsDSH[concept] && <li key={concept}>{concept.charAt(0).toUpperCase() + concept.slice(1)}</li>
                        ))}
                    </ul>
                    <p><strong>A revoir ou abandon (Concepts DSH):</strong> {item.data.revoirConceptsDSH}</p>
                    {item.data.revoirConceptsDSH === 'a_revoir' && (
                        <p><strong>Date à revoir (Concepts DSH):</strong> {item.data.dateRevoirConceptsDSH}</p>
                    )}
                    <p><strong>Intéressé par:</strong></p>
                    <ul>
                        {Object.keys(item.data.interet).map(interet => (
                            item.data.interet[interet] && <li key={interet}>{interet.charAt(0).toUpperCase() + interet.slice(1)}</li>
                        ))}
                    </ul>
                    <p><strong>A revoir ou abandon (Intérêt):</strong> {item.data.revoirInteret}</p>
                    {item.data.revoirInteret === 'a_revoir' && (
                        <>
                            <p><strong>Date à revoir (Intérêt):</strong> {item.data.dateRevoirInteret}</p>
                            <p><strong>Date RDV démo/formation:</strong> {item.data.dateRdvDemoFormation}</p>
                        </>
                    )}
                    <p><strong>Observation à préparer:</strong> {item.data.observationPreparation}</p>
                    <p><strong>Motif de refus:</strong> {item.data.motifRefus}</p>
                </li>
            ))}
        </ul>

            </>
        )}
        </>
    )
};

export default CRPresentation