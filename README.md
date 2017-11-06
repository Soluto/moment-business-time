# moment-business-time

Query and manipulate moment objects within the scope of business/working hours.

## Install

```
npm install [--save] moment-business-time
```

## Methods


### `moment#isWorkingDay`

Returns: `Boolean`

Determines if the day of the current instance is a working day. Working days are defined as any day with working hours in the current locale.

#### Example:
```javascript
moment('2015-02-27').isWorkingDay();
// true
moment('2015-02-28').isWorkingDay();
// false
```

### `moment#isWorkingTime`

Returns: `Boolean`

Determines if the day and time of the current instance corresponds to during business hours as defined by the currnet locale.

#### Example:
```javascript
moment('2015-02-27T15:00:00').isWorkingTime();
// true
moment('2015-02-27T20:00:00').isWorkingTime();
// false
```

### `moment#nextWorkingDay`

Returns: `moment`

Returns a new moment representing the next day considered to be a working day. The hours/minutes/seconds will be as for the source moment.

#### Example:
```javascript
moment('2015-02-28T10:00:00Z').nextWorkingDay();
// Mon Mar 02 2015 10:00:00 GMT+0000
moment('2015-02-28T20:00:00Z').nextWorkingDay();
// Mon Mar 02 2015 20:00:00 GMT+0000
```

### `moment#nextWorkingTime`

Returns: `moment`

Returns a new moment representing the start of the next day considered to be a working day.

#### Example:
```javascript
moment('2015-02-28T10:00:00Z').nextWorkingTime();
// Mon Mar 02 2015 09:00:00 GMT+0000
moment('2015-02-28T20:00:00Z').nextWorkingTime();
// Mon Mar 02 2015 09:00:00 GMT+0000
```

### `moment#lastWorkingDay`

Returns: `moment`

Returns a new moment representing the previous day considered to be a working day. The hours/minutes/seconds will be as for the source moment.

#### Example:
```javascript
moment('2015-02-28T10:00:00Z').lastWorkingDay();
// Fri Feb 27 2015 10:00:00 GMT+0000
moment('2015-02-28T20:00:00Z').lastWorkingDay();
// Fri Feb 27 2015 20:00:00 GMT+0000
```

### `moment#lastWorkingTime`

Returns: `moment`

Returns a new moment representing the end of the previous day considered to be a working day.

#### Example:
```javascript
moment('2015-02-28T10:00:00Z').lastWorkingTime();
// Fri Feb 27 2015 17:00:00 GMT+0000
moment('2015-02-28T20:00:00Z').lastWorkingTime();
// Fri Feb 27 2015 17:00:00 GMT+0000
```

## Configuration

### Working hours

The working hours used for a locale can be modified using moment's `locale` method. The default working hours are 09:00-17:00, Mon-Fri.

Example:

```javascript
// set opening time to 09:30 and close early on Wednesdays
moment.locale('en', {
    workinghours: {
        0: null,
        1: [['09:30:00', '17:00:00'], ['19:00:00', '21:00:00']],  // multiple range for a single day
        2: ['09:30:00', '17:00:00'],
        3: ['09:30:00', '13:00:00'],
        4: ['09:30:00', '17:00:00'],
        5: ['09:30:00', '17:00:00'],
        6: null
    }
});
moment('Wed Feb 25 2015 15:00:00 GMT+0000').isWorkingTime() // false
moment('Mon Feb 23 2015 09:00:00 GMT+0000').isWorkingTime() // false
```

### Holidays

Holidays which should not be considered as working days can be configured by passing them as locale information.

Example:

```javascript
moment.locale('en', {
    holidays: [
        '2015-05-04'
    ]
});
moment('2015-05-04').isWorkingDay() // false
```

Recurring holidays can also be set with wildcard parameters.

```javascript
moment.locale('en', {
    holidays: [
        '*-12-25'
    ]
});
moment('2015-12-25').isWorkingDay() // false
moment('2016-12-25').isWorkingDay() // false
moment('2017-12-25').isWorkingDay() // false
moment('2018-12-25').isWorkingDay() // false
```

## Running tests

```
npm test
```
