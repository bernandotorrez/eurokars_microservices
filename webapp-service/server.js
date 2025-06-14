require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const winston = require('winston');
const bearerToken = require('express-bearer-token');
const appRoot = require('app-root-path');
const cors = require('cors');
const compression = require('compression');
const httpStatus = require('http-status').status;
const isJson = require('is-json');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { timeDate, logTime } = require('./utils/globalFunction');
// const rateLimit = require('./utils/rateLimiter');
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder: { JSON_V2 } } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const { expressMiddleware } = require('zipkin-instrumentation-express');

const env = process.env.NODE_ENV || 'development';
const envName = env === 'development' ? 'dev' : 'prod';

// Initialize Zipkin tracer
const zipkinTracer = (serviceName) => {
  const tracer = new Tracer({
    ctxImpl: new ExplicitContext(),
    recorder: new BatchRecorder({
      logger: new HttpLogger({
        endpoint: process.env.URL_ZIPKIN,
        jsonEncoder: JSON_V2
      })
    }),
    localServiceName: serviceName // Change this to your service name
  });

  return tracer;
};

// List all Middlewares
const proxyMiddleware = require('./middleware/proxy');
const authMiddleware = require('./middleware/auth');
const allowedMethodMiddleware = require('./middleware/allowedMethods');
const requestlogMiddleware = require('./middleware/requestLog');

// List all File Routes
const authRouterV1 = require('./routes/v1/authenticationRoute');
const userRouterV1 = require('./routes/v1/userRoute');
const statusAppRouterV1 = require('./routes/v1/statusAppRoute');
const departmentRouterV1 = require('./routes/v1/departmentRoute');
const userStatusAppRouterV1 = require('./routes/v1/userStatusAppRoute');
const companyRouteV1 = require('./routes/v1/companyRoute');
const provinceRouteV1 = require('./routes/v1/provinceRoute');
const cityRouteV1 = require('./routes/v1/cityRoute');
const branchRouteV1 = require('./routes/v1/branchRoute');
const bankRouteV1 = require('./routes/v1/bankRoute');
const bankBeneficiaryRouteV1 = require('./routes/v1/bankBeneficiaryRoute');
const brandRouteV1 = require('./routes/v1/brandRoute');
const currencyRouteV1 = require('./routes/v1/currencyRoute');
const divisionRouteV1 = require('./routes/v1/divisionRoute');
const companyBankBeneficiaryRouteV1 = require('./routes/v1/companyBankBeneficiaryRoute');
const vendorBankBeneficiaryRouteV1 = require('./routes/v1/vendorBankBeneficiaryRoute');
const listCompanyBankRouteV1 = require('./routes/v1/listCompanyBankRoute');
const vendorRouteV1 = require('./routes/v1/vendorRoute');
const vendorCompanyRouteV1 = require('./routes/v1/vendorCompanyRoute');
const vendorCompanyDepartmentRouteV1 = require('./routes/v1/vendorCompanyDepartmentRoute');
const headerNavigationmentRouteV1 = require('./routes/v1/headerNavigationRoute');
const userDivisionRouteV1 = require('./routes/v1/userDivisionRoute');
const counterNumberRouteV1 = require('./routes/v1/counterNumberRoute');
const businessLineRouteV1 = require('./routes/v1/businessLineRoute');
const subBusinessLineOneRouteV1 = require('./routes/v1/subBusinessLineOneRoute');
const subBusinessLineTwoRouteV1 = require('./routes/v1/subBusinessLineTwoRoute');
const companyDetailRouteV1 = require('./routes/v1/companyDetailRoute');
const taxRouteV1 = require('./routes/v1/taxRoute');
const taxDetailRouteV1 = require('./routes/v1/taxDetailRoute');
const userCompanyDetailRouteV1 = require('./routes/v1/userCompanyDetailRoute');
const roleRouteV1 = require('./routes/v1/roleRoute');
const menuGroupRouteV1 = require('./routes/v1/menuGroupRoute');
const menuMenuGroupRouteV1 = require('./routes/v1/menuMenuGroupRoute');
const categoryRfaRouteV1 = require('./routes/v1/categoryRfaRoute');
const userMenuGroupRouteV1 = require('./routes/v1/userMenuGroupRoute');
const userRoleRouteV1 = require('./routes/v1/userRoleRoute');
const rolePermissionRouteV1 = require('./routes/v1/rolePermissionRoute');
const coaRouteV1 = require('./routes/v1/coaRoute');
const subCoaRouteV1 = require('./routes/v1/subCoaRoute');
const budgetRouteV1 = require('./routes/v1/budgetRoute');
const categoryBudgetRouteV1 = require('./routes/v1/categoryBudgetRoute');
const configurationRouteV1 = require('./routes/v1/configurationRoute');

