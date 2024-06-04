const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');

// Repositories
const statusAppRepository = require('../../repositories/mysql/statusAppRepository');

router.get('/', async (req, res) => {

});

module.exports = router;
