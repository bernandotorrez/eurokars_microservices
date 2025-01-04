const empty = (field) => {
  return `${slugToText(field)} is not allowed to be Empty`;
};

const charMinMaxLength = (field, min, max) => {
  return `${slugToText(field)} length must be at least ${min} - ${max} characters`;
};

const numericOnly = (field) => {
  return `${slugToText(field)} must only contain numeric characters`;
};

const alphabetOnly = (field) => {
  return `${slugToText(field)} must only contain alphabet characters`;
};

const url = (field) => {
  return `${slugToText(field)} must begin with '/' character`;
};

const fixLength = (field, fix) => {
  return `${slugToText(field)} must be ${fix} characters`;
};

const email = (field) => {
  return `${slugToText(field)} must be a valid email`;
};

const fileMaxSize = (field, size) => {
  return `${slugToText(field)} exceeds the maximum allowed size of ${size}`;
};

const filePdfOnly = (field) => {
  return `${slugToText(field)} must be a pdf file`;
};

const fileImageOnly = (field) => {
  return `${slugToText(field)} must be a jpg, jpeg, png file`;
};

const alphabetAndUrlOnly = (field) => {
  return `${slugToText(field)} must start with / and contain only alphabets`;
};

const slugToText = (field) => {
  const words = (field.indexOf('_') !== -1) ? field.split('_') : field.split(' ');
  let result = '';

  for (let i = 0; i < words.length; i++) {
    result += words[i].charAt(0).toUpperCase() + words[i].substr(1).toLowerCase();
    if (i < words.length - 1) {
      result += ' ';
    }
  }

  return `"${result}"`;
};

module.exports = {
  empty,
  charMinMaxLength,
  numericOnly,
  alphabetOnly,
  url,
  fixLength,
  email,
  fileMaxSize,
  filePdfOnly,
  fileImageOnly,
  alphabetAndUrlOnly,
  slugToText
};