const app = express();

// List all Pipeline / Middleware
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(bearerToken());
app.use(cors());
app.use([proxyMiddleware, allowedMethodMiddleware]);
// app.use([allowedMethodMiddleware]);
app.use(helmet());

// Check JWT_PRIVATE_KEY
if (!process.env.JWT_PRIVATE_KEY) {
  console.error('FATAL ERROR : jwtPrivateKey not set');
  process.exit(1);
}

// List all Routes
app.use('/v1/auth', expressMiddleware({ tracer: zipkinTracer('authentication-service.'+envName) }), authRouterV1);
app.use('/v1/user', [expressMiddleware({ tracer: zipkinTracer('user-service.'+envName) })], authMiddleware, userRouterV1);
app.use('/v1/status-app', [expressMiddleware({ tracer: zipkinTracer('status.app-service.'+envName) })], authMiddleware, statusAppRouterV1);
app.use('/v1/department', [expressMiddleware({ tracer: zipkinTracer('department-service.'+envName) })], authMiddleware, departmentRouterV1);
app.use('/v1/user-status-app', [expressMiddleware({ tracer: zipkinTracer('user.status.app-service.'+envName) })], authMiddleware, userStatusAppRouterV1);
app.use('/v1/company', [expressMiddleware({ tracer: zipkinTracer('company-service.'+envName) })], authMiddleware, companyRouteV1);
app.use('/v1/province', [expressMiddleware({ tracer: zipkinTracer('province-service.'+envName) })], authMiddleware, provinceRouteV1);
app.use('/v1/city', [expressMiddleware({ tracer: zipkinTracer('city-service.'+envName) })], authMiddleware, cityRouteV1);
app.use('/v1/branch', [expressMiddleware({ tracer: zipkinTracer('branch-service.'+envName) })], authMiddleware, branchRouteV1);
app.use('/v1/bank', [expressMiddleware({ tracer: zipkinTracer('bank-service.'+envName) })], authMiddleware, bankRouteV1);
app.use('/v1/bank-beneficiary', [expressMiddleware({ tracer: zipkinTracer('bank.beneficiary-service.'+envName) })], authMiddleware, bankBeneficiaryRouteV1);
app.use('/v1/brand', [expressMiddleware({ tracer: zipkinTracer('brand-service.'+envName) })], authMiddleware, brandRouteV1);
app.use('/v1/currency', [expressMiddleware({ tracer: zipkinTracer('currency-service.'+envName) })], authMiddleware, currencyRouteV1);
app.use('/v1/division', [expressMiddleware({ tracer: zipkinTracer('division-service.'+envName) })], authMiddleware, divisionRouteV1);
app.use('/v1/company-bank-beneficiary', [expressMiddleware({ tracer: zipkinTracer('company.bank.beneficiary-service.'+envName) })], authMiddleware, companyBankBeneficiaryRouteV1);
app.use('/v1/vendor-bank-beneficiary', [expressMiddleware({ tracer: zipkinTracer('vendor.bank.beneficiary-service.'+envName) })], authMiddleware, vendorBankBeneficiaryRouteV1);
app.use('/v1/list-company-bank', [expressMiddleware({ tracer: zipkinTracer('list.company.bank-service.'+envName) })], authMiddleware, listCompanyBankRouteV1);
app.use('/v1/vendor', [expressMiddleware({ tracer: zipkinTracer('vendor-service.'+envName) })], authMiddleware, vendorRouteV1);
app.use('/v1/vendor-company', [expressMiddleware({ tracer: zipkinTracer('vendor.company-service.'+envName) })], authMiddleware, vendorCompanyRouteV1);
app.use('/v1/vendor-company-department', [expressMiddleware({ tracer: zipkinTracer('vendor.company.department-service.'+envName) })], authMiddleware, vendorCompanyDepartmentRouteV1);
app.use('/v1/header-navigation', [expressMiddleware({ tracer: zipkinTracer('header.navigation-service.'+envName) })], authMiddleware, headerNavigationmentRouteV1);
app.use('/v1/user-division', [expressMiddleware({ tracer: zipkinTracer('user.division-service.'+envName) })], authMiddleware, userDivisionRouteV1);
app.use('/v1/counter-number', [expressMiddleware({ tracer: zipkinTracer('counter.number-service.'+envName) })], authMiddleware, counterNumberRouteV1);
app.use('/v1/business-line', [expressMiddleware({ tracer: zipkinTracer('business.line-service.'+envName) })], authMiddleware, businessLineRouteV1);
app.use('/v1/sub-business-line-one', [expressMiddleware({ tracer: zipkinTracer('sub.business.line.one-service.'+envName) })], authMiddleware, subBusinessLineOneRouteV1);
app.use('/v1/sub-business-line-two', [expressMiddleware({ tracer: zipkinTracer('sub.business.line.two-service.'+envName) })], authMiddleware, subBusinessLineTwoRouteV1);
app.use('/v1/company-detail', [expressMiddleware({ tracer: zipkinTracer('company.detail-service.'+envName) })], authMiddleware, companyDetailRouteV1);
app.use('/v1/tax', [expressMiddleware({ tracer: zipkinTracer('tax-service.'+envName) })], authMiddleware, taxRouteV1);
app.use('/v1/tax-detail', [expressMiddleware({ tracer: zipkinTracer('tax.detail-service.'+envName) })], authMiddleware, taxDetailRouteV1);
app.use('/v1/user-company-detail', [expressMiddleware({ tracer: zipkinTracer('user.company.detail-service.'+envName) })], authMiddleware, userCompanyDetailRouteV1);
app.use('/v1/role', [expressMiddleware({ tracer: zipkinTracer('role-service.'+envName) })], authMiddleware, roleRouteV1);
app.use('/v1/menu-group', [expressMiddleware({ tracer: zipkinTracer('menu.group-service.'+envName) })], authMiddleware, menuGroupRouteV1);
app.use('/v1/menu-menu-group', [expressMiddleware({ tracer: zipkinTracer('menu.menu.group-service.'+envName) })], authMiddleware, menuMenuGroupRouteV1);
app.use('/v1/category-rfa', [expressMiddleware({ tracer: zipkinTracer('category.rfa-service.'+envName) })], authMiddleware, categoryRfaRouteV1);
app.use('/v1/user-menu-group', [expressMiddleware({ tracer: zipkinTracer('user.menu.group-service.'+envName) })], authMiddleware, userMenuGroupRouteV1);
app.use('/v1/user-role', [expressMiddleware({ tracer: zipkinTracer('user.role-service.'+envName) })], authMiddleware, userRoleRouteV1);
app.use('/v1/role-permission', [expressMiddleware({ tracer: zipkinTracer('role.permission-service.'+envName) })], authMiddleware, rolePermissionRouteV1);
app.use('/v1/coa', [expressMiddleware({ tracer: zipkinTracer('coa-service.'+envName) })], authMiddleware, coaRouteV1);
app.use('/v1/sub-coa', [expressMiddleware({ tracer: zipkinTracer('sub.coa-service.'+envName) })], authMiddleware, subCoaRouteV1);
app.use('/v1/budget', [expressMiddleware({ tracer: zipkinTracer('budget-service.'+envName) })], authMiddleware, budgetRouteV1);
app.use('/v1/category-budget', [expressMiddleware({ tracer: zipkinTracer('category.budget-service.'+envName) })], authMiddleware, categoryBudgetRouteV1);
app.use('/v1/configuration', [expressMiddleware({ tracer: zipkinTracer('configuration-service.'+envName) })], authMiddleware, configurationRouteV1);

// Middleware Flow : proxyMiddleware -> allowedMethodMiddleware -> zipkinTracer -> authMiddleware

// Error Handler
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

  // Error Handler
  if (err.statusCode === 400) {
    let errorMessage = '';

    if (isJson(err.message)) {
      errorMessage = JSON.parse(err.message);
    } else {
      errorMessage = [
        {
          message: err.message,
          field: null
        }
      ];
    }

    res.status(err.statusCode).json({
      code: err.statusCode,
      success: false,
      message: 'Bad Request',
      data: errorMessage
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

if (process.env.IS_USE_HTTPS === 'true') {
  console.log('Server is using HTTPS, please provide .key and .crt for SSL');
  https.createServer({
    key: fs.readFileSync(path.resolve(__dirname, 'development-epp.eurokars.co.id.key')).toString(),
    cert: fs.readFileSync(path.resolve(__dirname, 'development-app.eurokars.co.id.crt')).toString()
  }, app).listen(process.env.PORT, () => {
    console.log('listening on port ' + process.env.PORT);
  });
} else {
  console.log('Server is using HTTP');
  app.listen(process.env.PORT, () => {
    console.log('listening on port ' + process.env.PORT);
  });
}

module.exports = app;
