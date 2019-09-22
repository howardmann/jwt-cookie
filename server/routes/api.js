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

api.profile = (req, res) => {
  // access id from req.auth from verifyToken middleware
  let id = Number(req.auth.id)
  let user = User.findBy('id', id)
  res.send(user)
}