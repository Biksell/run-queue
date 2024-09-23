const apiv1 = "https://www.speedrun.com/api/v1"
const apiv2 = "https://www.speedrun.com/api/v2"
const apiUrl = apiv1

/*
  Game: GetGameData (url) -> GetGameLeaderboard2
  User: GetUserLeaderboard(filter verified = 0)
  Moderator: GetUserSummary[userGameModeratorStats] -> GetGameLeaderboard ->
*/

const request = async (url, {signal, useTimeOut = true} = {}) => {
  console.log(`GET ${url}`)
  const response = await fetch(url, { signal });

  if(!response.ok) {
    return {"error": response.status};
  }
  
  const json = response.json();
  if(!useTimeOut) return await json;

  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 605);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  return await json;
}


const reqGame = async (game, inputType) => {
  let urlString = ""
  if (inputType === "url") {
    urlString = `${apiUrl}/GetGameData?gameUrl=${game}`
  } else {
    urlString = `${apiUrl}/GetGameData?gameId="${game}"`
  }

  const data = await request(urlString)
  if ("error" in data) {
    return data
  }

  console.log(data)

  const newGame = {
    gameId: data.game.id,
    categories: data.categories.map(c => c.id)
  }

  return newGame
}

const getRuns = async (value, type) => {
  if (apiUrl == apiv2) {
    let games = []

    if (type == "game") {
      const data = await reqGame(value, "url")
      if ("error" in data) {
        return data
      }

      games = games.concat(data)
    } else if (type == "series") {
      const data = await request(`${apiUrl}/GetSeriesSummary?seriesUrl=${value}`)
      if ("error" in data) {
        return data
      }
      console.log(data)

      const gameIds = data.gameList.map(game => game.id)
      console.log(gameIds)
      for (const gameId of gameIds) {
        const data = await reqGame(gameId, "id")
        if ("error" in data) {
          return data
        }
        games = games.concat(data)
      }
    } else if (type == "user") {
      const data = await request(`${apiUrl}/GetUserSummary?url=${value}`)
      if ("error" in data) {
        return data
      }

      return data.userStats.runsPending

    } else if (type == "moderator") {
      const data = await request(`${apiUrl}/GetUserSummary?url=${value}`)
      if ("error" in data) {
        return data
      }
      const gameIds = data.userGameModeratorStats.map(g => g.gameId)
      for (const gameId of gameIds) {
        games = games.concat(await reqGame(gameId, "id"))
      }
    }

    let count = 0
    for (const game of games) {
      console.log(game)
      for (const categoryId of game["categories"]) {
        let page = 1
        const params = {
          gameId: game.gameId,
          categoryId: categoryId,
          video: 0,
          verified: 0,
          obsolete: 1
        }

        let data = null
        while (data === null || page < data.pagination.pages) {
          data = await request(`${apiUrl}/GetGameLeaderboard2?page=${page}&params=` + JSON.stringify(params))
          console.log(data)
          if ("error" in data) {
            break
          }
          count += data.runList.length
          page += 1;
        }
        if ("error" in data) {
          return data
        }
      }
    }

    console.log(count)
    return {count: count}
  }

  if(apiUrl == apiv1) {
    let games = []

    if (type == "game") {
      const data = await request(`${apiUrl}/games?abbreviation=${value}`)

      if (data.pagination.size == 0) {
        return {error: "Not found"}
      }

      games = games.concat(data.data[0]["id"])

    } else if (type == "series") {
      const data = await request(`${apiUrl}/series?abbreviation=${value}`)

      if (data.pagination.size == 0) {
        return {error: "Not found"}
      }

      let gamesData = null
      let offset = 0
      do {
        gamesData = await request(`${data.data[0].links.find(e => e.rel === "games").uri}?max=200&offset=${offset}`)
        games = games.concat(gamesData.data.map(g => g.id))
        offset += 200
      } while (gamesData.pagination.size == 200)
    } else if (type == "user") {
      const data = await request(`https://www.speedrun.com/api/v2/GetUserSummary?url=${value}`)
      if ("error" in data) {
        return data
      }

      return data.userStats.runsPending
    } else if (type == "moderator") {
      const userData = await request(`${apiUrl}/users?name=${value}`)
      const userId = userData.data[0].id

      let gamesData = null
      let offset = 0
      do {
        gamesData = await request(`${apiUrl}/games?moderator=${userId}&max=200&offset=${offset}`)
        games = games.concat(gamesData.data.map(g => g.id))
        offset += 200
      } while (gamesData.pagination.size == 200)
    }

    let count = 0
    for(const gameID of games) {
      let offset = 0
      let data = null
      do {
        data = await request(`${apiUrl}/runs?game=${gameID}&max=200&status=new&offset=${offset}`)
        count += data.pagination.size
        offset += 200
      } while (data.pagination.size == 200)
    }
    return count
  }
}

const getAutocomplete = async (query, type, signal) => {
  if (apiUrl == apiv2) {
    const urlParams = new URLSearchParams({
      query,
      includeGames: type == "game",
      includeSeries: type == "series",
      includeUsers: type == "user" || type == "moderator",
      limit: 25
    });
    const data = await request(`${apiUrl}/GetSearch?${urlParams}`, {signal, useTimeOut: false });
    
    return Object.values(data).find(x => x.length).map(x => ({
      name: type == "series" ? `${x.name} Series` : x.name,
      url: x.url
    }));
  }

  if (apiUrl == apiv1) {
    const typeMap = {
      game: "games",
      series: "series",
      user: "users",
      moderator: "users"
    };
    const correctedType = typeMap[type];
    
    // Can't search through users when the search is less than 3 characters
    if(correctedType == "users" && query.length < 3)
      return [];
    
    const data = await request(`${apiUrl}/${correctedType}?name=${query}`, {signal, useTimeOut: false });

    return data.data.map(x => ({
      name: type == "series" ? `${x.names.international} Series` : x.names.international,
      url: x.weblink.split("/").at(-1)
    }));
  }
}

export default {getRuns, getAutocomplete}
