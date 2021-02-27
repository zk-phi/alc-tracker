function initialize () {
    initializeSheet();
    postToSlack("Initialization succeeded.");
}

function _postSummary (title, rowNum, action) {
    var summary = getSummary(rowNum);

    var blocks = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: title
            }
        }, {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "You had " + approx(summary.sum) + " units of alcohol (" + summary.date + ")."
            }
        }
    ].concat(
        summary.history.map(function (e) {
            return _formatHistoryItem(e.abv, e.vol, rowNum + "," + e.ix)
        })
    );

    if (action) {
        blocks.push({
            type: "actions",
            elements: [{
                type: "button",
                text: { type: "plain_text", text: "Add more reports for the day" },
                action_id: "add",
                value: rowNum + ""
            }]
        });
    }

    blocks.push({
        type: "section",
        text: {
            type: "mrkdwn",
            text: "Remaining quota: " + approx(summary.limit - summary.consumed) + " units."
        }
    });

    postToSlack("", blocks);
}

function _formatHistoryItem (abv, vol, actionTarget) {
    var str = "- ABV: " + abv + "%, VOL: " + vol + "ml = " + approx(abv * vol / 1000) + " in units";
    var block = {
        type: "section",
        text: { type: "mrkdwn", text: str }
    };
    if (actionTarget) {
        block.accessory = {
            type: "button",
            text: { type: "plain_text", text: ":pencil2:", emoji: true },
            action_id: "edit",
            value: actionTarget
        };
    }
    return block;
}

function _addReportWithDialog (rowNum, triggerId) {
    openSlackModal(triggerId, {
        type: "modal",
        title: { type: "plain_text", text: "Add Report" },
        callback_id: "add",
        private_metadata: rowNum + "",
        submit: { type: "plain_text", text: "Save" },
        close: { type: "plain_text", text: "Close" },
        blocks: [
            {
                type: "input",
                element: {
                    type: "plain_text_input",
                    initial_value: "0",
                    action_id: "abv_value"
                },
                label: { type: "plain_text", text: "ABV(%)" },
                block_id: "abv"
            }, {
                type: "input",
                element: {
                    type: "plain_text_input",
                    initial_value: "0",
                    action_id: "vol_value"
                },
                label: { type: "plain_text", text: "Volume(ml)" },
                block_id: "vol"
            }
        ]
    });

    return ContentService.createTextOutput("");
}

function doActionAdd (params) {
    return _addReportWithDialog(params.actions[0].value, params.trigger_id);
}

function doShortcutAdd (params) {
    return _addReportWithDialog(2, params.trigger_id);
}

function doSubmitAdd (params) {
    var rowNum = Number(params.view.private_metadata);

    var abv = Number(params.view.state.values.abv.abv_value.value);
    var vol = Number(params.view.state.values.vol.vol_value.value);
    var item = addToHistory(rowNum, abv, vol);

    _postSummary("Report added!", rowNum, true);

    return ContentService.createTextOutput("");
}

function doActionEdit (params) {
    var strId = params.actions[0].value;

    var id = strId.split(",");
    var value = getHistoryItem(id[0], id[1]);

    openSlackModal(params.trigger_id, {
        type: "modal",
        title: { type: "plain_text", text: "Edit Report" },
        callback_id: "edit",
        private_metadata: strId,
        submit: { type: "plain_text", text: "Save" },
        close: { type: "plain_text", text: "Close" },
        blocks: [
            {
                type: "input",
                element: {
                    type: "plain_text_input",
                    initial_value: value.abv + "",
                    action_id: "abv_value"
                },
                label: { type: "plain_text", text: "ABV(%)" },
                block_id: "abv"
            }, {
                type: "input",
                element: {
                    type: "plain_text_input",
                    initial_value: value.vol + "",
                    action_id: "vol_value"
                },
                label: { type: "plain_text", text: "Volume(ml)" },
                block_id: "vol"
            }, {
                type: "divider"
            }, {
                type: "section",
                text: { type: "mrkdwn", text: "Delete report" },
                accessory: {
                    type: "button",
                    text: { type: "plain_text", text: "Delete" },
                    style: "danger",
                    action_id: "delete",
                    value: strId
                }
            }
        ]
    });

    return ContentService.createTextOutput("");
}

function doSubmitEdit (params) {
    var strId = params.view.private_metadata;

    var abv = Number(params.view.state.values.abv.abv_value.value);
    var vol = Number(params.view.state.values.vol.vol_value.value);
    var id = strId.split(",");
    updateHistory(id[0], id[1], abv, vol);

    _postSummary("Report updated!", id[0]);

    return ContentService.createTextOutput("");
}

function doActionDelete (params) {
    var strId = params.actions[0].value;

    var id = strId.split(",");
    var value = getHistoryItem(id[0], id[1]);

    openSlackModal(params.trigger_id, {
        type: "modal",
        callback_id: "delete",
        private_metadata: strId,
        title: { type: "plain_text", text: "Delete report" },
        submit: { type: "plain_text", text: "Delete" },
        close: { type: "plain_text", text: "Back" },
        blocks:[
            {
                type: "section",
                text: { type: "mrkdwn", text: "Really delete this report ?" }
            },
            _formatHistoryItem(value.abv, value.vol)
        ]
    }, true);

    return ContentService.createTextOutput("");
}

function doSubmitDelete (params) {
    var strId = params.view.private_metadata;

    var id = strId.split(",");
    removeFromHistory(id[0], id[1]);

    _postSummary("Deleted the report.", id[0]);

    return ContentService.createTextOutput(JSON.stringify({
        response_action: "clear"
    })).setMimeType(ContentService.MimeType.JSON);
}

function doTimer () {
    appendRow(new Date());
    postImageToSlack("Alcohol Tracker summary", getChart(13).getBlob());
    _postSummary("Alcohol Tracker summary", 3, true);
}

function doAddLogToday (abv, vol) {
    var item = addToHistory(2, Number(abv), Number(vol));

    _postSummary("Item added!", 2);

    return ContentService.createTextOutput("");
}

function doPost (e) {
    var params = e.parameter.payload ? JSON.parse(e.parameter.payload) : e.parameter;

    var verificationToken = params.token;
    if (verificationToken != SLACK_VERIFICATION_TOKEN) throw "Invalid token";

    if (params.type) {
        if (params.type == 'block_actions') {
            if (params.actions[0].action_id == "edit") {
                return doActionEdit(params);
            } else if (params.actions[0].action_id == "delete") {
                return doActionDelete(params);
            } else if (params.actions[0].action_id == "add") {
                return doActionAdd(params);
            } else {
                throw "Unknown action";
            }
        } else if (params.type == 'view_submission') {
            if (params.view.callback_id == "edit") {
                return doSubmitEdit(params);
            } else if (params.view.callback_id == "delete") {
                return doSubmitDelete(params);
            } else if (params.view.callback_id == "add") {
                return doSubmitAdd(params);
            } else {
                throw "Unknown view";
            }
        } else if (params.type == 'shortcut') {
            if (params.callback_id == "add") {
                return doShortcutAdd(params);
            } else {
                throw "Unknown shortcut";
            }
        } else {
            "Unknown action type";
        }
    } else { /* slash command */
        var match = params.text.match(/([0-9.]+)[ 　]([0-9.]+)/);
        if (match) {
            return doAddLogToday(match[1], match[2]);
        } else {
            throw "Invalid params";
        }
    }

    throw "Unexpedted error";
}
