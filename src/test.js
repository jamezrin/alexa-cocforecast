const provider = require('./provider');
const fs = require('fs');
const path = require('path');
const entities = new (require('html-entities').AllHtmlEntities)();

provider.accessStats().then(function(result) {
    const samplePath = path.resolve(__dirname, 'samples/response.json');
    fs.writeFileSync(samplePath, JSON.stringify(result));

    const forecastMessage = entities.decode(result.forecastMessages["spanish"]);
    console.log(forecastMessage);
});
