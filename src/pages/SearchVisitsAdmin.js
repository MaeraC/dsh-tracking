

// fichier SearchVisitsAdmin

import { useState, useEffect } from "react"
import { getDocs, query, where, collection, getDoc, doc } from "firebase/firestore"
import { db } from "../firebase.config.js"

function SearchVisitsAdmin({ uid, role }) {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [salonName, setSalonName] = useState("")
    const [formType, setFormType] = useState([])
    const [searchResults, setSearchResults] = useState([])

    const handleSearch = async () => {
        try {
            const visitsRef = collection(db, "visits")
            let filteredQuery = query(visitsRef)

            const start = startDate ? new Date(startDate) : null
            const end = endDate ? new Date(endDate) : null

            if (start && end) {
                filteredQuery = query(filteredQuery, where("createdAt", ">=", start), where("createdAt", "<=", end))
            }

            
            if (role !== "administrateur") {
                filteredQuery = query(filteredQuery, where("userId", "==", uid))
            }

            const querySnapshot = await getDocs(filteredQuery)
            let visitsData = querySnapshot.docs.map(doc => doc.data())


            const allVisits = visitsData.flatMap(visit => [
                visit,
                ...(visit.dailyProspection || []),
                ...(visit.crDemonstration || []),
                ...(visit.crPresentation || []),
                ...(visit.suiviClient || []),
                ...(visit.suiviProspect || []),
            ])

            const userIds = new Set(allVisits.map(visit => visit.userId).filter(id => id !== undefined));
            console.log(userIds)

            
            const usersData = await Promise.all(Array.from(userIds).map(async userId => {
                const userDoc = await getDoc(doc(db, "users", userId));
                
                return { id: userId, name: userDoc.data().firstname, lastname: userDoc.data().lastname };
            }))
            
            const userIdToName = usersData.reduce((acc, user) => {
                acc[user.id] = user.name + " " + user.lastname
                return acc;
            }, {});
 
            console.log(userIdToName)
            
            const visitsWithNames = allVisits.map(visit => ({
                ...visit,
                userName: userIdToName[visit.userId]
            }))
            
            console.log(visitsWithNames);

            const filteredVisits = visitsWithNames.filter(visit => {
                const matchesSalon = salonName ? visit.salonName.toLowerCase() === salonName.toLowerCase() : true;
                const matchesFormType = formType.length > 0 ? formType.includes(visit.typeOfForm) : true;
                return matchesSalon && matchesFormType;
            })

            setSearchResults(filteredVisits)

            return true 

        } catch (error) {
            console.error("Erreur lors de la recherche des visites :", error)
        }
    }

    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target 
        if (checked) {
            setFormType((prevFormTypes) => [...prevFormTypes, value]);
        } else {
            setFormType((prevFormTypes) => prevFormTypes.filter((type) => type !== value));
        }
    };

    return (
        <section className="search-section">
            <header>
                <h1>Recherche par filtres</h1>
            </header>

            <div className="search-filter">
                
                <div>
                    <label htmlFor="startDate">Date de début :</label>
                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="endDate">Date de fin :</label>
                    <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div> 
                <div>
                    <label htmlFor="salonName"></label>
                    <input type="text" id="salonName" value={salonName} placeholder="Nom du salon" onChange={(e) => setSalonName(e.target.value)} />
                </div>
                <div className="space">
                    <label>Type de formulaire :</label>
                    <div>
                        <input className="checkbox" type="checkbox" id="feuilleDeRoute" value="Feuille de route" onChange={handleCheckboxChange} />
                        <label htmlFor="feuilleDeRoute">Feuille de route</label>
                    </div>
                    <div>
                        <input className="checkbox" type="checkbox" id="ficheDeProspection" value="Fiche de prospection" onChange={handleCheckboxChange} />
                        <label htmlFor="ficheDeProspection">Fiche de prospection</label>
                    </div>
                    <div>
                        <input className="checkbox" type="checkbox" id="ficheDeSuiviClient" value="Fiche de suivi Client" onChange={handleCheckboxChange} />
                        <label htmlFor="ficheDeSuiviClient">Fiche de suivi Client</label>
                    </div>
                    <div>
                        <input className="checkbox" type="checkbox" id="ficheDeSuiviProspect" value="Fiche de suivi Prospect" onChange={handleCheckboxChange} />
                        <label htmlFor="ficheDeSuiviProspect">Fiche de suivi Prospect</label>
                    </div>
                    <div>
                        <input className="checkbox" type="checkbox" id="crDemonstration" value="Compte rendu de RDV de Démonstration" onChange={handleCheckboxChange} />
                        <label htmlFor="crDemonstration">CR de RDV de Démonstration</label>
                    </div>
                    <div>
                        <input className="checkbox" type="checkbox" id="crPresentation" value="Compte rendu de RDV de Présentation" onChange={handleCheckboxChange} />
                        <label htmlFor="crPresentation">CR de RDV de Présentation</label>
                    </div>
                </div>

                <button className="button-colored" onClick={handleSearch}>Rechercher</button>
            </div>

            {searchResults.length > 0 && (
                <div className="search-results">

                    <p className="nb-visit">Nombre de visites pour le salon {salonName} : {searchResults.length}</p>
                    
                    {searchResults.map((visit, index) => {
                        if (visit.typeOfForm === "Feuille de route") {
                            return (
                                <div className="visit-saved" key={index}>
                                    <p className="title"><span>{visit.typeOfForm} </span>n° {index +1}</p>
                                    <p><span>Nom du salon</span> : {visit.salonName}</p>
                                    <p><span>Status</span> : {visit.status}</p>
                                    <p><span>Ville</span> : {visit.city}</p>
                                    <p><span>Date exacte</span> : {visit.exactDate}</p>
                                    <p><span>Date détectée</span> : {visit.detectedDate}</p>
                                    <p><span>Semaine</span> : {visit.week}</p>
                                    <p className="savedby"><span>Enregistré par</span> : {visit.userName}</p>
                                </div>
                            );
                        } 
                        
                        else if (visit.typeOfForm === "Fiche de prospection") {
                            return (
                                
                                    <div  className="shadow" key={index}>
                                    <p className="title"><span>{visit.typeOfForm} </span>n° {index +1}</p>
                                    <p><span>Nom du salon</span> : {visit.salonName}</p>
                                    <p><span>RDV obtenu</span> : {visit.rdvObtenu}</p>
                                        
                                    {visit.rdvObtenu === "Oui" && (
                                        <div className="nope">
                                            <p><span>Date du RDV</span> : {visit.dateRdv}</p>
                                            <p><span>Type de RDV</span> : {visit.typeRdv}</p>

                                            {visit.typeRdv === "Démonstration" && (
                                                <p><span>Type de démonstration</span> : {visit.typeDemo}</p>
                                            )}
                                            {visit.typeRdv === "Autre" && (
                                                <p><span>Observation</span> : {visit.observation}</p>
                                            )}
                                        </div>
                                    )} 
                                    {visit.rdvObtenu === "Non" && (
                                        <p><span>Observation</span> : {visit.observation}</p>
                                    )}
                                    <p className="savedby"><span>Enregistré par</span> : {visit.userName}</p>
                                </div>
                                
                            );
                        } 
                        
                        else if (visit.typeOfForm === "Fiche de suivi Prospect") {
                            return (
                               <div   className="shadow" key={index}>
                                 <li key={index}>
                                    <p className="title"><span className="bold">{visit.typeOfForm} </span>n° {index +1}</p>
                                    <p><strong>Nom du salon:</strong> {visit.salonName}</p>
                                    <p><strong>Adresse:</strong> {visit.salonAdresse}</p>
                                    <p><strong>Téléphone:</strong> {visit.salonTel}</p>
                                    <p><strong>Tenue du salon:</strong> {visit.tenueSalon}</p>
                                    <p><strong>Tenu par:</strong> {visit.tenuPar}</p>
                                    <p><strong>Département:</strong> {visit.dept}</p>
                                    <p><strong>Jour future:</strong> {visit.jFture}</p>
                                    <p><strong>Nom du responsable:</strong> {visit.responsableNom}</p>
                                    <p><strong>Age du responsable:</strong> {visit.responsableAge}</p>
                                    <p><strong>Numéro de portable:</strong> {visit.numeroPortable}</p>
                                    <p><strong>Email:</strong> {visit.adresseEmail}</p>
                                    <p><strong>Facebook:</strong> {visit.facebook}</p>
                                    <p><strong>Instagram:</strong> {visit.instagram}</p>
                                    <p><strong>Origine de la visite:</strong> {visit.origineVisite}</p>
                                    
                                    <h4 className="margin">Colorations avec Ammoniaque:</h4>
                                    {visit.colorationsAmmoniaque.map((coloration, i) => (
                                        <div key={i}>
                                            <p className="margin"><strong>Nom:</strong> {coloration.nom}</p><br></br>
                                            <p className="margin"><strong>Prix:</strong> {coloration.prix}</p><br></br>
                                            <p className="margin"><strong>ML:</strong> {coloration.ml}</p><br></br>
                                        </div>
                                    ))}

                                    <h4 className="margin">Colorations Sans ammoniaque:</h4>
                                    {visit.colorationsSansAmmoniaque.map((coloration, i) => (
                                        <div key={i}>
                                            <p className="margin"><strong>Nom:</strong> {coloration.nom}</p><br></br>
                                            <p className="margin"><strong>Prix:</strong> {coloration.prix}</p><br></br>
                                            <p className="margin"><strong>ML:</strong> {coloration.ml}</p><br></br>
                                        </div>
                                    ))}

                                    <h4 className="margin">Colorations végétales:</h4>
                                    {visit.colorationsVegetale.map((coloration, i) => (
                                        <div key={i}>
                                            <p className="margin"><strong>Nom:</strong> {coloration.nom}</p><br></br>
                                            <p className="margin"><strong>Prix:</strong> {coloration.prix}</p><br></br>
                                            <p className="margin"><strong>ML:</strong> {coloration.ml}</p><br></br>
                                        </div>
                                    ))}

                                    <h4>Autres marques:</h4>
                                    <p><strong>Poudre:</strong> {visit.autresMarques.poudre}</p>
                                    <p><strong>Permanente:</strong> {visit.autresMarques.permanente}</p>
                                    <p><strong>BAC:</strong> {visit.autresMarques.bac}</p>
                                    <p><strong>Revente:</strong> {visit.autresMarques.revente}</p>

                                    <p><strong>Date de visite:</strong> {visit.dateVisite}</p>
                                    <p><strong>Responsable présent:</strong> {visit.responsablePresent}</p>
                                    <p><strong>Concepts proposés:</strong> {visit.conceptsProposes}</p>
                                    <p><strong>Animation proposée:</strong> {visit.animationProposee}</p>
                                    <p><strong>Points à aborder lors de la prochaine visite:</strong> {visit.pointsProchaineVisite}</p>
                                    <p><strong>Intéressés par:</strong> {visit.interessesPar}</p>
                                    <p><strong>Autres points:</strong> {visit.autresPoints}</p>
                                    <p><strong>Observations:</strong> {visit.observations}</p>
                                    <p><strong>Statut:</strong> {visit.statut}</p>
                                    <p><strong>RDV Date:</strong> {visit.rdvDate}</p>
                                    <p><strong>RDV Pour:</strong> {visit.rdvPour}</p>
                                    <p><strong>Commande:</strong> {visit.commande}</p>
                                    <p className="savedby"><span>Enregistré par</span> : {visit.userName}</p>
                                </li>
                               </div>
                            );
                        } 
                        
                        else if (visit.typeOfForm === "Fiche de suivi Client") {
                            return (
                                <div  className="shadow" key={index}>

                                    <p className="title"><span className="bold">{visit.typeOfForm} </span>n° {index +1}</p>
                                    <p><span className="bold">Nom du salon :</span> {visit.salonName}</p>
                                    <p><span className="bold">Ville :</span> {visit.city}</p>
                                    <p><span className="bold">Adresse :</span> {visit.salonAdresse}</p>
                                    <p><span className="bold">Téléphone :</span> {visit.salonTel}</p>
                                    <p><span className="bold">Responsable du salon :</span> {visit.responsableNomPrenom}</p>
                                    <p><span className="bold">Portable du responsable :</span> {visit.responsablePortable}</p>
                                    <p><span className="bold">Email du responsable :</span> {visit.responsableEmail}</p>
                                    <p><span className="bold">Marques en place :</span></p>

                                    <ul>
                                        {visit.marquesEnPlace && visit.marquesEnPlace.systemeDsh && <li>Système DSH</li>}
                                        {visit.marquesEnPlace && visit.marquesEnPlace.colorationThalasso && <li>Coloration Thalasso</li>}
                                        {visit.marquesEnPlace && visit.marquesEnPlace.mechesThalasso && <li>Mèches Thalasso</li>}
                                        {visit.marquesEnPlace && visit.marquesEnPlace.ondThPerm && <li>Ond Th/Perm</li>}
                                        {visit.marquesEnPlace && visit.marquesEnPlace.laVegetale && <li>La Végétale</li>}
                                        {visit.marquesEnPlace && visit.marquesEnPlace.byDsh && <li>By DSH</li>}
                                        {visit.marquesEnPlace && visit.marquesEnPlace.oyzea && <li>Oyzea</li>}
                                        {visit.marquesEnPlace && visit.marquesEnPlace.stylPro && <li>Styl Pro</li>}
                                        {visit.marquesEnPlace && visit.marquesEnPlace.persTou && <li>Pers Tou</li>}
                                    </ul>
                                    <br></br>

                                    <p><span className="bold">Équipe :</span></p>

                                    <ul>
                                        {visit.equipe.map((member, i) => (
                                            <li key={i}><span className="bold">Membre {i + 1} :</span> {member.nomPrenom}, {member.role}</li>
                                        ))}
                                    </ul>
                                    <br></br>

                                    <p><span className="bold">Client en contrat :</span> {visit.clientEnContrat}</p>

                                    {visit.clientEnContrat === "OUI" && (
                                        <div>
                                            <p><span className="bold">Lequel :</span> {visit.contratLequel}</p>
                                            <p><span className="bold">Tarif spécifique :</span> {visit.tarifSpecifique}</p>
                                        </div>
                                    )}

                                    <p><span className="bold">Date de visite :</span> {visit.dateVisite}</p>
                                    <p><span className="bold">Responsable présent :</span> {visit.responsablePresent}</p>
                                    <p><span className="bold">Prise de commande :</span> {visit.priseDeCommande}</p>
                                    <p><span className="bold">Gammes commandées :</span> {visit.gammesCommande}</p>
                                    <p><span className="bold">Animation proposée :</span> {visit.animationProposee}</p>
                                    <p><span className="bold">Produits proposés :</span> {visit.produitsProposes}</p>
                                    <p><span className="bold">Autres points abordés :</span> {visit.autresPointsAbordes}</p>
                                    <p><span className="bold">Points pour la prochaine visite :</span> {visit.pointsProchaineVisite}</p>
                                    <p><span className="bold">Observations :</span> {visit.observations}</p>

                                    <p className="savedby"><span>Enregistré par</span> : {visit.userName}</p>
                                </div>  
                            );
                        }
                        
                        else if (visit.typeOfForm === "Compte rendu de RDV de Démonstration") {
                            return (
                                <li  className="shadow"  key={index}>
                                <p className="title"><span className="bold">{visit.typeOfForm} </span>n° {index +1}</p>
                                <p><strong>Nom du salon:</strong> {visit.salonName}</p>
                                <p><strong>Ville:</strong> {visit.ville}</p>
                                <p><strong>Nom du responsable:</strong> {visit.nomPrenomResponsable}</p>
                                <p><strong>Responsable présent:</strong> {visit.responsablePresent}</p>
                                <p><strong>Téléphone:</strong> {visit.tel}</p>
                                <p><strong>E-mail:</strong> {visit.email}</p>
                                <p><strong>Nombre de collaborateurs:</strong> {visit.nbCollaborateurs}</p>
                                <p><strong>Démonstrations:</strong></p>
                                <ul>
                                    {Object.keys(visit.demonstrations).map(demo => (
                                        visit.demonstrations[demo] && <li key={demo}>{demo.charAt(0).toUpperCase() + demo.slice(1)}</li>
                                    ))}
                                </ul>
                                <p><strong>Durée de la démonstration:</strong> {visit.dureeDemonstration}</p>
                                <p><strong>Technicienne présente:</strong> {visit.techniciennePresente}</p>
                                <p><strong>Nom de la technicienne:</strong> {visit.nomTechnicienne}</p>
                                <p><strong>Issue favorable:</strong></p>
                                <ul>
                                    {Object.keys(visit.issueFavorable).map(issue => (
                                        visit.issueFavorable[issue] && <li key={issue}>{issue.charAt(0).toUpperCase() + issue.slice(1)}</li>
                                    ))}
                                </ul>
                                <p><strong>Issue défavorable:</strong></p>
                                <ul>
                                    {Object.keys(visit.issueDefavorable).map(issue => (
                                        visit.issueDefavorable[issue] && <li key={issue}>{issue.charAt(0).toUpperCase() + issue.slice(1)}: {visit.issueDefavorable[issue]}</li>
                                    ))}
                                </ul>
                                <p><strong>Actions:</strong></p>
                                <ul>
                                    {Object.keys(visit.actions).map(action => (
                                        visit.actions[action] && <li key={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</li>
                                    ))}
                                </ul>
                                <p><strong>Précisions:</strong> {visit.precisions}</p>
                                <p><strong>Observations générales:</strong> {visit.observationsGenerales}</p>
                                <p className="savedby"><span>Enregistré par</span> : {visit.userName}</p>
                            </li>
                            );
                        } 
                        
                        else if (visit.typeOfForm === "Compte rendu de RDV de Présentation") {
                            return (
                                <div className="shadow" key={index}>
                                    <li key={index}>
                                    <p className="title"><span className="bold">{visit.typeOfForm} </span>n° {index +1}</p>
                                    <p><strong>Nom du salon:</strong> {visit.salonName}</p>
                                    <p><strong>Ville:</strong> {visit.ville}</p>
                                    <p><strong>Département:</strong> {visit.departement}</p>
                                    <p><strong>Présence du responsable:</strong> {visit.presenceResponsable}</p>
                                    <p><strong>Nom et prénom du responsable:</strong> {visit.nomPrenomResponsable}</p>
                                    <p><strong>Âge du responsable:</strong> {visit.ageResponsable}</p>
                                    <p><strong>Email:</strong> {visit.email}</p>
                                    <p><strong>Téléphone:</strong> {visit.tel}</p>
                                    <p><strong>Tenue du salon:</strong> {visit.tenueSalon}</p>
                                    <p><strong>Visite:</strong> {visit.visite}</p>
                                    <p><strong>Marques de coloration:</strong></p>
                                    <ul>
                                        {visit.marquesColoration.map((marque, index) => (
                                            <li key={index}>{marque}</li>
                                        ))}
                                    </ul>
                                    <p><strong>Marques de revente:</strong></p>
                                    <ul>
                                        {visit.marquesRevente.map((marque, index) => (
                                            <li key={index}>{marque}</li>
                                        ))}
                                    </ul>
                                    <p><strong>Marques BAC/TECH:</strong></p>
                                    <ul>
                                        {visit.marquesBacTech.map((marque, index) => (
                                            <li key={index}>{marque}</li>
                                        ))}
                                    </ul>
                                    <p><strong>Concepts DSH abordés:</strong></p>
                                    <ul>
                                        {Object.keys(visit.conceptsDSH).map(concept => (
                                            visit.conceptsDSH[concept] && <li key={concept}>{concept.charAt(0).toUpperCase() + concept.slice(1)}</li>
                                        ))}
                                    </ul>
                                    <p><strong>A revoir ou abandon (Concepts DSH):</strong> {visit.revoirConceptsDSH}</p>
                                    {visit.revoirConceptsDSH === 'a_revoir' && (
                                        <p><strong>Date à revoir (Concepts DSH):</strong> {visit.dateRevoirConceptsDSH}</p>
                                    )}
                                    <p><strong>Intéressé par:</strong></p>
                                    <ul>
                                        {Object.keys(visit.interet).map(interet => (
                                            visit.interet[interet] && <li key={interet}>{interet.charAt(0).toUpperCase() + interet.slice(1)}</li>
                                        ))}
                                    </ul>
                                    <p><strong>A revoir ou abandon (Intérêt):</strong> {visit.revoirInteret}</p>
                                    {visit.revoirInteret === 'a_revoir' && (
                                        <>
                                            <p><strong>Date à revoir (Intérêt):</strong> {visit.dateRevoirInteret}</p>
                                            <p><strong>Date RDV démo/formation:</strong> {visit.dateRdvDemoFormation}</p>
                                        </>
                                    )}
                                    <p><strong>Observation à préparer:</strong> {visit.observationPreparation}</p>
                                    <p><strong>Motif de refus:</strong> {visit.motifRefus}</p>
                                    <p className="savedby"><span>Enregistré par</span> : {visit.userName}</p>
                                </li>
                                </div>
                            );
                        } 
                        else {
                            return null
                        }
                    })}
                    
                </div>
            )}
        </section>
    )
}

export default SearchVisitsAdmin;
