var casper = require('casper').create({
    logLevel: "debug",
    verbose: true
});
var keychain = require("keychain");

var username = "hjaveed";
var password;

casper.start('https://jobmine.ccol.uwaterloo.ca/psp/SS/?cmd=login', function() {
    this.wait(1000);

    keychain.getPassword({
        account: username,
        service: "jobmine.ccol.uwaterloo.ca",
        type: "internet"
    }, function(err, pass) {
        password = pass;
    });
});

casper.then(function() {
    this.fillSelectors("#login", {
        "#userid": username,
        "#pwd": password
    }, true);
});

casper.run();

