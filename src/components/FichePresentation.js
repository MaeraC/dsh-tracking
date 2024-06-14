
// fichier FichePresentation.js

import { useState, useCallback } from "react"
import { db } from "../firebase.config"
import { updateDoc, doc, getDoc, getDocs, query, collection, where } from "firebase/firestore"
import back from "../assets/back.png"

function FichePresentation({ uid, onReturn }) {
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    
    const [message, setMessage] = useState("")

    const initialFormData = {
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
        createdAt: new Date(),
        typeOfForm: "Compte rendu de RDV de Présentation",
        userId: uid,
    }

    const [formData, setFormData] = useState(initialFormData)
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (type === 'checkbox') {
            setFormData(prevState => ({
                ...prevState,
                [name]: checked
            }))
        } 
        else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }))
        }
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

    const handleSearch = async (e) => {
        const searchValue = e.target.value
        setSearchSalon(searchValue)

        if (searchValue.length > 0) {
            try {
                const q = query(collection(db, "salons"), where("name", ">=", searchValue), where("name", "<=", searchValue + "\uf8ff"));
                const querySnapshot = await getDocs(q);

                const searchResults = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    searchResults.push({ id: doc.id, ...data })
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
        setSalonInfo(salon);
        setSuggestions([]);

        const salonRef = doc(db, "salons", salon.id);
        const salonSnapshot = await getDoc(salonRef);

        if (salonSnapshot.exists()) {
            const data = salonSnapshot.data();
            const crPresentation = data.crPresentation ? data.crPresentation[data.crPresentation.length - 1] : {};

            setFormData({
                salonName: crPresentation.salonName || initialFormData.salonName,
                ville: crPresentation.ville || initialFormData.ville,
                departement: crPresentation.departement || initialFormData.departement,
                presenceResponsable: crPresentation.presenceResponsable || initialFormData.presenceResponsable,
                nomPrenomResponsable: crPresentation.nomPrenomResponsable || initialFormData.nomPrenomResponsable,
                ageResponsable: crPresentation.ageResponsable || initialFormData.ageResponsable,
                email: crPresentation.email || initialFormData.email,
                tel: crPresentation.tel || initialFormData.tel,
                tenueSalon: crPresentation.tenueSalon || initialFormData.tenueSalon,
                visite: crPresentation.visite || initialFormData.visite,
                marquesColoration: crPresentation.marquesColoration || initialFormData.marquesColoration,
                marquesRevente: crPresentation.marquesRevente || initialFormData.marquesRevente,
                marquesBacTech: crPresentation.marquesBacTech || initialFormData.marquesBacTech,
                conceptsDSH: {
                    microscopie: crPresentation.conceptsDSH?.microscopie || initialFormData.conceptsDSH.microscopie,
                    couleur: crPresentation.conceptsDSH?.couleur || initialFormData.conceptsDSH.couleur,
                    deco: crPresentation.conceptsDSH?.deco || initialFormData.conceptsDSH.deco,
                    permanente: crPresentation.conceptsDSH?.permanente || initialFormData.conceptsDSH.permanente,
                    prGale: crPresentation.conceptsDSH?.prGale || initialFormData.conceptsDSH.prGale,
                },
                revoirConceptsDSH: crPresentation.revoirConceptsDSH || initialFormData.revoirConceptsDSH,
                dateRevoirConceptsDSH: crPresentation.dateRevoirConceptsDSH || initialFormData.dateRevoirConceptsDSH,
                interet: {
                    microscopie: crPresentation.interet?.microscopie || initialFormData.interet.microscopie,
                    couleur: crPresentation.interet?.couleur || initialFormData.interet.couleur,
                    deco: crPresentation.interet?.deco || initialFormData.interet.deco,
                    permanente: crPresentation.interet?.permanente || initialFormData.interet.permanente,
                    autre: crPresentation.interet?.autre || initialFormData.interet.autre,
                },
                revoirInteret: crPresentation.revoirInteret || initialFormData.revoirInteret,
                dateRevoirInteret: crPresentation.dateRevoirInteret || initialFormData.dateRevoirInteret,
                dateRdvDemoFormation: crPresentation.dateRdvDemoFormation || initialFormData.dateRdvDemoFormation,
                observationPreparation: crPresentation.observationPreparation || initialFormData.observationPreparation,
                motifRefus: crPresentation.motifRefus || initialFormData.motifRefus,
                createdAt: new Date(),
                typeOfForm: "Compte rendu de RDV de Présentation",
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
                            action: "Mise à jour du Compte rendu de RDV De Présentation",
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

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // Mets à jour le document du salon avec les nouvelles informations
            const salonRef = doc(db, "salons", salonInfo.id)
            const SalonSnapshot = await getDoc(salonRef)
           
            if (SalonSnapshot.exists()) {

                const salonData = SalonSnapshot.data()
                const updatedcrPresentation = [...(salonData.crPresentation || []), formData]
                await updateDoc(salonRef, { crPresentation: updatedcrPresentation })   

                // Met à jour l'historique du salon
                await updateSalonHistory(formData)
                setMessage("Compte rendu de RDV de Présentation enregistré avec succès !") 
            }
            else {
                console.error("Document de visite non trouvé.")
            }

        } catch (error) {
            console.error("Erreur lors de la mise à jour du salon : ", error);
        }
    }

    return (
        <div className="demonstration-section">
            <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>

            <div className="sugg">
                <input  className="input-sugg" type="text" placeholder="Rechercher un salon par son nom" value={searchSalon} onChange={handleSearch} />
                <div className="select-sugg">
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
                    <>
                    <p className="success">{message}</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-CRD">
                            <h2>{salonInfo.name}</h2>
                            <p className="adress">{salonInfo.address}</p>
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
                        
                            <button type="submit" className="button-colored">Envoyer</button>

                        </div>
                    </form>
                    <p className="success">{message}</p>
                    </>
                     
                )}

            </div>
        </div>
    )
}

export default FichePresentation