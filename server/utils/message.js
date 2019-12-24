var moment = require('moment');

var generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment().valueOf()
    }
}

var generateLocationMessage = (from, latitude, longitude) => {
    return {
        from,
        url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        createdAt: moment().valueOf()
    }
}
var generateFileMessage = (from, txt) => {
    return {
        from,
        url: `file:///C:/Users/anask/Desktop/${txt}`,
        createdAt: moment().valueOf()
    }
}

module.exports = { generateMessage, generateLocationMessage, generateFileMessage }

