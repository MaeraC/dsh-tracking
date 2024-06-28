
// fichier FichePresentation.js

import { useState, useCallback } from "react"
import { db } from "../firebase.config"
import { updateDoc, doc, getDoc, getDocs, query, collection, where } from "firebase/firestore"
import back from "../assets/back.png"
import plus from "../assets/plusplus.png"

function FichePresentation({ uid, onReturn }) {
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [showAllFiches, setShowAllFiches] = useState(false);
const [allFiches, setAllFiches] = useState([]);

    const initialFormData = {
        departement: '',
        responsablePresent: '',
        nomPrenomDuResponsable: '',
        ageDuResponsable: '',
        email: '',
        telephone: '',
        nombreDePersonnes: "",
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
        rdvPour: '',
        interessePar: {
            microscopie: false,
            couleur: false,
            deco: false,
            permanente: false,
            autre: false
        },
       
        observationsAPreparerpourLaProchaineVisite: '',
        motifDeRefus: '',
        createdAt: new Date(),
        typeOfForm: "Compte rendu de RDV de Présentation",
        userId: uid,
    }
    const [formData, setFormData] = useState(initialFormData)
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        if (type === 'checkbox') {
            setFormData(prevState => ({ ...prevState, [name]: checked }))
        } 
        else {
            setFormData(prevState => ({ ...prevState, [name]: value }))
        }
    }

    const handleAddColoration = () => {
        setFormData({ ...formData, marquesColoration: [...formData.marquesColoration, { nom: "" }] });
    }

    const handleColoration = (index, field, value) => {
        const coloration = formData.marquesColoration.map((marque, i) => {
            if (i === index) {
                return { ...marque, [field]: value };
            }
            return marque;
        })
        setFormData({ ...formData, marquesColoration: coloration })
    }

    const handleAddRevente = () => {
        setFormData({ ...formData, marquesRevente: [...formData.marquesRevente, { nom: "" }] })
    }

    const handleRevente = (index, field, value) => {
        const revente = formData.marquesRevente.map((marque, i) => {
            if (i === index) {
                return { ...marque, [field]: value }
            }
            return marque
        })
        setFormData({ ...formData, marquesRevente: revente })
    }

    const handleAddBac = () => {
        setFormData({ ...formData, marquesBacTech: [...formData.marquesBacTech, { nom: "" }] })
    }

    const handleBac = (index, field, value) => {
        const bac = formData.marquesBacTech.map((marque, i) => {
            if (i === index) {
                return { ...marque, [field]: value }
            }
            return marque;
        })
        setFormData({ ...formData, marquesBacTech: bac })
    }
    
    const handleRadioChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        //if (name === 'rdvOuAbandon') {
        //    setShowObservations(value === 'rdv');
        //}
    }

    const handleDemonstrationChange = (e) => {
        const { name, checked } = e.target
        setFormData(prevState => ({ ...prevState, conceptsDshAbordés: { ...prevState.conceptsDshAbordés, [name]: checked } }))
    }

    const handleInteresseChange = (e) => {
        const { name, checked } = e.target
        setFormData(prevState => ({ ...prevState, interessePar: { ...prevState.interessePar, [name]: checked } }))
    }

    const handleSearch = async (e) => {
        const searchValue = e.target.value
        setSearchSalon(searchValue)

        if (searchValue.length > 0) {
            try {
                const q = query(collection(db, "salons"), where("name", ">=", searchValue), where("name", "<=", searchValue + "\uf8ff"));
                const querySnapshot = await getDocs(q)
                const searchResults = []

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    searchResults.push({ id: doc.id, ...data })
                })
                setSuggestions(searchResults)
            } 
            catch (error) {
                console.error("Erreur lors de la recherche du salon : ", error)
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
            const data = salonSnapshot.data()
            const crPresentation = data.crPresentation ? data.crPresentation[data.crPresentation.length - 1] : {}

            setFormData({
                adresse: salon.address || "",
                city: salon.city || "",
                name: salon.name || "",
                departement: crPresentation.departement || initialFormData.departement,
                responsablePresent: crPresentation.responsablePresent || initialFormData.responsablePresent,
                nomPrenomDuResponsable: crPresentation.nomPrenomDuResponsable || initialFormData.nomPrenomDuResponsable,
                ageDuResponsable: crPresentation.ageDuResponsable || initialFormData.ageDuResponsable,
                email: crPresentation.email || initialFormData.email,
                telephone: crPresentation.telephone || initialFormData.telephone,
                tenueDuSalon: crPresentation.tenueDuSalon || initialFormData.tenueDuSalon,
                nombreDePersonnes: crPresentation.nombreDePersonnes || initialFormData.nombreDePersonnes,
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
                rdvPour: crPresentation.rdvPour || initialFormData.rdvPour,
                dateDeRdv: crPresentation.dateDeRdv || initialFormData.dateDeRdv,
                interessePar: {
                    microscopie: crPresentation.interessePar?.microscopie || initialFormData.interessePar.microscopie,
                    couleur: crPresentation.interessePar?.couleur || initialFormData.interessePar.couleur,
                    deco: crPresentation.interessePar?.deco || initialFormData.interessePar.deco,
                    permanente: crPresentation.interessePar?.permanente || initialFormData.interessePar.permanente,
                    autre: crPresentation.interessePar?.autre || initialFormData.interessePar.autre,
                },
                
                observationsAPreparerpourLaProchaineVisite: crPresentation.observationsAPreparerpourLaProchaineVisite || initialFormData.observationsAPreparerpourLaProchaineVisite,
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
                    ]
    
                    await updateDoc(salonRef, { historique: newHistoryEntry })
                } else {
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
                const updatedcrPresentation = [...(salonData.crPresentation || []), formData]
                await updateDoc(salonRef, { crPresentation: updatedcrPresentation })  
                await updateSalonHistory(formData)
                setMessage("Compte rendu de RDV de Présentation enregistré avec succès !") 
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
        try {
            const salonRef = doc(db, "salons", salonInfo.id);
            const salonSnapshot = await getDoc(salonRef);
    
            if (salonSnapshot.exists()) {
                const salonData = salonSnapshot.data();
                const crPresentations = salonData.crPresentation || [];
                setAllFiches(crPresentations);
                setShowAllFiches(true);
            } else {
                console.error("Document de visite non trouvé.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des fiches : ", error);
        }
    };

    return (
        <div className="demonstration-section">
            <div className="title-fiche">
                <h1>Compte rendu de RDV de Présentation</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <div className="sugg">
                <input  className="input-sugg" type="text" placeholder="Rechercher un salon par son nom" value={searchSalon} onChange={handleSearch} />
                <div className="select-sugg">
                    {suggestions.map((salon) => (
                        <div key={salon.id} onClick={() => handleSelectSuggestion(salon)}
                            style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }}>
                            {salon.name}
                        </div>
                    ))}
                </div>

                {salonInfo && (
                    <>
                    <button onClick={handleShowAllFiches}>Voir toutes les fiches enregistrées</button>

                    <form onSubmit={handleSubmit}>
                        <div className="form-CRD">
                            <h2>{salonInfo.name}</h2>
                            <p className="adress">{salonInfo.address}</p>
                            <input type="text" name="departement" placeholder='Département' value={formData.departement} onChange={handleChange} /><br></br>
                            <input type="text" name="nomPrenomDuResponsable" placeholder='Nom Prénom du responsable' value={formData.nomPrenomDuResponsable} onChange={handleChange} />
                            <input type="number" name="nombreDePersonnes" placeholder="Nombre de personnes" value={formData.nombreDePersonnes} onChange={handleChange} /><br />
                            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} /><br></br>
                            <input type="telephone" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} /><br></br><br></br>                           
                            <div className='space'>
                                <p className='bold margin'>Présence du responsable :</p><br></br>
                                <>
                                <input className='space checkbox' type="radio" name="responsablePresent" checked={formData.responsablePresent === 'OUI'} value="OUI" onChange={handleRadioChange} />
                                <label className="oui">OUI</label>     
                                <input className='space checkbox' type="radio" name="responsablePresent" value="NON" onChange={handleRadioChange} />
                                <label>NON</label>
                                </>
                            </div><br></br>
                            <div className="space">
                                <p className='bold margin'>Âge du responsable :</p><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="ageDuResponsable" value="moins de 30 ans" checked={formData.ageDuResponsable === 'moins de 30 ans'} onChange={handleRadioChange} />
                                    <label>moins de 30 ans</label>
                                </div><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="ageDuResponsable" value="de 30 à 50 ans" checked={formData.ageDuResponsable === 'de 30 à 50 ans'} onChange={handleRadioChange} />
                                    <label>de 30 à 50 ans</label>
                                </div><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="ageDuResponsable" value="plus de 50 ans" checked={formData.ageDuResponsable === 'plus de 50 ans'} onChange={handleRadioChange} />
                                    <label>plus de 50 ans</label>
                                </div>
                            </div><br></br>
                            <div className="space">
                                <p className='bold margin'>Tenue du salon :</p><br></br>
                                <div>
                                    <input className="checkbox" type="radio" name="tenueDuSalon" value="TB"  checked={formData.tenueDuSalon === 'TB'} onChange={handleRadioChange} />
                                    <label className="margin">Très bien</label>
                                </div>
                                <div>
                                    <input className="checkbox" type="radio" name="tenueDuSalon" value="MOY" checked={formData.tenueDuSalon === 'MOY'} onChange={handleRadioChange} />
                                    <label className="margin">Moyenne</label>
                                </div>
                                <div>
                                    <input className="checkbox" type="radio" name="tenueDuSalon" value="MAUVAIS" checked={formData.tenueDuSalon === 'MAUVAIS'} onChange={handleRadioChange} />
                                    <label>Mauvaise</label>
                                </div>
                            </div><br></br><br></br>
                            <div className="space">
                                <p className="margin"><strong>Visite :</strong></p><br></br>
                                <div>
                                    <input className="checkbox" type="radio" name="visite" value="spontanee" checked={formData.visite === 'spontanee'} onChange={handleRadioChange} />
                                    <label className="margin">Spontanée</label>
                                </div>
                                <div>
                                    <input className="checkbox" type="radio" name="visite" value="sur_recommandation" checked={formData.visite === 'sur_recommandation'} onChange={handleRadioChange} />
                                    <label className="margin">Sur recommandation</label>
                                </div>
                                <div>
                                    <input className="checkbox" type="radio" name="visite" value="ancienne_client" checked={formData.visite === 'ancienne_client'} onChange={handleRadioChange} />
                                    <label className="margin">Ancienne cliente</label>
                                </div>
                                <div>
                                    <input className="checkbox" type="radio" name="visite" value="prospection_telephoneephonique" checked={formData.visite === 'prospection_telephoneephonique'} onChange={handleRadioChange} />
                                    <label>Prospection téléphonique</label>
                                </div>
                            </div><br></br><br></br>
                                <div>
                                    {formData.marquesColoration.map((marque, index) => (
                                        <input key={index}  type="text" placeholder="Nom de la marque de coloration" value={marque.nom} onChange={(e) => handleColoration(index, 'nom', e.target.value)} />
                                    ))}
                                </div>
                                <button className="button-colored btn-plus-img" type="button" onClick={handleAddColoration}>Marque de coloration<img src={plus} alt="" /></button>
                                <div> 
                                    {formData.marquesRevente.map((marque, index) => (
                                        <input key={index}  type="text" placeholder="Nom de la marque de revente" value={marque.nom} onChange={(e) => handleRevente(index, "nom", e.target.value)} />
                                    ))}
                                </div>
                                <button className="button-colored btn-plus-img btn2" type="button" onClick={handleAddRevente}>Marque de revente<img src={plus} alt="" /></button>
                                <div>
                                    {formData.marquesBacTech.map((marque, index) => (
                                        <input key={index}  type="text" value={marque.nom} placeholder="Nom de la marque BAC/TECH" onChange={(e) => handleBac(index, "nom", e.target.value)} />
                                    ))}
                                </div>
                                <button className="button-colored btn-plus-img" type="button" onClick={handleAddBac}>Marque BAC/TECH<img src={plus} alt="" /></button>
                            <br></br><br></br>
                              <div>
                                <p className="margin"><strong>Concepts DSH abordés :</strong></p><br></br>
                                {Object.keys(formData.conceptsDshAbordés).map(demo => (
                                <> 
                                <label className="margin" key={demo}>
                                    <input type="checkbox" name={demo} checked={formData.conceptsDshAbordés[demo]} onChange={handleDemonstrationChange} className="checkbox" />
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
                                    <input type="checkbox" name={demo} checked={formData.interessePar[demo]} onChange={handleInteresseChange} className="checkbox" />
                                    {demo.charAt(0).toUpperCase() + demo.slice(1)}
                                </label>
                                <br></br>
                                </>
                            ))}
                            </div><br></br>
                            <div className="space">
                                <p className="margin"><strong>RDV ou abandon :</strong></p><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="rdvOuAbandon" value="rdv" checked={formData.rdvOuAbandon === "rdv"} onChange={handleRadioChange} />
                                    <label>RDV</label>
                                </div><br></br>
                                <div className="margin">
                                    <input className="checkbox" type="radio" name="rdvOuAbandon" value="abandon"  checked={formData.rdvOuAbandon === "abandon"} onChange={handleRadioChange} />
                                    <label>Abandon</label>
                                </div><br></br><br></br>
                                
                                {formData.rdvOuAbandon === 'rdv' && (
                                    <>
                                    <div>
                                        <p className="margin"><strong>RDV prévu pour quelle date :</strong></p><br />
                                        <input type="date" name="dateDeRdv" value={formData.dateDeRdv} onChange={handleChange} />
                                    </div>
                                    <div className="space">
                                        <p className='bold margin'>RDV pour :</p><br></br>
                                        <>
                                            <input className='space checkbox' type="radio" name="rdvPour" value="Formation" onChange={handleRadioChange} checked={formData.rdvPour === 'Formation'} />
                                            <label className="oui">Formation</label>
                                            <input className='space checkbox' type="radio" name="rdvPour" value="Démo" onChange={handleRadioChange} checked={formData.rdvPour === 'Démo'} />
                                            <label>Démo</label>
                                        </>
                                    </div>
                                    <div>
                                        <p className="margin bold">Observations à préparer pour la prochaine visite:</p>
                                        <textarea name="observationsAPreparerpourLaProchaineVisite" value={formData.observationsAPreparerpourLaProchaineVisite} onChange={handleChange}></textarea>
                                    </div>
                                    </>
                                )}
                                {formData.rdvOuAbandon === 'abandon' && (
                                    <>
                                        <p className="margin bold">Motif de l'abandon :</p>
                                        <textarea style={{width: "100%"}} name="motifDeRefus" value={formData.motifDeRefus} onChange={handleChange}></textarea>
                                    </>
                                )}
                            </div>
                            <br></br>
                            <button type="submit" className="button-colored">Envoyer</button>
                        </div>
                    </form>

                    {showAllFiches && (
                        <div className="all-fiches">
                            <h2>Toutes les fiches enregistrées</h2>
                            {allFiches.map((fiche, index) => (
                                <div key={index} className="fiche">
                                    <h3>{fiche.departement}</h3>
                                    <p><strong>Responsable présent :</strong> {fiche.responsablePresent}</p>
                                    <p><strong>Nom Prénom du responsable :</strong> {fiche.nomPrenomDuResponsable}</p>
                                    <p><strong>Âge du responsable :</strong> {fiche.ageDuResponsable}</p>
                                    <p><strong>Email :</strong> {fiche.email}</p>
                                    <p><strong>Téléphone :</strong> {fiche.telephone}</p>
                                    <p><strong>Nombre de personnes :</strong> {fiche.nombreDePersonnes}</p>
                                    <p><strong>Tenue du salon :</strong> {fiche.tenueDuSalon}</p>
                                    <p><strong>Visite :</strong> {fiche.visite}</p>
                                    
                                    <p><strong>Marques de coloration :</strong></p>
                                    <ul>
                                        {fiche.marquesColoration.map((marque, i) => (
                                            <li key={i}>{marque.nom}</li>
                                        ))}
                                    </ul>
                                    
                                    <p><strong>Marques de revente :</strong></p>
                                    <ul>
                                        {fiche.marquesRevente.map((marque, i) => (
                                            <li key={i}>{marque.nom}</li>
                                        ))}
                                    </ul>
                                    
                                    <p><strong>Marques BAC/TECH :</strong></p>
                                    <ul>
                                        {fiche.marquesBacTech.map((marque, i) => (
                                            <li key={i}>{marque.nom}</li>
                                        ))}
                                    </ul>
                                    
                                    <p><strong>Concepts DSH abordés :</strong></p>
                                    <ul>
                                        {Object.keys(fiche.conceptsDshAbordés).map(demo => (
                                            fiche.conceptsDshAbordés[demo] && (
                                                <li key={demo}>{demo.charAt(0).toUpperCase() + demo.slice(1)}</li>
                                            )
                                        ))}
                                    </ul>
                                    
                                    <p><strong>RDV ou abandon :</strong> {fiche.rdvOuAbandon}</p>
                                    {fiche.rdvOuAbandon === 'rdv' && (
                                        <>
                                            <p><strong>Date de RDV :</strong> {fiche.dateDeRdv}</p>
                                            <p><strong>RDV pour :</strong> {fiche.rdvPour}</p>
                                            <p><strong>Observations à préparer pour la prochaine visite :</strong> {fiche.observationsAPreparerpourLaProchaineVisite}</p>
                                        </>
                                    )}
                                    {fiche.rdvOuAbandon === 'abandon' && (
                                        <p><strong>Motif de l'abandon :</strong> {fiche.motifDeRefus}</p>
                                    )}
                                </div>
                            ))}
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

export default FichePresentation