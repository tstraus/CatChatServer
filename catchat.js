/* eslint-env node */

const uuid = require('uuid/v4')
const WebSocketServer = require('uws').Server
const chalk = require('chalk')

const wss = new WebSocketServer({ port: 1234 })
let connections = new Map() // uuid to websocket connection map
let users = new Map() // username to uuid map

wss.on('connection', function (ws) {
  ws.uuid = uuid()
  connections.set(ws.uuid, ws)
  console.log('connection: ' + ws.uuid)

  const id = {
    type: 'uuid',
    uuid: ws.uuid
  }

  ws.send(JSON.stringify(id))

    // ws callbacks
  ws.on('message', function (message) {
    const msg = JSON.parse(message)

    if (msg.type === 'join') {
      if (!users.has(msg.user)) {
        console.log(msg.user + ' joined as: ' + ws.uuid)
        users.set(msg.user, ws.uuid)
        ws.user = msg.user
      }
    } else if (msg.type === 'msg') {
      try {
        console.log(ws.user + ' -> ' + msg.user + ': ' + msg.data)

        const output = {
          type: 'msg',
          user: ws.user,
          data: msg.data
        }

        connections.get(users.get(msg.user)).send(JSON.stringify(output))
      } catch (err) {
        console.log(chalk.yellow('Could not find the destination: ') + msg.user)
      }
    } else {
      console.log(chalk.yellow('Received invalid message type: ') + msg.type)
    }
  })

  ws.on('close', function () {
    if ('user' in ws) {
      console.log(ws.user + ' disconnected')
    } else {
      console.log(ws.uuid + ' disconnected')
    }

    users.delete(ws.user)
    connections.delete(ws.uuid)
  })
})
