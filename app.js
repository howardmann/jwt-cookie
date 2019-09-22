const express = require('express')
const cookieParser = require('cookie-parser')
const {PORT} = require('./config')
const app = express()

// bodyParser built into express
app.use(express.json())
// cookie parser
app.use(cookieParser())

app.use(require('./routes'))


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

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
})