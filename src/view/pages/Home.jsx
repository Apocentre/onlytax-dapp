import { useState } from "react"
import "./Home.css"

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="sm:h-3/6">
      <div className="flex flex-col gap-4 card h-50">
        <div>
        </div>
        <div>
          <input
            type="text"
            placeholder="Enter token address"
            className="input input-bordered md:w-2/6 w-5/6" />
          </div>
          <div>
          <button className="btn btn-primary md:w-2/6 w-5/6 text-secondary-content">
          {
            true 
            ? <span>Collect</span>
            : <span className="loading loading-spinner"></span>
          }
          </button>
          </div>
          {/* <div>Collecting...</div> */}
          <div className="flex justify-center">
            <div className="bg-gray-200 dark:bg-gray-700 md:w-2/6 w-5/6 justify-self-center">
              <div className="bg-green-700 text-xs font-medium text-blue-100 text-center p-0.5 leading-none w-2/6" >45%</div>
            </div>
          </div>
      </div>
    </div>
  )
}

export default Home
