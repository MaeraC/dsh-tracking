
// Fichier Header.js

import { NavLink } from "react-router-dom"
import "../index.css"
import home from "../assets/home.png"
import surveys from "../assets/surveys.png"
import account from "../assets/compte.png"
import search from "../assets/search.png" 
import map from "../assets/map.png"


function Header() {

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
}

export default Header