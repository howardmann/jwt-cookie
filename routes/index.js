const express = require('express')
let router = express.Router()

// === AUTH ENDPOINTS ===
const auth = require('../auth')
router
  .post('/auth/login', auth.login)
  .get('/auth/logout', auth.logout)

// === API PAGES ===
const api = require('./api')

router
  .get('/', api.ping)
  .get('/api/secret', auth.verifyToken, api.secret)
  .get('/api/users', auth.verifyToken, auth.adminRequired, api.users)

module.exports = router


