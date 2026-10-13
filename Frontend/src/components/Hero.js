import React from 'react';
import { Link } from 'react-router-dom';
import { FaMountain, FaLeaf, FaHome } from 'react-icons/fa';

const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920)',
                    filter: 'brightness(0.5)'
                }}
            ></div>

            <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                    <FaMountain className="text-4xl text-green-400" />
                    <span className="text-green-400 text-lg font-medium tracking-wider uppercase">Himalayan Connect</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    From <span className="text-green-400">Himalayan Farms</span>
                    <br />To Your <span className="text-yellow-400">Doorstep</span>
                </h1>

                <p className="text-xl md:text-2xl mb-8 border-outline max-w-2xl mx-auto">
                    Experience Uttarakhand's organic produce and eco-homestays.
                    Support mountain farmers. Live the Himalayan way.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link
                        to="/products"
                        className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2"
                    >
                        <FaLeaf /> <span>Shop Organic</span>
                    </Link>
                    <Link
                        to="/homestays"
                        className="bg-surface dark:bg-surface/20 backdrop-blur text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-surface/30 transition flex items-center space-x-2 border border-white/40"
                    >
                        <FaHome /> <span>Book Homestay</span>
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                    <div className="w-1 h-3 bg-surface dark:bg-surface rounded-full animate-pulse"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;