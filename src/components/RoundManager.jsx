import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../utils/contractUtils';
import { getTezosPrice } from '../utils/api';

const ROUND_DURATION = 7 * 60; // 7 minutes in seconds
const LOCK_DURATION = 2 * 60; // 2 minutes in seconds

const RoundManager = () => {
    const [currentEpoch, setCurrentEpoch] = useState(null);
    const [roundInfo, setRoundInfo] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [tokenPrice, setTokenPrice] = useState(null);
    const [error, setError] = useState(null);

    const [contract, setContract] = useState(null);

    useEffect(() => {
        const initializeContract = async () => {
            try {
                const privateKey = process.env.VITE_PRIVATE_KEY;
                if (!privateKey) {
                    throw new Error("Private key not found in environment variables");
                }
                const provider = new ethers.JsonRpcProvider('https://node.ghostnet.etherlink.com');
                const signer = new ethers.Wallet(privateKey, provider);
                const initializedContract = getContract().connect(signer);
                setContract(initializedContract);
            } catch (err) {
                console.error("Error initializing contract:", err);
                setError("Failed to initialize contract. Check console for details.");
            }
        };

        initializeContract();
    }, []);

    useEffect(() => {
        if (!contract) return;

        const fetchData = async () => {
            try {
                const epoch = await contract.currentEpoch();
                setCurrentEpoch(Number(epoch));

                const round = await contract.rounds(epoch);
                setRoundInfo(round);

                const price = await getTezosPrice();
                setTokenPrice(price);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data. Check console for details.");
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 60000); // Refresh every 60 seconds

        return () => clearInterval(intervalId);
    }, [contract]);

    useEffect(() => {
        if (!contract || !roundInfo) return;

        const interval = setInterval(async () => {
            const now = Math.floor(Date.now() / 1000);
            const start = Number(roundInfo.startTimestamp);
            const end = start + ROUND_DURATION;
            const left = end - now;
            setTimeLeft(left > 0 ? left : 0);

            // Lock round after 2 minutes
            if (now >= start + LOCK_DURATION && roundInfo.lockPrice.toString() === '0') {
                await handleLockRound();
            }

            // End round after 7 minutes
            if (now >= end && roundInfo.closePrice.toString() === '0') {
                await handleEndRound();
            }

            // Start new round if current round has ended
            if (now >= end && roundInfo.closePrice.toString() !== '0') {
                await handleStartRound();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [contract, roundInfo]);

    const handleStartRound = async () => {
        if (!contract) return;
        try {
            const tx = await contract.startRound();
            await tx.wait();
            console.log("New round started successfully!");
        } catch (err) {
            console.error("Error starting new round:", err);
            setError("Failed to start new round. Check console for details.");
        }
    };

    const handleLockRound = async () => {
        if (!contract) return;
        const price = await getTezosPrice();
        if (!price) {
            console.error("Unable to fetch token price for locking round.");
            return;
        }
        try {
            const tx = await contract.lockRound(ethers.parseUnits(price.toString(), 8));
            await tx.wait();
            console.log("Round locked successfully with price:", price);
        } catch (err) {
            console.error("Error locking round:", err);
            setError("Failed to lock round. Check console for details.");
        }
    };

    const handleEndRound = async () => {
        if (!contract) return;
        const price = await getTezosPrice();
        if (!price) {
            console.error("Unable to fetch token price for ending round.");
            return;
        }
        try {
            const tx = await contract.endRound(ethers.parseUnits(price.toString(), 8));
            await tx.wait();
            console.log("Round ended successfully with price:", price);
        } catch (err) {
            console.error("Error ending round:", err);
            setError("Failed to end round. Check console for details.");
        }
    };

    if (error) return <div>Error: {error}</div>;
    if (!roundInfo) return <div>Loading...</div>;

    return (
        <div className="round-manager">
            <h2>Current Round: {currentEpoch}</h2>
            <p>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
            <p>Current Tezos Price: ${tokenPrice ? tokenPrice.toFixed(5) : 'Loading...'}</p>
            <p>Lock Price: {roundInfo.lockPrice.toString() !== '0' ? ethers.formatUnits(roundInfo.lockPrice, 8) : 'Not set'}</p>
            <p>Close Price: {roundInfo.closePrice.toString() !== '0' ? ethers.formatUnits(roundInfo.closePrice, 8) : 'Not set'}</p>
        </div>
    );
};

export default RoundManager;