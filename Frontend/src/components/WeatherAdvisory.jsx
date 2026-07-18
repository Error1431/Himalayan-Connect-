import React, { useState, useEffect } from 'react';
import {
    FaCloudSun, FaCloudRain, FaSun, FaCloud, FaSnowflake,
    FaWind, FaTint, FaThermometerHalf, FaExclamationTriangle,
    FaSeedling, FaUmbrella, FaSpinner
} from 'react-icons/fa';

// ─────────────────────────────────────────────
//  CONFIG →  OpenWeatherMap API key 
//  Free key: https://openweathermap.org/api (One Call API 3.0 or Current Weather)
// ─────────────────────────────────────────────
const OPENWEATHER_API_KEY = '876193a1f2815c7d4015c198912f67f3';

const getWeatherIcon = (condition, size = 'text-3xl') => {
    const map = {
        Clear: <FaSun className={`${size} text-amber-400`} />,
        Clouds: <FaCloud className={`${size} text-gray-400 dark:text-ink-soft-soft`} />,
        Rain: <FaCloudRain className={`${size} text-blue-400`} />,
        Drizzle: <FaCloudRain className={`${size} text-blue-300`} />,
        Thunderstorm: <FaCloudRain className={`${size} text-purple-500`} />,
        Snow: <FaSnowflake className={`${size} text-cyan-300`} />,
        Mist: <FaCloud className={`${size} border-outline`} />,
        Haze: <FaCloud className={`${size} border-outline`} />
    };
    return map[condition] || <FaCloudSun className={`${size} text-amber-400`} />;
};

// Generates a farming advisory based on current conditions
const getFarmAdvisory = (current, forecast) => {
    const advisories = [];
    if (!current) return advisories;

    if (current.main.temp > 32) {
        advisories.push({
            type: 'warning',
            text: 'Tez garmi hai — fasal ko shaam ya subah jaldi paani dein, dopahar mein nahi.'
        });
    }
    if (current.main.temp < 5) {
        advisories.push({
            type: 'warning',
            text: 'Thand zyada hai — paudhon ko frost se bachane ke liye covering karein.'
        });
    }
    if (current.main.humidity > 80) {
        advisories.push({
            type: 'info',
            text: 'Humidity high hai — fungal diseases ka khatra. Neem oil spray ka samay hai.'
        });
    }
    if (current.wind.speed > 8) {
        advisories.push({
            type: 'warning',
            text: 'Tez hawa chal rahi hai — naye paudhon ko support dein ya staking karein.'
        });
    }
    const rainComing = forecast?.some((f) => f.weather[0].main === 'Rain');
    if (rainComing) {
        advisories.push({
            type: 'info',
            text: 'Aane wale dinon mein baarish ki sambhavna hai — harvest ho chuki fasal ko dhak kar rakhein.'
        });
    }
    if (advisories.length === 0) {
        advisories.push({
            type: 'success',
            text: 'Mausam fasal ke liye anukool hai — normal farming activities continue rakhein.'
        });
    }
    return advisories;
};

/**
 * WeatherAdvisory
 * Props:
 *  - lat, lng: coordinates of the farm (defaults to Kedarnath Valley)
 *  - locationName: display name for the location
 */
