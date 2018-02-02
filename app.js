/**
 * Created by Aditya on 4/9/2017.
 */

var app = require('express')();
var bodyParser = require('body-parser');
var cron = require('cron');

//socket functionalities
var http = require('http').Server(app);
var fitbit_http = require('http');
var io = require('socket.io')(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoC = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/persons"; //persons is the db
var globalSocket;
var sockets = [];

setupSocket();
//==================   CRON   =============================
/*var cronJob = cron.job("0,30 * * * * *", function(){
    // perform operation e.g. GET request http.get() etc.
    var options = {
        host: 'localhost',
        port: '9000',
        path: '/getSteps',
        method: 'GET',
        headers: {
            //nothing
        }
    };

var get_req = fitbit_http.request(options, function(res) {
     res.setEncoding('utf8');
     var kar = "";
     res.on('data', function (chunk) {
            kar = kar + chunk;
      });
      res.on('end', function (chunk) {
                console.log(kar);
            }
        );
    });
    get_req.end();

    console.info('cron job completed');
});
cronJob.start(); */
//==================   CRON ENDS  =========================


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
            console.log(req.body);
            console.log(name);
            var gender = req.body.gender;
            var age = req.body.age;
            var weight = req.body.weight;
            var heartRate = req.body.heartRate;
            var sleep = req.body.sleep;
            var calorieBurnt = req.body.calorieBurnt;
            var steps = req.body.steps;

            //we assume doctor id
            var vitals = {"heartRate": heartRate, "sleep": sleep, "calorieBurnt": calorieBurnt, "steps": steps};
            //if bio fields are not null ->, if null, then a different query
            //if else logic is for re-visit, the update inside the if is an upsert and is a provision existing/new patients
            if (!(name=="")) {
                //This upsert logic: we are using the same page for new and existing. So this is a provision for error free insert
            collection.update(
                {"_id": parseInt(pat_id)},
                {
                    "_id": parseInt(pat_id),
                    "name": name, "age": age, "gender": gender, "weight": weight,
                    "vitals": vitals
                },
                true
            );
            }
            else {
                //a simulation for: if we actually create a page for existing patient
                //currently we simulate this by not putting the patients name
                collection.update(
                    {"_id": parseInt(pat_id)},
                    {"$set":{"vitals": vitals}}
                );
            }
            //the true is for the upsert
            db.close();
        } //else ends
        });
    //#todo: try to re-draw the main page
    res.redirect('/view/dashboard.html');

});

//connect, client sends connection
//#todo: server should check if this is the first time or second time
//#This works, if not, please check the way request is send
//should be in xx-www-form-urlencodeds
app.post('/cConnect',function(req, res){
    //request should contain client_id
    //response should contain parameters
    //response parameters will be in JSON parameters
        console.log("One client connected through mobile app");

        var user_id = req.body._id;
        console.log(req.body);
        mongoC.connect(url, function(err, db){
        var collection = db.collection('patient');

        var cursor = collection.find({"_id":parseInt(user_id)});
        //this will always return a patient
        //because patient is set from the doctor application -> so when the user hits, records will be returned
        //what if patient enters a wrong id -> #todo: optional, not handled yet
        cursor.forEach(function(db, err){
            if(err) console.log(err);
            else {
                var vitals = db.vitals;
                console.log("Vitals> "+JSON.stringify(vitals));
               // res.sendFile("view/simple-form.html",{root: __dirname });
                res.send(vitals);
                //res.redirect("simple-form.html");
            }
        });
        db.close();
    });

});


//route for: message from client that threshhold has crossed
/*This route:
* 1. Receives threshold crossed message, res (response) should send available dates in json
* 2. Send a notification to the desktop app, which is clickable to see history
* */
//#todo: should also recieive patient id
app.post('/cThresholdCrossed',function(req,res){
    //This module also sends an appointment
    /* Post message format
    * p_id
    * availability: for now we have it on a database #todo
    * vitals: for which threshold was crossed
    * */
    var p_id = 1; //hardcoded -> should come from Android apps payload
    var availability = {
        "date":"2017-04-10", "slot":"s3"
    } //this is for appointment scheduling
    var vitals; //receive vitals history
    //send this to the front end system, which can click the notification to see this vitals
    console.log("Danger: user vitals have crossed threshhold");
    console.log("Sockets open ? "+globalSocket.connected);
    //Module for sending an availability json
    //#todo: this has to be received from findAvailability.js

    //======================================================
    //Send the request as is
    //Processing of data at client side

    globalSocket.emit('notification',{
        data:req.body.activities-heart-intraday.dataset
    });
    sockets.forEach(function(socket){
        socket.emit('notification',{
            data:req.body.activities-heart-intraday.dataset
        });
    });

    //=======================================================
    //#todo: res.send(appointment slot)
    res.send("Need to send a scheduled appointment")

});


function setupSocket(){

    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    io.on('connection', function(socket){
        console.log("socket atleast started");
        sockets.push(socket);
        globalSocket = socket;
    });
    //run cron method here
    http.listen(8080, function(){
        console.log("Listening on port");
    });
}





