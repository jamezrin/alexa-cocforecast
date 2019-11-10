const request = require('request-promise');

async function accessStats() {
    // We first ping this endpoint to let them know we are using it
    // It is not actually needed, but the page periodically hits this url
    // for a reason, probably to know how many users are using it
    await request("http://clashofclansforecaster.com/PAGEHITS.json", { json: true });

    // This returns everything the site offers, with the translated messages 
    // and everything, and the trend (-1 when going down, 1 when going up)
    return await request("http://clashofclansforecaster.com/STATS.json", { json: true });
}

module.exports = { accessStats }
