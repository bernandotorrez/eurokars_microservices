const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { createClient } = require('redis'); // Import createClient
const httpStatus = require('http-status').status;

// Create a Redis client
const redisClient = createClient({
    socket: {
        host: process.env.REDIS_SERVER,
        port: process.env.REDIS_PORT,
    },
    username: process.env.REDIS_USER, // If Redis ACL is enabled and requires a username
    password: process.env.REDIS_PASS,
});

// Connect the Redis client
redisClient.connect()
    .then(() => {
        console.log('Connected to Redis');
    })
    .catch(err => {
        console.error('Redis Client Connection Error', err);
    });

// Configure the rate limiter
const limiter = rateLimit({
    store: new RedisStore.RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args), // Correctly use sendCommand
    }),
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        code: httpStatus.TOO_MANY_REQUESTS,
        success: false,
        message: httpStatus[`${httpStatus.TOO_MANY_REQUESTS}_NAME`],
        data: null,
    },
});

module.exports = limiter;
