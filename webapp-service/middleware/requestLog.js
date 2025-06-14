const appRoot = require('app-root-path');
const winston = require('winston');
const { timeDate, logTime } = require('../utils/globalFunction');

// Repositories
const requestLogRepository = require('../repositories/mysql/requestLogRepository');

const requestLog = async (req, res, next) => {
  const headers = Object.keys(req.headers).reduce((acc, key) => ({ ...acc, [key]: req.headers[key] }), {});
  const body = req.body;

  try {
    // Log to winston
    // const logDate = timeDate();
    // const fileName = `requests ${logDate}.log`;
    // const logLocation = `${appRoot}/request_logs/${fileName}`;

    // const logFile = winston.createLogger({
    //   transports: [
    //     new winston.transports.File({
    //       filename: logLocation,
    //       level: 'info',
    //       colorize: true,
    //       prettyPrint: true
    //     })
    //   ]
    // });

    // logFile.log({
    //   level: 'info',
    //   message: `${req.method} ${req.originalUrl}`,
    //   headers: req.headers,
    //   body: req.body,
    //   ip: req.ip,
    //   timestamp: logTime(),
    //   user_agent: req.headers['user-agent']
    // });

    const params = {
      method: req.method,
      url: req.originalUrl,
      headers,
      body,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    }

    // Insert to DB
    await requestLogRepository.create(params);

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requestLog;
