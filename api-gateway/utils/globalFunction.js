const moment = require('moment');

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

  const login_time = `${day} ${month} ${year} ${hour}:${minute}:${second}`;

  return login_time;
};

const timeDate = () => {
  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const day = currentDate.getDate();
  const month = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const date = `${day}-${month}-${year}`;

  return date;
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

  const time_his = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  return time_his;
};

const logTime = () => {
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const log_time = `${day}-${month}-${year} ${hour}:${minute}:${second}`;

  return log_time;
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

const objectToQueryString = (obj) => {
  let str = '';
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      for (const subKey in obj[key]) {
        str += `${key}[${subKey}]=${obj[key][subKey]}&`;
      }
    } else {
      str += `${key}=${obj[key]}&`;
    }
  }

  str = str.slice(0, -1);
  return str;
};

module.exports = {
  time,
  timeHis,
  capitalEachWord,
  logTime,
  checkNull,
  checkNullStart,
  checkDate,
  timeDate,
  objectToQueryString
};
