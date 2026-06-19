import express from 'express';
import fs from 'fs';

const app = express();

// Public folder serve karo
app.use(express.static('public'));

// Channels API
app.get('/channels', (req, res) => {
    try {
        const data = fs.readFileSync('channels.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: "Could not read channels.json" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));