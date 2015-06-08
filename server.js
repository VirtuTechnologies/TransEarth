/**
 * Module dependencies.
 */
var express = require('express');
var fs = require('fs');
var moment = require('moment');
var _ = require('lodash');
var validSessionDuration = 30 * 60 * 1000;

var TruckRoute = require('./app/routes/TruckRoute');
var UserRoute = require('./app/routes/UserRoute');
var LoadRoute = require('./app/routes/LoadRoute');
var LookupRoute = require('./app/routes/LookupRoute');

var http = require('http');
var https = require('https');
var path = require('path');
var mongoose = require('mongoose');
var ejs = require('ejs');
var passport = require('passport');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//var authentication = require('./config/authentication');
var User = require('./app/models/User');
var config = require('./config/config');
//mongoose.set('debug', true);
var Session = require('./app/models/Session');
mongoose.connect(config.db);

var app = express();

app.configure(function(){
    // all environments
    app.set('developmentPort', process.env.PORT || 9080);
    app.set('securedPort', process.env.SECURED || 443);
    app.set('unsecuredPort', process.env.UNSECURED || 80);
    app.set('localhostPort', process.env.SECURED || 8080);
    app.set('views', path.join(__dirname, 'app/views'));
    app.set('view engine', 'ejs');
    app.set('view options', {layout:false, root: path.join(__dirname, 'views')});
    app.use(express.favicon());
    //app.use(express.logger({ immediate: true, format: 'dev', stream: logfile}));
    //app.use(express.logger({ format: 'tiny', stream: logfile}));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.cookieParser());
    //app.use(express.session({secret: '1234567890QWERTY', cookie: {expires: new Date(Date.now() + 90000), maxAge: 90000}}));
    app.use(express.session({
        secret: '1234567890QWERTY',
        rolling: true,
        //cookie: {maxAge : validSessionDuration}
        //cookie: {maxAge : 0}
    }));
    app.use(express.responseTime());
    // Initialize Passport
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(logErrors);
    app.use(errorHandler);
    // Remember Me function
    app.use(function (req, res, next) {
        //console.log('Request session Maxage - '+req.session.cookie.maxAge);
        //console.log('Requested URL - '+req.url+" and session Maxage - "+req.session.cookie.maxAge);
        //console.log("Hiiii");
        if (req.method == 'POST' && req.url == '/login') {
            console.log("Inside Login Remember Me");
            /*if (req.body.rememberMe) {
                //req.session.cookie.maxAge = 0; // Remember 'me' Deacticate
                console.log("Marking Remember Me");
                req.session.cookie.maxAge = 5*24*60*60*1000; //Remember 'me' for 5 days
            } else {
                req.session.cookie.expires = false;
            }*/
        }
        req.error = null;
        if (req.isAuthenticated()) {
            /*if(typeof req.session.cookie == "undefined" || typeof req.session.cookie.maxAge == "undefined"){
                console.log(moment().utc().local().format("YYYY-MM-DD hh:mm:ss")+": Cookie MaxAge:"+req.session.cookie.maxAge+" Requested URL: "+req.url);
                console.log("Marking Remember Me for session duration");
                //req.session.cookie.maxAge = validSessionDuration;
                //req.session.cookie.maxAge = 0;
            }*/
            return next();
        }
        next();
    });
});

//app.locals.dbConfig = config.db;
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//Error Page
function logErrors(err, req, res, next) {
    console.error("Logging Errors: "+err.stack);
    next(err);
}
function errorHandler(err, req, res, next) {
    console.error("Handling Errors: "+err.stack);
    //res.status(500);
    //res.render('error', { error: err });
    res.status(500).send({ error: 'Something blew up!' });
}

app.get('/TransEarth/login', function (req, res) {
    console.log("Rendering login page");
    //res.render('login', { user: req.user, message: req.session.messages });
    var error = req.session.auth;
    clearSession(req);
    req.session.auth = null;
    res.render('login', {"error" : error});
});

