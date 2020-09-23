/* ---- internal fns */

function _getSheet () {
    return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function _getHistory (sheet, rowNum) {
    return JSON.parse(sheet.getRange(rowNum, 7).getValue());
}

function _setHistory (sheet, rowNum, history) {
    sheet.getRange(rowNum, 6, 1, 2).setValues([[
        history.reduce(function (l, r) { return l + (r ? r.abv * r.vol : 0); }, 0) / 1000,
        JSON.stringify(history)
    ]]);
}

/* ---- utils */

function initializeSheet (date) {
    var sheet = _getSheet();
    var date = date || new Date();
    sheet.clear();
    sheet.appendRow([ "date", "consumed", "pacemaker", "base", "limit", "sum", "history" ]);
    sheet.appendRow([
        formatDate(date),
        "=F2",
        "=(E2-D2)/7*" + (date.getDay() + 1) + "+D2",
        0,
        (7 - date.getDay()) * WEEK_TARGET / 7,
        0,
        "[]"
    ]);
}

function appendRow (date) {
    var sheet = _getSheet();
    sheet.insertRowBefore(2);
    return sheet.getRange(2, 1, 1, 7).setValues([[
        formatDate(date),
        "=B3+F2",
        "=(E2-D2)/7*" + (date.getDay() + 1) + "+D2",
        date.getDay() ? "=D3" : "=E3",
        date.getDay() ? "=E3" : "=E3" + "+" + WEEK_TARGET,
        0,
        "[]"
    ]]);
}

function addToHistory (rowNum, abv, vol) {
    var sheet = _getSheet();
    var history = _getHistory(sheet, rowNum);
    var item = { abv: abv, vol: vol, ix: history.length };
    history.push(item);
    _setHistory(sheet, rowNum, history);
    return item;
}

function removeFromHistory (rowNum, ix) {
    var sheet = _getSheet();
    var history = _getHistory(sheet, rowNum);
    history[ix] = null;
    _setHistory(sheet, rowNum, history);
    return null;
}

function updateHistory (rowNum, ix, abv, vol) {
    var sheet = _getSheet();
    var history = _getHistory(sheet, rowNum);
    history[ix].abv = abv;
    history[ix].vol = vol;
    _setHistory(sheet, rowNum, history);
    return history[ix];
}

function getHistoryItem (rowNum, ix) {
    return JSON.parse(_getSheet().getRange(rowNum, 7, 1, 1).getValue())[ix];
}

function getSummary (rowNum) {
    var data = _getSheet().getRange(rowNum, 1, 1, 7).getValues()[0];
    return {
        date: formatDate(data[0]),
        consumed: data[1],
        limit: data[4],
        sum: data[5],
        history: JSON.parse(data[6]).filter(function (x) { return !!x; })
    };
}

function getChart (numRows) {
    var sheet = _getSheet();
    var dataRange = sheet.getRange(1, 1, numRows + 1, 5);
    return sheet.newChart().addRange(dataRange).asLineChart().build();
}