const WeatherAdvisory = ({ lat = 30.7346, lng = 79.0669, locationName = 'Kedarnath Valley, Uttarakhand' }) => {
    const [current, setCurrent] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchWeather = async () => {
            setLoading(true);
            setError(null);
            try {
                const [currentRes, forecastRes] = await Promise.all([
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`),
                    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`)
                ]);

                if (!currentRes.ok || !forecastRes.ok) throw new Error('Weather API error');

                const currentData = await currentRes.json();
                const forecastData = await forecastRes.json();

                // Take one forecast entry per day (every 8th = 24hrs apart in 3-hr steps)
                const dailyForecast = forecastData.list.filter((_, i) => i % 8 === 0).slice(0, 5);

                if (isMounted) {
                    setCurrent(currentData);
                    setForecast(dailyForecast);
                }
            } catch (err) {
                console.error('Weather fetch error:', err);
                if (isMounted) setError('Mausam data load nahi ho saka. API key check karein.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchWeather();
        return () => { isMounted = false; };
    }, [lat, lng]);

    if (loading) {
        return (
            <div className="bg-surface dark:bg-surface rounded-2xl shadow-sm dark:shadow-none p-10 flex flex-col items-center justify-center text-gray-400 dark:text-ink-soft-soft">
                <FaSpinner className="animate-spin text-2xl mb-3 text-green-500" />
                <p className="text-sm">Mausam jankari load ho rahi hai...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-surface dark:bg-surface rounded-2xl shadow-sm dark:shadow-none p-8">
                <div className="flex items-center gap-3 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <FaExclamationTriangle className="text-xl shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const advisories = getFarmAdvisory(current, forecast);

    return (
        <div className="space-y-6">
            {/* Current weather hero card */}
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-sm dark:shadow-none p-6 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sky-100 text-sm font-medium">{locationName}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h2 className="text-5xl font-bold">{Math.round(current.main.temp)}°</h2>
                            <span className="text-sky-100 text-sm">feels like {Math.round(current.main.feels_like)}°C</span>
                        </div>
                        <p className="text-sky-50 mt-1 capitalize">{current.weather[0].description}</p>
                    </div>
                    {getWeatherIcon(current.weather[0].main, 'text-6xl')}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/20">
                    <div className="flex items-center gap-2">
                        <FaTint className="text-sky-200" />
                        <div>
                            <p className="text-xs text-sky-100">Humidity</p>
                            <p className="font-semibold">{current.main.humidity}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaWind className="text-sky-200" />
                        <div>
                            <p className="text-xs text-sky-100">Wind</p>
                            <p className="font-semibold">{current.wind.speed} m/s</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaThermometerHalf className="text-sky-200" />
                        <div>
                            <p className="text-xs text-sky-100">Pressure</p>
                            <p className="font-semibold">{current.main.pressure} hPa</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Farm advisory cards */}
            <div className="bg-surface dark:bg-surface rounded-2xl shadow-sm dark:shadow-none p-6">
                <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2">
                    <FaSeedling className="text-green-500" /> Farming Advisory
                </h3>
                <div className="space-y-3">
                    {advisories.map((adv, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border ${adv.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                                adv.type === 'success' ? 'bg-green-50 border-green-200' :
                                    'bg-blue-50 border-blue-200'
                                }`}
                        >
                            {adv.type === 'warning' ? <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" /> :
                                adv.type === 'success' ? <FaSeedling className="text-green-500 mt-0.5 shrink-0" /> :
                                    <FaUmbrella className="text-blue-500 mt-0.5 shrink-0" />}
                            <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft">{adv.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5-day forecast */}
            <div className="bg-surface dark:bg-surface rounded-2xl shadow-sm dark:shadow-none p-6">
                <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4">5-Day Forecast</h3>
                <div className="grid grid-cols-5 gap-2">
                    {forecast.map((day, i) => {
                        const date = new Date(day.dt * 1000);
                        return (
                            <div key={i} className="text-center p-3 rounded-xl bg-surface-alt dark:bg-app-bg hover:bg-green-50 transition">
                                <p className="text-xs text-gray-400 dark:text-ink-soft-soft font-medium mb-2">
                                    {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                                </p>
                                {getWeatherIcon(day.weather[0].main, 'text-2xl mx-auto')}
                                <p className="text-sm font-bold text-ink-soft dark:text-ink-soft mt-2">{Math.round(day.main.temp)}°</p>
                                <p className="text-xs text-gray-400 dark:text-ink-soft-soft">{Math.round(day.main.temp_min)}°/{Math.round(day.main.temp_max)}°</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeatherAdvisory;
