const bedrock = require('bedrock-protocol')
const crypto = require('crypto')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function getRandomColorCode() {
  const chars = '123456789abcdeflmnopqrstuvwxyz'
  return chars.charAt(Math.floor(Math.random() * chars.length))
}

function generateRandomString(len = 5) {
  const chars = '=+-_!?$&%~><#'
  return Array.from({ length: len }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('')
}

const spamCount = 999250
let realmCode = ''
let userMessage = ''

rl.question('Realm Code -', (code) => {
  realmCode = code.trim()
  rl.question('Message To Spam -', (msg) => {
    userMessage = msg.trim()
    rl.close()
    startSpamming()
  })
})

function logStatus(tag, msg) {
  console.log(`[${tag}] ${msg}`)
}

function startSpamming() {
  logStatus('Bot joining',` Joining realm with the code of - ${realmCode}`)

  const client = bedrock.createClient({
    username: 'Zijorh',
    realms: { realmInvite: realmCode }
  })

  let sent = 0

  const timeout = setTimeout(() => {
    logStatus('Bot timeout', `Couldnt join realm with code of - ${realmCode}`)
    client.disconnect()
    process.exit(1)
  }, 15000)

  client.on('join', () => {
    clearTimeout(timeout)
    logStatus('Bot Joins', `Bot Joined realm with code of - ${realmCode}`)
  })

  client.on('disconnect', (packet) => {
    clearTimeout(timeout)
    const reason = packet && packet.reason ? packet.reason : 'No reason'
    logStatus('Bot Disconnect', `bot disconnect bc - ${reason}`)
    process.exit(1)
  })

  client.on('error', (err) => {
    clearTimeout(timeout)
    logStatus('Error', err.message)
    process.exit(1)
  })

  client.on('start_game', () => {
    logStatus('Bot Spamming now', `sending ${spamCount} msgs`)

    function sendNext() {
      if (sent >= spamCount) {
        logStatus('Bot done', `Sent all ${spamCount} msgs`)
        client.disconnect()
        process.exit(0)
      }

      const color = getRandomColorCode()
      const randStr = generateRandomString()
      const fullMsg = `§${color}${userMessage} | ${randStr}`

      client.queue('command_request', {
        command: `me ${fullMsg}`,
        internal: false,
        version: 78,
        origin: {
          type: 5,
          uuid: '',
          request_id: crypto.randomUUID()
        }
      })

      sent++
      setImmediate(sendNext)
    }

    sendNext()
  })

  client.connect()
}
