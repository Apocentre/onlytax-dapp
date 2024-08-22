/* @refresh reload */
import {render} from "solid-js/web"

import "./index.css"
import Home from "./pages/Home"

const root = document.getElementById("root")

render(() => <Home />, root)
