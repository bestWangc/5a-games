import React from 'react';
import Link from 'next/link';
import ShopSidebar from './shop-sidebar';
import hero_data from '@/data/hero-data';
import ShopItem from './shop-item';

const ShopArea = () => {
  return (
    <section className="shop-area">
    <div className="container">
        <div className="row justify-content-center">
            <div className="col-xl-3 col-lg-4 col-md-11 order-2 order-lg-0">
                {/* sidebar start */}
                <ShopSidebar/>
                {/* sidebar end */}
            </div>
            <div className="col-xl-9 col-lg-8 col-md-11">
                <div className="shop__top-wrap">
                    <div className="row align-items-center">
                        <div className="col-lg-8 col-sm-6">
                            <div className="shop__showing-result">
                                <p>Showing 1 - 9 of 15 results</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="shop__ordering">
                                <select name="orderby" className="orderby">
                                    <option defaultValue="Default sorting">Default sorting</option>
                                    <option defaultValue="Sort by popularity">Sort by popularity</option>
                                    <option defaultValue="Sort by price ascending">Sort by price ascending</option>
                                    <option defaultValue="Sort by price descending">Sort by price descending</option>
                                    <option defaultValue="Sort by time ascending">Sort by time ascending</option>
                                    <option defaultValue="Sort by time descending">Sort by time descending</option>
                                </select>
                            </div>
                        </div> 
                    </div>
                </div>
                <div className="row justify-content-center row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-2 row-cols-1">
                  {hero_data.map((item) => (
                    <div key={item.id} className="col">
                        <ShopItem item={item} />
                    </div>
                  ))}
                </div>
                <div className="pagination__wrap">
                    <ul className="list-wrap d-flex flex-wrap justify-content-center">
                        <li><Link href="#" className="page-numbers current">01</Link></li>
                        <li><span className="page-numbers ">02</span></li>
                        <li><Link href="#" className="page-numbers">03</Link></li>
                        <li><Link href="#" className="page-numbers">....</Link></li>
                        <li>
                            <Link href="#" className="next page-numbers">
                                <i className="fas fa-angle-double-right"></i>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
  </section>
  );
};

export default ShopArea;