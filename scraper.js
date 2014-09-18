var casper = require('casper').create({
    clientScripts: ["lib/jquery.js"],
    logLevel: "debug",
    verbose: true
});
var keychain = require("keychain");
var fs = require("fs");
var async = require("async");

var username;
var password;

// go to the login page
casper.start('https://jobmine.ccol.uwaterloo.ca/psp/SS/?cmd=login', function() {
    // TODO: currently a really bad way to set the password, will improve later
    this.wait(1000);

    username = fs.read("username").trim();

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
    var jobs = JSON.parse(fs.read("jobs.json"));
    this.log("Processing " + jobs.length + " jobs", "info");

    async.eachSeries(jobs, function(job, callback) {
        casper.log("Processing " + job.id, "info");

        casper.open("https://jobmine.ccol.uwaterloo.ca/psp/SS_1/EMPLOYEE/WORK/c/UW_CO_STUDENTS.UW_CO_JOBDTLS.GBL?&UW_CO_JOB_ID=" + job.id);

        casper.then(function() {
            // TODO: process job

            callback();
        });
    }, function(err) {
        casper.log("Finished processing all jobs", "info");
    });
});

casper.run();

function fail(message) {
    casper.log(message, "error");
    casper.exit();
}

