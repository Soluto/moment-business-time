var MockDate = require('mockdate');
var moment = require('../lib/business-hours');
var localeData = require('../locale/default');

describe('moment.business-hours', function () {
  var now = '2015-02-26T10:12:34',
    weekend = '2015-02-28T10:13:00';

  var date = 'YYYY-MM-DD',
    time = 'HH:mm:ss.SSS',
    full = date + ' ' + time;

  beforeEach(function () {
    moment.locale('en');
  });

  afterEach(function () {
    moment.locale('en', localeData);
  });


  describe('isWorkingDay', function () {
    it('returns false on weekends by default', function () {
      moment(weekend).isWorkingDay().should.be.false;
    });

    it('returns true on weekdays by default', function () {
      moment(now).isWorkingDay().should.be.true;
    });
  });

  describe('isWorkingTime', function () {
    it('returns false on weekends by default', function () {
      moment(weekend).isWorkingTime().should.be.false;
    });

    it('returns true on weekdays by default', function () {
      moment(now).isWorkingTime().should.be.true;
    });

    it('considers working time inclusive', function () {
      moment.locale('en', {
        workinghours: {
          0: null,
          1: [['09:00:00', '17:00:00']],
          2: [['09:00:00', '17:00:00']],
          3: [['09:00:00', '17:00:00']],
          4: [['09:00:00', '17:00:00']],
          5: [['09:00:00', '17:00:00']],
          6: null
        }
      });

      moment('2017-06-26 09:00:00').isWorkingTime().should.be.true;
      moment('2017-06-26 17:00:00').isWorkingTime().should.be.true;
    });

    it('returns false when not in working hours and working time inclusive', function () {
      moment.locale('en', {
        workinghours: {
          0: null,
          1: [['07:00:00', '08:00:00']],
          2: [['10:00:00', '11:00:00']],
          3: [['09:00:00', '17:00:00']],
          4: [['14:00:00', '17:00:00']],
          5: [['09:00:00', '10:00:00']],
          6: ['11:00:00', '14:00:00']
        }
      });

      moment('2017-06-18 09:00:00').isWorkingTime().should.be.false;
      moment('2017-06-19 09:00:00').isWorkingTime().should.be.false;
      moment('2017-06-20 14:00:00').isWorkingTime().should.be.false;
      moment('2017-06-21 08:00:00').isWorkingTime().should.be.false;
      moment('2017-06-22 13:00:00').isWorkingTime().should.be.false;
      moment('2017-06-23 11:00:00').isWorkingTime().should.be.false;
      moment('2017-06-24 17:00:00').isWorkingTime().should.be.false;
    });

    it('returns true when working time inclusive and had multiple times range', function () {
      moment.locale('en', {
        workinghours: {
          0: null,
          1: [['07:00:00', '08:00:00'], ['10:00:00', '14:00:00'], ['17:00:00', '18:00:00']],
          2: null,
          3: null,
          4: null,
          5: null,
          6: null
        }
      });

      moment('2017-06-19 07:00:00').isWorkingTime().should.be.true;
      moment('2017-06-19 08:00:00').isWorkingTime().should.be.true;
      moment('2017-06-19 10:00:00').isWorkingTime().should.be.true;
      moment('2017-06-19 14:00:00').isWorkingTime().should.be.true;
      moment('2017-06-19 17:00:00').isWorkingTime().should.be.true;
      moment('2017-06-19 18:00:00').isWorkingTime().should.be.true;
    });

    it('returns false when working time inclusive and had multiple times range', function () {
      moment.locale('en', {
        workinghours: {
          0: null,
          1: [['07:00:00', '08:00:00'], ['10:00:00', '14:00:00'], ['17:00:00', '18:00:00']],
          2: null,
          3: null,
          4: null,
          5: null,
          6: null
        }
      });

      moment('2017-06-19 06:59:59').isWorkingTime().should.be.false;
      moment('2017-06-19 08:00:01').isWorkingTime().should.be.false;
      moment('2017-06-19 09:59:59').isWorkingTime().should.be.false;
      moment('2017-06-19 14:00:01').isWorkingTime().should.be.false;
      moment('2017-06-19 16:59:59').isWorkingTime().should.be.false;
      moment('2017-06-19 18:00:01').isWorkingTime().should.be.false;
    });
  });

  describe('modified locales', function () {
    it('handles different working days', function () {
      moment.locale('en', {
        workinghours: {
          0: ['09:30:00', '17:00:00'],
          1: ['09:30:00', '17:00:00'],
          2: ['09:30:00', '17:00:00'],
          3: ['09:30:00', '17:00:00'],
          4: ['09:30:00', '17:00:00'],
          5: null,
          6: null
        }
      });
      var fridayAfternoon = moment('2015-02-27T16:00:00'),
        sundayMorning = moment('2015-03-01T10:00:00');
      fridayAfternoon.isWorkingTime().should.be.false;
      fridayAfternoon.isWorkingDay().should.be.false;
      sundayMorning.isWorkingTime().should.be.true;
      sundayMorning.isWorkingDay().should.be.true;
      sundayMorning.lastWorkingDay().format(date).should.equal('2015-02-26'); //thursday
    });
  });

  describe('holidays', function () {
    beforeEach(function () {
      moment.locale('en');
      moment.locale('en', {
        holidays: [
          '2015-02-27',
          '*-12-25'
        ]
      });
    });

    afterEach(function () {
      moment.locale('en', {
        holidays: []
      });
    });

    it('does not count holidays as working days', function () {
      moment('2015-02-27').isWorkingDay().should.be.false;
    });

    it('supports holidays as wildcards', function () {
      moment('2015-12-25').isWorkingDay().should.be.false;
      moment('2016-12-25').isWorkingDay().should.be.false;
      moment('2017-12-25').isWorkingDay().should.be.false;
      moment('2018-12-25').isWorkingDay().should.be.false;
      moment('2019-12-25').isWorkingDay().should.be.false;
    });
  });

  describe('isWorkingByConfig', function () {
    var openOnSundayMorning = {
      tz: "America/Chicago",
      sun: ["06:00", "22:59:59"],
      mon: ["06:00", "22:59:59"],
      tue: ["06:00", "22:59:59"],
      wed: ["06:00", "22:59:59"],
      thu: ["06:00", "22:59:59"],
      fri: ["06:00", "22:59:59"],
      sat: ["06:00", "22:59:59"]
    };

    var closedOnSundayMorning = {
      tz: "America/Chicago",
      sun: ["16:00", "22:59:59"],
      mon: ["06:00", "22:59:59"],
      tue: ["06:00", "22:59:59"],
      wed: ["06:00", "22:59:59"],
      thu: ["06:00", "22:59:59"],
      fri: ["06:00", "22:59:59"],
      sat: ["06:00", "22:59:59"]
    };

    // We are mocking a Chicago Sunday morning at 6:38 AM
    MockDate.set(new Date('2019-11-03T14:38:52.425'));

    it('should return true for empty config', function () {
        moment().isWorkingByConfig({}).should.be.true;
    });

    it('should be working now', function () {
        moment().isWorkingByConfig(openOnSundayMorning).should.be.true;
    });

    it('should not be working now', function () {
      moment().isWorkingByConfig(closedOnSundayMorning).should.be.false;
    });
  });
});
