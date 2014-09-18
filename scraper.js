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
var jobs = [];

var rawJobs = fs.read("jobs.xls");
var rawJobArray = rawJobs.split("\n");

var reg = /<tr>((?:\n<td>.*?<\/td>){10})/g;
var tempObj;
while ((tempObj =reg.exec(rawJobs)) !== null) {
    tempObj = tempObj[0].replace(/<td>/g, '').replace(/<\/td>/g, '').split("\n");

    var job = {
        id: tempObj[1],
        jobTitle: tempObj[2],
        employer: tempObj[3],
        location: tempObj[5],
        openings: tempObj[6]
    };

    jobs.push(job);
}

// go to the login page
casper.start('https://jobmine.ccol.uwaterloo.ca/psp/SS/?cmd=login', function() {
    // TODO: currently a really bad way to set the password, will improve later
    this.wait(1000);

    username = fs.read("username.hidden").trim();

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

