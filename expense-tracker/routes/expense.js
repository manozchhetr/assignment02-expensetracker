const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth'); // Ensure you have this helper
const Expense = require('../models/Expense'); // Adjust path as necessary

// Get all expenses for the authenticated user
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).lean(); // Fetch user-specific expenses
    res.render('expenses/list', { expenses }); // Render the expenses view with data
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Render the add expense form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('expenses/add'); // Render the form to add a new expense
});

// Handle adding a new expense
router.post('/add', ensureAuthenticated, async (req, res) => {
  const { category, amount, description, date } = req.body;

  try {
    const newExpense = new Expense({
      user: req.user.id, // Associate expense with the logged-in user
      category,
      amount,
      description,
      date
    });

    await newExpense.save(); // Save the expense to the database
    res.redirect('/expenses'); // Redirect to the expenses list
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error'); // Handle any errors
  }
});

module.exports = router;