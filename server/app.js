const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const {PORT} = require('./config')
const app = express()

// bodyParser built into express
app.use(express.json())
// cookie parser
app.use(cookieParser())
// enable cors for frontend
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:8000', 'http://exultant-meal.surge.sh'],
  credentials: true
}))

app.use(require('./routes'))


// Boilerplate handle errors
// Catch and send error messages
app.use(function (err, req, res, next) {
  if (err) {
    res.status(422).json({
      error: err.message
    });
  } else {
    next()
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