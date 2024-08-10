const express = require('express');
const router = express.Router();

// Aryicle Model
let {Article} = require('../models/article');
// User Model
let User = require('../models/user');



// Add route
router.get('/add', ensureAuthenticated, function(req, res) {
    res.render("add_article", {
        title:'Add Article'
    });
});

// Add Submit POST Route
router.post('/add', async function(req, res){
    req.checkBody('title','Title is required').notEmpty();
    //req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if(errors){
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
        
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
    
        try {
            await article.save();
            req.flash('success', 'Article Added');
            res.redirect('/');
        } catch (err) {
            console.log(err);
            return;
        }
    }
});


// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (article.author != req.user._id) {
        req.flash('danger', 'Not Authorized');
        return res.redirect('/');
      }
      res.render('edit_article', {
        title: 'Edit Article',
        article: article
      });
  
    } catch (e) {
      res.send(e);
    }
  
  });

// Update Submit POST Route
router.post('/edit/:id', async function(req, res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}; 

    try {
        await Article.updateOne(query, article);
        req.flash('success', 'Article Updated');
        res.redirect('/');
    } catch (err) {
        console.log(err);
        return;
    }
});


// Delete Article
router.delete('/:id', async (req, res) => {
    try {
      if (!req.user._id) {
        res.status(500).send();
      }
      let query = { _id: req.params.id }
      const article = await Article.findById(req.params.id);
  
      if (article.author != req.user._id) {
        res.status(500).send();
      } else {
        remove = await Article.findByIdAndRemove(query);
        if (remove) {
          res.send('Success');
        }
      };
    } catch (e) {
      res.send(e);
    }
  });

// Get Single Article
router.get('/:id', async (req, res) => {
    const article = await Article.findById(req.params.id);
    const user = await User.findById(article.author);
    if (user) {
      res.render('article', {
        article: article,
        author: user.name
      });
    }
  });

// Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;
