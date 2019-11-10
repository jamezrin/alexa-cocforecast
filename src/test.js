const provider = require('./provider');
const fs = require('fs');
const entities = new (require('html-entities').AllHtmlEntities)();

provider.accessStats().then(function(result) {
    fs.writeFileSync("samples/response.json", JSON.stringify(result))

    const forecastMessage = entities.decode(result.forecastMessages["spanish"]);
    console.log(forecastMessage)
});
