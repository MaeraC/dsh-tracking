
import back from "../../assets/back.png"
import SearchFeuillesDuJour from "./SearchFeuillesDuJour"

function FeuilleJournaliereAdmin({ onReturn, uid }) {  
    return (
        <div className='fdr-section-admin'>
            <div className='titre-fiche'> 
                <h1>Feuilles de route</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <SearchFeuillesDuJour uid={uid} />

        </div>
    )
}

export default FeuilleJournaliereAdmin