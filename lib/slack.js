/* (str, [slack block]) -> api response */
function postToSlack (text, blocks) {
    return UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ text: text || "", blocks: blocks || [] })
    });
}

/* blob -> api response */
function postImageToSlack (title, blob) {
    return UrlFetchApp.fetch('https://slack.com/api/files.upload', {
        method: "post",
        payload: {
            token: SLACK_ACCESS_TOKEN,
            file: blob,
            channels: SLACK_CHANNEL_NAME,
            title: title
        }
    });
}

/* (triggerId, [slack block], bool) -> api response */
function openSlackModal (trigger_id, view, push) {
    return UrlFetchApp.fetch('https://slack.com/api/views.' + (push ? 'push' : 'open'), {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + SLACK_ACCESS_TOKEN },
        payload: JSON.stringify({ trigger_id: trigger_id, view: view })
    });
}
