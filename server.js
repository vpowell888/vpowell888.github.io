const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/contact', (req, res) => {
  console.log('Contact form data:', req.body);
  res.send('<h1>Thank you for your message!</h1><a href="/">Go back</a>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
