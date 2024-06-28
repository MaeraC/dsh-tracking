
// fichier ResultsFiches.js

import { useRef } from "react";
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";
import download from "../assets/download.png"   
import closeIcon from "../assets/back.png"     

function ResultsFiches({ data, onClose }) {
    const pageRef = useRef()
    const { colorationsAvecAmmoniaque, colorationsSansAmmoniaque, colorationsVégétales } = data;

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
                 //eslint-disable-next-line 
                const pageHeight = pdf.internal.pageSize.height;
                 //eslint-disable-next-line 
                while (height > 0) {
                     //eslint-disable-next-line 
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

            <p className='title-grid'>SALON DE COIFFURE / INSTITUT DE BEAUTE</p>
            <div className='infos-salon'>
                <div className='infos-generales'>
                    <div className='line'>
                        <p className='title-table'>Nom</p>
                        <p className='txt-table'></p>
                    </div>
                    <div className='line'>
                        <p className='title-table'>Adresse</p>
                        <p className='txt-table'>Adresse à récupérée</p>
                    </div>
                    <div className='line'>
                        <p className='title-table'>Ville</p>
                        <p className='txt-table'>Ville à récupérée</p>
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
                    <div className='col'>
                        <p className='title-col'>J.Fture</p>
                        <p className='txt-col'>{data.jFture}</p>
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
                        <p className='txt-col'>Nb à récupéré</p>
                    </div>
                    <div className='col col2'>
                        <p className='title-col'>origine de la visite</p>
                        <p className='txt-col'>{data.origineDeLaVisite}</p>
                    </div>
                </div>
            </div> 

            <div style={{marginBottom: "20px"}} className='infos-salon2'>
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
                                <p style={{width:"30%", borderRight: "1px solid #cfcfcf"}} className='title-table3'>Avec ammoniaque</p>
                                <div style={{width:"70%"}} className="sous-line-box">
                                    {colorationsAvecAmmoniaque.map((item, index) => (
                                        <div className='sous-line' key={`avec-ammoniaque-${index}`}>
                                            <p style={{width:"60%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.nom}</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.prix}€</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.ml}ml</p>
                                        </div>
                                    ))}
                                </div>
                            </div>  
                            <div className='line2'>
                                <p style={{width:"30%", borderRight: "1px solid #cfcfcf"}} className='title-table3'>Sans ammoniaque</p>
                                <div style={{width:"70%"}} className="sous-line-box">
                                    {colorationsSansAmmoniaque.map((item, index) => (
                                        <div className='sous-line' key={`sans-ammoniaque-${index}`}>
                                            <p style={{width:"60%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.nom}</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.prix}€</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.ml}ml</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                                                       <div className='line2'>
                                <p style={{width:"30%", borderRight: "1px solid #cfcfcf"}} className='title-table3'>Végétales</p>
                                <div style={{width:"70%"}} className="sous-line-box">
                                    {colorationsVégétales.map((item, index) => (
                                        <div className='sous-line' key={`végétales-${index}`}>
                                            <p style={{width:"60%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.nom}</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.prix}€</p>
                                            <p style={{width:"20%", borderRight: "1px solid #cfcfcf", paddingLeft: "10px"}} className='txt-table3'>{item.ml}ml</p>
                                        </div>
                                    ))}  
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='infos-generales2 infos-generales2-col'>
                        <div className='col col2'>
                            <p className='title-col'>Poudre</p>
                            <p style={{background: "white"}} className='txt-col'>{data.autresMarques.poudre}</p>
                        </div>
                        <div className='col col2'>
                            <p className='title-col'>Permanente</p>
                            <p style={{background: "white"}} className='txt-col'>{data.autresMarques.permanente}</p>
                        </div>
                        <div className='col col2'>
                            <p className='title-col'>Revente</p>
                            <p style={{background: "white"}} className='txt-col'>{data.autresMarques.revente}</p>
                        </div>
                        <div className='col col2'>
                            <p className='title-col'>BAC/TECH</p>
                            <p style={{background: "white"}} className='txt-col'>{data.autresMarques.bac}</p> 
                        </div>
                    </div>
                </div> 
            </div> 

            <div style={{width: "90%", display: "flex",  background: "#f0f0f0"}} className='infos-salon3'>
                <div style={{width: "40%"}}>
                    <div style={{display: "flex", width: "100%", border: "1px solid #cfcfcf", background: "#3D9B9B", padding: "10px"}}> 
                        <div style={{width: "50%", color: "white"}}>
                            <p>Date de visite</p>
                            <p>{data.dateDeVisite}</p>
                        </div>
                        <div style={{width: "50%", color: "white"}}>
                            <p>Responsable présente ?</p>
                            <p>{data.responsablePrésente}</p>
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
                <div style={{width: "40%"}}>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Intéressés par ?</p>
                        <p>{data.intéressésPar}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Autres points abordés ? Lesquels ?</p>
                        <p>{data.autresPoints}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Observations ou motifs si Abandon</p>
                        <p>{data.observations}</p>
                    </div>
                </div>
                <div style={{width: "20%"}}>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Abandon ?</p>
                        <p>{data.statut}</p>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>À revoir ?</p>
                        <p>{data.aRevoir}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>RDV obtenu ? </p>
                        <p>{data.rdvObtenu}</p>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>RDV Prévu pour le :</p>
                        <p>{data.rdvPrévuLe}</p>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>RDV Prévu pour :</p>
                        <p>{data.typeDeRdv}</p>
                    </div>
                    <div style={{border: "1px solid #cfcfcf", padding: "10px", background: "white"}}>
                        <p style={{fontWeight : "bold", marginBottom: "5px"}}>Commande ?</p>
                        <p>{data.commande}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResultsFiches;

