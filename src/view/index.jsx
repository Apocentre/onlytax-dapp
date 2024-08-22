/* @refresh reload */
import {render} from "solid-js/web";
import App from "./core/App";
import {StoreProvider} from "../data/Store";
import Layout from "./core/Layout";
import "./index.css";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?",
  );
}

render(() => {
  return (
    <StoreProvider>
      <Layout>
        <App />
      </Layout>
    </StoreProvider>
  );
}, root);  
