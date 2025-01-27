const moment = require('moment');
const crypto = require('crypto');

const time = () => {
  const date = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const loginTime = `${day} ${month} ${year} ${hour}:${minute}:${second}`;

  return loginTime;
};

const timeDate = () => {
  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const day = currentDate.getDate();
  const month = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const timeDate = `${day}-${month}-${year}`;

  return timeDate;
};

const checkNull = (value) => {
  if (!value || value === '' || value == null) {
    return '-';
  } else {
    return value;
  }
};

const checkNullStart = (value) => {
  if (!value || value === '' || value == null || value === 0) {
    return '-';
  } else {
    return value;
  }
};

const timeHis = () => {
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const timeHis = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  return timeHis;
};

const logTime = () => {
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const logTime = `${day}-${month}-${year} ${hour}:${minute}:${second}`;

  return logTime;
};

const capitalEachWord = (letter) => {
  const callback = letter.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');

  return callback;
};

const checkDate = (value) => {
  let newDate;
  if (moment(value, 'DD-MM-YYYY', true).isValid() || moment(value, 'D-MM-YYYY', true).isValid()) {
    newDate = value.split('-').reverse().join('-');
  } else if (moment(value, 'DD/MM/YYYY', true).isValid() || moment(value, 'D/MM/YYYY', true).isValid()) {
    newDate = value.split('/').reverse().join('-');
  } else {
    newDate = value;
  }

  return newDate;
};

const convertMessage = (messages) => {
  const data = [];

  messages.forEach((row) => {
    data.push({
      message: row.message,
      field: row.path[0]
    });
  });

  return data;
};

function objectToQueryString (obj) {
  return Object.keys(obj).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`).join('&');
}

function capitalizeWords (str) {
  return str.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

// Function to encode bytes to base64url format
function base64URLEncode (buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generatePkcePair () {
  const verifier = crypto.randomBytes(32).toString('hex');
  let challenge = crypto.createHash('sha256').update(verifier).digest('base64');
  challenge = challenge.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return { verifier, challenge };
}

module.exports = {
  time,
  timeHis,
  capitalEachWord,
  logTime,
  checkNull,
  checkNullStart,
  checkDate,
  timeDate,
  convertMessage,
  objectToQueryString,
  capitalizeWords,
  base64URLEncode,
  generatePkcePair
};
