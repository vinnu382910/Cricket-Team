const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const instalizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

instalizeDBAndServer()

//Get all players in team
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
   SELECT
      *
    FROM
      cricket_team;`
  const playerArray = await db.all(getPlayerQuery)
  response.send(
    playerArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

// Post new players in the team

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO cricket_team (player_name, jersey_number, role)
  VALUES ('${playerName}', '${jerseyNumber}', '${role}')`
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//Get Player By ID

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPLayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`
  const player = await db.get(getPLayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

//Put Player Details in Team

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const playerUpdateQuery = `
  UPDATE cricket_team 
  SET player_id = '${playerId}', player_name = '${playerName}', jersey_number = '${jerseyNumber}' ,role = '${role}'
  WHERE player_id = ${playerId};`
  await db.run(playerUpdateQuery)
  response.send('Player Details Updated')
})

//Delete Player From Team

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM cricket_team WHERE player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
