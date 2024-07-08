
// fichier ResultsFicheClient 


function ResultsFicheClient({data}) {
    const marquesLabels = {
        systemeDsh: 'Système DSH',
        colorationThalasso: 'Coloration Thalasso',
        mechesThalasso: 'Mèches Thalasso',
        ondThalassoPermanente: 'Ond Thalasso Permanente',
        laVégétale: 'La Végétale',
        byDsh: 'By DSH',
        olyzea: 'Olyzea',
        stylingPro: 'Styling Pro',
        personalTouch: 'Personal Touch',
        thalassoBac: 'Thalasso Bac',
        manufacturesABoucles: 'Manufactures à boucles',
        doubleLecture: 'Double Lecture',
        autre : "Autre"
    };
    const marquesEnPlace = Object.keys(data.marquesEnPlace)
    .filter(key => data.marquesEnPlace[key])
    .map(key => key === 'autre' && data.marquesEnPlace[key] ? data.marquesEnPlace[key] : marquesLabels[key])
    .join(' - ');

 

    const equipeList = data.équipe?.map((member, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: '10px', width: "100%" }}>
            <div style={{width: "70%", display: "flex" ,border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                <p style={{background: "#f0f0f0",padding: "10px", height: "100%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom Prénom</p>
                <p style={{paddingLeft: "10px",padding: "10px", display: "flex", alignItems: "center"}}>{member.nomPrenom}</p>
            </div>
            <div style={{width: "30%", display: "flex" ,border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                <p style={{background: "#f0f0f0",padding: "5px 10px",height: "100%",  fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Role</p>
                <p style={{paddingLeft: "10px",padding: "5px 10px", display: "flex", alignItems: "center"}}>{member.role}</p>
            </div>
        </div>
    ));

    const specifitesList = data?.specificites?.map((spe, index) => (
        <>
        <div key={index} style={{ display: 'flex',marginBottom: '10px', width: "100%" }}>
            <div style={{width: "100%", display: "flex" ,border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                <p style={{background: "#f0f0f0",padding: "5px 10px", height: "100%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Spécificité {index + 1}</p>
                <p style={{paddingLeft: "10px",padding: "5px 10px", display: "flex", alignItems: "center"}}>{spe}</p>
            </div>
        </div>
        </>
    ));

    const produitsList = data.produitsProposés?.map((produit, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: '10px', width: "100%" }}>
            <div style={{width: "100%", display: "flex" ,border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                <p style={{background: "#f0f0f0",padding: "5px 10px", height: "100%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Produit {index + 1}</p>
                <p style={{paddingLeft: "10px",padding: "5px 10px", display: "flex", alignItems: "center"}}>{produit}</p>
            </div>
        </div>
    ));

    const formatDate2 = (dateStr) => {
        if (!dateStr) return '';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
        return new Date(dateStr).toLocaleDateString('fr-FR', options)
    }

    return (
        <div className="results-fiches" >

            <div style={{width: "90%", display: "flex", height: "200px", marginBottom: "50px"}}>
                <div style={{width: "50%", height: "100%"}}>
                    <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>SALON DE COIFFURE</p>
                    <div style={{display: "flex" , height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom</p>
                        <p style={{width: "70%", height: "100%",paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.name}</p>
                    </div>
                    <div style={{display: "flex",  height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Adresse</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.adresse}</p>
                    </div>
                    <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Ville</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.city}</p>
                    </div>
                    <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Téléphone</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.téléphoneDuSalon}</p>
                    </div>
                </div>
                <div style={{width: "50%", height: "100%"}}>
                    <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>RESPONSABLE DU SALON</p>
                    <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom Prénom</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.nomDuResponsable}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Portable</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.portableDuResponsable}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Email</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.EmailDuResponsable}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Marques en place</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{marquesEnPlace}</p>
                    </div>
                </div>
            </div>

            
            <div style={{width: "90%", display: "flex", marginBottom: "20px", border: "1px solid #cfcfcf"}}>

                <div style={{width: "50%", height: "100%"}}>
                    <p style={{padding: "10px", fontWeight: "bold", border: "1px solid #cfcfcf", background: "#f0f0f0"}}>Liste des membres de l'équipe</p>
                    <div style={{ width: '100%', height: '100%' }}>
                        {equipeList}
                    </div>
                </div>
                <div style={{width: "50%", height: "100%"}}> 
                    <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{padding: "10px", background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center"}}>Client en contrat ?</p>
                        <p style={{padding: "10px",width: "70%",height: "100%",  display: "flex", alignItems: "center"}}>{data.clientEnContrat}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{padding: "10px",background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center"}}>Si Oui, lequel ?</p>
                        <p style={{padding: "10px",width: "70%",height: "100%",  display: "flex", alignItems: "center"}}>{data.typeDeContrat}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px", border: "1px solid #cfcfcf", padding: "10px", background: "#f0f0f0"}}>Tarif spécifique ?</p>
                        <p>{specifitesList}</p>
                    </div>
                </div>
            </div>

            <div style={{width: "90%", display: "flex",  background: "#f0f0f0", }} className='infos-salon3'>
                <div style={{width: "50%"}}>
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
                    <div style={{border: "1px solid #cfcfcf", background: "white"}}>
                        <p style={{fontWeight : "bold", padding: "10px", background: "#f0f0f0"}}>Quels ont été les produits proposés ?</p>
                        <p>{produitsList}</p>
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
                <div style={{width: "50%", height: "100%"}}>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white", height: "25%"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Prise de commande ?</p>
                        <p>{data.priseDeCommande}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white", height: "25%"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Si Oui, quelles gammes ?</p>
                        <p>{data.gammesCommandées}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white", height: "25%"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Autres points abordés ? Lesquels ?</p>
                        <p>{data.autresPointsAbordés}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white", height: "25%"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Observations (éléments à retenir) :</p>
                        <p>{data.observations}</p>
                    </div>
                </div>
                </div>

        </div>
    )
}

export default ResultsFicheClient