//Get User authentication message on login credentials
app.get('/TransEarth/getAuthMsg', function(req, res){
    //console.log("Inside getAuthMsg");
    //console.log("Got Authentication message to display:"+JSON.stringify(req.session.auth));
    if(typeof req.session.auth == 'undefined' || req.session.auth == null){
        res.json(200, {'initial':'true'});
    }else{
        res.json(200, req.session.auth);
    }
});

app.get('/TransEarth/logout', function (req, res) {
    console.log("Logging off");
    //res.render('login', { user: req.user, message: req.session.messages });
    clearSession(req);
    res.redirect('/');
});
//Redirected path for Passport authentication
app.post('/TransEarth/login', function (req, res, next) {

    console.log("Inside Passport authenticate for user - "+JSON.stringify(req.body));
    //req.session = {};
    //req.session.auth = null;
    passport.authenticate('local', function (err, user, info) {
        //console.log("Authentication for user - "+JSON.stringify(user));
        //console.log("Authentication for user error - "+JSON.stringify(err));
        if (err) {
            console.log("Passport Authenticate fail - "+err);
            req.error = "Passport Authenticate fail - "+err;
            //return next(err);
            req.session.auth = {
                messageAvailable : true,
                message : "Something crashed: "+err
            };
            //return res.redirect('/TransEarth');
            return res.json(200, "Something Crashed: "+err);
        }
        //console.log("Passport to Authenticate - "+user+" "+req.user);
        if (!user) {
            req.session.auth = {
                messageAvailable : true,
                message : info.message
            };
            //req.session.auth = {invalid : true};
            req.session.messages = [info.message];
            console.log("User validation failed - "+user+' - '+req.session.messages);
            //req.error = "Invalid Credentials";
            //return next(req.error);
            //return res.json(500, "Invalid Credentials");
            //return res.redirect('/TransEarth/login');
            return res.redirect('/TransEarth');
        }
        req.session.auth = null;
        req.logIn(user, function (err1) {
            if (err1) {
                req.error = "Passport Login compare error:"+err1;
                req.session.auth = {
                    messageAvailable : true,
                    message : "Validation not possible this time: "+err1
                };
                return res.redirect('/TransEarth');
                //return next(err);
            }
            //console.log("User Logged In - "+JSON.stringify(user));
            req.session.user_profile = user;
            //console.log("User Session Logged In - "+JSON.stringify(req.session.user_profile));
            //console.log("User Logged In - "+JSON.stringify(req.session.user_profile)+JSON.stringify(user));
            return res.redirect('/TransEarth');
        });
    })(req, res, next);

}, function(req,res){
    console.log("Passport Auth Next method");
    res.json(500,  req.session.messages);
});

app.get("/TransEarth/getLoggedInUserProfile", function(req, res){
    if(req.session.user_profile){
        console.log("Return user logged in:"+JSON.stringify(req.session.user_profile));
        res.json(200, {
            "user" : req.session.user_profile
        });
    }else{
        console.log("Return error user not logged in:"+req.session.user_profile);
        res.json(200, {});
    }

});
//Utilities URL
//Helper for ensuring authentication
function ensureAuthenticated(req, res, next) {
    console.log("Utility Method for Authentication ");
    if (req.isAuthenticated()) {
        return next();
    }else{
        return res.redirect('/TransEarth/sessionExpired');
    }

    /*if (req.isAuthenticated()) {
        console.log(moment().utc().local().format("YYYY-MM-DD hh:mm:ss")+": Cookie MaxAge:"+req.session.cookie.maxAge+" Requested URL: "+req.url);
        req.session.cookie.maxAge = validSessionDuration;
        console.log("User logged in - "+req.session.cookie.maxAge);
        return next();
    }
    req.session.validity = false;
    console.log("User not logged in - Default pages display - "+req.session.cookie.maxAge);
    return res.redirect('/TransEarth/sessionExpired');
    //return next();*/
}

