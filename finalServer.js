/**
 * Created by Aditya on 4/9/2017.
 */

var app = require('express')();
var bodyParser = require('body-parser');
var cron = require('cron');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoC = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/persons"; //persons is the db
var sockets = [];
var notified = false;
setupSocket();

//Below is the route to be used by doctor to send all the vitals
//These are the vitals that will be tracked
app.post('/dSendVitals', function(req,res){
    /*Request message format
     * p_id: patient id
     * Name: patient name,  Age, Weight, Gender
     * Vitals:
     * */
    /*Flow:
     * 1. First check if it is an existing patient -> in that case only update the vitals
     * 2. Else -> new entries in patients and doctor-patient
     * Collections -> patient, patient-doctor (currently only assumed one doctor)
     * */
    //process based on how you receive the vitals
    //Step 1
    console.log("Form submitted")
    var pat_id = req.body._id;
    //check in the "patient database"
    mongoC.connect(url, function(err, db){
        if(err) console.log("Error connecting to database");
        else {
            var collection = db.collection('patient');

            //insert newly
            var name = req.body.name;
            var gender = req.body.gender;
            var age = req.body.age;
            var weight = req.body.weight;
            //#todo: change this as per new profile.html
            //#todo: also change database
            var maxHeartRate = req.body.maxHeartRate;
            var minHeartRate = req.body.minHeartRate;
            var maxSleepHours = req.body.maxSleepHours;
            var minSleepHours = req.body.minSleepHours;
            var maxWeight = req.body.maxWeight;
            var minWeight = req.body.minWeight;
            var maxCalorieBurnt = req.body.maxCalorieBurnt;
            var minCalorieBurnt = req.body.minCalorieBurnt;
            var maxStepsCount = req.body.maxStepsCount;
            var minStepsCount = req.body.minStepsCount;

            //we assume doctor id
            //var vitals = {"heartRate": heartRate, "sleep": sleep, "calorieBurnt": calorieBurnt, "steps": steps};
            var vitals = {"maxHeartRate": maxHeartRate,
                "minHeartRate": minHeartRate,
                "maxSleepHours": maxSleepHours,
                "minSleepHours": minSleepHours,
                "maxWeight": maxWeight,
                "minWeight": minWeight ,
                "maxCalorieBurnt": maxCalorieBurnt,
                "minCalorieBurnt": minCalorieBurnt ,
                "maxStepsCount": maxStepsCount,
                "minStepsCount": minStepsCount
            };
            //if bio fields are not null ->, if null, then a different query
            //if else logic is for re-visit, the update inside the if is an upsert and is a provision existing/new patients
            if (!name) {
                //This upsert logic: we are using the same page for new and existing. So this is a provision for error free insert
                collection.update(
                    {"_id": parseInt(pat_id)},
                    {
                        "_id": parseInt(pat_id),
                        "name": name, "age": age, "gender": gender, "weight": weight,
                        "vitals": vitals
                    },
                    {upsert:true}
                );
            }
            else {
                //a simulation for: if we actually create a page for existing patient
                //currently we simulate this by not putting the patients name
                console.log("Update comes from here");
                collection.updateOne(
                    {"_id": parseInt(pat_id)},
                    {"$set":{"vitals": vitals}}
                );
            }
            //the true is for the upsert
            db.close();
        } //else ends
    });
    //#todo: try to re-draw the main page
    res.send("<h1>Vitals have been set</h1>");

});

/* For full version: refer app.js
app.post('/cConnect',function(req, res){
});
*/


//route for: message from client that threshhold has crossed
/*This route:
 * 1. Receives threshold crossed message, res (response) should send available dates in json
 * 2. Send a notification to the desktop app, which is clickable to see history
 * */
/*
app.post('/cThresholdCrossed',function(req,res){
    For full version: refer app.js
});*/



function setupSocket(){

    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    io.on('connection', function(socket){
        console.log("socket atleast started");
        sockets.push(socket);
        console.log("currently connected socket no: "+sockets.length);
    });
    //run cron method here
    http.listen(8080, function(){
        console.log("Listening on port");
    });
}

//==================   CRON   =============================

function runCron() {
    var cronJob = cron.job("0,10,20,30,40,50 * * * * *", function () {
        //getdata('steps');
        getdata('heartrate');
        //getdata('sleep');
        console.info('--------------------------------------------------------------');
    });
    cronJob.start();
}
runCron();
//==================   CRON ENDS  =========================

function getdata(vital) {
    // perform operation e.g. GET request http.get() etc.
    var options = {
        host: 'localhost',
        port: '9000',
        path: '/' + vital,
        method: 'GET',
    };

    var fitbit_http = require('http');
    var get_req = fitbit_http.request(options, function(res) {
        res.setEncoding('utf8');
        var kar = "";
        res.on('data', function (chunk) {
            kar = kar + chunk;
        });
        res.on('end', function (chunk) {
                console.log(kar);
                //aditya
                //if (vital == heartrate)
                //logic
                //else if (vital == sleep)
                //logic
                //else if (vital == steps)
                //logic

                //parse the json to get the value required and then fetch threshold from db.
                //compare values and trigger appointment if needed
                if(vital == 'heartrate'){
                    if(!kar.includes("error")) {
                        if (JSON.parse(kar)["activities-heart-intraday"]["dataset"].length > 0) {
                            notify(JSON.parse(kar)["activities-heart-intraday"]["dataset"][0]["value"]);
                        }
                    }
                   //notify(91);
                } //vital check if ends
            }
        );
    });
    get_req.end();
}
//this will never run if the heartRate is 0
//Nil values fail proof
function notify(heartValue){
    console.log("notifying");
    var url = "mongodb://localhost:27017/persons";
    var pat_id = 2;
    var history= [];
    mongoC.connect(url, function(err, db){
        if(err)
            console.log("Error Connecting To Database");
        else{
            var collection = db.collection('patient');

            var cursor = collection.findOne({"_id":parseInt(pat_id)},function(err, document){
                if((heartValue)<(document.vitals.minHeartRate) ||(heartValue)>(document.vitals.maxHeartRate)){
                    //emit data on all receiving sockets
                    console.log("In the if part");

                        sockets.forEach(function (socket) {
                            socket.emit('notification', {
                                data: {
                                    "_id": pat_id,
                                    "vitals": document.vitalsHistory,
                                    "appointment": {
                                        "date": "2017-04-15",
                                        "time": "10.30 AM EST"
                                    }
                                } //json ends
                            });
                            notified = true;
                            //send out entir history + appointment
                        });
                }
                else{
                    console.log("In the else part");

                    for(var i=0; i<document.vitalsHistory.length; i++){
                        if(i == document.vitalsHistory.length-1){
                            history.push(parseInt(heartValue));
                        }
                        history.push(document.vitalsHistory[i]);
                    }
                }
                if(history.length>0) {
                    console.log("Printing history len "+history.length);
                    collection.update({"_id": parseInt(pat_id)}, {"$set": {"vitalsHistory": history}});
                }
                //else story in history
            }); //find else


        }//else ends
    });

}






