const express = require('express');
const app = express();
const fs = require('fs');
app.use(express.static('public'));
app.get('/channels', (req, res) => {
    const data = JSON.parse(fs.readFileSync('channels.json', 'utf8'));
    res.json(data);
});
app.listen(process.env.PORT || 3000);