/**
 * Created by Aditya on 4/9/2017.
 */

/*
* Below is the list of patient availability
* We get 3 availability slots (only 3 slots)
* We then try to match with corresponding
* */
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/persons"; //persons is the db


var patientAvailability = {
    "id":1,
    availability:[
        {
            "date":"2017-04-08",
            "slot": "s3"
        },
        {
            "date":"2017-04-09",
            "slot": "s3"
        },

    ]
}

/*find the doctor for this patient
we create a doctor-patient mapping collection to map the doctor to a patietn
when the doctor configures the setting using the Web App, an ID is generated for the patient
this ID is used by the patient to log in to his/her app */

var patient_id = patientAvailability.id;
var patient_availability = patientAvailability.availability;

function connectDB(callback) {
    var doc_id;
    mongoClient.connect(url, function (err, db) {
        //select the collection
        var collection = db.collection('doctorPatient');

        var doc_rec = collection.find({"patients": {$in: [patient_id]}});
        var count ;
        collection.find({"patients": {$in: [patient_id]}}).count(function(err, db){
            //console.log(db==1);

        });

        doc_rec.forEach(function (db, err) {
            if (err)
                console.log("Unable to fetch doctor");
            else {
                doc_id =  db._id;
                callback(returnThis, arguments[1]);
                /*console.log(doc_id)*/
            };
        });
        db.close();
    }); //connection ends
}

//find corresponding doctor for the patient
//with an availability slot
//callback is the function that receives the slot
//#todo: response should be date and available time, not slot
function getDocId(callback,id){
    var doc_id = id;

    //now we know the doctor_id
    mongoClient.connect(url, function(err, db){
        var collection = db.collection('doctorAvailability');

        //get doctor's availability
        var cursor = collection.find({"_id":doc_id});
        cursor.forEach(function (db, err) {
            if(err) console.log(err);
            else {
                var availability = db.availability;

                //availability is received
                //now match with patient
                //first see if the dates match
                var flag = false;
                for(var i=0; i<patient_availability.length;i++){
                    var date = patient_availability[i].date;
                    for(var j=0;j<availability.length;j++){
                        if(availability[j].string==patient_availability[i].string){
                            var slots_patient = patient_availability[i].slot;
                            var slots_doctor = availability[j].slot;
                            result = intersection(slots_patient,slots_doctor);
                            //returnThis(result[0]);
                            //#todo: remove slot from database
                            callback(result[0]);
                            flag = true;
                            break;
                        }
                    }
                    if(flag) break;
                } //big for ends
                //console.log(availability);

            }
        });
        db.close();
    });

}


function intersection(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
}

//#todo: deal with the callbacks
function returnThis(result){
    var f = result;
    console.log(f);
}


connectDB(getDocId(returnThis,0));

