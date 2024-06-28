
// fichier ResultsFicheP.js

import { useRef } from "react";
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";
import download from "../assets/download.png"   
import closeIcon from "../assets/back.png"   

function ResultsFicheP({onClose, data}) {
    const pageRef = useRef()
    const {marquesColoration, marquesRevente, marquesBacTech, conceptsDshAbordés, interessePar} = data

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
    
    return (
        <div className="results-fiches"  ref={pageRef}>
            <button className="close-btn button-colored" onClick={onClose}><img src={closeIcon} alt="" /></button>
            <button className="download button-colored" onClick={downloadPDF}><img src={download} alt="" /></button>

            <div style={{width: "90%", display: "flex", height: "200px", marginBottom: "150px"}}>
                <div style={{width: "50%", height: "100%"}}>
                    <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>SALON DE COIFFURE</p>
                    <div style={{display: "flex" , height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom du salon</p>
                        <p style={{width: "70%", height: "100%",paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.name}</p>
                    </div>
                    <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Ville</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.city}</p>
                    </div> 
                    <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Département</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.departement}</p>
                    </div> 
                    <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nb de personnes</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.nombreDePersonnes}</p>
                    </div> 
                    <div style={{display: "flex",  height: "25%",border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Responsable pésent ?</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.responsablePresent}</p>
                    </div>
                </div>
                <div style={{width: "50%", height: "100%"}}>
                    <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>RESPONSABLE DU SALON</p>
                    <div style={{display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Nom Responsable</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.nomPrenomDuResponsable}</p>
                    </div>
                    
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Téléphone</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.telephone}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Email</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.email}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Âge du responsable</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.ageDuResponsable}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Tenue du salon</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.tenueDuSalon}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Visite :</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.visite}</p>
                    </div>
                </div>
            </div>
            <div style={{width: "90%", display: "flex", height: "200px", marginBottom: "50px", }}>
                <div style={{width: "50%", height: "100%", }}>  
                    <p style={{width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center"}}>MARQUES</p>
                    <div style={{ display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf" }}>
                        <p style={{ background: "#f0f0f0", height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px" }}>Marques de colorations</p>
                        <p style={{ width: "70%", height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center" }}>
                            {marquesColoration.length > 0 ? marquesColoration.map((marque, index) => marque.nom).join(', ') : 'Aucune marque de coloration spécifiée.'}
                        </p>
                    </div>
                    <div style={{ display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf" }}>
                        <p style={{ background: "#f0f0f0", height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px" }}>Marques de revente</p>
                        <p style={{ width: "70%", height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center" }}>
                            {marquesRevente.length > 0 ? marquesRevente.map((marque, index) => marque.nom).join(', ') : 'Aucune marque de revente spécifiée.'}
                        </p>
                    </div>

                    <div style={{ display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf" }}>
                        <p style={{ background: "#f0f0f0", height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px" }}>Marques BAC/TECH</p>
                        <p style={{ width: "70%", height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center" }}>
                            {marquesBacTech.length > 0 ? marquesBacTech.map((marque, index) => marque.nom).join(', ') : 'Aucune marque BAC/TECH spécifiée.'}
                        </p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>RDV Pour </p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.rdvPour}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Si refus, motif </p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.motifDeRefus}</p>
                    </div>
                </div>
                <div style={{width: "50%", height: "100%"}}>
                <p style={{ width: "100%", padding: "10px", background: "#3D9B9B", color: "white", textAlign: "center" }}>CONCEPTS DSH ET INTÉRÊTS</p>
                
                    <div style={{ display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf" }}>
                        <p style={{ background: "#f0f0f0", height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px" }}>Concepts DSH abordés</p>
                        <p style={{ width: "70%", height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                            {Object.keys(conceptsDshAbordés).filter(demo => conceptsDshAbordés[demo]).map(demo => (
                                <span key={demo} style={{ marginRight: "10px" }}>
                                    {demo.charAt(0).toUpperCase() + demo.slice(1)}
                                </span>
                            ))}
                        </p>
                    </div>
                    <div style={{ display: "flex", height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf" }}>
                        <p style={{ background: "#f0f0f0", height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px" }}>Intéressé par</p>
                        <p style={{ width: "70%", height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                            {Object.keys(interessePar).filter(demo => interessePar[demo]).map(demo => (
                                <span key={demo} style={{ marginRight: "10px" }}>
                                    {demo.charAt(0).toUpperCase() + demo.slice(1)}
                                </span>
                            ))}
                        </p>
                    </div>
                
                    
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>A revoir ?</p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.rdvOuAbandon}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>RDV Prévu le </p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.dateDeRdv}</p>
                    </div>
                    <div style={{display: "flex",height: "25%", border: "1px solid #cfcfcf", alignItems: "center", borderLeft: "1px solid #cfcfcf"}}>
                        <p style={{background: "#f0f0f0",height: "100%", width: "30%", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "10px"}}>Si à revoir, observations </p>
                        <p style={{width: "70%",height: "100%", paddingLeft: "10px", display: "flex", alignItems: "center"}}>{data.observationsAPreparerpourLaProchaineVisite}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResultsFicheP