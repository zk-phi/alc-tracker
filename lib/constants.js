var _properties = PropertiesService.getScriptProperties();

var SLACK_CHANNEL_NAME       = _properties.getProperty("SLACK_CHANNEL_NAME");
var SLACK_VERIFICATION_TOKEN = _properties.getProperty("SLACK_VERIFICATION_TOKEN");
var SLACK_WEBHOOK_URL        = _properties.getProperty("SLACK_WEBHOOK_URL");
var SLACK_ACCESS_TOKEN       = _properties.getProperty("SLACK_ACCESS_TOKEN");
var WEEK_TARGET              = _properties.getProperty("WEEK_TARGET") || 25; /* 25u = 200g */
