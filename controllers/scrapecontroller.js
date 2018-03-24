/////////////////////////////////////////////// /* Imports */ ////////////////////////////////////////////////////////
// defining the routes for all of the projects

let request = require('request-promise'); // HTTP Request
let cheerio = require('cheerio'); // Web Scraper
let Promise = require('bluebird');// helps promises happen
let {Article, Comment} = require("../models"); // Require all models//



/////////////////////////////////////////////// /* Exports */ ////////////////////////////////////////////////////////
module.exports = (app) => { // Export Module Containing Routes. Called from app.js

  /////////////////////////////////////////////// /* Get Requests */ ////////////////////////////////////////////////////////
  // Default Route
  // listens for get methods from the client 
  // render goes back through the client, tells the server to render this page with handlebars
  // index the html 
  // getting a message from the front end (handlbars), sending it to the back end
  // then the back end is sending it back out what we needed rendered
  app.get("/", (req, res) => res.render("index"));

  // Scrape Articles Route
  app.get("/api/search", (req, res) => {
    request("https://www.npr.org/sections/news/").then((html) => {
      // console.log("Load Response");
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      // and parse the html returned from request for extracting data we want
      let $ = cheerio.load(html);

      let articles = []; 
      // Initialize array to store articles

      // for each article get the data
      $("article").each((i, element) => { // Use Cheerio to Search for all Article HTML Tags
        //NPR Only Returns Low Res Images to the Web Scrapper. A little String Manipulation is Done to Get High Res Images
        let lowResImageLink = $(element).children('.item-image').children('.imagewrap').children('a').children('img').attr('src');

        if (lowResImageLink) {

          let imageLength = lowResImageLink.length;
          let highResImage = lowResImageLink.substr(0, imageLength - 11) + "800-c100.jpg";

          // get the item 
          let item = $(element).children('.item-info');

          // get the data we want from each article
          // pshing it into the mongo data base 
          articles.push({ // Store Scrapped Data into handlebarsObject
            headline: item.children('.title').children('a').text(),
            summary: item.children('.teaser').children('a').text(),
            url: item.children('.title').children('a').attr('href'),
            imageURL: highResImage,
            slug: item.children('.slug-wrap').children('.slug').children('a').text(),
            comments: null
          }); // Store HTML Data as an Object within an Object
        } // End of If Else
      }); // End of Article Serch

      // render
      function render () {
        // Return Scrapped Data to Handlebars for Rendering
        res.render("index", {data: articles});
      }

      // save all the new articles in the db. 
      // mongo has a built in promise/ 
      Promise.map(articles, (article)=> {
        return Article.upsert(article);
      })
        .then(()=> {
          console.log('upserted articles');
          render();
        })
        .catch((error)=> {
          console.error('Error upserting articles: ' + error);
          render();
        });
    });
  });

  // Saved Article Route
  app.get("/api/savedArticles", (req, res) => {
    // Grab every document in the Articles collection
    db.Articles.find({}). // Find all Saved Articles
    then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  }); // Default Route

  /////////////////////////////////////////////// /* Post Requests */ ////////////////////////////////////////////////////////
  app.post("/api/add", (req, res) => { // Add Article Route

    // console.log("add path hit");

    let articleObject = req.body;

    db.Articles. // Save the Article to the Database
    findOne({url: articleObject.url}). // Look for an Existing Article with the Same URL
    then(function(response) {

      if (response === null) { // Only Create Article if it has not been Created
        db.Articles.create(articleObject).then((response) => console.log(" ")).catch(err => res.json(err));
      } // End if

      // If we were able to successfully  save an Article, send a message to the client
      res.send("Article Saved");
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

  }); // End Post Route

  // Delete Article Route
  app.post("/api/deleteArticle", (req, res) => {
    // console.log(req.body)
    sessionArticle = req.body;

    db.Articles.findByIdAndRemove(sessionArticle["_id"]). // Look for the Article and Remove from DB
    then(response => {
      if (response) {
        res.send("Sucessfully Deleted");
      }
    });
  }); // End deleteArticle Route

  // Delete Comment Route
  app.post("/api/deleteComment", (req, res) => {
    // console.log("delete comment route hit")
    let comment = req.body;
    db.Notes.findByIdAndRemove(comment["_id"]). // Look for the Comment and Remove from DB
    then(response => {
      if (response) {
        res.send("Sucessfully Deleted");
      }
    });
  }); // End deleteArticle Route

  // Create Notes Route
  app.post("/api/createNotes", (req, res) => {

    sessionArticle = req.body;

    db.Notes.create(sessionArticle.body).then(function(dbNote) {
      // console.log(dbNote);
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Articles.findOneAndUpdate({
        _id: sessionArticle.articleID.articleID
      }, {
        $push: {
          note: dbNote._id
        }
      });
    }).then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  }); // End deleteArticle Route

  // Route for grabbing a specific Article by id, populate it with it's note
  app.post("/api/populateNote", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    // console.log("ID is "+ req.body.articleID);

    db.Articles.findOne({_id: req.body.articleID}).populate("Note"). // Associate Notes with the Article ID
    then((response) => {
      // console.log("response is " + response);

      if (response.note.length == 1) { // Note Has 1 Comment

        db.Notes.findOne({'_id': response.note}).then((comment) => {
          comment = [comment];
          console.log("Sending Back One Comment");
          res.json(comment); // Send Comment back to the Client
        });

      } else { // Note Has 0 or more than 1 Comments

        console.log("2")
        db.Notes.find({
          '_id': {
            "$in": response.note
          }
        }).then((comments) => {
          // console.log("Sending Back Multiple Comments");
          res.json(comments); // Send Comments back to the Client
        });
      }
      // If we were able to successfully find an Article with the given id, send it back to the client
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  }); // End of Post Populate Note

} // End of Module Export

// i thought you had to export here?? 