function clearSession(req){
    if(typeof req.session != 'undefined' && req.session != null){
        //req.session.auth = null;
        req.session.user_profile = null;
        req.session.auth = null;
    }
}

function isLoggedInMiddleware(req, res, next) {

    if(typeof req.cookies.session != "undefined" && req.cookies.session != null){
        var session_id = req.cookies.session;
        if (!session_id) {
            console.log("User not logged in - Default pages display - "+req.session.cookie.maxAge);
            //res.redirect('/TransEarth/login');
            return next();
        }

        Session.findOne({ '_id' : session_id }, function(err, session) {
            "use strict";

            if (err) {
                console.log("Cannot find Session - "+session_id);
                return next();
            }

            if (!session) {
                {
                    console.log("User not logged in - Default pages display - "+req.session.cookie.maxAge);
                    //res.redirect('/TransEarth/login');
                    return next();
                }
            }

            req.username = session.username;
            return next();
        });
    }
}
//Base URL
app.get('/', function (req, res) {
    //console.log("Redirect base URL to Home page");
    //fs.createReadStream('./logfile.log').pipe(res);
    //clearSession(req);
    res.redirect('/TransEarth');
});

app.get('/TransEarth', function (req, res) {
    console.log("Get Index page: "+JSON.stringify(req.session));
    //clearSession(req);
    var local = {
        session :{
            loginFailed : false
        }
    };
    if(typeof req.session.user_profile != "undefined" && req.session.user_profile != null){
        local.session.user = {};
        local.session.user.user_name = req.session.user_profile.display_name;
        local.session.user.user_type = req.session.user_profile.user_type;
        local.session.user.user_logged_in = true;
        //console.log("Rendering home page with User logged in: "+JSON.stringify(local));
    }
    if(typeof req.session.auth != "undefined" && req.session.auth != null){
        //console.log("Login failed and including login template: "+JSON.stringify(req.session.auth));
        local.session.loginFailed = true;
        local.session.loginError = req.session.auth.message;
    }
    if(typeof req.session.validity != "undefined" && req.session.validity != null && !req.session.validity){
        console.log("User Session invalid: "+req.session.validity);
        local.session.validity = false;
        req.session.validity = null;
    }
    console.log("Rendering Index Home session details: "+JSON.stringify(local));
    res.render('index', local);
    //res.render('example', user);
});

app.get('/TransEarth/sessionExpired', function (req, res) {
    console.log("Get sessionExpired");
    clearSession(req);
    var local = {
        session :{
            expired : true
        }
    };
    res.render('error', local);
    //res.render('example', user);
});

app.get('/TransEarth/site_home', function (req, res) {
    //console.log("Get Site Home page");
    //clearSession(req);
    res.render('site_home');
});

app.get('/TransEarth/signup', function (req, res) {
    //console.log("Signup page");
    res.render('signup');
});

app.get('/TransEarth/searchTrucks', function (req, res) {
    //console.log("Trucks page");
    res.render('search_trucks');
});

app.get('/TransEarth/searchLoad', function (req, res) {
    //console.log("Loads page");
    res.render('search_load');
});

app.get('/TransEarth/truck_owner_home', ensureAuthenticated, function (req, res) {
    //console.log("Trucks page");
    res.render('truck_owner_home');
});

app.get('/TransEarth/load_owner_home', ensureAuthenticated, function (req, res) {
    console.log("Load page");
    res.render('load_owner_home');
});

app.get('/TransEarth/truck_owner_trucks', ensureAuthenticated, function (req, res) {
    console.log("Load truck_owner_trucks page");
    res.render('truck_owner_trucks');
});

app.get('/TransEarth/truck_owner_posts', ensureAuthenticated, function (req, res) {
    console.log("Load truck_owner_posts page");
    res.render('truck_owner_posts');
});

