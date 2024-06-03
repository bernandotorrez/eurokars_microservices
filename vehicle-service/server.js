require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const winston = require('winston');
const { timeDate, logTime } = require('./utils/globalFunction');
const bearerToken = require('express-bearer-token');
const appRoot = require('app-root-path');
const cors = require('cors');
const compression = require('compression');
const httpStatus = require('http-status');
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder: { JSON_V2 } } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const { expressMiddleware } = require('zipkin-instrumentation-express');

// Initialize Zipkin tracer
const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: 'http://egi-javaconfigserver.eurokars.co.id:9411/api/v2/spans',
      jsonEncoder: JSON_V2
    })
  }),
  localServiceName: 'vehicle-service' // Change this to your service name
});

// const jwt = require('jsonwebtoken');

// Middleware
const authMiddleware = require('./middleware/auth');
const proxyMiddleware = require('./middleware/proxy');
const rateLimit = require('./utils/rateLimiter');

// setiap membuat file router baru, silahkan panggil disini
const vehicleRouterV1 = require('./routes/v1/vehicle');

const app = express();

app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(bearerToken());
app.use(cors());

// Use Middleware to all Routes
app.use([proxyMiddleware, rateLimit, expressMiddleware({ tracer }), authMiddleware]);

// wajib saat naik ke production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

if (!process.env.JWT_PRIVATE_KEY) {
  console.error('FATAL ERROR : jwtPrivateKey not set');
  process.exit(1);
}

// setiap ada penambahan Router, inisialisasi index nya disini
app.use('/v1/vehicle', vehicleRouterV1);

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
  // const decoded = jwt.verify(req.header('X-Auth-Token'), process.env.JWT_PRIVATE_KEY);
  if (err.statusCode === 400) {
    res.status(400).json({
      code: 400,
      success: false,
      message: 'Bad Request',
      data: JSON.parse(err.message)
    });
  } else {
    logFile.log({
      level: 'error',
      message: `${err}`,
      httpStatus: `${err.statusCode || httpStatus.INTERNAL_SERVER_ERROR}`,
      ip: `${req.ip}`,
      url: `${req.originalUrl}`,
      method: `${req.method}`,
      timestamp: logTime()
    });

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
