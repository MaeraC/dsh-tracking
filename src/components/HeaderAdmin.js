
// fichier HeaderAdmin

import { NavLink , useLocation} from "react-router-dom"
import "../index.css"
import home from "../assets/home.png"
import homeB from "../assets/homeb.png"
import user from "../assets/user.png"
import userB from "../assets/userb.png" 
import search from "../assets/search.png" 
import searchB from "../assets/searchb.png" 
import { useEffect, useState } from "react"

function HeaderAdmin() {

    const location = useLocation();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        setActiveTab(location.pathname);
    }, [location]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    }

    return (
        <header className="header">
            <nav>
                <NavLink
                    to="/tableau-de-bord-administrateur/apercu-admin"
                    className={activeTab === "/tableau-de-bord-administrateur/apercu-admin" ? "active" : ""}
                    onClick={() => handleTabClick("/tableau-de-bord-administrateur/apercu-admin")}
                >
                    <img src={activeTab === "/tableau-de-bord-administrateur/apercu-admin" ? homeB : home} alt="Onglet accueil" className="iconHeader" />
                </NavLink>
                
                <NavLink
                    to="/tableau-de-bord-administrateur/recherche-visites-admin"
                    className={activeTab === "/tableau-de-bord-administrateur/recherche-visites-admin" ? "active" : ""}
                    onClick={() => handleTabClick("/tableau-de-bord-administrateur/recherche-visites-admin")}
                >
                    <img src={activeTab === "/tableau-de-bord-administrateur/recherche-visites-admin" ? searchB : search} alt="onglet rechercher visites" className="iconHeader" />
                </NavLink>
                <NavLink
                    to="/tableau-de-bord-administrateur/mon-compte-admin"
                    className={activeTab === "/tableau-de-bord-administrateur/mon-compte-admin" ? "active" : ""}
                    onClick={() => handleTabClick("/tableau-de-bord-administrateur/mon-compte-admin")}
                >
                    <img src={activeTab === "/tableau-de-bord-administrateur/mon-compte-admin" ? userB : user} alt="Onglet mon compte" className="iconHeader" />
                </NavLink>
            </nav>
        </header>
    )
}

export default HeaderAdmin