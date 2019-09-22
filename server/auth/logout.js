let logout = (req, res) => {
  res.clearCookie('access_token')
  res.send('cookie cleared')
}

module.exports = logout