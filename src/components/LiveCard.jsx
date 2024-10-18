import React, { useState, useEffect } from 'react';
import './Card.css';
import { ethers } from 'ethers';
import { getContract } from '../utils/contractUtils';
import { getTezosPrice } from '../utils/api';

const LiveCard = () => {
    const [roundInfo, setRoundInfo] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const contract = getContract();
                const currentEpoch = await contract.currentEpoch();
                const round = await contract.rounds(currentEpoch);
                setRoundInfo(round);

                const price = await getTezosPrice();
                setCurrentPrice(price);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (roundInfo) {
            const interval = setInterval(() => {
                const now = Math.floor(Date.now() / 1000);
                const end = Number(roundInfo.closeTimestamp);
                const left = end - now;
                setTimeLeft(left > 0 ? left : 0);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [roundInfo]);

    if (!roundInfo) return <div>Loading...</div>;

    const lockPrice = ethers.formatUnits(roundInfo.lockPrice, 8);
    const totalAmount = ethers.formatEther(roundInfo.totalAmount);

    return (
        <div className="card live-card">
            <h2>Live Prediction</h2>
            <p>Locked Price: ${lockPrice}</p>
            <div className="info-row">
                <div className="time-left">Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
            </div>
            <div className="info-container">
                <div className="info-box">
                    <h4>Prize Pool</h4>
                    <p>{totalAmount} XTZ</p>
                </div>
                <div className="info-box">
                    <h4>Up</h4>
                    <p>{roundInfo.bullAmount > 0 ? 
                        (Number(roundInfo.totalAmount) / Number(roundInfo.bullAmount)).toFixed(2) : 
                        '0'}x</p>
                </div>
                <div className="info-box">
                    <h4>Down</h4>
                    <p>{roundInfo.bearAmount > 0 ? 
                        (Number(roundInfo.totalAmount) / Number(roundInfo.bearAmount)).toFixed(2) : 
                        '0'}x</p>
                </div>
            </div>
            {currentPrice && (
                <div className="current-price">
                    <h4>Current Price</h4>
                    <p className={currentPrice > Number(lockPrice) ? 'positive' : 'negative'}>
                        ${currentPrice.toFixed(5)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default LiveCard;