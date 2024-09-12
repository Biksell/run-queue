import { useState, useEffect } from 'react'
import RequestForm from "./components/RequestForm"
import Runs from "./components/Runs"
import runsService from "./services/runs"


function App() {
  const [runs, setRuns] = useState({})
  const [currentFilter, setCurrentFilter] = useState("")
  const [currentSelection, setCurrentSelection] = useState("game")
  const [cursor, setCursor] = useState('_');

  useEffect (() => {
    setTimeout(() => {
      setCursor(cursor === " " ? "_" : " ")
    }, 700)
  })


  const requestRuns = async (event) => {
    event.preventDefault()
    console.log(`Requested "${currentSelection}" with input "${currentFilter}"`)
    const newRuns = await runsService.getRuns(currentFilter, currentSelection)
    console.log(typeof(newRuns))
    setRuns(newRuns)
  }

  const handleFilterChange = (event) => {
    setCurrentFilter(event.target.value)
  }

  const handleSelectionChange = (event) => {
    setCurrentSelection(event.target.value)
  }


  return (
    <div className={`text-center`}>
      <div>
        <header>
          <div>
              <a href="https://biksel.dev/"
                className={`justify-content-sm-center link-body-emphasis`}>
                <span>biksel.dev<span className="cursor">{cursor}</span></span>
              </a>
          </div>
        </header>
      </div>
      <div id="main-content">
        <RequestForm
          input={currentFilter}
          inputHandler={handleFilterChange}
          selection={currentSelection}
          selectionHandler={handleSelectionChange}
          requestHandler={requestRuns}
        />
      </div>
      <div>
        <Runs runs={runs}/>
      </div>
    </div>

  )
}

export default App
