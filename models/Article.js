/////////////////////////////////////////////// /* Imports */ //////////////////////////////////////////////////////////
let mongoose = require('mongoose');

/////////////////////////////////////////////// /* Initialize */ //////////////////////////////////////////////////////////
let Schema = mongoose.Schema; // Save a Reference to the Schema Constructor

/////////////////////////////////////////////// /* Model*/ //////////////////////////////////////////////////////////

let ArticleSchema = new Schema({ // Create a New Schema Constructor for News Article

  headline: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  imageURL: {
    type: String,
    required: true
  },

  slug: {
    type: String
  },

  // `comments` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Comment
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]

}); // End of New Schema


/////////////////////////////////////////////// /* Export */ //////////////////////////////////////////////////////////


// AnimalSchema.statics.search = function search (name, cb) {
//   return this.where('name', new RegExp(name, 'i')).exec(cb);
// }

// Animal.search('Rover', function (err) {
//   if (err) ...
// })

// var query = {},
//     update = { expire: new Date() },
//     options = { upsert: true, new: true, setDefaultsOnInsert: true };

// // Find the document
// Model.findOneAndUpdate(query, update, options, function(error, result) {
//     if (error) return;

//     // do something with the document
// });


ArticleSchema.statics.upsert = function upsert (data) {
  var query = {url: data.url};
  var data; 
  var options = { 
    upsert: true, 
    new: true, 
    setDefaultsOnInsert: true 
  };

  // upsert the article
  return Article.findOneAndUpdate(query, data, options).exec();
}

// This creates our model from the above schema, using mongoose's model method
let Article = mongoose.model("Article", ArticleSchema);

module.exports = Article; // Export the Article Model
