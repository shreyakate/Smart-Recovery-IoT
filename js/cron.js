var mongoC = require('mongodb').MongoClient;
var cron = require('cron');

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
                if(JSON.parse(kar)["activities-heart-intraday"]["dataset"].length>0) {
                    notify(JSON.parse(kar)["activities-heart-intraday"]["dataset"][0]["value"]);
                }
            } //vital check if ends
          }
      );
  });
  get_req.end();
}
//this will never run if the heartRate is 0
//Nil values fail proof
function notify(heartValue){
    var url = "mongodb://localhost:27017/persons";
    var pat_id = 2;
    var history= [];
    mongoC.connect(url, function(err, db){
        if(err)
            console.log("Error Connecting To Database");
        else{
            var collection = db.collection('patient');

            var cursor = collection.findOne({"_id":parseInt(pat_id)},function(err, document){
                if(parseInt(heartValue)<parseInt(document.vitals.minHeart) ||parseInt(heartValue)>parseInt(document.vitals.maxHeart)){
                    //emit data on all receiving sockets
                    sockets.forEach(function(socket){
                        socket.emit('notification',{data:{
                                "_id":p_id,
                                "vitals":document.vitalsHistory,
                                "appointment":{
                                    "date":"2017-04-15",
                                    "time":"10.30 AM EST"
                                }
                            } //json ends
                        });
                        //send out entir history + appointment
                    });
                }
                else{
                    history.push(document.vitalsHistory);
                    history.push(parseInt(heartValue));
                }
                if(history.length>0)
                    collection.update({"_id":parseInt(pat_id)},{"$set":{"vitalsHistory":history}});
                //else story in history
            }); //find else


        }//else ends
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
