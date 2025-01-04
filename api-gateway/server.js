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
const fs = require('fs');
const path = require('path');
const https = require('https');
const { timeDate, logTime } = require('./utils/globalFunction');
const rateLimit = require('./utils/rateLimiter');

// List all Middlewares
const allowedMethodMiddleware = require('./middleware/allowedMethods');

// List all Service
const vehicleServiceV1 = require('./routes/v1/vehicleService');

// WebApp Service
const webAppAuthServiceV1 = require('./routes/v1/webAppService/authenticationService');
const webAppUserServiceV1 = require('./routes/v1/webAppService/userService');
const statusAppUserServiceV1 = require('./routes/v1/webAppService/statusAppService');
const departmentUserServiceV1 = require('./routes/v1/webAppService/departmentService');
const userStatusAppServiceV1 = require('./routes/v1/webAppService/userStatusAppService');
const companyServiceV1 = require('./routes/v1/webAppService/companyService');
const provinceServiceV1 = require('./routes/v1/webAppService/provinceService');
const cityServiceV1 = require('./routes/v1/webAppService/cityService');
const branchServiceV1 = require('./routes/v1/webAppService/branchService');
const bankServiceV1 = require('./routes/v1/webAppService/bankService');
const bankBeneficiaryServiceV1 = require('./routes/v1/webAppService/bankBeneficiaryService');
const brandServiceV1 = require('./routes/v1/webAppService/brandService');
const currencyServiceV1 = require('./routes/v1/webAppService/currencyService');
const divisionServiceV1 = require('./routes/v1/webAppService/divisionService');
const companyBankBeneficiaryServiceV1 = require('./routes/v1/webAppService/companyBankBeneficiaryService');
const vendorBankBeneficiaryServiceV1 = require('./routes/v1/webAppService/vendorBankBeneficiaryService');
const listCompanyBankServiceV1 = require('./routes/v1/webAppService/listCompanyBankService');
const vendorServiceV1 = require('./routes/v1/webAppService/vendorService');
const vendorCompanyServiceV1 = require('./routes/v1/webAppService/vendorCompanyService');
const vendorCompanyDepatmentServiceV1 = require('./routes/v1/webAppService/vendorCompanyDepartmentService');
const headerNavigationServiceV1 = require('./routes/v1/webAppService/headerNavigationService');
const userDivisionServiceV1 = require('./routes/v1/webAppService/userDivisionService');
const counterNumberServiceV1 = require('./routes/v1/webAppService/counterNumberService');
const businessLineServiceV1 = require('./routes/v1/webAppService/businessLineService');
const subBusinessLineOneServiceV1 = require('./routes/v1/webAppService/subBusinessLineOneService');
const subBusinessLineTwoServiceV1 = require('./routes/v1/webAppService/subBusinessLineTwoService');
const companyDetailServiceV1 = require('./routes/v1/webAppService/companyDetailService');
const taxServiceV1 = require('./routes/v1/webAppService/taxService');
const taxDetailServiceV1 = require('./routes/v1/webAppService/taxDetailService');
const userCompanyDetailServiceV1 = require('./routes/v1/webAppService/userCompanyDetailService');
const roleServiceV1 = require('./routes/v1/webAppService/roleService');
const menuGroupV1 = require('./routes/v1/webAppService/menuGroupService');
const menuMenuGroupV1 = require('./routes/v1/webAppService/menuMenuGroupService');
const categoryRfaServiceV1 = require('./routes/v1/webAppService/categoryRfaService');
const userMenuGroupServiceV1 = require('./routes/v1/webAppService/userMenuGroupService');
const userRoleServiceV1 = require('./routes/v1/webAppService/userRoleService');
const rolePermissionServiceV1 = require('./routes/v1/webAppService/rolePermissionService');

const app = express();

// List all Pipeline
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(bearerToken());
app.use(cors({ exposedHeaders: ['Eurokars-Auth-Token', 'Eurokars-Auth-Refresh-Token'] }));
app.use(allowedMethodMiddleware);
app.use(helmet());

// Check JWT_PRIVATE_KEY
if (!process.env.JWT_PRIVATE_KEY) {
  console.error('FATAL ERROR : jwtPrivateKey not set');
  process.exit(1);
}

