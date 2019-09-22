const jwt = require('jsonwebtoken')
const {SECRET_KEY} = require('../../config')

// Simple middleware to verify token from bearer Header or cookie
let verifyToken = function(req, res, next) {
  let bearerToken = null;
  // check if bearer header exists via API request
  let bearerHeader = req.headers["authorization"]
  if (typeof bearerHeader !== 'undefined') {
    // authorization: bearer token12345
    bearerToken = bearerHeader.split(" ")[1]
  }

  // get cookieToken
  let cookieToken = req.cookies.access_token

  // set token from bearer header token or cookieToken
  let token = bearerToken || cookieToken

  jwt.verify(token, SECRET_KEY, (err, data) => {
    if (err) {
      return res.sendStatus(403) // forbidden
    }
    req.token = token
    req.auth = data
    next()
  })
}

module.exports = verifyToken