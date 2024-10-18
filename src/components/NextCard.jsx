import React, { useState, useEffect } from 'react';
import './Card.css';
import { ethers } from 'ethers';
import { getContract, getSignedContract, connectWallet } from '../utils/contractUtils';

const NextCard = () => {
    const [amount, setAmount] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);
    const [selectedDirection, setSelectedDirection] = useState('');
    const [currentEpoch, setCurrentEpoch] = useState(null);
    const [roundInfo, setRoundInfo] = useState(null);
    const [account, setAccount] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const contract = getContract();
                const epoch = await contract.currentEpoch();
                setCurrentEpoch(Number(epoch));

                const round = await contract.rounds(epoch);
                setRoundInfo(round);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds

        return () => clearInterval(interval);
    }, []);

    const handleConnectWallet = async () => {
        try {
            const address = await connectWallet();
            setAccount(address);
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    };

    const handlePrediction = (direction) => {
        if (!account) {
            handleConnectWallet();
            return;
        }
        setSelectedDirection(direction);
        setIsFlipped(true);
    };

    const handleBack = () => {
        setIsFlipped(false);
        setAmount('');
    };

    const handleCommit = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        try {
            const signedContract = await getSignedContract();
            const tx = await signedContract.placeBet(selectedDirection === 'up', {
                value: ethers.parseEther(amount)
            });
            await tx.wait();
            alert("Bet placed successfully!");
            handleBack();
        } catch (error) {
            console.error("Error placing bet:", error);
            alert("Failed to place bet. Please try again.");
        }
    };

    if (!roundInfo) return <div>Loading...</div>;

    return (
        <div className="card next-card">
            {!isFlipped ? (
                <>
                    <h3>Next Prediction</h3>
                    <div className="info-container">
                        <div className="info-box">
                            <h4>Prize Pool</h4>
                            <p>{ethers.formatEther(roundInfo.totalAmount)} XTZ</p>
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
                    <div className="prediction-buttons">
                        <button
                            onClick={() => handlePrediction('up')}
                            className="up-button"
                            disabled={roundInfo.lockTimestamp <= Math.floor(Date.now() / 1000)}
                        >
                            📈 Up
                        </button>
                        <button
                            onClick={() => handlePrediction('down')}
                            className="down-button"
                            disabled={roundInfo.lockTimestamp <= Math.floor(Date.now() / 1000)}
                        >
                            📉 Down
                        </button>
                    </div>
                    {!account && (
                        <button onClick={handleConnectWallet} className="connect-wallet-button">
                            Connect Wallet
                        </button>
                    )}
                </>
            ) : (
                <>
                    <h3>Set Position</h3>
                    <p>Selected Direction: {selectedDirection === 'up' ? '📈 Up' : '📉 Down'}</p>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter XTZ amount"
                        className="amount-input"
                    />
                    <div className="action-buttons">
                        <button onClick={handleCommit} className="commit-button">
                            Commit
                        </button>
                        <button onClick={handleBack} className="back-button">Back</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default NextCard;