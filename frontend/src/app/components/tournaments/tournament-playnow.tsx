"use client";
import React from 'react';
import tournament_data from '@/data/tournament-data';
import TournamentBox from './tournament-box';
import TextAnimation from '../common/text-animation';
import { useEffect, useRef, useState } from "react";
import Link from 'next/link';

const TournamentPlayNow = () => {
  const iframeRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleReadyMessage = (event) => {
      if (event.origin !== window.location.origin) {
        console.warn('Origin mismatch:', event.origin);
        return;
      }

      if (event.data.type === 'ready') {
        console.log('Received ready message from iframe');
        setIsReady(true);
      }
    };

    window.addEventListener('message', handleReadyMessage, false);

    return () => {
      window.removeEventListener('message', handleReadyMessage, false);
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && isReady) {
      //向游戏发送登陆的地址
      const adr = sessionStorage.getItem('account');
      if (sessionStorage.getItem('account')) {
        const message = { address:adr};
      console.log('Sending message:', message);
      iframe.contentWindow.postMessage(message, window.location.origin); // 使用当前窗口的源
    }
      
    }
  }, [isReady]);

  return (
    <section className="tournament-area section-pt-120 section-pb-90">
    <div className="container">
        {/* <div className="tournament__wrapper"> */}
        <div className="">
            <div className="row justify-content-center">
                <div className="col-xl-6 col-lg-7 col-md-10">
                    <div className="section__title text-center mb-60">
                        <TextAnimation title='our tournament' />
                        <h3 className="title">play to earn games</h3>
                    </div>
                </div>
            </div>
            <div className="text-center">
              <iframe
                src="/battle_hero/index.html"
                ref={iframeRef}
                style={{ width: '1290px', height: '730px', border: 'none' }}
                title="Game"
                id="gameFrame" 
              ></iframe>
            </div>
            <Link href="/shop-details/3">
            <button className="shop__details-cart-btn shop__details-cart-btn-sell" >Back to Hero</button>
            </Link>
                                
            <br/>

            <div className="row justify-content-center gutter-25">
              {tournament_data.map((item) => (
                <div key={item.id} className="col-xl-4 col-lg-5 col-md-6 col-sm-9">
                    <TournamentBox item={item} />
                </div>
              ))}
            </div>
        </div>
    </div>
  </section>
  );
};

export default TournamentPlayNow;