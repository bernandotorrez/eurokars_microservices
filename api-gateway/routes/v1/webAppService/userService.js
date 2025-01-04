const express = require('express');
require('express-async-errors');
const router = express.Router();

// API Adapter
const apiAdapter = require('../../../utils/apiAdapter.js');
const httpStatus = require('http-status').status;
const { URL_WEBAPP_SERVICE } = process.env;
const api = apiAdapter(URL_WEBAPP_SERVICE);

const route = 'user';

router.get('/', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const user = await api.get(`/v1/${route}`, headers);
  return res.json(user.data);
});

router.get('/self', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const user = await api.get(`/v1/${route}/self`, headers);
  return res.json(user.data);
});

router.post('/reset/pass', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const user = await api.post(`/v1/${route}/reset/pass`, {}, headers);
  return res.json(user.data);
});

router.get('/photo/:size', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';

  const { size } = req.params;

  try {
    const arrayBuffer = await api.get(`https://graph.microsoft.com/v1.0/me/photos/${size}/$value`, {
      responseType: 'arraybuffer',
      headers: { Authorization: accessToken }
    });

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': arrayBuffer.data.length
    });

    return res.send(arrayBuffer.data);
  } catch (error) {
    if (error.response.status === 404) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: 'Image not Set',
        data: null
      });
    } else {
      return res.status(error.response.status).json({
        code: error.response.status,
        success: false,
        message: error.message,
        data: null
      });
    }
  }
});

router.get('/profile', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';

  try {
    const myProfile = await api.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: accessToken }
    });

    const { displayName, jobTitle, mail, officeLocation, id } = myProfile.data;

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'User Found',
      data: {
        display_name: displayName,
        job_title: jobTitle,
        mail,
        office_location: officeLocation,
        id
      }
    });
  } catch (error) {
    if (error.response.status === 404) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: 'User not Found',
        data: null
      });
    } else {
      return res.status(error.response.status).json({
        code: error.response.status,
        success: false,
        message: error.message,
        data: null
      });
    }
  }
});

router.get('/device', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const user = await api.get(`/v1/${route}/device`, headers);
  return res.json(user.data);
});

router.get('/device/token', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';
  const deviceToken = req.header('Eurokars-Device-Token') ?? '';
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken,
      'Eurokars-Device-Token': deviceToken
    }
  };

  const user = await api.get(`/v1/${route}/device/token`, headers);
  return res.json(user.data);
});

router.put('/device/revoke', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const { token } = req.body;

  const user = await api.put(`/v1/${route}/device/revoke`, { token }, headers);

  return res.json(user.data);
});

module.exports = router;
