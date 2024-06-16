
// fichier FicheDemonstration.js

import { useState, useCallback } from "react"
import { db } from "../firebase.config"
import { updateDoc, doc, getDoc, getDocs, query, collection, where } from "firebase/firestore"
import back from "../assets/back.png"

function FicheDemonstration({ uid, onReturn }) {
    const [searchSalon, setSearchSalon] = useState("")
    const [salonInfo, setSalonInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    
    const [message, setMessage] = useState("")

    const initialFormData = {
        nomduSalon: '',
        ville: '',
        nomPrenomDuResponsable: '',
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
        dureeDeLaDemonstration: '',
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
        createdAt: new Date(),
        typeOfForm: "Compte rendu de RDV de Démonstration",
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
    
    const handleDemonstrationChange = (e) => {
        const { name, checked } = e.target

        setFormData(prevState => ({
            ...prevState,
            demonstrations: {
                ...prevState.demonstrations,
                [name]: checked
            }
        }))
    }
    
    const handleIssueFavorableChange = (e) => {
        const { name, checked } = e.target

        setFormData(prevState => ({
            ...prevState,
            issueFavorable: {
                ...prevState.issueFavorable,
                [name]: checked
            }
        }))
    }
    
    const handleIssueDefavorableChange = (e) => {
        const { name, value } = e.target

        setFormData(prevState => ({
            ...prevState,
            issueDefavorable: {
                ...prevState.issueDefavorable,
                [name]: value
            }
        }))
    }
    
    const handleActionsChange = (e) => {
        const { name, checked } = e.target

        setFormData(prevState => ({
            ...prevState,
            actions: {
                ...prevState.actions,
                [name]: checked
            }
        }))
    }

    const handleSearch = async (e) => {
        
        const searchValue = e.target.value;
        setSearchSalon(searchValue);

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
            const crDemonstration = data.crDemonstration ? data.crDemonstration[data.crDemonstration.length - 1] : {};

            setFormData({
                nomduSalon: crDemonstration.nomduSalon || "",
                ville: crDemonstration.ville || "",
                nomPrenomDuResponsable: crDemonstration.nomPrenomDuResponsable || "",
                responsablePresent: crDemonstration.responsablePresent || "",
                tel: crDemonstration.tel || "",
                email: crDemonstration.email || "",
                nbCollaborateurs: crDemonstration.nbCollaborateurs || "",
                demonstrations: {
                    luminacolor: crDemonstration.demonstrations?.luminacolor || false,
                    veracolor: crDemonstration.demonstrations?.veracolor || false,
                    thalassoBAC: crDemonstration.demonstrations?.thalassoBAC || false,
                    decoloration: crDemonstration.demonstrations?.decoloration || false,
                    ondulation: crDemonstration.demonstrations?.ondulation || false,
                    microscopique: crDemonstration.demonstrations?.microscopique || false,
                    draw: crDemonstration.demonstrations?.draw || false,
                    laVegetale: crDemonstration.demonstrations?.laVegetale || false,
                    autre: crDemonstration.demonstrations?.autre || false,
                },
                dureeDeLaDemonstration: crDemonstration.dureeDeLaDemonstration || "",
                techniciennePresente: crDemonstration.techniciennePresente || "",
                avecLaVRP: crDemonstration.avecLaVRP || false,
                seule: crDemonstration.seule || false,
                nomTechnicienne: crDemonstration.nomTechnicienne || "",
                issueFavorable: {
                    luminacolor: crDemonstration.issueFavorable?.luminacolor || false,
                    veracolor: crDemonstration.issueFavorable?.veracolor || false,
                    thalassoBAC: crDemonstration.issueFavorable?.thalassoBAC || false,
                    decoloration: crDemonstration.issueFavorable?.decoloration || false,
                    ondulation: crDemonstration.issueFavorable?.ondulation || false,
                    microscopique: crDemonstration.issueFavorable?.microscopique || false,
                    draw: crDemonstration.issueFavorable?.draw || false,
                    laVegetale: crDemonstration.issueFavorable?.laVegetale || false,
                    autre: crDemonstration.issueFavorable?.autre || false,
                },
                issueDefavorable: {
                    luminacolor: crDemonstration.issueDefavorable?.luminacolor || "",
                    veracolor: crDemonstration.issueDefavorable?.veracolor || "",
                    thalassoBAC: crDemonstration.issueDefavorable?.thalassoBAC || "",
                    decoloration: crDemonstration.issueDefavorable?.decoloration || "",
                    ondulation: crDemonstration.issueDefavorable?.ondulation || "",
                    microscopique: crDemonstration.issueDefavorable?.microscopique || "",
                    draw: crDemonstration.issueDefavorable?.draw || "",
                    laVegetale: crDemonstration.issueDefavorable?.laVegetale || "",
                    autre: crDemonstration.issueDefavorable?.autre || "",
                },
                actions: {
                    abandon: crDemonstration.actions?.abandon || false,
                    aSuivre: crDemonstration.actions?.aSuivre || false,
                    aRetenter: crDemonstration.actions?.aRetenter || false,
                    adapterLePrix: crDemonstration.actions?.adapterLePrix || false,
                    attenteReponse: crDemonstration.actions?.attenteReponse || false,
                },
                precisions: crDemonstration.precisions || "",
                observationsGenerales: crDemonstration.observationsGenerales || "",
                createdAt: new Date(),
                typeOfForm: "CR de RDV de Démonstration",
                userId: uid,
            });
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
                            action: "Mise à jour du Compte rendu de RDV de Démonstration",
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
                const updatedcrDemonstration = [...(salonData.crDemonstration || []), formData]
                await updateDoc(salonRef, { crDemonstration: updatedcrDemonstration })   

                // Met à jour l'historique du salon
                await updateSalonHistory(formData)
                setMessage("Compte rendu de RDV de Démonstration enregistré avec succès !") 
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
                            <input type="text" name="nomPrenomDuResponsable" placeholder="Nom Prénom du responsable" value={formData.nomPrenomDuResponsable} onChange={handleChange} /><br></br>
                        
                            <div className="space">
                                <p className="bold margin">Responsable présent :</p><br></br>
                                <label className="oui"><input className="checkbox" type="radio" name="responsablePresent" value="oui" checked={formData.responsablePresent === 'oui'} onChange={handleChange} />OUI</label>
                                <label><input className="checkbox" type="radio" name="responsablePresent" value="non" checked={formData.responsablePresent === 'non'} onChange={handleChange} />NON</label>
                            </div>

                            <input type="tel" name="tel" placeholder="Téléphone" value={formData.tel} onChange={handleChange} /><br></br>
                            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} /><br></br>
                            <input type="text" name="nbCollaborateurs" placeholder="Nombre de collaborateurs" value={formData.nbCollaborateurs} onChange={handleChange} /><br></br>
                        
                            <p className="bold margin">La démonstration portait sur :</p><br></br>
                            {Object.keys(formData.demonstrations).map(demo => (
                                <> 
                                <label className="margin" key={demo}>
                                <input
                                    type="checkbox"
                                    name={demo}
                                    checked={formData.demonstrations[demo]}
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
                                <p className="bold margin">Présence d'une technicienne :</p><br></br>
                                <label className="space oui">
                                    <input
                                        type="radio"
                                        className="checkbox"
                                        name="techniciennePresente"
                                        value="oui"
                                        checked={formData.techniciennePresente === 'oui'}
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
                                        checked={formData.techniciennePresente === 'non'}
                                        onChange={handleChange}
                                    />
                                    NON
                                </label>
                            </div>

                            <input type="text" name="dureeDeLaDemonstration" placeholder="Durée de la démonstration" value={formData.dureeDeLaDemonstration} onChange={handleChange} /><br></br>
                    
                            {formData.techniciennePresente === 'oui' && (
                                <>
                                <label className="space oui">
                                    <input
                                    type="checkbox"
                                    className="checkbox"
                                    name="avecLaVRP"
                                    checked={formData.avecLaVRP}
                                    onChange={handleChange}
                                    />
                                    Avec la VRP
                                </label>
                                <label className="space">
                                    <input
                                    type="checkbox"
                                    className="checkbox"
                                    name="seule"
                                    checked={formData.seule}
                                    onChange={handleChange}
                                    />
                                    Seule
                                </label><br></br>
                                <input
                                    type="text"
                                    name="nomTechnicienne"
                                    placeholder="Nom de la technicienne"
                                    value={formData.nomTechnicienne}
                                    onChange={handleChange}
                                    />
                                </>
                            )}
                            <br></br>
                            <br></br>

                            <p className="bold margin">Issue favorable de la démonstration avec implantation de :</p><br></br>

                            {Object.keys(formData.issueFavorable).map(issue => (
                                <>
                                <label  className="margin" key={issue}>
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    name={issue}
                                    checked={formData.issueFavorable[issue]}
                                    onChange={handleIssueFavorableChange}
                                />
                                {issue.charAt(0).toUpperCase() + issue.slice(1)}
                                </label>
                                <br></br>
                                </>
                            ))}
                    
                            <br></br>
                            <p className="bold margin">Si, issue défavorable de la démonstration, cocher le motif:</p>

                            {Object.keys(formData.issueDefavorable).map(issue => (
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
                                                checked={formData.issueDefavorable[issue] === 'trop complexe'}
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
                                                checked={formData.issueDefavorable[issue] === 'realisation ratée'}
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
                                                checked={formData.issueDefavorable[issue] === 'correspond pas aux attentes'}
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
                                                checked={formData.issueDefavorable[issue] === 'implantation concurrente recente'}
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
                                                checked={formData.issueDefavorable[issue] === 'prix'}
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
                                                    checked={formData.issueDefavorable[issue] === 'souhaite reflechir'}
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
                            {Object.keys(formData.actions).map(action => (
                                <>
                                <label key={action} className="margin">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    name={action}
                                    checked={formData.actions[action]}
                                    onChange={handleActionsChange}
                                />
                                {action.charAt(0).toUpperCase() + action.slice(1)}
                                </label>
                                <br></br>
                                </>
                            ))}
                            <br></br>

                            <label className="bold margin">A préciser:</label><br></br>
                            <textarea name="precisions" value={formData.precisions} onChange={handleChange}></textarea><br></br>
                        
                            <label className="bold margin">Observations générales:</label><br></br>
                            <textarea name="observationsGenerales" value={formData.observationsGenerales} onChange={handleChange}></textarea>
                            <br></br>
                        
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

export default FicheDemonstration