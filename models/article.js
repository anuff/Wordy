let mongoose = require('mongoose');

// Article Schema
let articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
}, { collection: 'articles' }
)
let Article = mongoose.model('Article', articleSchema, 'articles');
module.exports.Article = Article;
