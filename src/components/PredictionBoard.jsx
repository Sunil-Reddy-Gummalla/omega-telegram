import React from 'react';
import ExpiredCard from './ExpiredCard';
import LiveCard from './LiveCard';
import NextCard from './NextCard';
import RoundManager from './RoundManager';
import './PredictionBoard.css';

const PredictionBoard = () => {
    return (
        <div className="prediction-board">
            <h1>Market Prediction Board</h1>
            <RoundManager />
            <div className="card-container">
                <LiveCard />
                <NextCard />
                <ExpiredCard />
            </div>
        </div>
    );
};

export default PredictionBoard;