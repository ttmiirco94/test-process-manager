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