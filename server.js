const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/data', (req, res) => {
    const applications = [];

    fs.createReadStream('applications.csv')
        .pipe(csv())
        .on('data', (row) => {
            applications.push(row);
        })
        .on('end', () => {
            res.json(applications);
        });
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
