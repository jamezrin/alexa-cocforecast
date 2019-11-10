const Alexa = require('ask-sdk-core');
const provider = require('./provider');
const entities = new (require('html-entities').AllHtmlEntities)();

const SKILL_TITLE = "Botín de Clash of Clans";

function createForecastMessage(locale, stats) {
  const lootIndex = stats.lootIndexString;

  if (locale === "es-ES" || locale === "es-MX" || locale === "es-US") {
    const currentTrend = stats.currentLoot.trend === -1 ? "bajando" : "subiendo";
    const forecastMessage = entities.decode(stats.forecastMessages["spanish"]);

    return `
    Bienvenido a Botín de Clash of Clans, el botín está en ${lootIndex} sobre 10 y ${currentTrend}. 
    ${forecastMessage} 
    Visita clashofclansforecaster.com para más información.
    `;
  } else if (locale === "en-US" || locale === "en-GB" ||
    locale === "en-AU" || locale === "en-IN" || locale === "en-CA") {
    const currentTrend = stats.currentLoot.trend === -1 ? "going down" : "going up";
    const forecastMessage = entities.decode(stats.forecastMessages["english"]);

    return `
    Welcome to Clash of Clans Loot Forecaster, currently the loot is at ${lootIndex} out of 10 and ${currentTrend}. 
    ${forecastMessage} 
    Visit clashofclansforecaster.com for more information.
    `;
  } else {
    return `The locale ${locale} is not supported yet`
  }
}

const MainIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'LootStatsIntent');
  },

  async handle(handlerInput) {
    const speechText = createForecastMessage(
      handlerInput.requestEnvelope.request.locale,
      await provider.accessStats()
    );

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = `
    Los datos de esta skill están proporcionados por clashofclansforecaster.com. 
    Puedes ver como funciona esta herramienta visitando su sitio web`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = '¡Hasta luego!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    //any cleanup logic goes here
    console.log(`Session ended: ${handlerInput}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    
    const speechText = "Ha ocurrido un error, por favor inténtalo otra vez"

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

let skill;

exports.handler = async function (event, context) {
  console.log(`SKILL REQUEST ${JSON.stringify(event)}`);

  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        MainIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`SKILL RESPONSE ${JSON.stringify(response)}`);

  return response;
};