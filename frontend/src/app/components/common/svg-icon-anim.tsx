'use client'
import { StaticImageData } from 'next/image';
import React,{useRef,useEffect} from 'react';
import Vivus from 'vivus';

const SvgIconCom = ({icon,id}:{icon:StaticImageData;id:string}) => {
  const svgRef = useRef<HTMLDivElement | null>(null);
  const vivusRef = useRef<Vivus | null>(null);

  useEffect(() => {
    const currentSvgRef = svgRef.current;

    if (currentSvgRef && !vivusRef.current) {
      vivusRef.current = new Vivus(currentSvgRef, {
        duration: 180,
        file: icon.src,
      });
    }

    const handleMouseEnter = () => {
      if (vivusRef.current) {
        vivusRef.current.reset().play();
      }
    };

    return () => {
      if (currentSvgRef) {
        currentSvgRef.removeEventListener("mouseenter", handleMouseEnter);
      }
    };
  }, [icon.src]);

  return (
    <div
    className="svg-icon"
    id={id}
    ref={svgRef}
    onMouseEnter={() => vivusRef.current?.reset().play()}
    onMouseLeave={() => vivusRef.current?.reset()}
  ></div>
  );
};

export default SvgIconCom;