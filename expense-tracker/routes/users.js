const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const Expense = require('../models/Expense'); // Import the Expense model

// Registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle Registration POST
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  let errors = [];

  if (!username || !password) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.render('register', { errors, username, password });
  }

  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      errors.push({ msg: 'Username already exists' });
      return res.render('register', { errors, username, password });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/users/login');

  } catch (err) {
    console.error(err);
    res.render('register', { errors: [{ msg: 'Server error' }], username, password });
  }
});

// Handle Login POST
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/expenses',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

// Add Expense Page
router.get('/expenses/add', (req, res) => {
  res.render('expenses/add'); // Create this view for adding expenses
});

// Handle Add Expense POST
router.post('/expenses/add', async (req, res) => {
  const { date, description, amount, category } = req.body;
  const errors = [];

  if (!date || !description || !amount || !category) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (errors.length > 0) {
    return res.render('expenses/add', { errors, date, description, amount, category });
  }

  try {
    const newExpense = new Expense({
      user: req.user.id, // Associate expense with the logged-in user
      date,
      description,
      amount,
      category
    });

    await newExpense.save();
    req.flash('success_msg', 'Expense added successfully');
    res.redirect('/expenses'); // Redirect to the expenses list page

  } catch (err) {
    console.error(err);
    res.render('expenses/add', { errors: [{ msg: 'Error saving expense' }], date, description, amount, category });
  }
});

// Get All Expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).lean(); // Fetch expenses for the logged-in user
    res.render('expenses/list', { expenses }); // Ensure you have this view
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;