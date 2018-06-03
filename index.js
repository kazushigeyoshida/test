'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = undefined;
var SKILL_NAME = "ナビ";
var HELP_MESSAGE = "目的地をお探しの時は「検索」と、終わりたい時は「おしまい」と言ってください。どうしますか？";
var HELP_REPROMPT = "どうしますか？";
var STOP_MESSAGE = "安全運転でどうぞ";
var POISEARCH_PROMPT = "何を検索しますか？";
var FOUND_MESSAGE = (num, val) => num + "件の" + val + "が見つかりました";
var NOTFOUND_MESSAGE = "すみません、お探しのものは見つかりませんでした";
var LIST_POI = [
    {
        "id": "PARKING",
        "value": [
            "駐車場", "パーキング"
        ],
        "list": [
            "タイムズ成城駅南", "吉田パーキング第三", "タイムズ成城駅北", "オーエックス成城駅", "タイムズ成城四丁目"       
        ]
    },
    {
        "id": "GASSTATION",
        "value": [
            "給油所", "ガソリンスタンド", "スタンド"
        ],
        "list": [
            "矢島石油", "エッソ成城南", "エネオス砧", "出光狛江世田谷通り店"
        ]
    }
];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('POISearchIntent');
    },
    'POISearchIntent': function () {
        var speechOutput = NOTFOUND_MESSAGE;
        var screenOutput = "";
        const intentObj = this.event.request.intent;
        var indexValue = -1;
        if (intentObj.slots.fromPIOtype.value) {
            // POI type was specified
            var value = intentObj.slots.fromPIOtype.value;
            LIST_POI.find( spot => {    //Q: Can't I get 'id' of type value instead of .find?
                indexValue = spot.value.indexOf(value);
                if (indexValue >= 0) {
                    // use the same POI word what user asked for better usability
                    speechOutput= FOUND_MESSAGE(spot.list.length, spot.value[indexValue]);
                    // generate mock result, ignore Searchtype
                    var n = 1;
                    spot.list.forEach(poi => {
                        screenOutput += "[" + n + "] " + poi + "\n";
                        n++;
                    });
                    return true;
                }
            });
            this.emit(':tellWithCard', speechOutput, SKILL_NAME, screenOutput);
        } else {
            // POI type was not specified, ask user again
            this.emit(':ask', POISEARCH_PROMPT);
        }
    },
    // may be next step is to add "Set destination" intent, which includes use of POI search result
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'SessionEndedRequest': function () {
        // Nothing to do
    }
};
