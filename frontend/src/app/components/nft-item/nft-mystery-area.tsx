import React from 'react';
import nft_data_mystery from '@/data/nft-data-mystery';
import NftItemMysteryBox from './nft-item-mystery-box';

const NftItemArea = () => {
  return (
    <section className="nft-item__area">
      <div className="container custom-container">
        <div className="row justify-content-center">
          {nft_data_mystery.slice(0, 1).map((item) => (
            <div key={item.id} className="col-xxl-5 col-xl-5 col-lg-6 col-md-9">
              <NftItemMysteryBox item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NftItemArea;