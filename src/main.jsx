import {StrictMode} from "react"
import {createRoot} from "react-dom/client"
import Home from "./view/pages/Home.jsx"
import Layout from "./view/core/Layout.jsx";
import "./index.css"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Layout>
      <Home />
    </Layout>
  </StrictMode>,
)
