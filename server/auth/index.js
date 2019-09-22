let auth = module.exports = {}

auth.verifyToken = require('./middleware/verifyToken')
auth.adminRequired = require('./middleware/adminRequired')
auth.login = require('./login')
auth.logout = require('./logout')