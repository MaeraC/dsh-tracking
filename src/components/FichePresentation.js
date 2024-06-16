
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
        //nomduSalon: '',
        ville: '',
        departement: '',
        responsablePresent: '',
        nomPrenomDuResponsable: '',
        ageDuResponsable: '',
        email: '',
        telephone: '',
        tenueDuSalon: '',
        visite: '',
        marquesColoration: [],
        marquesRevente: [],
        marquesBacTech: [],
        conceptsDshAbordés: {
            microscopie: false,
            couleur: false,
            deco: false,
            permanente: false,
            prGale: false
        },
        rdvOuAbandon: '',
        dateDeRdv: '',
        interessePar: {
            microscopie: false,
            couleur: false,
            deco: false,
            permanente: false,
            autre: false
        },
       
        obeservationsAPreparerpourLaProchaineVisite: '',
        motifDeRefus: '',
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

    const handleAddColoration = () => {
        setFormData({
            ...formData,
            marquesColoration: [...formData.marquesColoration, { nom: "" }]
        });
    }

    const handleColoration = (index, field, value) => {
        const coloration = formData.marquesColoration.map((marque, i) => {
            if (i === index) {
                return { ...marque, [field]: value };
            }
            return marque;
        });

        setFormData({ ...formData, marquesColoration: coloration });
    }

    const handleAddRevente = () => {
        setFormData({
            ...formData,
            marquesRevente: [...formData.marquesRevente, { nom: "" }]
        });
    }

    const handleRevente = (index, field, value) => {
        const revente = formData.marquesRevente.map((marque, i) => {
            if (i === index) {
                return { ...marque, [field]: value };
            }
            return marque;
        });

        setFormData({ ...formData, marquesRevente: revente });
    }

    const handleAddBac = () => {
        setFormData({
            ...formData,
            marquesBacTech: [...formData.marquesBacTech, { nom: "" }]
        });
    }

    const handleBac = (index, field, value) => {
        const bac = formData.marquesBacTech.map((marque, i) => {
            if (i === index) {
                return { ...marque, [field]: value };
            }
            return marque;
        });

        setFormData({ ...formData, marquesBacTech: bac });
    }
    
    const handleRadioChange = (e) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleDemonstrationChange = (e) => {
        const { name, checked } = e.target

        setFormData(prevState => ({
            ...prevState,
            conceptsDshAbordés: {
                ...prevState.conceptsDshAbordés,
                [name]: checked
            }
        }))
    }

    const handleInteresseChange = (e) => {
        const { name, checked } = e.target

        setFormData(prevState => ({
            ...prevState,
            interessePar: {
                ...prevState.interessePar,
                [name]: checked
            }
        }))
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
                //nomduSalon: crPresentation.nomduSalon || initialFormData.nomduSalon,
                ville: crPresentation.ville || initialFormData.ville,
                departement: crPresentation.departement || initialFormData.departement,
                responsablePresent: crPresentation.responsablePresent || initialFormData.responsablePresent,
                nomPrenomDuResponsable: crPresentation.nomPrenomDuResponsable || initialFormData.nomPrenomDuResponsable,
                ageDuResponsable: crPresentation.ageDuResponsable || initialFormData.ageDuResponsable,
                email: crPresentation.email || initialFormData.email,
                telephone: crPresentation.telephone || initialFormData.telephone,
                tenueDuSalon: crPresentation.tenueDuSalon || initialFormData.tenueDuSalon,
                visite: crPresentation.visite || initialFormData.visite,
                marquesColoration: crPresentation.marquesColoration || initialFormData.marquesColoration,
                marquesRevente: crPresentation.marquesRevente || initialFormData.marquesRevente,
                marquesBacTech: crPresentation.marquesBacTech || initialFormData.marquesBacTech,
                conceptsDshAbordés: {
                    microscopie: crPresentation.conceptsDshAbordés?.microscopie || false,
                    couleur: crPresentation.conceptsDshAbordés?.couleur || false,
                    deco: crPresentation.conceptsDshAbordés?.deco || false,
                    permanente: crPresentation.conceptsDshAbordés?.permanente || false,
                    prGale: crPresentation.conceptsDshAbordés?.prGale || false,
                },
                rdvOuAbandon: crPresentation.rdvOuAbandon || initialFormData.rdvOuAbandon,
                dateDeRdv: crPresentation.dateDeRdv || initialFormData.dateDeRdv,
                interessePar: {
                    microscopie: crPresentation.interessePar?.microscopie || initialFormData.interessePar.microscopie,
                    couleur: crPresentation.interessePar?.couleur || initialFormData.interessePar.couleur,
                    deco: crPresentation.interessePar?.deco || initialFormData.interessePar.deco,
                    permanente: crPresentation.interessePar?.permanente || initialFormData.interessePar.permanente,
                    autre: crPresentation.interessePar?.autre || initialFormData.interessePar.autre,
                },
                
                obeservationsAPreparerpourLaProchaineVisite: crPresentation.obeservationsAPreparerpourLaProchaineVisite || initialFormData.obeservationsAPreparerpourLaProchaineVisite,
                motifDeRefus: crPresentation.motifDeRefus || initialFormData.motifDeRefus,
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

    // Fonction de vérification des champs
    const validateFormData = (data) => {
        for (const key in data) {
            if (data[key] === '' || data[key] === null || data[key] === undefined) {
                return key;
            }
            if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
                const nestedInvalidKey = validateFormData(data[key]);
                if (nestedInvalidKey) {
                    return `${key}.${nestedInvalidKey}`;
                }
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        const invalidField = validateFormData(formData);
        if (invalidField) {
            console.error(`Erreur : le champ "${invalidField}" est vide ou invalide.`);
            return;
        }
    
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
                                <input className='space checkbox' type="radio" name="responsablePresent" value="OUI" onChange={handleRadioChange} />
                                <label>OUI</label>     
                                <input className='space checkbox' type="radio" name="responsablePresent" value="NON" onChange={handleRadioChange} />
                                <label>NON</label>
                                </>
                            </div>
                            
                            <input type="text" name="nomPrenomDuResponsable" placeholder='Nom du responsable' value={formData.nomPrenomDuResponsable} onChange={handleChange} />
                            
                            <div className="space">
                                <p className='bold margin'>Âge du responsable :</p><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="ageDuResponsable" value="moins de 30 ans" onChange={handleRadioChange} />
                                    <label>moins de 30 ans</label>
                                </div><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="ageDuResponsable" value="de 30 à 50 ans" onChange={handleRadioChange} />
                                    <label>de 30 à 50 ans</label>
                                </div><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="ageDuResponsable" value="plus de 50 ans" onChange={handleRadioChange} />
                                    <label>plus de 50 ans</label>
                                </div>
                            </div>

                            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} /><br></br>
                            <input type="telephone" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} />
                            
                            <div className="space">
                                <p className='bold margin'>Tenue du salon :</p><br></br>
                                <div>
                                    <input className="checkbox" type="radio" name="tenueDuSalon" value="TB" onChange={handleRadioChange} />
                                    <label className="margin">Très bien</label>
                                </div>
                                <div>
                                    <input className="checkbox" type="radio" name="tenueDuSalon" value="MOY" onChange={handleRadioChange} />
                                    <label className="margin">Moyenne</label>
                                </div>
                                <div>
                                    <input className="checkbox" type="radio" name="tenueDuSalon" value="MAUVAIS" onChange={handleRadioChange} />
                                    <label>Mauvaise</label>
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
                                    <input className="checkbox" type="radio" name="visite" value="prospection_telephoneephonique" onChange={handleRadioChange} />
                                    <label>Prospection téléphonique</label>
                                </div>
                            </div><br></br>

                            <div className="space">
                                {formData.marquesColoration.map((marque, index) => (
                                    <div key={index}>
                                        <input type="text" placeholder="Nom de la marque" value={marque.nom} onChange={(e) => handleColoration(index, 'nom', e.target.value)} />
                                    </div>
                                ))}
                                <button className="button-colored btnn" type="button" onClick={handleAddColoration}>Ajouter une marque de coloration</button>
                            </div><br></br>
                            <div className="space">
                                {formData.marquesRevente.map((marque, index) => (
                                <div key={index}>
                                    <input type="text" placeholder="Nom de la marque" value={marque.nom} onChange={(e) => handleRevente(index, "nom", e.target.value)} />
                                </div>
                                ))}
                                <button className="button-colored btnn" type="button" onClick={handleAddRevente}>Ajouter une marque de revente</button>
                            </div><br></br>
                            <div className="space">
                                {formData.marquesBacTech.map((marque, index) => (
                                <div key={index}>
                                <input type="text" value={marque.nom} placeholder="Nom de la marque" onChange={(e) => handleBac(index, "nom", e.target.value)} />
                                </div>
                                ))}
                                <button className="button-colored btnn" type="button" onClick={handleAddBac}>Ajouter une marque BAC/TECH</button>
                            </div><br></br><br></br>
                              <div>
                                <p className="margin"><strong>Concepts DSH abordés :</strong></p><br></br>
                                {Object.keys(formData.conceptsDshAbordés).map(demo => (
                                <> 
                                <label className="margin" key={demo}>
                                <input
                                    type="checkbox"
                                    name={demo}
                                    checked={formData.conceptsDshAbordés[demo]}
                                    onChange={handleDemonstrationChange}
                                    className="checkbox"
                                />
                                {demo.charAt(0).toUpperCase() + demo.slice(1)}
                                </label>
                                <br></br>
                                </>
                            ))}
                               
                            </div><br></br>
                            <div>
                            <p className="margin"><strong>Intéressé par :</strong></p><br></br>
                                {Object.keys(formData.interessePar).map(demo => (
                                <> 
                                <label className="margin" key={demo}>
                                <input  
                                    type="checkbox"
                                    name={demo}
                                    checked={formData.interessePar[demo]}
                                    onChange={handleInteresseChange}
                                    className="checkbox"
                                />
                                {demo.charAt(0).toUpperCase() + demo.slice(1)}
                                </label>
                                <br></br>
                                </>
                            ))}
                               
                            </div><br></br>
                            
                            <div className="space">
                                <p className="margin"><strong>RDV ou abandon :</strong></p><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="rdvOuAbandon" value="rdv" onChange={handleRadioChange} />
                                    <label>RDV</label>
                                </div><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="rdvOuAbandon" value="abandon" onChange={handleRadioChange} />
                                    <label>Abandon</label>
                                </div><br></br><br></br>
                                
                                {formData.rdvOuAbandon === 'rdv' && (
                                <div>
                                    <p className="margin"><strong>RDV prévu pour quelle date :</strong></p><br></br>
                                    <input type="date" name="dateDeRdv" value={formData.dateDeRdv} onChange={handleChange} />
                                </div>
                                )}
                            </div>
                            <br></br>
                            <div>
                                <label className="margin bold">Si à RDV, observation à préparer pour la prochaine visite:</label>
                                <textarea name="obeservationsAPreparerpourLaProchaineVisite" value={formData.obeservationsAPreparerpourLaProchaineVisite} onChange={handleChange}></textarea>
                            </div>
                            <div>
                                <label className="margin bold">Si refus, motif:</label>
                                <textarea name="motifDeRefus" value={formData.motifDeRefus} onChange={handleChange}></textarea>
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