function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    var min  = date.getMinutes();

    if (min >= 2) {
      min = min - 2;
    }
    else {
      if (hour == 0) {
          min = 0;
      }
      else {
              hour = hour - 1;
              min = 58 + min;
      }
    }

    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return hour + ":" + min;
}

function getSleeplog(token, resp) {
  var auth = "";

  if (token == "dummy")
  auth = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1TFpGRFIiLCJhdWQiOiIyMjg4R0YiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyd2VpIHJhY3QgcmhyIHJwcm8gcnNsZSIsImV4cCI6MTQ5MjE1NDg3OCwiaWF0IjoxNDkyMTI2MDc4fQ.xfMHXGE848O9JvTngVOyfCPaUwT2DazCYvLz3wPLV60';
  else
  auth = 'Bearer ' + token;

  var options = {
      host: 'api.fitbit.com',
      path: '/1.2/user/-/sleep/date/2017-04-09/2017-04-13.json',
      method: 'GET',
      headers: {
          'Authorization': auth
      }
  };

  // Set up the request
  var https = require('https');
  var get_req = https.request(options, function(res) {
      res.setEncoding('utf8');
      var data = [];
      var kar = "";
      res.on('data', function (chunk) {
        data.push(chunk);
        kar = kar + chunk;
      });
      res.on('end', function (chunk) {
        var str = JSON.parse(data.join(''));
        resp.writeHead(200, {"Content-Type" : "text/html"});
        resp.write(kar);
        resp.end();
      }
    );
  });
  get_req.end();
}

function getHeartrate(token, resp) {
  var auth = "";

  if (token == "dummy")
  auth = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1TFpGRFIiLCJhdWQiOiIyMjg4R0YiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyd2VpIHJhY3QgcmhyIHJwcm8gcnNsZSIsImV4cCI6MTQ5MjE1NDg3OCwiaWF0IjoxNDkyMTI2MDc4fQ.xfMHXGE848O9JvTngVOyfCPaUwT2DazCYvLz3wPLV60';
  else
  auth = 'Bearer ' + token;

  var t = getDateTime();
  //console.log(t);

  var options = {
      host: 'api.fitbit.com',
      path: '/1/user/-/activities/heart/date/today/1d/1min/time/'+t+'/'+t+'.json',
      method: 'GET',
      headers: {
          'Authorization': auth
      }
  };

  // Set up the request
  var https = require('https');
  var get_req = https.request(options, function(res) {
      res.setEncoding('utf8');
      var data = [];
      var kar = "";
      res.on('data', function (chunk) {
        data.push(chunk);
        kar = kar + chunk;
      });
      res.on('end', function (chunk) {
        var str = JSON.parse(data.join(''));
        // var st = JSON.stringify(str['activities-heart-intraday']['dataset']);
        // if (st.length > 0)
        //   st = JSON.stringify(st[0]);
        // else {
        //   st = "no";
        // }
        // console.log(st);

        resp.writeHead(200, {"Content-Type" : "text/html"});
        //resp.write(st);
        resp.write(kar);
        resp.end();
      }
    );
  });
  get_req.end();
}

function getSteps(token, resp) {
  var auth = "";

  if (token == "dummy")
  auth = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1TFpGRFIiLCJhdWQiOiIyMjg4R0YiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyd2VpIHJhY3QgcmhyIHJwcm8gcnNsZSIsImV4cCI6MTQ5MjE1NDg3OCwiaWF0IjoxNDkyMTI2MDc4fQ.xfMHXGE848O9JvTngVOyfCPaUwT2DazCYvLz3wPLV60';
  else
  auth = 'Bearer ' + token;

  var options = {
      host: 'api.fitbit.com',
      path: '/1/user/-/activities/tracker/steps/date/today/1d.json',
      method: 'GET',
      headers: {
          'Authorization': auth
      }
  };

  // Set up the request
  var https = require('https');
  var get_req = https.request(options, function(res) {
      res.setEncoding('utf8');
      var data = [];
      var kar = "";
      res.on('data', function (chunk) {
        data.push(chunk);
        kar = kar + chunk;
      });
      res.on('end', function (chunk) {
        var str = JSON.parse(data.join(''));

        resp.writeHead(200, {"Content-Type" : "text/html"});
        resp.write(kar);
        resp.end();
      }
    );
  });
  get_req.end();
}

function getToken(codestring, resp) {

  var querystring = require('querystring');
  // Build the post string from an object
  var post_data = querystring.stringify({
      'redirect_uri' : 'http://localhost:9000/callback',
      'client_id': '2288GF',
      'grant_type': 'authorization_code',
        'code' : codestring
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'api.fitbit.com',
      //port: '80',
      path: '/oauth2/token',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic MjI4OEdGOjkxNmM3ZDVmZTFhN2E5ZjBlMTE1NzVmY2RjMDVlZDg0'
      }
  };

  // Set up the request
  var https = require('https');
  var post_req = https.request(post_options, function(res) {
    res.setEncoding('utf8');
    var str = "";
    var data = [];
    res.on('data', function (chunk) {
      data.push(chunk);
    });
    res.on('end', function (chunk) {
      var str = JSON.parse(data.join(''));
      console.log(str.access_token);

      //console.log(str.refresh_token);
      getSteps(str.access_token, resp);
    });
  });

  post_req.write(post_data);
  post_req.end();
}

var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/callback', function(req, resp){
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var code = req.query.code;
  getToken(code, resp);
});

app.get('/home',function(req, resp){
  resp.writeHead(200, {"Content-Type" : "text/html"});
  resp.write("<html><head><title>Home</title></head><body>Home page!</br>");
  resp.write("<a href=https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=2288GF&scope=heartrate%20sleep%20profile%20weight%20activity&redirect_uri=http://localhost:9000/callback>Get Daily Steps</a>");
  resp.write("<br>");
  resp.write("</body></html>");
  resp.end();
});

app.get('/steps',function(req, resp){
  getSteps("dummy", resp);
});

app.get('/heartrate',function(req, resp){
  getHeartrate("dummy", resp);
});

app.get('/sleep',function(req, resp){
  getSleeplog("dummy", resp);
});

app.listen(9000);
console.log("Server running on 9000 port");
