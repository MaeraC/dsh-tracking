
// Fichier CRDémonstration.js

import { useState } from "react"
//import { useNavigate } from "react-router-dom"
import { db } from "../firebase.config"
import { updateDoc, doc } from "firebase/firestore"

function CRDémonstration({ visitId }) {

    //const navigate = useNavigate()

    const [formState, setFormState] = useState({
        nomSalon: '',
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
        observationsGenerales: ''
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

            await updateDoc(visitDocRef, {
                crDemonstration: formState
            })

            //navigate("/tableau-de-bord-commercial/questionnaires/");
        } 
        catch (error) {
            console.error("Erreur lors de la soumission du CRDemonstration :", error);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="form-CRD">
            <h1>CR RDV DEMONSTRATION</h1>

            <input type="text" name="nomSalon" placeholder="Nom du salon" value={formState.nomSalon} onChange={handleChange} /><br></br>
            <input type="text" name="ville" placeholder="Ville" value={formState.ville} onChange={handleChange} /><br></br>
            <input type="text" name="nomPrenomResponsable" placeholder="Nom Prénom du responsable" value={formState.nomPrenomResponsable} onChange={handleChange} /><br></br>
          
            <div className="display">
                <p className="bold">Responsable présent :</p>
                <label className="space"><input type="radio" name="responsablePresent" value="oui" checked={formState.responsablePresent === 'oui'} onChange={handleChange} />OUI</label>
                <label><input type="radio" name="responsablePresent" value="non" checked={formState.responsablePresent === 'non'} onChange={handleChange} />NON</label>
            </div>

            <input type="tel" name="tel" placeholder="Téléphone" value={formState.tel} onChange={handleChange} /><br></br>
            <input type="email" name="email" placeholder="E-mail" value={formState.email} onChange={handleChange} /><br></br>
            <input type="text" name="nbCollaborateurs" placeholder="Nombre de collaborateurs" value={formState.nbCollaborateurs} onChange={handleChange} /><br></br>
        
            <p className="bold">La démonstration portait sur:</p>
            {Object.keys(formState.demonstrations).map(demo => (
                <>
                <label key={demo}>
                <input
                    type="checkbox"
                    name={demo}
                    checked={formState.demonstrations[demo]}
                    onChange={handleDemonstrationChange}
                    className="marginRight"
                />
                {demo.charAt(0).toUpperCase() + demo.slice(1)}
                </label>
                <br></br>
                </>
            ))}
            <br></br>

            
            <div className="display">
                <p className="bold">Présence dune technicienne :</p>
                <label className="space">
                    <input
                        type="radio"
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
                <label className="space">
                    <input
                    type="checkbox"
                    name="avecLaVRP"
                    checked={formState.avecLaVRP}
                    onChange={handleChange}
                    className="marginRight"
                    />
                    Avec la VRP
                </label>
                <label>
                    <input
                    type="checkbox"
                    name="seule"
                    checked={formState.seule}
                    onChange={handleChange}
                    className="marginRight"
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

            <p className="bold">Issue favorable de la démonstration avec implantation de :</p>

            {Object.keys(formState.issueFavorable).map(issue => (
                <>
                <label key={issue}>
                <input
                    type="checkbox"
                    name={issue}
                    checked={formState.issueFavorable[issue]}
                    onChange={handleIssueFavorableChange}
                    className="marginRight"
                />
                {issue.charAt(0).toUpperCase() + issue.slice(1)}
                </label>
                <br></br>
                </>
            ))}
    
            <br></br>
            <p className="bold">Si, issue défavorable de la démonstration, cocher le motif:</p>

            {Object.keys(formState.issueDefavorable).map(issue => (
                <>
                <div key={issue}>
                    <label>
                        <p className="bold">{issue.charAt(0).toUpperCase() + issue.slice(1)}:</p>
                        <label>
                            <input
                                type="radio"
                                name={issue}
                                value="trop complexe"
                                checked={formState.issueDefavorable[issue] === 'trop complexe'}
                                onChange={handleIssueDefavorableChange}
                                className="marginRight"
                            />
                            Trop complexe
                        </label><br></br>
                        <label>
                            <input
                                type="radio"
                                name={issue}
                                value="realisation ratée"
                                checked={formState.issueDefavorable[issue] === 'realisation ratée'}
                                onChange={handleIssueDefavorableChange}
                                className="marginRight"
                            />
                            Réalisation ratée
                        </label><br></br>
                        <label>
                            <input
                                type="radio"
                                name={issue}
                                value="correspond pas aux attentes"
                                checked={formState.issueDefavorable[issue] === 'correspond pas aux attentes'}
                                onChange={handleIssueDefavorableChange}
                                className="marginRight"
                            />
                            Ne correspond pas aux attentes
                        </label><br></br>
                        <label>
                            <input
                                type="radio"
                                name={issue}
                                value="implantation concurrente recente"
                                checked={formState.issueDefavorable[issue] === 'implantation concurrente recente'}
                                onChange={handleIssueDefavorableChange}
                                className="marginRight"
                            />
                            Implantation concurrente récente
                        </label><br></br>
                        <label>
                            <input
                                type="radio"
                                name={issue}
                                value="prix"
                                checked={formState.issueDefavorable[issue] === 'prix'}
                                onChange={handleIssueDefavorableChange}
                                className="marginRight"
                            />
                            Prix
                        </label><br></br>
                        <label>
                                <input
                                    type="radio"
                                    name={issue}
                                    value="souhaite reflechir"
                                    checked={formState.issueDefavorable[issue] === 'souhaite reflechir'}
                                    onChange={handleIssueDefavorableChange}
                                    className="marginRight"
                                />
                                Souhaite réfléchir
                        </label><br></br>
                    </label>
                </div>
                <br></br>
                </>
            ))}
            
            <p className="bold">Actions suite à l'issue défavorable:</p>
            {Object.keys(formState.actions).map(action => (
                <>
                <label key={action}>
                <input
                    type="checkbox"
                    name={action}
                    checked={formState.actions[action]}
                    onChange={handleActionsChange}
                    className="marginRight"
                />
                {action.charAt(0).toUpperCase() + action.slice(1)}
                </label>
                <br></br>
                </>
            ))}
            <br></br>

            <label className="bold">A préciser:</label><br></br>
            <textarea name="precisions" value={formState.precisions} onChange={handleChange}></textarea><br></br>
        
            <label className="bold">Observations générales:</label><br></br>
            <textarea name="observationsGenerales" value={formState.observationsGenerales} onChange={handleChange}></textarea>
            <br></br>
        
            <button type="submit" className="button">Envoyer</button>
        </form>
    )
}

export default CRDémonstration