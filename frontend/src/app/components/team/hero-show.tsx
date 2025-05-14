import React from "react";
import Link from "next/link";
import Image from "next/image";
import hero_data from "@/data/hero-data";


const HeroShow = () => {
  const related_prd = hero_data.slice(0, 4);
  return (
    <div className="related__product-wrapper">
      <h2 className="related-title">MY Heroes</h2>
      <div className="row justify-content-center row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-sm-2 row-cols-1">
        {related_prd.map((item) => (
          <div key={item.id}>
            <div className="show__item">
              <div className="show__item-thumb">
                <Link href={`/shop-details/${item.id}`}>
                  <Image src={item.img} alt="img" style={{ width: 'auto', height: 'auto' }} />
                </Link>
                {/* <Link href="#" className="wishlist-button">
                    <i className="far fa-heart"></i>
                  </Link> */}
              </div>
              <div className="show__item-line"></div>
              <div className="show__item-content">
                <div className="show__item-content-detail">
                  <div className="lef-col">Name:</div>
                  <h4 className="name">
                    <Link href={`/shop-details/${item.id}`}>{item.title}</Link>
                  </h4>
                </div>
                <div className="show__item-content-detail">
                  <div className="lef-col">Level:</div>
                  <h4 className="level">
                    {item.level}
                  </h4>
                </div>
                <div className="show__item-content-detail">
                  <div className="lef-col">attack:</div>
                  <h4 className="attack">
                    9999
                  </h4>
                </div>
                <div className="show__item-content-detail">
                  <div className="lef-col">defense:</div>
                  <h4 className="defense">
                    6789
                  </h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroShow;
