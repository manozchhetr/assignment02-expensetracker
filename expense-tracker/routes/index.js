const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

router.get('/', (req, res) => {
  res.render('index', { title: 'Expense Tracker Home' });
});

router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().populate('user').lean();
    res.render('expenses', { expenses });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
