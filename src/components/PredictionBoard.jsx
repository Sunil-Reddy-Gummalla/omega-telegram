import ExpiredCard from './ExpiredCard';
import LiveCard from './LiveCard';
import NextCard from './NextCard';
import './PredictionBoard.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PredictionBoard = () => {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
    const [tokenPrice, setTokenPrice] = useState(null);
    const [isTimeOver, setIsTimeOver] = useState(false);

    const fetchTokenPrice = async () => {
        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tezos&vs_currencies=usd');
            setTokenPrice(response.data.tezos.usd);
        } catch (error) {
            console.error("Error fetching token price:", error);
        }
    };

    useEffect(() => {
        fetchTokenPrice();
        const intervalId = setInterval(() => {
            fetchTokenPrice();
        }, 60000);
        return () => clearInterval(intervalId);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setIsTimeOver(true); // Time is over
        }
    }, [timeLeft]);

    // Function to reset the timer to 5 minutes
    const handleResetTimer = () => {
        setTimeLeft(300); // Reset to 5 minutes
        setIsTimeOver(false); // Reset the time over state
    };

    return (
        <div className="prediction-board">
            <h1>Market Prediction Board</h1>
            <div className="market-timer">
                <h3 className="timer">
                    Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </h3>
                {tokenPrice && <h4 className="price">Price: ${tokenPrice.toFixed(5)}</h4>}
            </div>
            <div className="card-container">
                <ExpiredCard />
                <LiveCard price={tokenPrice} isTimeOver={isTimeOver} onResetTimer={handleResetTimer} /> {/* Pass reset function */}
                <NextCard />
            </div>
        </div>
    );
};

export default PredictionBoard;
