function ResultsFicheD2({onClose, data}) {

    const {typeDeDémonstration, issueFavorable, issueDéfavorable} = data
    
    return (
        <div className="results-fiches">

<div style={{width: "90%", display: "flex", height: "200px", marginBottom: "50px"}}>
            <div style={{width: "50%", height: "100%"}}>
                <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>SALON DE COIFFURE</p>
                <div style={{display: "flex" , height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                    <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom</p>
                    <p style={{width: "70%", height: "100%",paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.name}</p>
                </div>
                <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                    <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Ville</p>
                    <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.city}</p>
                </div> 
                <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                    <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom Responsable</p>
                    <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.nomPrenomDuResponsable}</p>
                </div>
                <div style={{display: "flex",  height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                    <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Responsable pésent ?</p>
                    <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.responsablePrésent}</p>
                </div>
            </div>
            <div style={{width: "50%", height: "100%"}}>
                <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>RESPONSABLE DU SALON</p>
                
                <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                    <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Téléphone</p>
                    <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.téléphone}</p>
                </div>
                <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                    <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Email</p>
                    <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.email}</p>
                </div>
                <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                    <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nb de collaborateurs</p>
                    <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.nombreDeCollaborateurs}</p>
                </div>
            </div>
        </div>
            

            <div style={{width: "90%", height: "300px", marginBottom: "50px", flexDirection: "column"}}>
                <div style={{display: "flex", height: "100%",}}>
                    <div style={{width: "30%", height: "100%"}}>
                        <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>DEMONSTRATION</p>
                        <div style={{display: "flex" , height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                            <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>La démonstration portait sur :</p>
                            {Object.entries(typeDeDémonstration).map(([key, value]) => (
                                value && (
                                    <div key={key}>
                                        <p style={{ display: "flex", paddingLeft: "10px" }}>
                                            {key === "autre" ? value : key}
                                        </p>
                                    </div> 
                                )
                            ))}
                        </div>
                        <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                            <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Durée de la démonstration:</p>
                            <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.duréeDeLaDémonstration}</p>
                        </div>
                        <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                            <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Présence d'une technicienne ?</p>
                            <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.techniciennePrésente}</p>
                        </div>
                        <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                            <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Avec la VRP ou Seule ?</p>
                            {data.avecLaVRP || data.seule ? (
                                <p style={{width: "70%", height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>
                                    {data.avecLaVRP && data.seule ? "Avec la VRP / Seule" : data.avecLaVRP ? "Avec la VRP" : "Seule"}
                                </p>
                            ) : (
                                <p style={{width: "70%", height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>Non spécifié</p>
                            )}
                        </div>
                    
                    </div>
                    <div style={{width: "70%", height: "100%"}}>
                        <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>ISSUES</p>
                        <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                            <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Issue favorable :</p>
                            {Object.entries(issueFavorable).map(([key, value]) => (
                                value !== null && (
                                    <div key={key} style={{display: "flex"}}>
                                        <p style={{ paddingLeft: "10px", }}>{key}</p>
                                        <p style={{fontWeight: "bold", marginLeft: "10px"}}>{value}</p> 
                                    </div>
                                )
                            ))}
                        </div>
                        <div style={{display: "flex",height: "50%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                            <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Issue défavorable de :</p>
                            {Object.entries(issueDéfavorable).map(([key, value]) => (
                            
                                Object.values(value).some(val => val !== '') && (
                                    <div style={{ display: "flex", flexDirection: "column", marginLeft: "10px", marginRight: "20px" }} key={key}>  
                                        <p>{key}</p>
                                        <div >
                                            <div style={{ display: "flex",  }}>
                                                <p style={{ fontWeight: "bold", }}>Motif</p>
                                                <p style={{  paddingLeft: "10px", }}>{value.motif}</p>
                                            </div>
                                            <div style={{ display: "flex",  }} >
                                                <p style={{ fontWeight: "bold", }}>Action</p>
                                                <p style={{  paddingLeft: "10px", }}>{value.actions}</p>
                                            </div>
                                            <div style={{ display: "flex",  }}>
                                                <p style={{ fontWeight: "bold", }}>Précisions</p>
                                                <p style={{  paddingLeft: "10px", }}>{value.précisions}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                )
                                
                            ))}
                        </div>
                        <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                            <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom de la technicienne</p>
                            <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.nomDeLaTechnicienne}</p>
                        </div>
                    </div>
                </div>
               
            </div>
            <div style={{ border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf", height: "150px", width: "90%"}}>
                        <p style={{background: "#f0f0f0", padding: "10px", fontWeight: "bold"}}>Observations générales</p>
                        <p style={{ padding: "10px"}}>{data.observationsGénérales}</p>
                    </div>
        </div>
    )
}

export default ResultsFicheD2