
// fichier Entry.js

import { Link } from "react-router-dom"

function Home() {
    return (
        <div className="entry">
            <h1>LOGO</h1>
            <Link to="/inscription" className="button-white">M'inscrire</Link>
            <Link to="/connexion" className="button-white">Me connecter</Link>
        </div>
    )
}

export default Home


