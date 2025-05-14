'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import hero_data from '@/data/hero-data';
import InputRange from '../ui/input-range';

const ShopSidebar = () => {
  const related__products = hero_data.slice(0,7);
  const [priceValue,setPriceValue] = useState([0,380]);
  // handleChanges
  const handleChanges = (val: number[]) => {
    setPriceValue(val);
  };
  return (
    <aside className="shop-sidebar">
    <div className="shop__widget">
        <h4 className="shop__widget-title">search</h4>
        <div className="shop__widget-inner">
            <div className="shop__search">
                <input type="text" placeholder="Search here"/>
                <button className="p-0 border-0"><i className="flaticon-search"></i></button>
            </div>
        </div>
    </div>
    <div className="shop__widget">
        <h4 className="shop__widget-title">filter by price</h4>
        <div className="shop__widget-inner">
            <div className="shop__price-filter">
                <div id="slider-range">
                <InputRange
                    MAX={380}
                    MIN={0}
                    STEP={1}
                    values={priceValue}
                    handleChanges={handleChanges}
                />
                </div>
                <div className="shop__price-slider-amount">
                    <input type="submit" className="p-0 border-0" value="Filter"/>
                    {/* <input type="text" id="amount" name="price" placeholder="Add Your Price" /> */}
                    <span className=''>0.{priceValue[0]} - ${priceValue[1]} ETH</span>
                </div>
            </div>
        </div>
    </div>
    <div className="shop__widget">
        <h4 className="shop__widget-title">Categories</h4>
        <div className="shop__widget-inner">
            <ul className="product-categories list-wrap">
                <li><Link href="/shop">Hero</Link><span className="float-right">12</span></li>
                <li><Link href="/shop">Equipment</Link><span className="float-right">03</span></li>

            </ul>
        </div>
    </div>
    <div className="shop__widget">
        <h4 className="shop__widget-title">Related Heroes</h4>
        <div className="shop__widget-inner">
            {related__products.map((item) => (
            <div key={item.id} className="related__products-item">
                <div className="related__products-thumb">
                    <Link href={`/shop-details/${item.id}`}>
                        <Image src={item.img} alt="img" width={78} height={80} />
                    </Link>
                </div>
                <div className="related__products-content">
                    <h4 className="product-name">
                        <Link href={`/shop-details/${item.id}`}>{item.title}</Link>
                    </h4>
                    <span className="amount">${item.price}</span>
                </div>
            </div>
            ))}
        </div>
    </div>
    
</aside>
  );
};

export default ShopSidebar;