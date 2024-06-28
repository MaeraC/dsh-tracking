
// fichier historiqueAdmin.js

function HistoriqueAdmin() {
    return (
        <div>
            <table style={{display: "flex"}}> 
                <thead style={{display: "flex", flexDirection: "column"}}>  
                    <tr>
                    <th>Nom du salon</th>
                    <th>Ville du salon</th>
                    <th>Département</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>Hair Care</td>
                    <td>Paris</td>
                    <td>34200</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default HistoriqueAdmin