app.get('/TransEarth/manage_post', ensureAuthenticated, function (req, res) {
    console.log("Load add_post page");
    res.render('manage_post');
});

app.get('/TransEarth/manage_truck', ensureAuthenticated, function (req, res) {
    console.log("Load manage_truck page");
    res.render('manage_truck');
});

app.get('/TransEarth/manage_load', ensureAuthenticated, function (req, res) {
    console.log("Load manage page");
    res.render('manage_load');
});

app.get('/TransEarth/add_trucks', ensureAuthenticated, function (req, res) {
    console.log("Add Multiple Trucks Page");
    res.render('add_trucks');
});

app.post("/TransEarth/createUser", UserRoute.createUser);

app.post("/TransEarth/getTruckPostingsSummary", TruckRoute.getTruckPostSummary);
app.post("/TransEarth/getLoadPostingsSummary", LoadRoute.getLoadListSummary);

app.post("/TransEarth/getTruckPostings", TruckRoute.searchTruckPost);
app.post("/TransEarth/getLoadPostings", LoadRoute.searchLoadList);

app.post("/TransEarth/getMyTrucks", ensureAuthenticated, TruckRoute.getMyTrucks);
app.post("/TransEarth/getMyTruckPosts", ensureAuthenticated, TruckRoute.getMyTruckPosts);

app.post("/TransEarth/getMyLoadList", ensureAuthenticated, LoadRoute.getMyLoadList);

app.post("/TransEarth/getTruckById", ensureAuthenticated, TruckRoute.getTruckById);
app.post("/TransEarth/getTruckPostById", ensureAuthenticated, TruckRoute.getTruckPostById);

app.post("/TransEarth/addTruck", ensureAuthenticated, TruckRoute.addTruck);
app.post("/TransEarth/editTruck", ensureAuthenticated, TruckRoute.editTruck);
app.post("/TransEarth/removeTruck", ensureAuthenticated, TruckRoute.removeTruck);

app.post("/TransEarth/addTruckPost", ensureAuthenticated, TruckRoute.addTruckPost);
app.post("/TransEarth/editTruckPost", ensureAuthenticated, TruckRoute.editTruckPost);
app.post("/TransEarth/removeTruckPost", ensureAuthenticated, TruckRoute.removeTruckPost);

app.post("/TransEarth/getLoadById", ensureAuthenticated, LoadRoute.getLoadById);

app.post("/TransEarth/addLoad", ensureAuthenticated, LoadRoute.addLoad);
app.post("/TransEarth/editLoad", ensureAuthenticated, LoadRoute.editLoad);
app.post("/TransEarth/removeLoad", ensureAuthenticated, LoadRoute.removeLoad);

app.get("/TransEarth/getMaterialTypes", LookupRoute.getMaterialTypes);
app.get("/TransEarth/getTruckTypes", LookupRoute.getTruckTypes);
app.get("/TransEarth/getTruckMakes", LookupRoute.getTruckMakes);

app.get('/TransEarth/test', function (req, res) {
    res.render('test');
});
app.post('/TransEarth/getTruckPostingsSummaryTest', function (req, res) {

    var response ={
        truckPostList : {
            details : [
                {
                    source : "Chennai",
                    destination : "Vellore",
                    capacity : "101 Tons",
                    availableDate : "03rd Jan 2016"
                },
                {
                    source : "Vellore",
                    destination : "Bangalore",
                    capacity : "102 Tons",
                    availableDate : "06rd May 2016"
                }
            ]
        }
    }
    ;
    console.log("Response for get Truck Summary:" +JSON.stringify(response));
    res.json(200, response);
});

// Create an HTTP service.
var server = http.createServer(app);

server.listen(app.get('unsecuredPort'), function(){
    console.log('__dirname - ' + __dirname);
    console.log('process.env.NODE_ENV - ' + process.env.NODE_ENV);
    console.log('root - ' + config.root);
    console.log('Express server listening on port '+app.get('unsecuredPort'));
});
