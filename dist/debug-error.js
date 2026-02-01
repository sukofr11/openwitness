// Debug helper to show errors on screen
window.onerror = function (msg, url, line, col, error) {
    var extra = !col ? '' : '\ncolumn: ' + col;
    extra += !error ? '' : '\nerror: ' + error;
    alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
    return false;
};
console.log("Debug logger active");
