// Example in-memory data-access implementation of user DB
const User = require('../data-access/user')
const jwt = require('jsonwebtoken')
const {SECRET_KEY} = require('../config')
const bcrypt = require('bcrypt')

let login = (req, res) => {
  let {email, password} = req.body

  // Find user and validate password
  let user = User.findBy('email', email)
  let passwordValid = user && bcrypt.compareSync(password, user.passwordHash)
  
  if (!passwordValid) { 
    return res.sendStatus(403)
  }

  // Create json webtoken with user email and id
  let token = jwt.sign({
    id: user.id, 
    email: user.email
  }, SECRET_KEY)

  // Set jwt token in cookie as 'access_token'
  res.cookie('access_token', token, {
    // maxAge: 365 * 24 * 60 * 60 * 100, // session only cookie
    httpOnly: true // cannot be modified using XSS or JS
  })
  
  // Also as API send back token
  res.status(200).send({
    message: 'Authenticated! Use this token in your Authorization header as Bearer token',
    token,
    id: user.id
  })  
}

module.exports = login

