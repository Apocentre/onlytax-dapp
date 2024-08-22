import { useState } from "react"
import "./Home.css"

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="sm:h-3/6">
      <div className="flex flex-col gap-4 card h-50">
        <div>
          <h1>Collect Fees</h1>
        </div>        
        <div>
          <input
            type="text"
            placeholder="Enter token address"
            className="input input-bordered input-warning md:w-2/6 w-5/6" />
          </div>
          <div>
            <button className="btn btn-active btn-primary md:w-2/6 w-5/6 text-base-100">Collect</button>
          </div>
        </div>
    </div>
  )
}

export default Home
