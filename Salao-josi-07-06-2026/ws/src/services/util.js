const moment = require('moment');

const SLOT_DURATION = 30;

const hourToMinutes = (hour) => {
  const [hours, minutes] = String(hour).split(':').map(Number);
  return hours * 60 + minutes;
};

const mergeDateTime = (date, time) => {
  const baseDate = moment(date);
  const baseTime = moment(time);

  return baseDate
    .clone()
    .hour(baseTime.hour())
    .minute(baseTime.minute())
    .second(0)
    .millisecond(0);
};

const sliceMinutes = (start, end, duration = SLOT_DURATION, includeEnd = true) => {
  const slices = [];
  const cursor = moment(start);
  const limit = moment(end);

  while (includeEnd ? cursor <= limit : cursor < limit) {
    slices.push(cursor.format('HH:mm'));
    cursor.add(duration, 'minutes');
  }

  return slices;
};

const splitByValue = (array, value) => {
  const groups = [];
  let group = [];

  for (const item of array) {
    if (item === value) {
      if (group.length) {
        groups.push(group);
        group = [];
      }
    } else {
      group.push(item);
    }
  }

  if (group.length) {
    groups.push(group);
  }

  return groups;
};

const toCents = (value) => Math.round(Number(value || 0) * 100);

const isOpened = async (horarios) => {
  const now = moment();
  const currentDay = now.day();
  const currentMinutes = now.hour() * 60 + now.minute();

  return horarios.some((horario) => {
    const days = horario.dias || [];
    if (!days.includes(currentDay)) {
      return false;
    }

    const start = moment(horario.inicio);
    const end = moment(horario.fim);
    const startMinutes = start.hour() * 60 + start.minute();
    const endMinutes = end.hour() * 60 + end.minute();

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  });
};

module.exports = {
  SLOT_DURATION,
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://ws.salao-josi.com.br:8000'
      : 'http://localhost:8000',
  AWS: {
    bucketURL: 'https://salao-na-mao.s3.amazonaws.com',
  },
  validateEmail: (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  allFields: (obj, keys) => keys.every((key) => {
    const value = obj[key];
    return value !== undefined && value !== null && value !== '' && value.length !== 0;
  }),
  hourToMinutes,
  mergeDateTime,
  sliceMinutes,
  splitByValue,
  toCents,
  isOpened,
};
