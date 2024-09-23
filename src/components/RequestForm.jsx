const RequestForm = ({input, inputHandler, selection, selectionHandler, requestHandler, loading}) => {
  let submitBtn
  if (!loading) {
    submitBtn = (<button className={``} type="submit">Get Runs</button>)
  } else {
    submitBtn = (<button className={``} type="submit" disabled> Loading... </button>)
  }
  return (
    <div>
      <form onSubmit={requestHandler}>
        <span>Get pending runs from:</span>
        <input
          value={input}
          onChange={inputHandler}
          className={``}
        />
        <select className={``} value={selection} onChange={selectionHandler}>
          <option value="game">Game</option>
          <option value="series">Series</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
        </select>
        {submitBtn}
      </form>
    </div>
  )
}

export default RequestForm
