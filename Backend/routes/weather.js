const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxies OpenWeatherMap so the API key stays on the server (it used to be
// hardcoded directly in the frontend bundle, visible to anyone who opened
// devtools — and this route was never actually mounted in server.js, so
// calling it always 404'd, which is why the Farmer Dashboard showed
// "API failed").
router.get('/current', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'lat and lon query params are required' });
        }
        if (!process.env.WEATHER_API_KEY) {
            return res.status(503).json({ success: false, code: 'WEATHER_NOT_CONFIGURED', message: 'Weather is not configured on this server yet. Add WEATHER_API_KEY to Backend/.env.' });
        }

        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: { lat, lon, units: 'metric', appid: process.env.WEATHER_API_KEY }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Weather (current) error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Weather API error', error: error.response?.data?.message || error.message });
    }
});

router.get('/forecast', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'lat and lon query params are required' });
        }
        if (!process.env.WEATHER_API_KEY) {
            return res.status(503).json({ success: false, code: 'WEATHER_NOT_CONFIGURED', message: 'Weather is not configured on this server yet. Add WEATHER_API_KEY to Backend/.env.' });
        }

        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: { lat, lon, units: 'metric', appid: process.env.WEATHER_API_KEY }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Weather (forecast) error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Weather API error', error: error.response?.data?.message || error.message });
    }
});

module.exports = router;
