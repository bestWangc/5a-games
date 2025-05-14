import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useGlobalState } from '@/context/global-state';
import { readAddressList } from '../helper'; 
import heroAbi from './BattleHeroToken.json';

const MintNFT: React.FC = () => {
  const { state } = useGlobalState();
  const [mintPrice, setMintPrice] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMintPrice = async () => {
      if (state.userAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addressList = readAddressList();
        const contract = new ethers.Contract(addressList.battleHeroToken, heroAbi, provider);

        const price = await contract.getMintPrice();
        setMintPrice(ethers.utils.formatEther(price));
      }
    };

    fetchMintPrice();
  }, [state.userAddress]);

  const mintNFT = async () => {
    if (!state.userAddress) {
      setMessage("Please connect your wallet first.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addressList = readAddressList();
      const contract = new ethers.Contract(addressList.battleHeroToken, heroAbi, signer);

      const tx = await contract.mint(state.userAddress, {
        value: ethers.utils.parseEther(mintPrice || "0")
      });

      await tx.wait();
      setMessage("Minting successful!");
    } catch (error) {
      setMessage(`Minting failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Mint NFT</h1>
      {mintPrice && <p>Mint Price: {mintPrice} ETH</p>}
      <button onClick={mintNFT}>Mint NFT</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default MintNFT;
