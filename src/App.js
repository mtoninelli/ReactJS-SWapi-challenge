import React, { useEffect, useState } from "react";

import "./App.css";

function App() {
  // states
  const [allShips, setAllShips] = useState([]);
  const [ships, setShips] = useState([]);

  // fetch ships
  useEffect(() => {
    fetch("https://swapi.dev/api/starships/")
      .then((r) => r.json())
      .then((data) => setAllShips(data.results));
  }, []);

  // init ships state
  useEffect(() => {
    const initShips = async () => {
      if (allShips.length > 0) {
        // filter (avoid) slow ships
        const _filtredShips = allShips.filter((s) => s.hyperdrive_rating > 1);
        // sort by hyperdrive_rating
        _filtredShips.sort((b, a) => a.hyperdrive_rating - b.hyperdrive_rating);
        // load films (only those you need)
        let filmsUrlArray = [];
        _filtredShips.forEach((s) => {
          s.films.forEach((fUrl) => {
            if (!filmsUrlArray.includes(fUrl)) {
              filmsUrlArray.push(fUrl);
            }
          });
        });
        const _films = await loadFilms(filmsUrlArray);
        // insert films_title array in ships state array
        _filtredShips.forEach((s) => {
          let _filmTitlesArray = [];
          s.films.forEach((fUrl) => {
            const _film = _films.find((f) => f.url === fUrl);
            _filmTitlesArray.push(_film.title);
          });
          s["films_titles"] = _filmTitlesArray;
        });
        // set store Ships
        setShips(_filtredShips);
      }
    };
    // init state
    initShips();
  }, [allShips]);

  // fetch films by film url array
  const loadFilms = async (_filmsUrlArray) => {
    let promises = [];
    for (let key in _filmsUrlArray) {
      promises.push(getFilm(_filmsUrlArray[key]));
    }
    return await Promise.all(promises);
  };

  // fetch film by url
  const getFilm = async (filmUrl) => {
    const r = await fetch(filmUrl);
    return r.json();
  };

  // rating label
  const getHyperdriveRatingLabel = (s) => {
    switch (Number(s)) {
      case 1:
        return "Average";
      case 2:
        return "Fast";
      case 3:
        return "Really Fast";
      case 4:
        return "Amazingly Fast";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="App">
      <header>
        <h1>The SWAPI challenge</h1>
      </header>
      {ships.length === 0 && <div>Loading...</div>}
      <div className={"ships-container"}>
        {ships.length > 0 &&
          ships.map((s, k) => {
            return (
              <div className={"ship-container"} key={k}>
                <div className={"Ship-title"}>
                  <p>{s.name}</p>
                </div>
                <strong>{getHyperdriveRatingLabel(s.hyperdrive_rating)}</strong>
                <p>Films: </p>
                {s.films_titles.map((title, k) => (
                  <p key={k}>{title}</p>
                ))}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default App;
