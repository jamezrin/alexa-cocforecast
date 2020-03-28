const provider = require('./provider');
const fs = require('fs');
const path = require('path');
const entities = new (require('html-entities').AllHtmlEntities)();

provider.accessStats().then(function(result) {
    const forecastMessage = entities.decode(result.forecastMessages["spanish"]);
    console.log(forecastMessage);
});
