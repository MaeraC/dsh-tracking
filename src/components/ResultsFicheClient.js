
// fichier ResultsFicheClient
import { useRef } from "react";
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";
import download from "../assets/download.png"   
import closeIcon from "../assets/back.png" 


function ResultsFicheClient({data, onClose}) {
    const pageRef = useRef()
    const downloadPDF = () => {
        const input = pageRef.current;
        if (!input) {
            console.error('Erreur : référence à l\'élément non valide');
            return;
        }
    
        html2canvas(input, {
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight,
            scrollX: window.scrollX,
            scrollY: window.scrollY,
        })
        .then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = canvas.width / canvas.height;
            const width = pdfWidth;
            const height = width / ratio;
            let position = 0;
    
            if (height > pdfHeight) {
                const pageHeight = pdf.internal.pageSize.height;
                while (height > 0) {
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                     //eslint-disable-next-line 
                    height -= pdfHeight;
                    position -= pageHeight;
                    if (height > 0) {
                        pdf.addPage();
                    }
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
            }
    
            pdf.save("statistics.pdf");
        })
        .catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    };
    const marquesLabels = {
        systemeDsh: 'Système DSH',
        colorationThalasso: 'Coloration Thalasso',
        mechesThalasso: 'Mèches Thalasso',
        ondThalassoPermanente: 'Ond Thalasso Permanente',
        laVégétale: 'La Végétale',
        byDsh: 'By DSH',
        olyzea: 'Olyzea',
        stylPro: 'Styl Pro',
        persTou: 'Pers Tou',
    };
    const marquesEnPlace = Object.keys(data.marquesEnPlace)
        .filter(key => data.marquesEnPlace[key])
        .map(key => marquesLabels[key])
        .join(', ');
 

    const equipeList = data.équipe.map((member, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: '10px', width: "100%" }}>
            <div style={{width: "100%", display: "flex" ,border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                <p style={{background: "#f0f0f0",padding: "10px", height: "100%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom Prénom</p>
                <p style={{paddingLeft: "10px",padding: "10px", display: "flex", alignItems: "center"}}>{member.nomPrenom}</p>
            </div>
            <div style={{display: "flex" ,border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                <p style={{background: "#f0f0f0",padding: "10px",height: "100%",  fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Role</p>
                <p style={{paddingLeft: "10px",padding: "10px", display: "flex", alignItems: "center"}}>{member.role}</p>
            </div>
        </div>
    ));

    return (
        <div className="results-fiches"  ref={pageRef}>
            <button className="close-btn button-colored" onClick={onClose}><img src={closeIcon} alt="" /></button>
            <button className="download button-colored" onClick={downloadPDF}><img src={download} alt="" /></button>

            <div style={{width: "90%", display: "flex", height: "200px", marginBottom: "50px"}}>
                <div style={{width: "50%", height: "100%"}}>
                    <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>SALON DE COIFFURE</p>
                    <div style={{display: "flex" , height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom</p>
                        <p style={{width: "70%", height: "100%",paddingLeft: "10px", display: "flex", alignItems: "center"}}>nom à afficher</p>
                    </div>
                    <div style={{display: "flex",  height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Adresse</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.adresse}</p>
                    </div>
                    <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Ville</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>ville à afficher</p>
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
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.téléphoneDuResponsable}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Email</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.emailDuResponsable}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Marques en place</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{marquesEnPlace}</p>
                    </div>
                </div>
            </div>

            <p style={{width: "90%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>EQUIPE</p>
            <div style={{width: "90%", display: "flex", marginBottom: "20px"}}>
                <div style={{width: "50%", height: "100%"}}>
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
                        <p style={{padding: "10px",background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center"}}>Lequel ?</p>
                        <p style={{padding: "10px",width: "70%",height: "100%",  display: "flex", alignItems: "center"}}>{data.typeDeContrat}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{padding: "10px",background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center"}}>Tarif spécifique ?</p>
                        <p style={{padding: "10px",width: "70%",height: "100%",  display: "flex", alignItems: "center"}}>{data.tarifSpécifique}</p>
                    </div>
                </div>
            </div>

            <div style={{width: "90%", display: "flex",  background: "#f0f0f0"}} className='infos-salon3'>
                <div style={{width: "50%"}}>
                    <div style={{display: "flex", width: "100%", border: "1px solid #cfcfcf", background: "#3D9B9B", padding: "10px"}}> 
                        <div style={{width: "50%", color: "white"}}>
                            <p className="bold">Date de visite</p>
                            <p>{data.dateDeVisite}</p>
                        </div>
                        <div style={{width: "50%", color: "white"}}>
                            <p className="bold">Responsable présente ?</p>
                            <p>{data.responsablePrésente}</p>
                        </div>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Quels ont été les produits proposés ?</p>
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
                <div style={{width: "50%"}}>
                    <div style={{display: "flex", width: "100%", border: "1px solid #cfcfcf", background: "#3D9B9B", padding: "10px"}}> 
                        <div style={{width: "50%", color: "white"}}>
                            <p className="bold">Prise de commande ?</p>
                            <p>{data.priseDeCommande}</p>
                        </div>
                        <div style={{width: "50%", color: "white"}}>
                            <p className="bold">Quelle gamme ?</p>
                            <p>{data.gammesCommandées}</p>
                        </div>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Autres points abordés ? Lesquels ?</p>
                        <p>{data.autresPoints}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Observations (éléments à retenir)</p>
                        <p>{data.observations}</p>
                    </div>
                </div>
                </div>

        </div>
    )
}

export default ResultsFicheClient