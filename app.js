const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'jwt_chicken'
const bcrypt = require('bcrypt')
const app = express()

// bodyParser built into express
app.use(express.json())
// cookie parser
app.use(cookieParser())

// public route
app.get('/', (req, res) => {
  res.send('public homepage')
})

// Example in-memory data-access implementation of user DB
const User = require('./user')

// authentication login
app.post('/auth/login', (req, res) => {
  let {email, password} = req.body

  // Find user and validate password
  let user = User.findBy('email', email)
  let passwordValid = user && bcrypt.compareSync(password, user.passwordHash)
  
  if (!passwordValid) { throw new Error('invalid email or password')}

  // Create json webtoken with user email and id
  let token = jwt.sign({
    id: user.id, 
    email: user.email
  }, SECRET_KEY)

  // Set jwt token in cookie as 'access_token'
  res.cookie('access_token', token, {
    maxAge: 3600, // expires after 1 hr
    httpOnly: true // cannot be modified using XSS or JS
  })

  // Also as API send back token
  res.send({
    message: 'Authenticated! Use this token in your Authorization header as Bearer token',
    token
  })  
})

// logout and clear cookie
app.get('/auth/logout', (req, res) => {
  res.clearCookie('access_token')
  res.send('cookie cleared')
})

// must have token from bearer or cookie to view
app.get('/api/secret', verifyToken, (req, res) => {
  // auth data if verifyToken successful
  let auth = req.auth
  res.json({
    secret: '42',
    auth
  })
})

// must have token as well as be admin
app.get('/api/users', verifyToken, adminRequired, (req, res) => {
  let users = User.list()
  res.send(users)
})

// Simple middleware to verify token from bearer Header or cookie
function verifyToken (req, res, next) {
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

// Simple middleware to check if user admin
// To be used after verifyToken middleware as it sets user email under req.auth
function adminRequired (req, res, next) {
  let auth = req.auth
  let email = auth.email
  let user = User.findBy('email', email)
  let isAdmin = user && user.admin
  if (!isAdmin) {
    return res.status(403).send({
      message: 'Admin only',
      auth
    })
  }
  next()
}


// Boilerplate handle errors
// Catch and send error messages
app.use(function (err, req, res, next) {
  if (err) {
    res.status(422).json({
      error: err.message
    });
  } else {
    next();
  }
});

// 404
app.use(function (req, res) {
  res.status(404).json({
    status: 'Page does not exist'
  });
});

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
})