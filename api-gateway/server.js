require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const winston = require('winston');
const bearerToken = require('express-bearer-token');
const appRoot = require('app-root-path');
const cors = require('cors');
const compression = require('compression');
const httpStatus = require('http-status');
const { timeDate, logTime } = require('./utils/globalFunction');

// const jwt = require('jsonwebtoken');
// const authMiddleware = require('./middleware/auth');

// setiap membuat file router baru, silahkan panggil disini
const vehicleRouterV1 = require('./routes/v1/vehicleService');

// WebApp Service
const webAppAuthRouterV1 = require('./routes/v1/webAppService/authenticationService');
const webAppUserRouterV1 = require('./routes/v1/webAppService/userService');
const statusAppUserRouterV1 = require('./routes/v1/webAppService/statusAppService');
const departmentUserRouterV1 = require('./routes/v1/webAppService/departmentService');

const app = express();

app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(bearerToken());
app.use(cors({ exposedHeaders: ['Eurokars-Auth-Token', 'Eurokars-Auth-Refresh-Token'] }));

// Use Middleware to all Routes
// app.use(authMiddleware);

// wajib saat naik ke production
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

if (!process.env.JWT_PRIVATE_KEY) {
  console.error('FATAL ERROR : jwtPrivateKey not set');
  process.exit(1);
}

// setiap ada penambahan Router, inisialisasi index nya disini
app.use('/api-gateway/v1/vehicle', vehicleRouterV1);
// WebApp Service
app.use('/api-gateway/v1/webapp/auth', webAppAuthRouterV1);
app.use('/api-gateway/v1/webapp/user', webAppUserRouterV1);
app.use('/api-gateway/v1/webapp/status-app', statusAppUserRouterV1);
app.use('/api-gateway/v1/webapp/department', departmentUserRouterV1);

// error handler
process.on('uncaughtException', (ex) => {
  const log_date = timeDate();
  const file_name = `uncaughtException ${log_date}.log`;
  const log_location = `${appRoot}/logs/${file_name}`;

  const logFile = winston.createLogger({

    transports: [

      new winston.transports.File({
        filename: log_location,
        level: 'error',
        colorize: true,
        prettyPrint: true
      })
    ]
  });

  logFile.log({
    level: 'error',
    message: `uncaughtException : ${ex.message}`,
    timestamp: logTime()
  });

  console.log(ex);

  process.exit(1);
});

process.on('unhandledRejection', (ex) => {
  const log_date = timeDate();
  const file_name = `unhandledRejection ${log_date}.log`;
  const log_location = `${appRoot}/logs/${file_name}`;

  const logFile = winston.createLogger({

    transports: [

      new winston.transports.File({
        filename: log_location,
        level: 'error',
        colorize: true,
        prettyPrint: true
      })
    ]
  });

  logFile.log({
    level: 'error',
    message: `unhandledRejection : ${ex}`,
    timestamp: logTime()
  });

  console.log(ex);

  process.exit(1);
});

app.use(function (req, res, next) {
  res.status(httpStatus.NOT_FOUND).json({
    code: httpStatus.NOT_FOUND,
    success: false,
    message: httpStatus[`${httpStatus.NOT_FOUND}_NAME`],
    data: null
  });
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env').trim() === 'development' ? err : {};

  const log_date = timeDate();
  const file_name = `error ${log_date}.log`;
  const log_location = `${appRoot}/logs/${file_name}`;

  const logFile = winston.createLogger({

    transports: [

      new winston.transports.File({
        filename: log_location,
        level: 'error',
        colorize: true,
        prettyPrint: true
      })
    ]
  });

  // uncomment when use JWT
  // const decoded = jwt.verify(req.header('Eurokars-Auth-Token'), process.env.JWT_PRIVATE_KEY);

  logFile.log({
    level: 'error',
    message: `${err}`,
    httpStatus: `${err.statusCode || httpStatus.INTERNAL_SERVER_ERROR}`,
    ip: `${req.ip}`,
    url: `${req.originalUrl}`,
    method: `${req.method}`,
    // email: `${decoded._email}`,
    timestamp: logTime()
  });

  // render the error page
  // handle bad request
  if (err.code === 'ECONNREFUSED') { // IF Service Down / Unavailable
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      code: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message || 'Service Unavailable',
      data: null
    });
  } else if (err.response) {
    if (err.response.data.code === 400) {
      res.status(400).json({
        code: 400,
        success: false,
        message: 'Bad Request',
        data: err.response.data.data
      });
    } else {
      res.status(err.response.data.code || httpStatus.INTERNAL_SERVER_ERROR).json({
        code: err.response.data.code || httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: err.response.data.message || httpStatus[`${httpStatus.INTERNAL_SERVER_ERROR}_NAME`],
        data: null
      });
    }
  } else {
    res.status(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      code: err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message || httpStatus[`${httpStatus.INTERNAL_SERVER_ERROR}_NAME`],
      data: null
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log('listening on port ' + process.env.PORT);
});

module.exports = app;
