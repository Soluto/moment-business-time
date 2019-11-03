var moment = require('moment'),
    minimatch = require('minimatch');

var localeData = require('../locale/default');
moment.updateLocale(moment.locale(), localeData);

function getLocaleData(key) {
    return moment.localeData()['_' + key];
}

function createMomentFromTimeString(d, timeString) {
    const times = timeString.split(':');
    var _d = d.clone();
    _d.hours(times[0]);
    _d.minutes(times[1] || 0);
    _d.seconds(times[2] || 0);
    _d.milliseconds(0);
    return _d;
}

function openingTimes(d) {
    d = d.clone();
    var hours = getLocaleData('workinghours');
    if (!d.isWorkingDay()) {
        return null;
    }
    const result =  hours[d.day()].map(function (openingHours) {
        if(typeof(openingHours) === 'object') {
            const timeResult = openingHours.map(function (time) {
                return createMomentFromTimeString(d, time);
            })
            return timeResult;
        } else if(typeof(openingHours) === 'string') {
            return createMomentFromTimeString(d, openingHours);
        }
    });
    return result;
}

moment.fn.isBusinessDay = function isBusinessDay() {
    var hours = getLocaleData('workinghours');
    return !!hours[this.day()] && !this.isHoliday();
};
moment.fn.isWorkingDay = moment.fn.isBusinessDay;

moment.fn.isWorkingTime = function isWorkingTime() {
    var openinghours = openingTimes(this);
    if (!openinghours) {
        return false;
    } else {
        if(Array.isArray(openinghours[0])) {
            return openinghours.some(hours => {
                return this.isSameOrAfter(hours[0]) && this.isSameOrBefore(hours[1]);
            })
        } else {
            return this.isSameOrAfter(openinghours[0]) && this.isSameOrBefore(openinghours[1]);
        }
    }
};

moment.fn.isHoliday = function isHoliday() {
    var isHoliday = false,
        today = this.format('YYYY-MM-DD');
    getLocaleData('holidays').forEach(function (holiday) {
        if (minimatch(today, holiday)) {
            isHoliday = true;
        }
    });
    return isHoliday;
};

moment.fn.nextWorkingDay = function nextWorkingDay() {
    var d = this.clone();
    d = d.add(1, 'day');
    while (!d.isWorkingDay()) {
        d = d.add(1, 'day');
    }
    return d;
};

moment.fn.lastWorkingDay = function lastWorkingDay() {
    var d = this.clone();
    d = d.subtract(1, 'day');
    while (!d.isWorkingDay()) {
        d = d.subtract(1, 'day');
    }
    return d;
};

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}

var daysMap = {sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6};

function parseWorkingHours(workingHours) {
    var hours = {};
    for (var key in workingHours) {
        hours[daysMap[key.toLowerCase()]] = workingHours[key];
    }
    return hours;
}

moment.fn.isWorkingByConfig = function isWorkingByConfig(workingHours) {
    try {
        if (isEmptyObject(workingHours)) {
            return true;
        }

        const localeName = `en-outOfHours`;
        if (!moment.localeData(localeName)) {
            moment.defineLocale(localeName, {
                parentLocale: 'en',
            });
        }

        moment.updateLocale(localeName, {
            workinghours: parseWorkingHours(workingHours),
            holidays: [],
        });

        // Use Date class to take DST in consideration.
        const localMoment = moment(new Date(new Date().toLocaleString('en-US', {timeZone: workingHours.tz})));
        localMoment.locale(localeName);

        return localMoment.isWorkingTime();

    } catch (e) {
        throw Error('failed parsing working hours. error:' + e)
    }
};

module.exports = moment;
