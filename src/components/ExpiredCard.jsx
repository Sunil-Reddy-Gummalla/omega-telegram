import React from 'react';
import './Card.css'; // Import common CSS

const ExpiredCard = () => {
    return (
        <div className="card expired-card">
            <h3>Expired Prediction</h3>
            <p>No further actions can be taken.</p>
        </div>
    );
};

export default ExpiredCard;
