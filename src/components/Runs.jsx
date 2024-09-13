import Run from "./Run"

const Runs = ({runs}) => {
  if (typeof(runs) === "number") {
    return (
      <div>
        <span>Runs: {runs}</span>
      </div>
    )
  } else if (runs === "") {
    return (
      <>
      </>
    )
  }
  if ("error" in runs) {
    return (
      <div>
        <span>Error: {runs.error}</span>
      </div>
    )
  }
  if ("count" in runs) {
    return (
      <div>
        <span>Runs: {runs.count}</span>
      </div>
    )
  } else {
    return(
      <>
      </>
    )
  }

}

export default Runs
