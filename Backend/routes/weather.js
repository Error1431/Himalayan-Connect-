const axios = require('axios');

const getWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather`,
            {
                params: {
                    lat,
                    lon,
                    units: 'metric',
                    appid: process.env.WEATHER_API_KEY
                }
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Weather API error',
            error: error.response?.data || error.message
        });
    }
};

module.exports = { getWeather };