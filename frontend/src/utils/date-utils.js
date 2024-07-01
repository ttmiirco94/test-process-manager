const moment = require("moment-timezone");

exports.getFormattedIsoDate = (isoString) => {
    const date = new Date(isoString);
    const pad = (number) => number.toString().padStart(2, '0');
    const day = pad(date.getUTCDate());
    const month = pad(date.getUTCMonth() + 1); // Months are zero-indexed
    const year = date.getUTCFullYear();
    const hours = pad(date.getUTCHours() + 2);
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

exports.formatDatabaseDate = (dateString) => {
    let date;

    // Check if the date string is in ISO 8601 format
    if (moment(dateString, moment.ISO_8601, true).isValid()) {
        date = moment(dateString, moment.ISO_8601).utcOffset('+02:00');
    } else {
        // Parse the date string without timezone
        date = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
    }

    // Format the date to "DD.MM.YYYY HH:mm:ss"
    return date.format('DD.MM.YYYY HH:mm:ss');
};