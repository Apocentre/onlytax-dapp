import {Router, Routes, Route} from "@solidjs/router";
import Home from "../pages/Home";

const App = () => {
  return (
    <div class="main max-w-[500px] flex items-center justify-center min-h-screen w-screen text-[#E5E4DC] place-content-center">
      <Router>
        <Routes>
          <Route path="/" component={Home} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
