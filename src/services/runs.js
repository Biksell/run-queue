const apiUrl = "https://www.speedrun.com/api/v2"

/*
  Game: GetGameData (url) -> GetGameLeaderboard2
  User: GetUserLeaderboard(filter verified = 0)
  Moderator: GetUserSummary[userGameModeratorStats] -> GetGameLeaderboard ->
*/

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const request = async (url, params = null) => {
  await sleep(600)
  let response = null
  if(!params) {
    console.log(`GET ${url}, params: ${params}`)
    response = await fetch(url)
  } else {
    console.log(`POST ${url}, params: ${params}`)
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: params
    })
  }
  //console.log(response.status)
  if(response.status == 429) {
    return {"error": "Rate limited; Too many requests; Try again later"}
  }
  return await response.json()
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
  let games = []

  if (type === "game") {
    const data = await reqGame(value, "url")
    if ("error" in data) {
      return data
    }

    games = games.concat(data)
  } else if (type === "series") {
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
  } else if (type === "user") {
    const data = await request(`${apiUrl}/GetUserSummary?url=${value}`)
    if ("error" in data) {
      return data
    }

    return data.userStats.runsPending

  } else if (type === "moderator") {
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


export default {getRuns}
