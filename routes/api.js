let api = module.exports = {}

const User = require('../data-access/user')

api.ping = (req, res) => {
  res.send('pong')
}

api.secret = (req, res) => {
  res.json({
    secret: 42
  })
}

api.users = (req, res) => {
  let users = User.list()
  res.send(users)
}
