import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaSearchLocation, FaCrosshairs, FaCheckCircle } from 'react-icons/fa';
//  CONFIG → apni Google Maps API key yahan lagao
//  Console: https://console.cloud.google.com/google/maps-apis
//  Enable: Maps JavaScript API, Places API, Geocoding API
const GOOGLE_MAPS_API_KEY = 'AIzaSyAvceWu73u5SBX2YByw5Y2DjDYHFMUwkTA';
const LIBRARIES = ['places'];

const DEFAULT_CENTER = { lat: 30.7333, lng: 79.0667 }; // Kedarnath Valley, Uttarakhand
const MAP_CONTAINER_STYLE = { width: '100%', height: '280px', borderRadius: '14px' };

const MAP_OPTIONS = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
    ]
};

/**
 * LocationPicker
 * Props:
 *  - value: { address, coordinates: {lat,lng}, zipCode, formattedAddress }
 *  - onChange: (locationObject) => void
 */
const LocationPicker = ({ value, onChange }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    });

    const [marker, setMarker] = useState(
        value?.coordinates?.lat ? value.coordinates : DEFAULT_CENTER
    );
    const [zipCode, setZipCode] = useState(value?.zipCode || '');
    const [addressText, setAddressText] = useState(value?.address || '');
    const [locating, setLocating] = useState(false);
    const [zipValidating, setZipValidating] = useState(false);
    const [zipValid, setZipValid] = useState(null);

    const mapRef = useRef(null);
    const autocompleteRef = useRef(null);

    const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

    // Reverse geocode lat/lng → readable address + zip
    const reverseGeocode = useCallback((lat, lng) => {
        if (!window.google) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const result = results[0];
                const zipComponent = result.address_components.find((c) =>
                    c.types.includes('postal_code')
                );
                const foundZip = zipComponent ? zipComponent.long_name : '';
                setAddressText(result.formatted_address);
                if (foundZip) setZipCode(foundZip);

                onChange({
                    address: result.formatted_address,
                    coordinates: { lat, lng },
                    zipCode: foundZip || zipCode,
                    formattedAddress: result.formatted_address
                });
            }
        });
    }, [onChange, zipCode]);

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarker({ lat, lng });
        reverseGeocode(lat, lng);
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setMarker({ lat, lng });
                mapRef.current?.panTo({ lat, lng });
                mapRef.current?.setZoom(15);
                reverseGeocode(lat, lng);
                setLocating(false);
            },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.geometry) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(15);

        const zipComponent = place.address_components?.find((c) =>
            c.types.includes('postal_code')
        );
        const foundZip = zipComponent ? zipComponent.long_name : zipCode;
        setAddressText(place.formatted_address || place.name);
        if (foundZip) setZipCode(foundZip);

        onChange({
            address: place.formatted_address || place.name,
            coordinates: { lat, lng },
            zipCode: foundZip,
            formattedAddress: place.formatted_address
        });
    };

    // Validate ZIP code by geocoding it → moves marker to that pin code area
    const handleZipBlur = () => {
        if (!zipCode || zipCode.length < 6 || !window.google) {
            setZipValid(zipCode.length === 0 ? null : false);
            return;
        }
        setZipValidating(true);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: `${zipCode}, India` }, (results, status) => {
            setZipValidating(false);
            if (status === 'OK' && results[0]) {
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();
                setMarker({ lat, lng });
                mapRef.current?.panTo({ lat, lng });
                mapRef.current?.setZoom(13);
                setZipValid(true);
                setAddressText(results[0].formatted_address);
                onChange({
                    address: results[0].formatted_address,
                    coordinates: { lat, lng },
                    zipCode,
                    formattedAddress: results[0].formatted_address
                });
            } else {
                setZipValid(false);
            }
        });
    };

    useEffect(() => {
        if (value?.coordinates?.lat) setMarker(value.coordinates);
    }, [value]);

    if (loadError) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                Map load nahi ho saka. Google Maps API key check karein.
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="p-8 bg-surface-alt dark:bg-app-bg border border-gray-200 dark:border-outline rounded-xl text-sm text-gray-400 dark:text-ink-soft-soft text-center">
                Map load ho raha hai...
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase tracking-wide">
                Farm Location
            </label>

            {/* Search box with Places Autocomplete */}
            <Autocomplete
                onLoad={(ac) => (autocompleteRef.current = ac)}
                onPlaceChanged={handlePlaceChanged}
                options={{ componentRestrictions: { country: 'in' } }}
            >
                <div className="relative">
                    <FaSearchLocation className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft text-sm" />
                    <input
                        type="text"
                        value={addressText}
                        onChange={(e) => setAddressText(e.target.value)}
                        placeholder="Village, Tehsil, District search karein..."
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-outline rounded-xl text-sm outline-none focus:border-green-500 transition"
                    />
                </div>
            </Autocomplete>

            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-outline">
                <GoogleMap
                    mapContainerStyle={MAP_CONTAINER_STYLE}
                    center={marker}
                    zoom={value?.coordinates?.lat ? 13 : 8}
                    onClick={handleMapClick}
                    onLoad={onMapLoad}
                    options={MAP_OPTIONS}
                >
                    <Marker
                        position={marker}
                        draggable
                        onDragEnd={(e) => {
                            const lat = e.latLng.lat();
                            const lng = e.latLng.lng();
                            setMarker({ lat, lng });
                            reverseGeocode(lat, lng);
                        }}
                    />
                </GoogleMap>

                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    className="absolute bottom-3 right-3 bg-surface dark:bg-surface shadow-md rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold text-green-700 hover:bg-green-50 transition disabled:opacity-60"
                >
                    <FaCrosshairs className={locating ? 'animate-spin' : ''} />
                    {locating ? 'Locating...' : 'Use My Location'}
                </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-ink-soft-soft flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-green-500" />
                Map par tap karein ya pin ko drag karein exact location set karne ke liye
            </p>

            {/* ZIP Code field */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase tracking-wide mb-1.5">
                    PIN / ZIP Code
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => {
                            setZipCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                            setZipValid(null);
                        }}
                        onBlur={handleZipBlur}
                        placeholder="e.g. 246471 (Kedarnath area)"
                        maxLength={6}
                        className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition pr-9 ${zipValid === true ? 'border-green-400 focus:border-green-500' :
                            zipValid === false ? 'border-red-300 focus:border-red-400' :
                                'border-gray-200 dark:border-outline focus:border-green-500'
                            }`}
                    />
                    {zipValidating && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-ink-soft-soft">...</span>
                    )}
                    {!zipValidating && zipValid === true && (
                        <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm" />
                    )}
                </div>
                {zipValid === false && (
                    <p className="text-xs text-red-400 mt-1">PIN code se location nahi mil saka, map par manually set karein</p>
                )}
                {zipValid === true && (
                    <p className="text-xs text-green-500 mt-1">PIN code verified — map par location update ho gaya</p>
                )}
            </div>
        </div>
    );
};

export default LocationPicker;
