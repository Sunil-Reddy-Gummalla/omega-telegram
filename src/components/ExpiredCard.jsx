import React, { useState, useEffect } from 'react';
import './Card.css';
import { ethers } from 'ethers';
import { getContract, getSignedContract, connectWallet } from '../utils/contractUtils';

const ExpiredCard = () => {
    const [pastRounds, setPastRounds] = useState([]);
    const [account, setAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClaimLoading, setIsClaimLoading] = useState(false);

    useEffect(() => {
        const checkAccount = async () => {
            try {
                const address = await connectWallet();
                setAccount(address);
            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        };

        checkAccount();
    }, []);

    useEffect(() => {
        const fetchPastRounds = async () => {
            if (!account) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const contract = getContract();
                const currentEpoch = await contract.currentEpoch();
                const rounds = [];

                for (let i = 1; i <= 5; i++) {
                    const epoch = Number(currentEpoch) - i;
                    if (epoch < 0) break;

                    const round = await contract.rounds(epoch);
                    const userRound = await contract.ledger(epoch, account);

                    rounds.push({
                        epoch,
                        closePrice: round.closePrice,
                        bullWon: round.bullWon,
                        bearWon: round.bearWon,
                        cancelled: round.cancelled,
                        userAmount: ethers.formatEther(userRound.amount),
                        userBull: userRound.bull,
                        claimed: userRound.claimed,
                    });
                }

                setPastRounds(rounds);
            } catch (error) {
                console.error("Error fetching past rounds:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPastRounds();
        const intervalId = setInterval(fetchPastRounds, 60000);

        return () => clearInterval(intervalId);
    }, [account]);

    const handleClaim = async (epoch) => {
        if (!account) {
            alert("Please connect your wallet first");
            return;
        }

        setIsClaimLoading(true);
        try {
            const signedContract = await getSignedContract();
            const tx = await signedContract.claim(epoch);
            await tx.wait();
            alert(`Successfully claimed rewards for round ${epoch}`);
            setPastRounds(prev => prev.map(round => 
                round.epoch === epoch ? {...round, claimed: true} : round
            ));
        } catch (error) {
            console.error("Error claiming rewards:", error);
            alert("Failed to claim rewards. Please try again.");
        }
        setIsClaimLoading(false);
    };

    if (isLoading) return <div className="card expired-card">Loading past rounds...</div>;

    if (!account) return <div className="card expired-card">Please connect your wallet to view past rounds.</div>;

    return (
        <div className="card expired-card">
            <h3>Past Rounds</h3>
            {pastRounds.length > 0 ? (
                pastRounds.map(round => (
                    <div key={round.epoch} className="past-round">
                        <h4>Round {round.epoch}</h4>
                        <p>Close Price: {ethers.formatUnits(round.closePrice, 8)}</p>
                        <p>Your Bet: {round.userAmount} XTZ {round.userBull ? 'UP' : 'DOWN'}</p>
                        <p>Result: {round.cancelled ? 'Cancelled' : (round.bullWon ? 'UP' : 'DOWN')}</p>
                        {!round.claimed && Number(round.userAmount) > 0 && (
                            <button 
                                onClick={() => handleClaim(round.epoch)}
                                disabled={isClaimLoading || round.cancelled}
                            >
                                {isClaimLoading ? 'Claiming...' : 'Claim Reward'}
                            </button>
                        )}
                        {round.claimed && <p>Rewards Claimed</p>}
                    </div>
                ))
            ) : (
                <p>No past rounds found.</p>
            )}
        </div>
    );
};

export default ExpiredCard;