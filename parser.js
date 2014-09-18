var fs = require("fs");

fs.readFile("jobs.xls", function(err, rawJobsBuffer) {
    var rawJobs = rawJobsBuffer.toString();

    var rawJobArray = rawJobs.split("\n");

    var jobs = [];

    var tempLength = 0;

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

    fs.writeFile("jobs.json", JSON.stringify(jobs), function(err) {
        if (err) throw err;

        console.log("Jobs parsed");
    });
});

