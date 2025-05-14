"use client";
import React, { useEffect } from "react";
import { animationCreate } from "@/utils/utils";
import BackToTopCom from "@/app/components/common/back-to-top-com";
import { ToastContainer } from "react-toastify";
import AnimateMouse from "@/app/components/common/animated-mouse";
import ContextProvider from "@/context/app-context";
import { GlobalStateProvider } from '@/context/global-state';

if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    animationCreate();
  }, []);
  return (
    <GlobalStateProvider>
    <ContextProvider>
     <AnimateMouse/>
      {children} 
      <BackToTopCom />
      <ToastContainer />
    </ContextProvider>
    </GlobalStateProvider>
  );
};

export default Wrapper;
