import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
    const [account, setAccount] = useState(null);

    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            }
        };

        checkConnection();
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1>Omega Protocol</h1>
            </div>
            <div className="header-right">
                {account ? (
                    <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
                ) : (
                    <button onClick={connectWallet}>Connect Wallet</button>
                )}
            </div>
        </header>
    );
};

export default Header;