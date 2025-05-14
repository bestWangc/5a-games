import React from "react";
import Image from "next/image";
import loadingGif from '@/assets/img/nft/openbox.gif';

interface ResultType {
  title: string;
  img: string;
  level: string;
  attack: string;
  defense: string;
  tokenId?: string;
}

interface PopupProps {
  result: ResultType | null;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ result, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {result ? (
          <>
            <h4 className="title">{result.title}</h4>
            <Image src={result.img} alt="Result" width={373} height={287} />
            <p>Level: {result.level}</p>
            <p>Attack: {result.attack}</p>
            <p>Defense: {result.defense}</p>
            <button 
              style={{backgroundColor: 'red'}}
              className="close-btn" 
              onClick={() => window.location.href=`/shop-details/${result.tokenId}`}
            >
              Play Now
            </button>
            <span> </span>
            <button onClick={onClose} className="close-btn">Close</button>
          </>
        ) : (
          <div className="loading-animation">
            <Image src={loadingGif} alt="Loading" width={512} height={512} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
