import {StrictMode} from "react"
import {createRoot} from "react-dom/client"
import Home from "./view/pages/Home.jsx"
import Layout from "./view/core/Layout.jsx";
import AppWalletProvider from "./view/core/WalletProvider.jsx"
import "./index.css"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWalletProvider>
      <Layout>
        <Home />
      </Layout>
    </AppWalletProvider>
  </StrictMode>,
)
