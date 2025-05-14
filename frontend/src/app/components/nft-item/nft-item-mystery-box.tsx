"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { INftType } from "@/data/nft-data";
import Popup from "./popup";
import { ethers } from 'ethers';
import res1 from '@/assets/img/hero/xiao.png';
import { readAddressList } from '../helper'; 
import heroAbi from './BattleHeroToken.json';

interface ResultType {
  title: string;
  img: string;
  level: string;
  attack: string;
  defense: string;
  tokenId?: string;
}

const NftItemMysteryBox = ({ item }: { item: INftType }) => {

  const [showPopup, setShowPopup] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);

  const handleMintClick = () => {
    setShowPopup(true);
    // 盲盒开箱过程
    setTimeout(() => {
      // const randomResult: ResultType = { title: "Your NFT", img: "/assets/img/hero/xiao.png" }; // 随机结果
      // setResult(randomResult);
    }, 5000); // 3秒后显示结果
  };

  const mintNFT = async () => {
    if (!window.ethereum) {
      console.log('MetaMask is not installed');
      return;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    const account = accounts[0];
    // const provider = new ethers.BrowserProvider(window.ethereum);
    // //const signer = provider.getSigner();
    // const addressList = readAddressList();
    // const heroContract = new ethers.Contract(addressList.battleHeroToken, heroAbi);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const addressList = readAddressList();
    const contract = new ethers.Contract(addressList.battleHeroToken, heroAbi.abi, signer);


    const mintPrice = await contract.getMintPrice();
    const mintPriceString = ethers.formatUnits(mintPrice, "ether");
    console.log ("price: "+mintPrice);
    
   

    setShowPopup(true);
    try {
      const tx = await contract.mint(account, {
        value: ethers.parseUnits(mintPriceString, "ether").toString()
      });
      
      console.log(tx);/*
      const receipt = await tx.wait();
      console.log("logs: " + JSON.stringify(receipt.logs, null, 2)); */
      let all_nfts = await contract.owned(account);
      const ID_ENCODING_PREFIX= BigInt(1)<< BigInt(255);//token id 需要减去ID ENCODING PREFIX
      let token_id = all_nfts[0]- ID_ENCODING_PREFIX;
      console.log(token_id);
      let attr = await contract.getHeroAttributes(token_id);
      console.log(attr);
  
      let jsonUrl= await contract.tokenURI(token_id);console.log(jsonUrl);
  
      const randomResult: ResultType = { title: "Your HERO (NFT)", img: "/assets/img/hero/zed.png", level: attr.level.toString(), attack: attr.attack.toString(), defense: attr.defense.toString(), tokenId: token_id.toString()}; 
      setResult(randomResult);
      //console.log("logs: "+receipt.logs);
      //console.log("all : "+receipt);
      // Update data after minting
      //fetchData(account!, provider);
      
    } catch (error) {
      console.error("Error during minting:", error);
      // const randomResult: ResultType = { title: "Your HERO (NFT)", img: "/assets/img/hero/xiao.png" }; 
      // setResult(randomResult);
    }
  };

  return (
    <div className="nft-item__mystery-box">
    <div className="mystery-box-effect">
    <div className="nft-item__box" style={{opacity:0.93}}>
      <div className="nft-item__thumb">
        <Link href="/shop-details">
          <Image src={item.img} alt="img" width={230} height={180}/>
        </Link>
      </div>
      <div className="nft-item__content">
        <h4 className="title">
          <Link href="/shop-details">{item.title}</Link>
        </h4>
        <div className="nft-item__avatar">
          <div className="avatar-img">
             <i className={item.creator}></i>
          </div>
          <div className="avatar-name">
            <h5 className="name">
              {item.creator_name}
            </h5>
          </div>
        </div> 
     
        <div className="nft-item__bid">
          <div className="nft-item__price">
            <p>
              {item.eth}
              <span className="currency">Eth</span>
            </p>
            {/* <Link href="/shop-details" className="bid-btn"> */}
            <button onClick={mintNFT} className="bid-btn">
                  Mint <i className="fas fa-long-arrow-alt-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
    {showPopup && <Popup result={result} onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default NftItemMysteryBox;
