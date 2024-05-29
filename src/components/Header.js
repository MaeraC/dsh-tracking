
// Fichier Header.js

import { NavLink , useLocation} from "react-router-dom"
import "../index.css"
import home from "../assets/home.png"
import homeB from "../assets/homeb.png"
import survey from "../assets/survey.png"
import surveyB from "../assets/surveyb.png"
import user from "../assets/user.png"
import userB from "../assets/userb.png" 
import search from "../assets/search.png" 
import searchB from "../assets/searchb.png" 
import markerG from "../assets/marker-h.png"
import markerB from "../assets/markerB.png"
import { useEffect, useState } from "react"


function Header() {

    const location = useLocation();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        setActiveTab(location.pathname);
    }, [location]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <header className="header">
            <nav>
                <NavLink
                    to="/tableau-de-bord-commercial/apercu"
                    className={activeTab === "/tableau-de-bord-commercial/apercu" ? "active" : ""}
                    onClick={() => handleTabClick("/tableau-de-bord-commercial/apercu")}
                >
                    <img src={activeTab === "/tableau-de-bord-commercial/apercu" ? homeB : home} alt="Onglet accueil" className="iconHeader" />
                </NavLink>
                <NavLink
                    to="/tableau-de-bord-commercial/map"
                    className={activeTab === "/tableau-de-bord-commercial/map" ? "active" : ""}
                    onClick={() => handleTabClick("/tableau-de-bord-commercial/map")}
                >
                    <img src={activeTab === "/tableau-de-bord-commercial/map" ? markerB : markerG} alt="Onglet map" className="iconHeader" />
                </NavLink>
                <NavLink
                    to="/tableau-de-bord-commercial/questionnaires"
                    className={activeTab === "/tableau-de-bord-commercial/questionnaires" ? "active" : ""}
                    onClick={() => handleTabClick("/tableau-de-bord-commercial/questionnaires")}
                >
                    <img src={activeTab === "/tableau-de-bord-commercial/questionnaires" ? surveyB : survey} alt="Onglet questionnaires" className="iconHeader" />
                </NavLink>
                <NavLink
                    to="/tableau-de-bord-commercial/recherche-visites"
                    className={activeTab === "/tableau-de-bord-commercial/recherche-visites" ? "active" : ""}
                    onClick={() => handleTabClick("/tableau-de-bord-commercial/recherche-visites")}
                >
                    <img src={activeTab === "/tableau-de-bord-commercial/recherche-visites" ? searchB : search} alt="onglet rechercher visites" className="iconHeader" />
                </NavLink>
                <NavLink
                    to="/tableau-de-bord-commercial/mon-compte"
                    className={activeTab === "/tableau-de-bord-commercial/mon-compte" ? "active" : ""}
                    onClick={() => handleTabClick("/tableau-de-bord-commercial/mon-compte")}
                >
                    <img src={activeTab === "/tableau-de-bord-commercial/mon-compte" ? userB : user} alt="Onglet mon compte" className="iconHeader" />
                </NavLink>
            </nav>
        </header>
    );

    /*
    return (
        
        <header className="header"> 
            <nav>
                <NavLink to="apercu"           className={({ isActive }) => (isActive ? "active" : "")}><img src={home} alt="Onglet accueil" className="iconHeader" /></NavLink>
                <NavLink to="map"           className={({ isActive }) => (isActive ? "active" : "")}><img src={map} alt="Onglet map" className="iconHeader" /></NavLink>
                <NavLink to="questionnaires"   className={({ isActive }) => (isActive ? "active" : "")}><img src={surveys} alt="Onglet questionnaires" className="iconHeader" /></NavLink>
                <NavLink to="mon-compte"       className={({ isActive }) => (isActive ? "active" : "")}><img src={account} alt="Onglet mon compte" className="iconHeader" /></NavLink>
                <NavLink to="recherche-visites"      className={({ isActive }) => (isActive ? "active" : "")}><img src={search} alt="onglet rechercher visites" className="iconHeader" /></NavLink>
            </nav>
        </header>
    )
    */
}

export default Header