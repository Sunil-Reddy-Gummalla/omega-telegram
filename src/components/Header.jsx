import React, { useEffect } from 'react'
import { ConnectButton } from 'thirdweb/react'
import { inAppWallet, createWallet } from 'thirdweb/wallets'
import { etherlink_testnet, etherlink_mainnet } from '../native-chains/etherlink'
import { client } from '../client'
import { useState } from 'react'
import './Header.css'

const Header = () => {
  const [selectedChain, setSelectedChain] = useState(etherlink_testnet);

  // Function to handle chain change
  const handleChainChange = (e) => {
    const chain = e.target.value === 'etherlink_testnet' ? etherlink_testnet : etherlink_mainnet;
    setSelectedChain(chain);
  };

  return (
    <header className="header">
      <div className="header-left"> 
        <h1>Omega Protocol</h1>
      </div>
      <div className="header-right">
        {/* Styled Dropdown */}
        <select 
          className="chain-select" 
          onChange={handleChainChange} 
          value={selectedChain === etherlink_testnet ? 'etherlink_testnet' : 'etherlink_mainnet'}
        >
          <option value="etherlink_testnet">Etherlink Testnet</option>
          <option value="etherlink_mainnet">Etherlink Mainnet</option>
        </select>

        {/* Wallet connection button */}
        <ConnectButton
          client={client}
          chain={selectedChain}
          wallets={[
            inAppWallet({
              auth: {
                options: ['telegram'],
              },
            }),
            createWallet('io.metamask'),
          ]}
        />
      </div>
    </header>
  )
}

export default Header
