const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../dist-tauri')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist-tauri/index.html'));
});

app.listen(port, () => {
    console.log(Tauri dev server running on http://localhost:);
});
