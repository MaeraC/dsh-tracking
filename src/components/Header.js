
// Fichier Header.js

import { NavLink } from "react-router-dom"
import "../index.css"
import home from "../assets/home.png"
import surveys from "../assets/surveys.png"
import account from "../assets/compte.png"
import logout from "../assets/logout.png"
import search from "../assets/search.png"

function Header() {
    return (
        <header className="header"> 
            <nav>
                <NavLink to="apercu"           className={({ isActive }) => (isActive ? "active" : "")}><img src={home} alt="Onglet accueil" /></NavLink>
                <NavLink to="questionnaires"   className={({ isActive }) => (isActive ? "active" : "")}><img src={surveys} alt="Onglet questionnaires" /></NavLink>
                <NavLink to="mon-compte"       className={({ isActive }) => (isActive ? "active" : "")}><img src={account} alt="Onglet mon compte" /></NavLink>
                <NavLink to="deconnexion"      className={({ isActive }) => (isActive ? "active" : "")}><img src={logout} alt="bouton déconnexion" /></NavLink>
                <NavLink to="recherche-visites"      className={({ isActive }) => (isActive ? "active" : "")}><img src={search} alt="onglet rechercher visites" /></NavLink>
            </nav>
        </header>
    )
}

export default Header