let User = require('../../data-access/user')

// Simple middleware to check if user admin
// To be used after verifyToken middleware as it sets user email under req.auth
let adminRequired = function(req, res, next) {
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

module.exports = adminRequired