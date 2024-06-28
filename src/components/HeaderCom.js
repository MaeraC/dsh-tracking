import React from "react";
import "../index.css";
import home from "../assets/home.png"
import homeB from "../assets/homeb.png"
import survey from "../assets/survey.png"
import surveyB from "../assets/surveyb.png"
import user from "../assets/user.png"
import userB from "../assets/userb.png" 
import markerG from "../assets/marker-h.png"
import markerB from "../assets/markerB.png"

function HeaderCom ({ activeTab, onTabChange }) {
    
    const handleTabClick = (tab) => {
        onTabChange(tab)
    }

    const getIcon = (tab) => {
        switch (tab) {
            case "apercu":
                return activeTab === "apercu" ? homeB : home
            case "map":
                return activeTab === "map" ? markerB : markerG
            
            case "fiches":
                return activeTab === "fiches" ? surveyB : survey
           
            case "mon-compte":
                return activeTab === "mon-compte" ? userB : user

            default:
                return null
        }
    }

    return (
        <header className="header">
            <nav>
                <button className={activeTab === "apercu" ? "active" : ""} onClick={() => handleTabClick("apercu")}>
                    <img src={getIcon("apercu")} alt="Aperçu" /> 
                </button>

                <button className={activeTab === "map" ? "active" : ""} onClick={() => handleTabClick("map")} >
                    <img src={getIcon("map")} alt="Map" />
                </button>

                <button className={activeTab === "fiches" ? "active" : ""}  onClick={() => handleTabClick("fiches")} >
                    <img src={getIcon("fiches")} alt="fiches" />
                </button>

                
                <button className={activeTab === "mon-compte" ? "active" : ""} onClick={() => handleTabClick("mon-compte")} >
                    <img src={getIcon("mon-compte")} alt="Mon Compte" />
                </button>
            </nav>
        </header>
    );
};

export default HeaderCom
