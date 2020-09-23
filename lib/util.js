function formatDate (date) {
    return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
}

function approx (num) {
    return (num + "").substring(0, 4);
}
