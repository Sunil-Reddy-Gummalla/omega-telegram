import React, { useState } from 'react';
import './Card.css';
import { useActiveAccount, ConnectButton, useWalletBalance } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { etherlink_mainnet, etherlink_testnet } from '../native-chains/etherlink';
import { client } from '../client';

const tokenAddress = "0xB1Ea698633d57705e93b0E40c1077d46CD6A51d8"; // Replace this with the actual Tezos token contract address

const NextCard = () => {
    const [amount, setAmount] = useState('');
    const [isFlipped, setIsFlipped] = useState(false); // Track if card is flipped
    const [selectedDirection, setSelectedDirection] = useState(''); // Track selected direction
    const [rotate, setRotate] = useState(false); // Track rotation state
    const [highlightWalletButton, setHighlightWalletButton] = useState(false); // Highlight state for connect wallet button

    const account = useActiveAccount(); // Get active account
    const { data: balanceData, isLoading, isError } = useWalletBalance({
        chain: etherlink_testnet,
        address: account?.address,
        client,
        tokenAddress, // Tezos token address
    });

    const handleRotate = () => {
        setRotate(true); // Set rotate to true to trigger animation
        setTimeout(() => setRotate(false), 1000); // Reset rotation state after animation
    };

    const handlePrediction = (direction) => {
        if (!account) {
            // If no account, highlight the connect wallet button
            setHighlightWalletButton(true);
            setTimeout(() => setHighlightWalletButton(false), 1500); // Remove highlight after 1.5 seconds
            return;
        }
        setSelectedDirection(direction); // Save the selected direction (up or down)
        setIsFlipped(true); // Show the position input view
        handleRotate(); // Rotate on prediction selection
    };

    const handleBack = () => {
        setIsFlipped(false); // Go back to the initial prediction view
        setAmount(''); // Reset amount input
        handleRotate(); // Rotate on back action
    };

    const handleCommit = () => {
        console.log(`Betting ${amount} XTZ in ${selectedDirection} direction.`);
    };

    return (
        <div className={`card next-card ${rotate ? 'rotate' : ''}`}>
            {!isFlipped ? (
                // Initial prediction view (Up/Down buttons)
                <>
                    <h3>Next Prediction</h3>
                    <div className="info-container">
                        <div className="info-box">
                            <h4>Prize Pool</h4>
                            <p>$1000</p> {/* Placeholder value */}
                        </div>
                        <div className="info-box">
                            <h4>Up</h4>
                            <p>1.5x</p> {/* Placeholder value */}
                        </div>
                        <div className="info-box">
                            <h4>Down</h4>
                            <p>0.8x</p> {/* Placeholder value */}
                        </div>
                    </div>
                    <div className="prediction-buttons">
                        <button
                            onClick={() => handlePrediction('up')}
                            className="up-button"
                            disabled={!account} // Disable if wallet is not connected
                        >
                            📈 Up
                        </button>
                        <button
                            onClick={() => handlePrediction('down')}
                            className="down-button"
                            disabled={!account} // Disable if wallet is not connected
                        >
                            📉 Down
                        </button>
                    </div>

                    {/* Conditionally render the "Connect Wallet" button if the wallet is not connected */}
                    {!account && (
                        <ConnectButton
                            client={client}
                            chain={etherlink_mainnet}
                            wallets={[
                                inAppWallet({
                                    auth: {
                                        options: ['telegram'],
                                    },
                                }),
                                createWallet('io.metamask'),
                            ]}
                            className={highlightWalletButton ? 'highlight' : ''} // Apply highlight class if needed
                        />
                    )}
                </>
            ) : (
                // Set Position form (input field and commit/back buttons)
                <>
                    <h3>Set Position</h3>
                    <p>Selected Direction: {selectedDirection === 'up' ? '📈 Up' : '📉 Down'}</p>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter Tezos amount"
                        className="amount-input"
                    />

                    {/* Display balance under the input */}
                    {isLoading ? (
                        <p>Loading balance...</p>
                    ) : isError ? (
                        <p>Error fetching balance</p>
                    ) : (
                        <p>Your Balance: {balanceData?.displayValue} {balanceData?.symbol}</p>
                    )}

                    <div className="action-buttons">
                        <button onClick={handleCommit} className="commit-button">Commit</button>
                        <button onClick={handleBack} className="back-button">Back</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default NextCard;
