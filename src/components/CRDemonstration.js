
// Fichier CRDémonstration.js

import { useState } from "react"

import { db } from "../firebase.config"
import { updateDoc, doc, getDoc } from "firebase/firestore"
import back from "../assets/back.png"
import { useNavigate } from "react-router-dom"

function CRDémonstration({ uid, visitId }) {

    const navigate = useNavigate()

    const [message, setMessage] = useState("")
    const [suiviList, setSuiviList] = useState([])
    const [showForm, setShowForm] = useState(true)

    const createdAt = new Date()

    const [formState, setFormState] = useState({
        salonName: '',
        ville: '',
        nomPrenomResponsable: '',
        responsablePresent: '',
        tel: '',
        email: '',
        nbCollaborateurs: '',
        demonstrations: {
          luminacolor: false,
          veracolor: false,
          thalassoBAC: false,
          decoloration: false,
          ondulation: false,
          microscopique: false,
          draw: false,
          laVegetale: false,
          autre: false,
        },
        dureeDemonstration: '',
        techniciennePresente: '',
        avecLaVRP: false,
        seule: false,
        nomTechnicienne: '',
        issueFavorable: {
          luminacolor: false,
          veracolor: false,
          thalassoBAC: false,
          decoloration: false,
          ondulation: false,
          microscopique: false,
          draw: false,
          laVegetale: false,
          autre: false,
        },
        issueDefavorable: {
          luminacolor: '',
          veracolor: '',
          thalassoBAC: '',
          decoloration: '',
          ondulation: '',
          microscopique: '',
          draw: '',
          laVegetale: '',
          autre: '',
        },
        actions: {
          abandon: false,
          aSuivre: false,
          aRetenter: false,
          adapterLePrix: false,
          attenteReponse: false,
        },
        precisions: '',
        observationsGenerales: '',
        createdAt: createdAt,
        typeOfForm: "Compte rendu de RDV de Démonstration",
        userId: uid,
    })
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (type === 'checkbox') {
            setFormState(prevState => ({
                ...prevState,
                [name]: checked
            }))
        } 
        else {
            setFormState(prevState => ({
                ...prevState,
                [name]: value
            }))
        }
    }
    
    const handleDemonstrationChange = (e) => {
        const { name, checked } = e.target

        setFormState(prevState => ({
            ...prevState,
            demonstrations: {
                ...prevState.demonstrations,
                [name]: checked
            }
        }))
    }
    
    const handleIssueFavorableChange = (e) => {
        const { name, checked } = e.target

        setFormState(prevState => ({
            ...prevState,
            issueFavorable: {
                ...prevState.issueFavorable,
                [name]: checked
            }
        }))
    }
    
    const handleIssueDefavorableChange = (e) => {
        const { name, value } = e.target

        setFormState(prevState => ({
            ...prevState,
            issueDefavorable: {
                ...prevState.issueDefavorable,
                [name]: value
            }
        }))
      }
    
    const handleActionsChange = (e) => {
        const { name, checked } = e.target

        setFormState(prevState => ({
            ...prevState,
            actions: {
                ...prevState.actions,
                [name]: checked
            }
        }))
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const visitDocRef = doc(db, "visits", visitId)
            const visitDocSnapshot = await getDoc(visitDocRef)

            if (visitDocSnapshot.exists()) {

                const visitData = visitDocSnapshot.data()
                //const updatedcrDemonstration = [...(visitData.crDemonstration || []), formState]

                const updatedcrDemonstration = Array.isArray(visitData.crDemonstration) 
                    ? [...visitData.crDemonstration, formState]
                    : [formState];

                await updateDoc(visitDocRef, { crDemonstration: updatedcrDemonstration }) 
                
                setMessage("Formulaire enregistré avec succès")

                setFormState({
                    salonName: '',
                    ville: '',
                    nomPrenomResponsable: '',
                    responsablePresent: '',
                    tel: '',
                    email: '',
                    nbCollaborateurs: '',
                    demonstrations: {
                    luminacolor: false,
                    veracolor: false,
                    thalassoBAC: false,
                    decoloration: false,
                    ondulation: false,
                    microscopique: false,
                    draw: false,
                    laVegetale: false,
                    autre: false,
                    },
                    dureeDemonstration: '',
                    techniciennePresente: '',
                    avecLaVRP: false,
                    seule: false,
                    nomTechnicienne: '',
                    issueFavorable: {
                    luminacolor: false,
                    veracolor: false,
                    thalassoBAC: false,
                    decoloration: false,
                    ondulation: false,
                    microscopique: false,
                    draw: false,
                    laVegetale: false,
                    autre: false,
                    },
                    issueDefavorable: {
                    luminacolor: '',
                    veracolor: '',
                    thalassoBAC: '',
                    decoloration: '',
                    ondulation: '',
                    microscopique: '',
                    draw: '',
                    laVegetale: '',
                    autre: '',
                    },
                    actions: {
                    abandon: false,
                    aSuivre: false,
                    aRetenter: false,
                    adapterLePrix: false,
                    attenteReponse: false,
                    },
                    precisions: '',
                    observationsGenerales: '',
                    createdAt: createdAt,
                    typeOfForm: "Compte rendu de RDV de Démonstration",
                    userId: uid,
                })
            }
            else {
                console.error("Document de visite non trouvé.")
                setMessage("Une erreur s'est produite lors de l'enregistrement du formulaire")
            }
            
        } 
        catch (error) {
            console.error("Erreur lors de la soumission du CRDemonstration :", error);
        }
    }

    const showSuiviList = async () => {
        try {
            const visitDocRef = doc(db, "visits", visitId)
            const visitDocSnapshot = await getDoc(visitDocRef)
    
            if (visitDocSnapshot.exists()) {
                const visitData = visitDocSnapshot.data()
                const demonstrationData = visitData.crDemonstration || []
    
                // Mets à jour la liste des formulaires saisis avec les données de Firebase
                setSuiviList(demonstrationData.map((formState, index) => ({ id: index, data: formState })))
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

    const handleBackClick = () => {
        navigate("/tableau-de-bord-commercial/questionnaires");
        window.location.reload()
    }
    
    return (
        <>
        <button onClick={handleBackClick} className="button-back"><img src={back} alt="retour" /></button>
        {showForm ? (
            <>
            <button className="button-colored btn-crd" onClick={showSuiviList}>Afficher les formulaires enregistrés</button>
            <p className="success">{message}</p>
                    
            <form onSubmit={handleSubmit} className="form-CRD">

                <input type="text" name="salonName" placeholder="Nom du salon" value={formState.salonName} onChange={handleChange} /><br></br>
                <input type="text" name="ville" placeholder="Ville" value={formState.ville} onChange={handleChange} /><br></br>
                <input type="text" name="nomPrenomResponsable" placeholder="Nom Prénom du responsable" value={formState.nomPrenomResponsable} onChange={handleChange} /><br></br>
            
                <div className="space">
                    <p className="bold margin">Responsable présent :</p><br></br>
                    <label className="oui"><input className="checkbox" type="radio" name="responsablePresent" value="oui" checked={formState.responsablePresent === 'oui'} onChange={handleChange} />OUI</label>
                    <label><input className="checkbox" type="radio" name="responsablePresent" value="non" checked={formState.responsablePresent === 'non'} onChange={handleChange} />NON</label>
                </div>

                <input type="tel" name="tel" placeholder="Téléphone" value={formState.tel} onChange={handleChange} /><br></br>
                <input type="email" name="email" placeholder="E-mail" value={formState.email} onChange={handleChange} /><br></br>
                <input type="text" name="nbCollaborateurs" placeholder="Nombre de collaborateurs" value={formState.nbCollaborateurs} onChange={handleChange} /><br></br>
            
                <p className="bold margin">La démonstration portait sur :</p><br></br>
                {Object.keys(formState.demonstrations).map(demo => (
                    <>
                    <label className="margin" key={demo}>
                    <input
                        type="checkbox"
                        name={demo}
                        checked={formState.demonstrations[demo]}
                        onChange={handleDemonstrationChange}
                        className="checkbox"
                    />
                    {demo.charAt(0).toUpperCase() + demo.slice(1)}
                    </label>
                    <br></br>
                    </>
                ))}
                <br></br>

                
                <div className="display space">
                    <p className="bold margin">Présence dune technicienne :</p><br></br>
                    <label className="space oui">
                        <input
                            type="radio"
                            className="checkbox"
                            name="techniciennePresente"
                            value="oui"
                            checked={formState.techniciennePresente === 'oui'}
                            onChange={handleChange}
                        />
                        OUI
                    </label>
                    <label>
                        <input
                            type="radio"
                            className="checkbox"
                            name="techniciennePresente"
                            value="non"
                            checked={formState.techniciennePresente === 'non'}
                            onChange={handleChange}
                        />
                        NON
                    </label>
                </div>

                <input type="text" name="dureeDemonstration" placeholder="Durée de la démonstration" value={formState.dureeDemonstration} onChange={handleChange} /><br></br>
        
                {formState.techniciennePresente === 'oui' && (
                    <>
                    <label className="space oui">
                        <input
                        type="checkbox"
                        className="checkbox"
                        name="avecLaVRP"
                        checked={formState.avecLaVRP}
                        onChange={handleChange}
                        />
                        Avec la VRP
                    </label>
                    <label className="space">
                        <input
                        type="checkbox"
                        className="checkbox"
                        name="seule"
                        checked={formState.seule}
                        onChange={handleChange}
                        />
                        Seule
                    </label><br></br>
                    <input
                        type="text"
                        name="nomTechnicienne"
                        placeholder="Nom de la technicienne"
                        value={formState.nomTechnicienne}
                        onChange={handleChange}
                        />
                    </>
                )}
                <br></br>
                <br></br>

                <p className="bold margin">Issue favorable de la démonstration avec implantation de :</p>

                {Object.keys(formState.issueFavorable).map(issue => (
                    <>
                    <label  className="margin" key={issue}>
                    <input
                        type="checkbox"
                        className="checkbox"
                        name={issue}
                        checked={formState.issueFavorable[issue]}
                        onChange={handleIssueFavorableChange}
                    />
                    {issue.charAt(0).toUpperCase() + issue.slice(1)}
                    </label>
                    <br></br>
                    </>
                ))}
        
                <br></br>
                <p className="bold margin">Si, issue défavorable de la démonstration, cocher le motif:</p>

                {Object.keys(formState.issueDefavorable).map(issue => (
                    <>
                    <div key={issue}>
                        <label>
                            <p className="bold margin">{issue.charAt(0).toUpperCase() + issue.slice(1)}:</p><br></br>
                            <label className="margin">
                                <input
                                    type="radio"
                                    className="checkbox"
                                    name={issue}
                                    value="trop complexe"
                                    checked={formState.issueDefavorable[issue] === 'trop complexe'}
                                    onChange={handleIssueDefavorableChange}
                                />
                                Trop complexe
                            </label><br></br>
                            <label className="margin">
                                <input
                                    type="radio"
                                    name={issue}
                                    className="checkbox"
                                    value="realisation ratée"
                                    checked={formState.issueDefavorable[issue] === 'realisation ratée'}
                                    onChange={handleIssueDefavorableChange}
                                />
                                Réalisation ratée
                            </label><br></br>
                            <label className="margin">
                                <input
                                    type="radio"
                                    name={issue}
                                    className="checkbox"
                                    value="correspond pas aux attentes"
                                    checked={formState.issueDefavorable[issue] === 'correspond pas aux attentes'}
                                    onChange={handleIssueDefavorableChange}
                                />
                                Ne correspond pas aux attentes
                            </label><br></br>
                            <label className="margin">
                                <input
                                    type="radio"
                                    className="checkbox"
                                    name={issue}
                                    value="implantation concurrente recente"
                                    checked={formState.issueDefavorable[issue] === 'implantation concurrente recente'}
                                    onChange={handleIssueDefavorableChange}
                                />
                                Implantation concurrente récente
                            </label><br></br>
                            <label className="margin">
                                <input
                                    type="radio"
                                    name={issue}
                                    className="checkbox"
                                    value="prix"
                                    checked={formState.issueDefavorable[issue] === 'prix'}
                                    onChange={handleIssueDefavorableChange}
                                />
                                Prix
                            </label><br></br>
                            <label className="margin">
                                    <input
                                        type="radio"
                                        className="checkbox"
                                        name={issue}
                                        value="souhaite reflechir"
                                        checked={formState.issueDefavorable[issue] === 'souhaite reflechir'}
                                        onChange={handleIssueDefavorableChange}
                                    />
                                    Souhaite réfléchir
                            </label><br></br>
                        </label>
                    </div>
                    <br></br>
                    </>
                ))}
                
                <p className="bold margin">Actions suite à l'issue défavorable:</p><br></br>
                {Object.keys(formState.actions).map(action => (
                    <>
                    <label key={action} className="margin">
                    <input
                        type="checkbox"
                        className="checkbox"
                        name={action}
                        checked={formState.actions[action]}
                        onChange={handleActionsChange}
                    />
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                    </label>
                    <br></br>
                    </>
                ))}
                <br></br>

                <label className="bold margin">A préciser:</label><br></br>
                <textarea name="precisions" value={formState.precisions} onChange={handleChange}></textarea><br></br>
            
                <label className="bold margin">Observations générales:</label><br></br>
                <textarea name="observationsGenerales" value={formState.observationsGenerales} onChange={handleChange}></textarea>
                <br></br>
            
                <button type="submit" className="button-colored">Envoyer</button>
            </form>
            </>
        ) : (
            <>
            <button className="button-colored" onClick={() => setShowForm(true)}>Réafficher le formulaire</button>

            <ul className="crd-results">
                        {suiviList.map((item, index) => (
                            <li className="crd-saved" key={item.id}>
                                <p><span className="bold">{item.data.typeOfForm} </span>n° {index +1}</p>
                                <p><strong>Nom du salon:</strong> {item.data.salonName}</p>
                                <p><strong>Ville:</strong> {item.data.ville}</p>
                                <p><strong>Nom du responsable:</strong> {item.data.nomPrenomResponsable}</p>
                                <p><strong>Responsable présent:</strong> {item.data.responsablePresent}</p>
                                <p><strong>Téléphone:</strong> {item.data.tel}</p>
                                <p><strong>E-mail:</strong> {item.data.email}</p>
                                <p><strong>Nombre de collaborateurs:</strong> {item.data.nbCollaborateurs}</p>
                                <p><strong>Démonstrations:</strong></p>
                                <ul>
                                    {Object.keys(item.data.demonstrations).map(demo => (
                                        item.data.demonstrations[demo] && <li key={demo}>{demo.charAt(0).toUpperCase() + demo.slice(1)}</li>
                                    ))}
                                </ul>
                                <p><strong>Durée de la démonstration:</strong> {item.data.dureeDemonstration}</p>
                                <p><strong>Technicienne présente:</strong> {item.data.techniciennePresente}</p>
                                <p><strong>Nom de la technicienne:</strong> {item.data.nomTechnicienne}</p>
                                <p><strong>Issue favorable:</strong></p>
                                <ul>
                                    {Object.keys(item.data.issueFavorable).map(issue => (
                                        item.data.issueFavorable[issue] && <li key={issue}>{issue.charAt(0).toUpperCase() + issue.slice(1)}</li>
                                    ))}
                                </ul>
                                <p><strong>Issue défavorable:</strong></p>
                                <ul>
                                    {Object.keys(item.data.issueDefavorable).map(issue => (
                                        item.data.issueDefavorable[issue] && <li key={issue}>{issue.charAt(0).toUpperCase() + issue.slice(1)}: {item.data.issueDefavorable[issue]}</li>
                                    ))}
                                </ul>
                                <p><strong>Actions:</strong></p>
                                <ul>
                                    {Object.keys(item.data.actions).map(action => (
                                        item.data.actions[action] && <li key={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</li>
                                    ))}
                                </ul>
                                <p><strong>Précisions:</strong> {item.data.precisions}</p>
                                <p><strong>Observations générales:</strong> {item.data.observationsGenerales}</p>
                            </li>
                        ))}
                    </ul>
            </>
        )}
        </>
        
    )
}

export default CRDémonstration