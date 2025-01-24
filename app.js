const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const logger = require('morgan');
const helmet = require("helmet");
const compression = require('compression')
const cors = require("cors")

const apiRouter = require('./routes/api');
const schedule = require('node-schedule');
const app = express();

app.use(cors());
app.use(compression())
app.use(helmet())

// const { runningSchedule } = require('./util/util')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send({
    status: 'success',
    apiHealth: 'healthy'
  })
});
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// run in midnight
// const scheduleMidnight = schedule.scheduleJob('0 0 * * *', async () => {
//   const result = await runningSchedule() ? 'success running midnight schedule' : 'failed running midnight schedule'
//   console.log(result)
// });

// run in noon
// const scheduleNoon = schedule.scheduleJob('0 12 * * *', async () => {
//   const result = await runningSchedule() ? 'success running noon schedule' : 'failed running noon schedule'
//   console.log(result)
// });


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
