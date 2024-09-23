import { useId, useState, forwardRef, useEffect } from "react";
import runsService from "../services/runs"

const RequestForm = forwardRef(function RequestForm({requestHandler, loading}, {inputRef, selectRef}) {
  const inputId = useId();
  const [autoCompete, setAutoComplete] = useState([]);
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);
  const [isAutoCompeteLoading, setIsAutoCompeteLoading] = useState(false);
  const [focusOptionIndex, setFocusOptionIndex] = useState(0);

  let activeDescendantId = isAutoCompleteOpen ? autoCompete[focusOptionIndex]?.url : null;
  if(isAutoCompeteLoading)
    activeDescendantId = "inactive-option";

  const focusHandler = (e) => {
    if(!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(e.key)) return;
    
    if(e.key == "Enter" && !isAutoCompleteOpen) return;
    e.preventDefault();
    
    if(e.key == "Enter") {
      inputRef.current.value = autoCompete[focusOptionIndex].url;
      setIsAutoCompleteOpen(false);
      return;
    }

    setIsAutoCompleteOpen(true);

    let newIndex = focusOptionIndex;

    if (e.key == "ArrowDown") newIndex++;
    else if (e.key == "ArrowUp") newIndex--;
    
    if (newIndex >= autoCompete.length || e.key == "Home")
      newIndex = 0;
    else if (newIndex < 0 || e.key == "End")
      newIndex = autoCompete.length - 1;

    setFocusOptionIndex(newIndex);
  }

  useEffect(() => {
    const signal = new AbortController();
    
    (async () => {
      setIsAutoCompeteLoading(true);
      const res = await runsService.getAutocomplete(inputRef.current.value, selectRef.current.value, signal.signal);
      setAutoComplete(res);
      setIsAutoCompeteLoading(false);
    })();
    
    return () => signal.abort();
  }, [inputRef.current?.value, selectRef.current?.value]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target == inputRef.current || e.target == selectRef.current) return;
      setIsAutoCompleteOpen(false);
    }

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [inputRef, selectRef]);

  useEffect(() => {
    const onKeyPress = (e) => {
      if (e.key != "Escape") return;
      setIsAutoCompleteOpen(false);
    }

    document.addEventListener("keydown", onKeyPress);
    return () => document.removeEventListener("keydown", onKeyPress);
  }, [isAutoCompleteOpen]);

  return (
    <div>
      <form onSubmit={requestHandler}>
        <label id={`${inputId}-label`} htmlFor={inputId}>Get pending runs from:</label>
        <div className="input-area">
          <input
            ref={inputRef}
            id={inputId}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={isAutoCompleteOpen}
            aria-controls="autocomplete"
            aria-activedescendant={activeDescendantId}
            onKeyDown={focusHandler}
            onFocus={() => setIsAutoCompleteOpen(true)}
          />
          {
            isAutoCompleteOpen && (
              <ul id="autocomplete" aria-labelledby={`${inputId}-label`} className="autocomplete" role="listbox">
                {
                  isAutoCompeteLoading || !autoCompete.length ? (
                    <li id="inactive-option" role="option">{isAutoCompeteLoading ? "Loading..." : "No results"}</li>
                  ) : autoCompete.map((item, index) => {
                    return (
                      <li key={item.url} id={item.url} className={index == focusOptionIndex ? "active" : undefined} role="option" onClick={() => inputRef.current.value = item.url}>
                        {item.name}
                      </li>
                    )
                  })
                }
              </ul>
            )
          }
        </div>
        <select ref={selectRef}>
          <option value="game">Game</option>
          <option value="series">Series</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
        </select>
        <button disabled={loading}>{loading ? "Loading..." : "Get Runs"}</button>
      </form>
    </div>
  )
});

export default RequestForm
