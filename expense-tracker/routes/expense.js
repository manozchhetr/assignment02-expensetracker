const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth'); // We'll create this helper later
const Expense = require('../models/Expense');

router.get('/', ensureAuthenticated, async (req, res) => {
  const expenses = await Expense.find({ user: req.user.id }).lean();
  res.render('expenses/list', { expenses });
});

router.get('/add', ensureAuthenticated, (req, res) => res.render('expenses/add'));

router.post('/add', ensureAuthenticated, async (req, res) => {
  const { category, amount, description, date } = req.body;
  const newExpense = new Expense({
    user: req.user.id,
    category,
    amount,
    description,
    date
  });
  await newExpense.save();
  res.redirect('/expenses');
});

module.exports = router;
