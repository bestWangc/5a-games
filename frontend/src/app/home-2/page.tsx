"use client";
import { Metadata } from "next";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/header/header";
import HeroBannerTwo from "../components/hero-banner/hero-banner-2";
import MatchResultArea from "../components/match-result/match-result-area";
import area_bg from '@/assets/img/bg/area_bg02.jpg';
import AboutAreaTwo from "../components/about-area/about-area-2";
import StreamersArea from "../components/streamers/streamers-area";
import UpcomingMatches from "../components/upcoming-match/upcoming-matches";
import ProjectArea from "../components/projects/project-area";
import SocialArea from "../components/social/social-area";
import BrandArea from "../components/brand/brand-area";
import FooterTwo from "@/layout/footer/footer-2";

import { useEffect, useRef, useState } from "react";

// export const metadata: Metadata = {
//   title: "Home Page Two",
// };

export default function HomeTwo() {
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
      const message = { address:"0x3A30103644D08Fd4eA87526625D59421895607C9"};
      console.log('Sending message:', message);
      iframe.contentWindow.postMessage(message, window.location.origin); // 使用当前窗口的源
    }
  }, [isReady]);

  return (
    <Wrapper>
      {/* header start */}
      <Header style_2={true} />
      {/* header end */}

      {/* main area start */}
      <main className="main--area">
        {/* hero banner start */}
        <HeroBannerTwo />
        {/* hero banner end */}

        {/* match result start */}
        <MatchResultArea/>
        {/* match result end */}

        {/* area-background-start */}
        <div className="area-background" style={{backgroundImage:`url(${area_bg.src})`}}>

        {/* about-area */}
        <AboutAreaTwo/>
        {/* about-area-end */}

        {/* streamers area start */}
        <StreamersArea/>
        {/* streamers area end */}

        </div>
        {/* area-background-end */}

        {/* upcoming matches start */}
        <UpcomingMatches/>
        {/* upcoming matches end */}

        {/* project area start */}
        <ProjectArea/>
        {/* project area end */}

        {/* social area start */}
        <SocialArea/>
        {/* social area end */}

        {/* brand area start */}
        <BrandArea/>
        {/* brand area end */}

        <div className="text-center">
          <h1>Fight now</h1>
          <iframe
            src="/battle_hero/index.html"
            ref={iframeRef}
            style={{ width: '1290px', height: '730px', border: 'none' }}
            title="Game"
            id="gameFrame" 
          ></iframe>
        </div>


      </main>
      {/* main area end */}

      {/* footer start */}
      <FooterTwo/>
      {/* footer end */}
    </Wrapper>
  );
}
