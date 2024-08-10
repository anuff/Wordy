const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res){
    res.render('register');
});

router.post('/register', async function(req, res) {
  try {
      const name = req.body.name;
      const email = req.body.email;
      const username = req.body.username;
      const password = req.body.password;
      const password2 = req.body.password2;

      req.checkBody('name', 'Name is required').notEmpty();
      req.checkBody('email', 'Email is required').notEmpty();
      req.checkBody('email', 'Email is not valid').isEmail();
      req.checkBody('username', 'Username is required').notEmpty();
      req.checkBody('password', 'Password is required').notEmpty();
      req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

      let errors = req.validationErrors();

      if (errors) {
          res.render('register', { errors: errors });
      } else {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          console.log('Original Password:', password);
          console.log('Hashed Password:', hashedPassword);

          const newUser = new User({
              name: name,
              email: email,
              username: username,
              password: hashedPassword
          });

          await newUser.save();
          req.flash('success', 'You are now registered and can log in');
          res.redirect('/users/login');
      }
  } catch (err) {
      console.error('Error hashing password:', err);
      res.status(500).send('Error registering user');
  }
});



// Login Form
router.get('/login', function(req, res){
    res.render('login');
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', function(req, res){
  req.logout(function(err){
      if(err) {
          // Handle error if logout fails
          console.error(err);
          return next(err);
      }
      // Redirect or respond as needed after successful logout\
      req.flash('success', 'You are logged out');
      res.redirect('/users/login');
  });
});


module.exports = router;