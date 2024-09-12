const RequestForm = ({input, inputHandler, selection, selectionHandler, requestHandler}) => {
  return (
    <div>
      <form onSubmit={requestHandler}>
        <span>Get runs:</span>
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
        <button className={``} type="submit">Get Runs</button>
      </form>
    </div>
  )
}

export default RequestForm
