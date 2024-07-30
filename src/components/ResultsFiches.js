    

function ResultsFiches({ data, isFirstFiche }) { 
    const { colorationsAvecAmmoniaque, colorationsSansAmmoniaque, colorationsVégétales } = data;
    const formatDate2 = (dateStr) => {
        if (!dateStr) return '';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
        return new Date(dateStr).toLocaleDateString('fr-FR', options)
    }
    return (
        <div className="results-fiches" style={{background: "white"}}>

            {isFirstFiche && (
                <>
                <p className='title-grid'>SALON DE COIFFURE / INSTITUT DE BEAUTE</p>
                <div className='infos-salon' style={{marginBottom: "10px"}}>
                    <div className='infos-generales'>
                        <div className='line'>
                            <p className='title-table'>Nom</p>
                            <p className='txt-table'>{data.name}</p>
                        </div>
                        <div className='line'>
                            <p className='title-table'>Adresse</p>
                            <p className='txt-table'>{data.adresse}</p>
                        </div>
                        <div className='line'>
                            <p className='title-table'>Ville</p>
                            <p className='txt-table'>{data.city}</p>
                        </div>
                        <div className='line'>
                            <p className='title-table'>Téléphone</p>
                            <p className='txt-table'>{data.téléphoneDuSalon}</p>
                        </div>
                    </div>
                    <div className='infos-generales-col'>
                        <div className='col'>
                            <p className='title-col'>Tenu du salon</p>
                            <p className='txt-col'>{data.tenueDuSalon}</p>
                        </div>
                        <div className='col'>
                            <p className='title-col'>Tenu par</p>
                            <p className='txt-col'>{data.salonTenuPar}</p>
                        </div>
                        <div className='col'>
                            <p className='title-col'>Département</p>
                            <p className='txt-col'>{data.département}</p>
                        </div>
                        
                    </div>
                    <div className='infos-generales'>
                        <div className='line'>
                            <p className='title-table'>Nom du responsable</p>
                            <p className='txt-table'>{data.nomDuResponsable}</p> 
                        </div>
                        <div className='line'>
                            <p className='title-table'>Téléphone</p>
                            <p className='txt-table'>{data.numéroDuResponsable}</p>
                        </div>
                        <div className='line'>
                            <p className='title-table'>Email</p>
                            <p className='txt-table'>{data.emailDuResponsable}</p>
                        </div>
                        <div className='line'>
                            <p className='title-table'>Réseaux sociaux</p>
                            <div className='txt-table rs'>
                                <div>
                                    <p className='title-fb'>Facebook</p>
                                    <p className='txt-fb'>{data.facebook}</p>
                                </div>
                                <div>
                                    <p className='title-ig'>Instagram</p>
                                    <p className='txt-ig'>{data.instagram}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='infos-generales-col'>
                        <div className='col col2'>
                            <p className='title-col'>Âge du responsable</p>
                            <p className='txt-col'>{data.âgeDuResponsable}</p>
                        </div>
                        <div className='col col2'>
                            <p className='title-col'>Nb de personnes</p>
                            <p className='txt-col'>{data.nombreDePersonnes}</p>
                        </div>
                        <div className='col col2'>
                            <p className='title-col'>J.Fture</p>
                            <p className='txt-col'>{data.jFture}</p>
                        </div>
                    </div>
                </div>
                </>
            )}
             

            <div style={{marginBottom: "0px"}} className='infos-salon2'>
                <div style={{width: "100%", display: "flex"}}> 
                    <p style={{background: "#3D9B9B", padding: "10px", width: "50%", textAlign: "center", color: "white"}}>MARQUES DE COLORATION PRESENTES</p>
                    <p style={{background: "#3D9B9B", padding: "10px", width: "50%", textAlign: "center", color: "white"}}>AUTRES MARQUES</p>
                </div>
               <div style={{width: "100%", display: "flex"}}>
                    <div className='infos-generales2'>
                        <div style={{display: "flex", width: "100%"}}>
                            <p style={{width: "30%", borderRight: "1px solid #cfcfcf"}}></p>
                            <p style={{width: "45%", borderRight: "1px solid #cfcfcf", textAlign: "center", fontWeight: "bold", padding: "3px"}}>Nom</p>
                            <p style={{width: "15%", borderRight: "1px solid #cfcfcf", textAlign: "center", fontWeight: "bold", padding: "3px"}}>Prix</p>
                            <p style={{width: "15%", borderRight: "1px solid #cfcfcf", textAlign: "center", fontWeight: "bold", padding: "3px"}}>ML</p>
                        </div>
                        <div className='tables'>
                            <div className='line2'>
                                <p style={{width:"30%", borderRight: "1px solid #cfcfcf", padding: "10px"}} className='title-table3'>Avec ammoniaque</p>
                                <div style={{width:"70%"}} className="sous-line-box">
                                    {colorationsAvecAmmoniaque && colorationsAvecAmmoniaque.map((item, index) => (
                                        <div className='sous-line' key={`avec-ammoniaque-${index}`} style={{background: "white"}}>
                                            <p style={{width:"60%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.nom}</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.prix}€</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.ml}ml</p>
                                        </div>
                                    ))}
                                </div>
                            </div>  
                            <div className='line2'>
                                <p style={{width:"30%", borderRight: "1px solid #cfcfcf", padding: "10px"}} className='title-table3'>Sans ammoniaque</p>
                                <div style={{width:"70%"}} className="sous-line-box">
                                    {colorationsSansAmmoniaque && colorationsSansAmmoniaque.map((item, index) => (
                                        <div className='sous-line' key={`sans-ammoniaque-${index}`}  style={{background: "white"}}>
                                            <p style={{width:"60%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.nom}</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.prix}€</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.ml}ml</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='line2'>
                                <p style={{width:"30%", borderRight: "1px solid #cfcfcf", padding: "10px"}} className='title-table3'>Végétales</p>
                                <div style={{width:"70%"}} className="sous-line-box">
                                    {colorationsVégétales && colorationsVégétales.map((item, index) => (
                                        <div className='sous-line' key={`végétales-${index}`} style={{background: "white"}}>
                                            <p style={{width:"60%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.nom}</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.prix}€</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.ml}ml</p>
                                        </div>
                                    ))}  
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='infos-generales2 infos-generales2-col' style={{ border: "1px solid #cfcfcf"}}>
                        <div className='col col2'>
                            <p style={{padding: "5px"}} className='title-col'>Poudre</p>
                            <p style={{background: "white", padding: "5px"}} className='txt-col'>{data?.autresMarques?.poudre}</p>
                        </div>
                        <div className='col col2'>
                            <p style={{padding: "5px"}} className='title-col'>Permanente</p>
                            <p style={{background: "white", padding: "5px"}} className='txt-col'>{data?.autresMarques?.permanente}</p>
                        </div>
                        <div className='col col2'>
                            <p style={{padding: "5px"}} className='title-col'>Revente</p>
                            <p style={{background: "white", padding: "5px"}} className='txt-col'>{data?.autresMarques?.revente}</p>
                        </div>
                        <div className='col col2'>
                            <p style={{padding: "5px"}} className='title-col'>BAC/TECH</p>
                            <p style={{background: "white", padding: "5px"}} className='txt-col'>{data?.autresMarques?.bac}</p> 
                        </div>
                    </div>
                </div> 
            </div> 

            <div style={{width: "90%", display: "flex",  background: "#f0f0f0", marginBottom: "30px"}} className='infos-salon3'>
                <div style={{width: "40%"}}>
                    <div style={{display: "flex", width: "100%", border: "1px solid #cfcfcf"}}> 
                        <div style={{width: "50%",  border: "1px solid #cfcfcf", display: "flex", alignItems: "center"}}>
                            <p style={{padding: "10px", width: "60%"}} className="bold">Date de visite : </p>
                            <p style={{marginLeft: "10px", width: "40%", background: "white",  borderLeft: "1px solid #cfcfcf", padding: "10px",}}>{formatDate2(data.dateDeVisite)}</p>
                        </div>
                        <div style={{width: "50%",  border: "1px solid #cfcfcf",  display: "flex",  alignItems: "center"}}>
                            <p style={{padding: "10px", width: "60%"}} className="bold">Responsable présente ?</p>
                            <p style={{marginLeft: "10px", width: "40%", background: "white",  borderLeft: "1px solid #cfcfcf", padding: "10px",}}>{data.responsablePrésent}</p>
                        </div>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Quels ont été les concepts et produits proposés ?</p>
                        <p>{data.conceptsProposés}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Y a t'il eu une animation proposée ? Si oui, laquelle ? </p>
                        <p>{data.animationProposée}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Points à aborder lors de la prochaine visite :</p>
                        <p>{data.pointsPourLaProchaineVisite}</p>
                    </div>
                </div>
                <div style={{width: "35%"}}>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Origine de la visite</p>
                        <p>{data.origineDeLaVisite}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Intéressés par ?</p>
                        <p>{data.intéressésPar}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Autres points abordés ? Lesquels ?</p>
                        <p>{data.autresPoints}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Observations (éléments à retenir) ou motifs si Abandon</p>
                        <p>{data.observations}</p>
                    </div>
                </div>
                <div style={{width: "25%"}}>
                    <div style={{border: "1px solid #cfcfcf", background: "white", display: "flex"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px", background: "#e0e0e0",  padding: "5px 10px"}}>Abandon ou à revoir ?</p>
                        <p style={{ padding: "5px 10px"}}>{data.statut}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", background: "white", display: "flex"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px", background: "#e0e0e0",  padding: "5px 10px"}}>RDV obtenu ?</p>
                        <p style={{ padding: "5px 10px"}}>{data.rdvObtenu}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", background: "white", display: "flex"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px", background: "#e0e0e0",  padding: "5px 10px"}}>Si Oui, RDV Prévu le ?</p>
                        <p style={{ padding: "5px 10px"}}>{formatDate2(data.rdvPrévuLe)}</p>
                    </div> 
                    <div style={{border: "1px solid #cfcfcf", background: "white", display: "flex"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px", background: "#e0e0e0",  padding: "5px 10px"}}>Si Oui, RDV Prévu pour ?</p>
                        <p style={{ padding: "5px 10px"}}>{data.typeDeRdv}</p>
                    </div> 
                    <div style={{border: "1px solid #cfcfcf", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px", background: "#e0e0e0",  padding: "5px 10px"}}>Si démonstration, quel type :</p>
                        <div style={{display: "flex", flexWrap: "wrap"}}>
                        {data.typeDeDémonstration.map((item, index) => (
                            <p key={index} style={{ padding: "2px 5px", display: "flex", flexWrap: "wrap", fontSize: "14px"}}>{item}</p> 
                        ))} 
                        </div>
                    </div> 
                    <div style={{border: "1px solid #cfcfcf", background: "white", display: "flex"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px", background: "#e0e0e0",  padding: "5px 10px"}}>Commande ?</p>
                        <p style={{ padding: "5px 10px"}}>{data.commande}</p>
                    </div> 
                </div>
            </div>
        </div>
    );
}

export default ResultsFiches;

