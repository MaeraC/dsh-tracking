import React                                        from "react"
import ReactDOM                                     from "react-dom/client"
import "./index.css"
import { BrowserRouter as Router, Routes, Route }   from "react-router-dom"
import Home                                         from "./pages/Home"
import SignUp                                       from "./pages/SignUp.js"
import Login                                        from "./pages/Login.js"
import DashboardCom                                 from "./pages/DashboardCom.js"
import DashboardAdmin                               from "./pages/DashboardAdmin.js"
import "typeface-roboto"


const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route exact path="/"                               element={<Home />} />
                <Route path="/inscription"                          element={<SignUp />} />
                <Route path="/connexion"                            element={<Login />} />
                <Route path="/tableau-de-bord-commercial/*"  element={<DashboardCom />} />
                <Route path="/tableau-de-bord-administrateur"       element={<DashboardAdmin />} />
            </Routes>
        </Router>
    </React.StrictMode>
)