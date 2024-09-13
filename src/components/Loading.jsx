const Loading = ({shown}) => {
  if(shown) {
    return (
      <div className={"loader"}></div>
    )
  } else if (!shown) {
    return (
      <>
      </>
    )
  }
}

export default Loading
