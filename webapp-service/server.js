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
const rateLimit = require('./utils/rateLimiter');
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder: { JSON_V2 } } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const { expressMiddleware } = require('zipkin-instrumentation-express');

// Initialize Zipkin tracer
const zipkinTracer = (serviceName) => {
  const tracer = new Tracer({
    ctxImpl: new ExplicitContext(),
    recorder: new BatchRecorder({
      logger: new HttpLogger({
        endpoint: 'http://egi-javaconfigserver.eurokars.co.id:9411/api/v2/spans',
        jsonEncoder: JSON_V2
      })
    }),
    localServiceName: serviceName // Change this to your service name
  });

  return tracer;
};
// const jwt = require('jsonwebtoken');

// Middleware
const proxyMiddleware = require('./middleware/proxy');
const authMiddleware = require('./middleware/auth');

// setiap membuat file router baru, silahkan panggil disini
const authRouterV1 = require('./routes/v1/authenticationRoute');
const userRouterV1 = require('./routes/v1/userRoute');
const statusAppRouterV1 = require('./routes/v1/statusAppRoute');
const departmentRouterV1 = require('./routes/v1/departmentRoute');
const userStatusAppRouterV1 = require('./routes/v1/userStatusAppRoute');
const userDepartmentRouteV1 = require('./routes/v1/userDepartmentRoute');
const companyRouteV1 = require('./routes/v1/companyRoute');

const app = express();

app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(bearerToken());
app.use(cors());
app.use([proxyMiddleware, rateLimit]);

// wajib saat naik ke production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

// Check env JWT_PRIVATE_KEY
if (!process.env.JWT_PRIVATE_KEY) {
  console.error('FATAL ERROR : jwtPrivateKey not set');
  process.exit(1);
}

// setiap ada penambahan Router, inisialisasi index nya disini
app.use('/v1/auth', expressMiddleware({ tracer: zipkinTracer('authentication-service') }), authRouterV1);
app.use('/v1/user', [expressMiddleware({ tracer: zipkinTracer('user-service') }), authMiddleware], userRouterV1);
app.use('/v1/status-app', [expressMiddleware({ tracer: zipkinTracer('status.app-service') }), authMiddleware], statusAppRouterV1);
app.use('/v1/department', [expressMiddleware({ tracer: zipkinTracer('department-service') }), authMiddleware], departmentRouterV1);
app.use('/v1/user-status-app', [expressMiddleware({ tracer: zipkinTracer('user.status.app-service') }), authMiddleware], userStatusAppRouterV1);
app.use('/v1/user-department', [expressMiddleware({ tracer: zipkinTracer('user.department-service') }), authMiddleware], userDepartmentRouteV1);
app.use('/v1/company', [expressMiddleware({ tracer: zipkinTracer('company-service') }), authMiddleware], companyRouteV1);

// Middleware Flow : proxyMiddleware -> rateLimit -> zipkinTracer -> authMiddleware

// error handler
process.on('uncaughtException', (ex) => {
  const logDate = timeDate();
  const fileName = `uncaughtException ${logDate}.log`;
  const logLocation = `${appRoot}/logs/${fileName}`;

  const logFile = winston.createLogger({

    transports: [

      new winston.transports.File({
        filename: logLocation,
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
  const logDate = timeDate();
  const fileName = `unhandledRejection ${logDate}.log`;
  const logLocation = `${appRoot}/logs/${fileName}`;

  const logFile = winston.createLogger({

    transports: [

      new winston.transports.File({
        filename: logLocation,
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

  const logDate = timeDate();
  const fileName = `error ${logDate}.log`;
  const logLocation = `${appRoot}/logs/${fileName}`;

  const logFile = winston.createLogger({

    transports: [
      new winston.transports.File({
        filename: logLocation,
        level: 'error',
        colorize: true,
        prettyPrint: true
      })
    ]
  });

  logFile.log({
    level: 'error',
    message: `${err}`,
    httpStatus: `${err.statusCode || httpStatus.INTERNAL_SERVER_ERROR}`,
    ip: `${req.ip}`,
    url: `${req.originalUrl}`,
    method: `${req.method}`,
    timestamp: logTime()
  });

  // handle bad request
  if (err.statusCode === 400) {
    res.status(err.statusCode).json({
      code: err.statusCode,
      success: false,
      message: 'Bad Request',
      data: JSON.parse(err.message)
    });
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
