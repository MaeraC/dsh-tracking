
// fichier Entry.js

import { Link } from "react-router-dom"

function Home() {
    return (
        <div className="entry">
            <h1>LOGO</h1>
            <Link to="/inscription" className="button button-v2">M'inscrire</Link>
            <Link to="/connexion" className="button button-v2">Me connecter</Link>
        </div>
    )
}

export default Home


