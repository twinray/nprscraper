// import npm libraries
// this also servers as the server.js / the back end of the app
var express = require('express');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
let mongoose = require('mongoose'); // MongoDB ORM

// import main controller
var scrapecontroller = require('./controllers/scrapecontroller');

// create the express app
var app = express();

// add middleware for parsing json 
var jsonParser = bodyParser.json();
app.use(jsonParser);

app.use(express.static(process.cwd() + '/public:assets'));

// add middleware for rendering templates
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// setup main controller
//app.use(scrapecontroller)
//
scrapecontroller(app);

// separation of concerns, want to separate set up model in the server file wiht the rest of the true back end work
// controller file, just communicates between data base and front end. 
// server.js defines  back end 

/////////////////////////////////////////////// /* Mongoose Configuration */ ////////////////////////////////////////////////////////
mongoose.Promise = Promise; // Set mongoose to leverage Built in JavaScript ES6 Promises
// set up heroku my lab
// mongodb://heroku_j76pdjtj:kq0i751inpd55bu9sbgvv0j6nk@ds125255.mlab.com:25255/heroku_j76pdjtj
var MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI);

// mongodb://heroku_set up my heroku link above // short hand style 
let mongooseConnection = mongoose.connection;

mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
  console.log(`Sucessfully Connected to Mongo DB !`); // If Connection is successful, Console.log(Message)
});


// listen on port
var port = 4000;
app.listen(port);
console.log('Server listening on port ' + port);
