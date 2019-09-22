# JWT Authentication with cookies
How to secure API endpoints using JWT authentication and persist tokens in browser cookies.

## Demo Overview
1. A user validates credentials and receives JWT token which is also persisted in browser cookie under `access_token`
```javascript
POST /auth/login
{
  "email": "howie@email.com",
  "password": "chicken"
}

// Response
{
  "message": "Authenticated! Use this token in your Authorization header as Bearer token",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJmZWxpeEBlbWFpbC5jb20iLCJpYXQiOjE1NjkxMzE3OTZ9.NPYhtxPgFsc8ghjA281Uv4n3XFjuDuBFHQeiVSiWdro"
}

// Also stored in cookie as access_token
```
2. User vists secure API by passing access token as Bearer Header
```javascript
GET /api/secret
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJmZWxpeEBlbWFpbC5jb20iLCJpYXQiOjE1NjkxMzE3OTZ9.NPYhtxPgFsc8ghjA281Uv4n3XFjuDuBFHQeiVSiWdro

// response
{
  "secret": "42",
  "auth": {
    "id": 1,
    "email": "howie@email.com",
    "iat": 1569132038
  }
}
```
3. Also works from browser if user has access_token stored in cookie after login

## Code
Minimum Dependencies
```javascript
  "dependencies": {
    "bcrypt": "^3.0.6", // for hashing user email and passwords
    "cookie-parser": "^1.4.4", // for reading cookies from req.cookies
    "express": "^4.17.1",
    "jsonwebtoken": "^8.5.1", // for signing and verifying jwt
  }
```

### 1. Setup authentication route
Create a POST login authentication route `/auth/login` whose responsibiltiy is to:
- find user and validate if password matches hash in db
- if valid, create token by signing user id and email using JWT
- set token in browser cookie under `access_token`
- return access token in payload
```javascript
const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'jwt_chicken'
const bcrypt = require('bcrypt')
const app = express()

// bodyParser built into express
app.use(express.json())

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

```


### 2. Create verifyToken middleware
Create a middleware to verify token either from cookie or bearer authorization header. Versatile middleware that can be used to verify requests both from browser or an API request.

If invalid it will throw error and pass onto error handler middleware. If valid will append token to `req.token` and jwt payload (id, email) to `req.auth`.

```javascript
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
```

### 3. Create authorization middleware
Add another middleware that comes after verifyToken to check if authenticated user is an authorized admin. Access the user id from the `req.auth` property that would be appended by the verifyToken above.
```javascript
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

```

### 4. Use middleware
Place middleware in between appropriate routes that need to be secured
```javascript
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

```