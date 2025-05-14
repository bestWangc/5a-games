'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import menu_data from "@/data/menu-data";
import logo from '@/assets/img/logo/logo.png';
import useSticky from "@/hooks/use-sticky";
import { usePathname } from 'next/navigation';
import SearchPopup from "@/app/components/common/search-popup";
import OffCanvas from "@/app/components/common/off-canvas";
import MobileOffCanvas from "@/app/components/common/mobile-offcanvas";
import SvgIconCom from "@/app/components/common/svg-icon-anim";
import shape from '@/assets/img/icons/shape02.svg';
import { ethers } from 'ethers';
import { useGlobalState } from '@/context/global-state';

const Header = ({ style_2 = false }: { style_2?: boolean }) => {
  const { sticky, isStickyVisible } = useSticky();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState<boolean>(false);
  const [openMobileOffCanvas, setOpenMobileOffCanvas] = useState<boolean>(false);
  const { state, dispatch } = useGlobalState();
  useEffect(() => {
    if (sessionStorage.getItem('account')) {
        setAccount(sessionStorage.getItem('account')as string);
    }
}, [])

  // const setUserAddress = (address: string) => {
  //   dispatch({ type: 'SET_USER_ADDRESS', payload: address });
  // };

  const handleOpenSearch = (audioPath: string) => {
    setIsSearchOpen(true);
    const audio = new Audio(audioPath);
    audio.play();
  };

  const handleOpenOffCanvas = (audioPath: string) => {
    setIsOffCanvasOpen(true);
    const audio = new Audio(audioPath);
    audio.play();
  };

  const handleOpenMobileOffCanvas = (audioPath: string) => {
    setOpenMobileOffCanvas(true);
    const audio = new Audio(audioPath);
    audio.play();
  };

  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        sessionStorage.setItem('account', accounts[0]);
        // setUserAddress(accounts[0]);
      } catch (error) {
        console.error("User rejected the request.");
      }
    } else {
      console.error("MetaMask is not installed.");
    }
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header>
      <div id="sticky-header" className={`tg-header__area transparent-header ${sticky ? 'tg-sticky-menu' : ''} ${isStickyVisible ? 'sticky-menu__show' : ''}`}>
        <div className="container custom-container">
          <div className="row">
            <div className="col-12">
              <div className="mobile-nav-toggler" onClick={() => handleOpenMobileOffCanvas('/assets/audio/click.wav')} >
                <i className="fas fa-bars"></i>
              </div>
              <div className="tgmenu__wrap">
                <nav className="tgmenu__nav">
                  <div className="logo">
                    <Link href="/">
                      <Image src={logo} alt="Logo" style={{ height: 'auto' }} />
                    </Link>
                  </div>
                  <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                    <ul className="navigation">
                      {menu_data.map((menu) =>
                        menu.sub_menu ? (
                          <li
                            key={menu.id}
                            className={`menu-item ${menu.sub_menu && menu.sub_menu.some(sub => pathname === sub.link) ? 'menu-item-has-children active' : ''}`}
                          >
                            <Link href="#">{menu.title}</Link>
                            <ul className="sub-menu">
                              {menu.sub_menu.map((sub, i) => (
                                <li key={i} className={pathname === sub.link ? 'active' : ''}>
                                  <Link href={sub.link}>{sub.title}</Link>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ) : (
                          <li key={menu.id} className={pathname === menu.link ? 'active' : ''}>
                            <Link href={menu.link}>{menu.title}</Link>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="tgmenu__action d-none d-md-block">
                    <ul className="list-wrap">
                      {/* <li className="search">
                        <a onClick={() => handleOpenSearch('/assets/audio/click.wav')} className="cursor-pointer">
                          <i className="flaticon-search-1"></i>
                        </a>
                      </li> */}
                      <li className="header-btn">
                        {account ? (
                          <div className={'tg-border-btn'}>
                            {style_2 && <SvgIconCom icon={shape} id="svg-2" />}
                            <span>Wallet: {shortenAddress(account)}</span>
                          </div>
                        ) : (
                          <div onClick={connectWallet} className={'tg-border-btn'}>
                            {style_2 && <SvgIconCom icon={shape} id="svg-2" />}
                            <i className="flaticon-edit"></i> Connect Wallet
                          </div>
                        )}
                      </li>
                      <li className="side-toggle-icon" onClick={() => handleOpenOffCanvas('/assets/audio/click.wav')}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SearchPopup setIsSearchOpen={setIsSearchOpen} isSearchOpen={isSearchOpen} />
      <OffCanvas isOffCanvasOpen={isOffCanvasOpen} setIsOffCanvasOpen={setIsOffCanvasOpen} />
      <MobileOffCanvas openMobileOffCanvas={openMobileOffCanvas} setOpenMobileOffCanvas={setOpenMobileOffCanvas} />
    </header>
  );
};

export default Header;