// List all Routes
app.use('/api-gateway/v1/vehicle', rateLimit, vehicleServiceV1);
// WebApp Service
app.use('/api-gateway/v1/webapp/auth', webAppAuthServiceV1);
app.use('/api-gateway/v1/webapp/user', rateLimit, webAppUserServiceV1);
app.use('/api-gateway/v1/webapp/status-app', rateLimit, statusAppUserServiceV1);
app.use('/api-gateway/v1/webapp/department', rateLimit, departmentUserServiceV1);
app.use('/api-gateway/v1/webapp/user-status-app', rateLimit, userStatusAppServiceV1);
app.use('/api-gateway/v1/webapp/company', rateLimit, companyServiceV1);
app.use('/api-gateway/v1/webapp/province', rateLimit, provinceServiceV1);
app.use('/api-gateway/v1/webapp/city', rateLimit, cityServiceV1);
app.use('/api-gateway/v1/webapp/branch', rateLimit, branchServiceV1);
app.use('/api-gateway/v1/webapp/bank', rateLimit, bankServiceV1);
app.use('/api-gateway/v1/webapp/bank-beneficiary', rateLimit, bankBeneficiaryServiceV1);
app.use('/api-gateway/v1/webapp/brand', rateLimit, brandServiceV1);
app.use('/api-gateway/v1/webapp/currency', rateLimit, currencyServiceV1);
app.use('/api-gateway/v1/webapp/division', rateLimit, divisionServiceV1);
app.use('/api-gateway/v1/webapp/company-bank-beneficiary', rateLimit, companyBankBeneficiaryServiceV1);
app.use('/api-gateway/v1/webapp/vendor-bank-beneficiary', rateLimit, vendorBankBeneficiaryServiceV1);
app.use('/api-gateway/v1/webapp/list-company-bank', rateLimit, listCompanyBankServiceV1);
app.use('/api-gateway/v1/webapp/vendor', rateLimit, vendorServiceV1);
app.use('/api-gateway/v1/webapp/vendor-company', rateLimit, vendorCompanyServiceV1);
app.use('/api-gateway/v1/webapp/vendor-company-department', rateLimit, vendorCompanyDepatmentServiceV1);
app.use('/api-gateway/v1/webapp/header-navigation', rateLimit, headerNavigationServiceV1);
app.use('/api-gateway/v1/webapp/user-division', rateLimit, userDivisionServiceV1);
app.use('/api-gateway/v1/webapp/counter-number', rateLimit, counterNumberServiceV1);
app.use('/api-gateway/v1/webapp/business-line', rateLimit, businessLineServiceV1);
app.use('/api-gateway/v1/webapp/sub-business-line-one', rateLimit, subBusinessLineOneServiceV1);
app.use('/api-gateway/v1/webapp/sub-business-line-two', rateLimit, subBusinessLineTwoServiceV1);
app.use('/api-gateway/v1/webapp/company-detail', rateLimit, companyDetailServiceV1);
app.use('/api-gateway/v1/webapp/tax', rateLimit, taxServiceV1);
app.use('/api-gateway/v1/webapp/tax-detail', rateLimit, taxDetailServiceV1);
app.use('/api-gateway/v1/webapp/user-company-detail', rateLimit, userCompanyDetailServiceV1);
app.use('/api-gateway/v1/webapp/role', rateLimit, roleServiceV1);
app.use('/api-gateway/v1/webapp/menu-group', rateLimit, menuGroupV1);
app.use('/api-gateway/v1/webapp/menu-menu-group', rateLimit, menuMenuGroupV1);
app.use('/api-gateway/v1/webapp/category-rfa', rateLimit, categoryRfaServiceV1);
app.use('/api-gateway/v1/webapp/user-menu-group', rateLimit, userMenuGroupServiceV1);
app.use('/api-gateway/v1/webapp/user-role', rateLimit, userRoleServiceV1);
app.use('/api-gateway/v1/webapp/role-permission', rateLimit, rolePermissionServiceV1);

// Error Handler
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
  if (err.code === 'ECONNREFUSED') { // IF Service Down / Unavailable
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      code: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message || 'Service Unavailable',
      data: null
    });
  } else if (err.response) {
    if (err.response.data.code === 400) { // Bad request
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
