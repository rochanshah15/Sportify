// src/context/BoxContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api.jsx'; // Make sure this path is correct for your project

const BoxContext = createContext();

export const useBox = () => {
    const context = useContext(BoxContext);
    if (context === undefined) {
        throw new Error('useBox must be used within a BoxProvider');
    }
    return context;
};

export const BoxProvider = ({ children }) => {
    const [boxes, setBoxes] = useState([]);
    const [featuredBoxes, setFeaturedBoxes] = useState([]);
    const [popularBoxes, setPopularBoxes] = useState([]);
    const [nearbyBoxes, setNearbyBoxes] = useState([]);
    const [ownerBoxes, setOwnerBoxes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});

    const processBoxData = useCallback((boxesArray) => {
        if (!Array.isArray(boxesArray)) return [];
        return boxesArray.map(box => ({
            ...box,
            rating: box.rating !== null ? parseFloat(box.rating) : null,
            coordinates: (box.latitude && box.longitude) ? [parseFloat(box.latitude), parseFloat(box.longitude)] : null
        })).filter(box => box.coordinates !== null);
    }, []);
    
    const addBox = useCallback(async (boxData) => {
        setLoading(true);
        setError(null);
        const formData = new FormData();
        Object.keys(boxData).forEach(key => {
            if (key === 'images') return;
            const value = boxData[key];
            if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        if (boxData.images && boxData.images.length > 0) {
            formData.append('image', boxData.images[0]);
        }
        try {
            await api.post('/boxes/owner/boxes/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchOwnerBoxes();
            return { success: true };
        } catch (err) {
            console.error('Error adding box:', err.response?.data);
            const errorMessage = err.response?.data?.detail || Object.values(err.response?.data || {})[0]?.[0] || 'Failed to add the box.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []); // fetchOwnerBoxes is defined below

    const fetchOwnerBoxes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/boxes/owner/boxes/');
            setOwnerBoxes(processBoxData(response.data.results || response.data));
        } catch (err) {
            console.error('Error fetching owner boxes:', err);
            setError('Could not load your boxes.');
        } finally {
            setLoading(false);
        }
    }, [processBoxData]);

    const fetchNearbyBoxes = useCallback(async (latitude, longitude, radius = 10) => {
        setLoading(true);
        try {
            const response = await api.get('/boxes/boxes/nearby/', { 
                params: { lat: latitude, lng: longitude, radius } 
            });
            setNearbyBoxes(processBoxData(response.data));
        } catch (err) {
            console.error('Error fetching nearby boxes:', err);
            setError('Could not load nearby boxes.');
        } finally {
            setLoading(false);
        }
    }, [processBoxData]);

    const fetchBoxes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/boxes/boxes/', { params: filters });
            setBoxes(processBoxData(response.data.results || response.data));
        } catch (err) {
            console.error('Error fetching boxes:', err);
            setError('Could not load boxes.');
        } finally {
            setLoading(false);
        }
    }, [filters, processBoxData]);

    const fetchFeaturedBoxes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/boxes/boxes/featured/');
            setFeaturedBoxes(processBoxData(response.data));
        } catch (err) {
            console.error('Error fetching featured boxes:', err);
            setError('Could not load featured boxes.');
        } finally {
            setLoading(false);
        }
    }, [processBoxData]);

    const fetchPopularBoxes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/boxes/boxes/popular/');
            setPopularBoxes(processBoxData(response.data));
        } catch (err) {
            console.error('Error fetching popular boxes:', err);
            setError('Could not load popular boxes.');
        } finally {
            setLoading(false);
        }
    }, [processBoxData]);

    // --- ADDED THIS HOOK TO AUTOMATICALLY FETCH ON FILTER CHANGE ---
    // This is the only modification made to your file.
    useEffect(() => {
        // This check prevents an API call on the very first render before filters are set.
        // The first fetch is triggered when the BoxListings component calls setFilters.
        if (Object.keys(filters).length > 0) {
            fetchBoxes();
        }
    }, [fetchBoxes]); // The dependency array includes fetchBoxes.
                     // Since fetchBoxes itself depends on 'filters', this effect will
                     // run every time the filters are changed.

    const contextValue = {
        boxes,
        featuredBoxes,
        popularBoxes,
        nearbyBoxes,
        ownerBoxes,
        loading,
        error,
        fetchBoxes,
        fetchFeaturedBoxes,
        fetchPopularBoxes,
        fetchNearbyBoxes,
        fetchOwnerBoxes,
        addBox,
        filters,
        setFilters,
        refreshAll: () => {
            fetchBoxes();
            fetchFeaturedBoxes();
            fetchPopularBoxes();
            fetchOwnerBoxes();
        }
    };

    return (
        <BoxContext.Provider value={contextValue}>
            {children}
        </BoxContext.Provider>
    );
};