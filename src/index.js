const Alexa = require('ask-sdk-core');
const provider = require('./provider');
const entities = new (require('html-entities').AllHtmlEntities)();
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const languageStrings = {
  'en': require('./languages/english'),
  'es': require('./languages/spanish')
};

function getLocalizedTrend(trendIndex, requestAttributes) {
  if (trendIndex === 1) {
    return requestAttributes.t('UPWARDS_TREND');
  } else if (trendIndex === -1) {
    return requestAttributes.t('DOWNWARDS_TREND');
  } else if (trendIndex === 0) {
    return requestAttributes.t('STABLE_TREND')
  }
}

const MainIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'LootStatsIntent');
  },

  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    const stats = await provider.accessStats();

    const localizedTrend = getLocalizedTrend(
      stats.currentLoot.trend,
      requestAttributes
    );

    const forecastMessage = entities.decode(
      stats.forecastMessages[requestAttributes.t('GENERIC_LANG')]
    );

    const speechText = requestAttributes.t(
      'MAIN_STATS_MESSAGE',
      stats.lootIndexString,
      localizedTrend,
      forecastMessage
    );

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(
        requestAttributes.t('SKILL_NAME'), 
        speechText)
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
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    const speechText = requestAttributes.t('HELP_MESSAGE');

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(
        requestAttributes.t('SKILL_NAME'),
        speechText)
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
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    const speechText = requestAttributes.t('EXIT_MESSAGE');

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(
        requestAttributes.t('SKILL_NAME'),
        speechText)
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

    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    const speechText = requestAttributes.t('ERROR_MESSAGE')

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // @ts-ignore
    const localizationClient = i18n.use(sprintf).init({
      lng: Alexa.getLocale(handlerInput.requestEnvelope),
      resources: languageStrings,
    });
    localizationClient.localize = function localize() {
      const args = arguments;
      const values = [];
      for (let i = 1; i < args.length; i += 1) {
        values.push(args[i]);
      }
      // @ts-ignore
      const value = i18n.t(args[0], {
        returnObjects: true,
        postProcess: 'sprintf',
        sprintf: values,
      });
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    };
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
      .addRequestInterceptors(LocalizationInterceptor)
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`SKILL RESPONSE ${JSON.stringify(response)}`);

  return response;
};