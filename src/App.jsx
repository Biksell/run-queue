import { useState, useEffect, useRef } from "react"
import RequestForm from "./components/RequestForm"
import Runs from "./components/Runs"
import Loading from "./components/Loading"
import runsService from "./services/runs"


function App() {
  const [runs, setRuns] = useState({})
  const inputRef = useRef(null)
  const selectRef = useRef(null)
  const [cursor, setCursor] = useState('_')
  const [loading, setLoading] = useState(false)

  useEffect (() => {
    setTimeout(() => {
      setCursor(cursor === " " ? "_" : " ")
    }, 700)
  })


  const requestRuns = async (event) => {
    setLoading(true)
    setRuns("")
    event.preventDefault()
    const currentFilter = inputRef.current.value
    const currentSelection = selectRef.current.value
    console.log(`Requested "${currentSelection}" with input "${currentFilter}"`)
    const newRuns = await runsService.getRuns(currentFilter, currentSelection)
    console.log(typeof(newRuns))
    setRuns(newRuns)
    setLoading(false)
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
        <a href="https://www.github.com/biksell/run-queue">Source code</a>
        <p>
          Each API call has a 600ms delay because of rate-limit, so the more games a series or moderator has, the longer it will take.
        </p>
        <p>For games and series, use their abbreviation; For users and moderators, use their username</p>

        <RequestForm
          ref={{inputRef, selectRef}}
          requestHandler={requestRuns}
          loading={loading}
        />
        <div>
          <Runs runs={runs}/>
          <Loading shown={loading}/>
        </div>
      </div>
    </div>

  )
}

export default App
