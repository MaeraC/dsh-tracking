
// fichier ResultsFicheD.js

import { useRef } from "react";
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";
import download from "../assets/download.png"   
import closeIcon from "../assets/back.png"   

function ResultsFicheD({onClose, data}) {
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

    const {typeDeDémonstration, issueFavorable, issueDéfavorable} = data
    
    return (
        <div className="results-fiches"  ref={pageRef}>
            <button className="close-btn button-colored" onClick={onClose}><img src={closeIcon} alt="" /></button>
            <button className="download button-colored" onClick={downloadPDF}><img src={download} alt="" /></button>

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

            <div style={{width: "90%", display: "flex", height: "200px", marginBottom: "50px"}}>
                <div style={{width: "30%", height: "100%"}}>
                    <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>DEMONSTRATION</p>
                    <div style={{display: "flex" , height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>La démonstration portait sur :</p>
                        {Object.entries(typeDeDémonstration).map(([key, value]) => (
                            value && (
                                <div key={key}>
                                    <p style={{ display: "flex",  paddingLeft: "10px"}}>{key}</p>
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
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom de la technicienne</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.nomDeLaTechnicienne}</p>
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
                                            <p style={{  paddingLeft: "10px", }}>{value.préciser}</p>
                                        </div>
                                    </div>
                                </div>
                                
                            )
                            
                        ))}
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nb de collaborateurs</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.nombreDeCollaborateurs}</p>
                    </div>
                    
                    
                    
                </div>
            </div>
        </div>
    )
}

export default ResultsFicheD