var casper = require('casper').create({
    clientScripts: [
        "lib/jquery.js"
    ],
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

casper.then(function() {
    var url = this.evaluate(function() {
        return $("a:contains('Job Inquiry')").attr("href");
    });

    this.log(url);

    this.open(url);
});

casper.then(function() {
    var url = this.evaluate(function() {
        return $("#ptifrmtgtframe").attr("src");
    });

    this.open(url);
});

casper.thenClick("input[value='Search']");

casper.waitWhileVisible("div img#processing", function() {
    this.capture("search2.png");
});

casper.run();

