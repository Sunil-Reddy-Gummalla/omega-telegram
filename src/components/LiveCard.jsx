import React, { useState, useEffect } from 'react';
import './Card.css';

const LiveCard = ({ price, isTimeOver, onResetTimer }) => {
    const [lockedPrice, setLockedPrice] = useState("0.6900"); // Initialize locked price
    const [priceChange, setPriceChange] = useState(0);
    const [upMultiplier, setUpMultiplier] = useState(1);
    const [downMultiplier, setDownMultiplier] = useState(1);
    const [isCalculating, setIsCalculating] = useState(false);
    const pricePool = 1000;
    useEffect(() => {
        if (!isTimeOver) {
            const calculatedPriceChange = (price - lockedPrice).toFixed(5); // Price change with 5 decimal places
            setPriceChange(calculatedPriceChange);

            const calculatedUpMultiplier = (1 + Math.abs(calculatedPriceChange) / 100).toFixed(2);
            setUpMultiplier(calculatedUpMultiplier);

            const calculatedDownMultiplier = (1 - Math.abs(calculatedPriceChange) / 100).toFixed(2);
            setDownMultiplier(calculatedDownMultiplier);
        }
    }, [price, lockedPrice, isTimeOver]);

    // Handle time over (processing for 10 seconds, then reset timer)
    useEffect(() => {
        if (isTimeOver) {
            setIsCalculating(true); // Show "Calculating..." message

            // Simulate processing for 10 seconds
            const timer = setTimeout(() => {
                setIsCalculating(false); // Hide "Calculating..." message
                if (onResetTimer) {
                    onResetTimer(); // Call the parent component's function to reset the timer
                }
            }, 10000); // 10 seconds delay

            return () => clearTimeout(timer); // Cleanup timer if component unmounts
        }
    }, [isTimeOver, price, onResetTimer]);

    return (
        <div className="card live-card">
            <h2>Live Prediction</h2>
            <p>Locked Price: ${lockedPrice}</p>
            {isCalculating ? (
                <div className="loading-container">
                    <img src="https://i.gifer.com/Xuw0.gif" alt="Loading..." className="loading-icon" />
                    <p className="centered-text">Calculating...</p> {/* Show this when processing */}
                </div>
            ) : (
                <>
                    <div className="info-row">
                        <div className={`price-box ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                            Current Price: ${price}
                        </div>
                        <div className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                            Price Change: {priceChange}
                        </div>
                    </div>
                    <div className="info-container">
                        <div className="info-box">
                            <h4>Prize Pool</h4>
                            <p>${pricePool}</p> {/* Placeholder value */}
                        </div>
                        <div className="info-box">
                            <h4>Up</h4>
                            <p>{upMultiplier}</p> {/* Placeholder value */}
                        </div>
                        <div className="info-box">
                            <h4>Down</h4>
                            <p>{downMultiplier}</p> {/* Placeholder value */}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LiveCard;
