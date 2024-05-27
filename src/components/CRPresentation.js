
// Fichier CRPresentation.js

import { useState } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.config';

const CRPresentation = ({ visitId}) => {

    const [formData, setFormData] = useState({
        nomSalon: '',
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
        motifRefus: ''
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

            await updateDoc(visitDocRef, {
                crDemonstration: formData
            })

            //navigate("/tableau-de-bord-commercial/questionnaires/");
        } 
        catch (error) {
            console.error("Erreur lors de la soumission du CRDemonstration :", error);
        }
    }

    return (
        <form onSubmit={handleSubmit} className='form-crp'>
            <input type="text" name="nomSalon" placeholder="Nom du salon" value={formData.nomSalon} onChange={handleChange} /><br></br>
            <input type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} /><br></br>
            <input type="text" name="departement" placeholder='Département' value={formData.departement} onChange={handleChange} /><br></br>
            
            <div className='display'>
                <p className='bold'>Présence de la responsable:</p>
                <>
                <input className='space' type="radio" name="presenceResponsable" value="OUI" onChange={handleRadioChange} />
                <label>OUI</label>     
                <input className='space' type="radio" name="presenceResponsable" value="NON" onChange={handleRadioChange} />
                <label>NON</label>
                </>
            </div>
            
            <input type="text" name="nomPrenomResponsable" placeholder='Nom du responsable' value={formData.nomPrenomResponsable} onChange={handleChange} />
            
            <div>
                <p className='bold'>Âge du responsable :</p>
                <label>moins de 30 ans</label>
                <input type="radio" name="ageResponsable" value="moins de 30 ans" onChange={handleRadioChange} />
                <label>de 30 à 50 ans</label>
                <input type="radio" name="ageResponsable" value="de 30 à 50 ans" onChange={handleRadioChange} />
                <label>plus de 50 ans</label>
                <input type="radio" name="ageResponsable" value="plus de 50 ans" onChange={handleRadioChange} />
            </div>

            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} /><br></br>
            <input type="tel" name="tel" placeholder="Téléphone" value={formData.tel} onChange={handleChange} />
            
            <div>
                <p className='bold'>Tenue du salon:</p>
                <label>TB</label>
                <input type="radio" name="tenueSalon" value="TB" onChange={handleRadioChange} />
                <label>MOY</label>
                <input type="radio" name="tenueSalon" value="MOY" onChange={handleRadioChange} />
                <label>MAUVAIS</label>
                <input type="radio" name="tenueSalon" value="MAUVAIS" onChange={handleRadioChange} />
            </div>
            <div>
                <label>Visite:</label>
                <label>Spontanée</label>
                <input type="radio" name="visite" value="spontanee" onChange={handleRadioChange} />
                <label>Sur recommandation</label>
                <input type="radio" name="visite" value="sur_recommandation" onChange={handleRadioChange} />
                <label>Ancienne cliente</label>
                <input type="radio" name="visite" value="ancienne_client" onChange={handleRadioChange} />
                <label>Prospection téléphonique</label>
                <input type="radio" name="visite" value="prospection_telephonique" onChange={handleRadioChange} />
            </div>
            <div>
                <label>Marques de coloration:</label>
                {formData.marquesColoration.map((marque, index) => (
                    <div key={index}>
                        <input type="text" value={marque} onChange={(e) => handleChange(e)} />
                    </div>
                ))}
                <button type="button" onClick={() => setFormData({...formData, marquesColoration: [...formData.marquesColoration, '']})}>Ajouter une marque de coloration</button>
            </div>
            <div>
                <label>Marques de revente:</label>
                {formData.marquesRevente.map((marque, index) => (
                <div key={index}>
                <input type="text" value={marque} onChange={(e) => handleChange(e)} />
                </div>
                ))}
                <button type="button" onClick={() => setFormData({...formData, marquesRevente: [...formData.marquesRevente, '']})}>Ajouter une marque de revente</button>
            </div>
            <div>
            <label>Marques BAC et TECH:</label>
                {formData.marquesBacTech.map((marque, index) => (
                <div key={index}>
                <input type="text" value={marque} onChange={(e) => handleChange(e)} />
                </div>
                ))}
                <button type="button" onClick={() => setFormData({...formData, marquesBacTech: [...formData.marquesBacTech, '']})}>Ajouter une marque BAC/TECH</button>
            </div>
            <div>
                <label>Concepts DSH abordés:</label>
                <div>
                    <input type="checkbox" name="conceptsDSH" value="microscopie" onChange={handleCheckboxChange} />
                    <label>Microscopie</label>
                </div>
                <div>
                    <input type="checkbox" name="conceptsDSH" value="couleur" onChange={handleCheckboxChange} />
                    <label>Couleur</label>
                </div>
                <div>
                    <input type="checkbox" name="conceptsDSH" value="deco" onChange={handleCheckboxChange} />
                    <label>Déco</label>
                </div>
                <div>
                    <input type="checkbox" name="conceptsDSH" value="permanente" onChange={handleCheckboxChange} />
                    <label>Permanente</label>
                </div>
                <div>
                    <input type="checkbox" name="conceptsDSH" value="prGale" onChange={handleCheckboxChange} />
                    <label>PR. Gale</label>
                </div>
            </div>
            <div>
                <label>À revoir ou abandon:</label>
                <label>À revoir</label>
                <input type="radio" name="revoirConceptsDSH" value="a_revoir" onChange={handleRadioChange} />
                <label>Abandon</label>
                <input type="radio" name="revoirConceptsDSH" value="abandon" onChange={handleRadioChange} />
                {formData.revoirConceptsDSH === 'a_revoir' && (
                <div>
                    <label>RDV prévu pour quelle date:</label>
                    <input type="date" name="dateRevoirConceptsDSH" value={formData.dateRevoirConceptsDSH} onChange={handleChange} />
                </div>
                )}
            </div>
            <div>
                <label>Intéressé par:</label>
                <div>
                    <input type="checkbox" name="interet" value="microscopie" onChange={handleCheckboxChange} />
                    <label>Microscopie</label>
                </div>
                <div>
                    <input type="checkbox" name="interet" value="couleur" onChange={handleCheckboxChange} />
                    <label>Couleur</label>
                </div>
                <div>
                    <input type="checkbox" name="interet" value="deco" onChange={handleCheckboxChange} />
                    <label>Déco</label>
                </div>
                <div>
                    <input type="checkbox" name="interet" value="permanente" onChange={handleCheckboxChange} />
                    <label>Permanente</label>
                </div>
                <div>
                    <input type="checkbox" name="interet" value="autre" onChange={handleCheckboxChange} />
                    <label>Autre</label>
                </div>
            </div>
            <div>
                <label>À revoir ou abandon:</label>
                <label>À revoir</label>
                <input type="radio" name="revoirInteret" value="a_revoir" onChange={handleRadioChange} />
                <label>Abandon</label>
                <input type="radio" name="revoirInteret" value="abandon" onChange={handleRadioChange} />
                {formData.revoirInteret === 'a_revoir' && (
                    <div>
                        <label>RDV prévu pour quelle date:</label>
                        <input type="date" name="dateRevoirInteret" value={formData.dateRevoirInteret} onChange={handleChange} />
                        <label>RDV pour démo / formation:</label>
                        <input type="date" name="dateRdvDemoFormation" value={formData.dateRdvDemoFormation} onChange={handleChange} />
                    </div>
                )}
            </div>
            <div>
                <label>Si à revoir, observation à préparer pour la prochaine visite:</label>
                <textarea name="observationPreparation" value={formData.observationPreparation} onChange={handleChange}></textarea>
            </div>
            <div>
                <label>Si refus, motif:</label>
                <textarea name="motifRefus" value={formData.motifRefus} onChange={handleChange}></textarea>
            </div>
            <button type="submit">Soumettre</button>
        </form>
    );
};

export default CRPresentation;