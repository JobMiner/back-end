var casper = require('casper').create({
    clientScripts: ["lib/jquery.js"],
    logLevel: "debug",
    verbose: true
});
var keychain = require("keychain");

var username = "hjaveed";
var password;

// go to the login page
casper.start('https://jobmine.ccol.uwaterloo.ca/psp/SS/?cmd=login', function() {
    // TODO: currently a really bad way to set the password, will improve later
    this.wait(1000);

    keychain.getPassword({
        account: username,
        service: "jobmine.ccol.uwaterloo.ca",
        type: "internet"
    }, function(err, pass) {
        password = pass;
    });
});

// login to JobMine
casper.then(function() {
    if (!password) return fail("Password was not set properly");
    if (!/Password:/.test(casper.getHTML())) return fail("Expected to be on login page");

    this.fillSelectors("#login", {
        "#userid": username,
        "#pwd": password
    }, true);
});

casper.then(function() {
    // ready to go to descriptions
});

casper.run();

function fail(message) {
    casper.log(message, "error");
    casper.exit();
}

