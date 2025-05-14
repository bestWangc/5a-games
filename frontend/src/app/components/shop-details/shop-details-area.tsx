'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RelatedProducts from './related-products';
// import ShopModal from './shop-modal';
import ShopDetailsImages from './shop-details-images';
import { IHero } from '@/types/hero-type';
import { useGlobalState } from '@/context/global-state';
import { ethers } from 'ethers';
import { readAddressList } from '../helper'; 
import  abi  from '@/data/BattleHeroToken-abi';
const ShopDetailsArea = ({ product }: { product: IHero }) => {

    const [showModal, setShowModal] = useState(false);
    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
    const [incValue, setIncValue] = useState<number>(1);
    const { state, dispatch } = useGlobalState();
    const [account, setAccount]= useState<string | null>(null);
    //hanle increment 
    const handleIncrement = (value: string) => {
        if (value === 'inc') {
            setIncValue(prev => prev + 1)
        }
        else {
            if (incValue > 1) {
                setIncValue(prev => prev - 1)
            }
        }
    }
    let signer = null;
    let provider;
    let contract = null;
    const shortenAddress = (address: string) => {
        if (!address) return '';
        return `${address.slice(0, 11)}...${address.slice(-11)}`;
      };
    const buyProduct= async ()=>{
        
        
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await  provider.getSigner();
        const addressList = readAddressList();
        const contract = new ethers.Contract(addressList.battleHeroToken, abi, signer);

        
       const  price = await contract.getMintPrice()
       console.log(price)
    }
    useEffect( () => {
        if (sessionStorage.getItem('account')) {
            setAccount(sessionStorage.getItem('account')as string);
        }
    },[])
    

    return (
        <>
            <section className="shop-area shop-details-area">
                <div className="container">
                    <div className="row">
                        {/* shop details images  */}
                        <ShopDetailsImages product={product} />
                        {/* shop details images  */}
                        <div className="shop__details-content">
                            {/* <div className="shop__details-rating">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <span className="rating-count">( 3 Customer Review )</span>
                      </div> */}
                            <h2 className="title">{product.title}</h2>
                            {/* <div className="shop__details-price">
                          <span className="amount">{value} USDC<span className="stock-status">- {product.status}</span></span>
                      </div> */}
                            <div className="shop__details-short-description">
                                <p>{product.description}</p>
                            </div>
                            <div className="shop__details-model d-flex align-items-center">
                                <p className="model m-0">Level:</p>
                                <ul className="list-wrap d-flex align-items-center">
                                    <li className="active">{product.level}</li>
                                </ul>
                            </div>
                            <div className="shop__details-model d-flex align-items-center">
                                <p className="model m-0">attack:</p>

                                    <span className="shop__details-model-text-attack">9</span>
                      
                            </div>
                            <div className="shop__details-model d-flex align-items-center">
                                <p className="model m-0">defense:</p>
                                <span className="shop__details-model-text-defense">11</span>
                            </div>
                            {/* <div className="shop__details-model d-flex align-items-center">
                                <p className="model m-0">Price:</p>
                                <span className="shop__details-model-text-price">  ${product.price}</span>
                            </div> */}
                            <div className="shop__details-model d-flex align-items-center">
                                <p className="model m-0">Owner:</p>
                                <span className="shop__details-model-text-address">  {shortenAddress(sessionStorage.getItem('account'))}</span>
                            </div>
                            <div className="shop__details-model d-flex align-items-center">
                                <p className="model m-0">From:</p>
                                <span className="shop__details-model-text"> Polygon/ETH Testland </span>
                            </div>
                            <div className="shop__details-qty">
                                <div className="cart-plus-minus d-flex flex-wrap align-items-center">
                                    {/* <form className="quantity num-block">
                                  <input type="text" className="in-num" value={incValue} readOnly />
                                  <div className="qtybutton-box">
                                      <span onClick={()=> handleIncrement('inc')} className="plus"><i className="fas fa-angle-up"></i></span>
                                      <span onClick={()=> handleIncrement('dec')} className="minus dis"><i className="fas fa-angle-down"></i></span>
                                  </div>
                              </form> */}
                              {
                                product.owner !== account?<>
                                <button className="shop__details-cart-btn shop__details-cart-btn-sell" data-bs-toggle="modal" data-bs-target="#sellModal">Sell</button>
                                {/* <button className="shop__details-cart-btn shop__details-cart-btn-sell" data-bs-toggle="modal" data-bs-target="#removeModal">Remove</button> */}
                                <Link href="/tournament">
                                <button className="shop__details-cart-btn shop__details-cart-btn-sell"  style={{backgroundColor:'red'}} >Play</button>
                                </Link>
                                </>
                                :


                                <button  className={`shop__details-cart-btn shop__details-cart-btn-buy `}  onClick={()=>buyProduct()} >Buy</button>
                              }
                                    
                                    {/* <button className="shop__details-cart-btn shop__details-cart-btn-sell" data-bs-toggle="modal" data-bs-target="#exampleModal">Sell</button> */}
                                    <div className="modal fade " id="sellModal" aria-labelledby="sellModalLabel" aria-hidden="true">
                                        <div className="modal-dialog  modal-dialog-centered">
                                            <div className="modal-content">
                                                <div className="modal-header" data-bs-theme="dark">
                                                    <h1 className="modal-title fs-5" id="sellModalLabel">SELL PRICE</h1>
                                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div className="modal-body">
                                                    <div className="mb-1">
                                                        
                                                        <input type="text" className="form-control" id="recipient-name"/>
                                                    </div>
                                                </div>
                                                <div className="modal-footer">
                                                    <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                                    <button className="btn btn-primary btn-confirm" >Confirm</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal fade " id="removeModal" aria-labelledby="removeModalLabel" aria-hidden="true">
                                        <div className="modal-dialog  modal-dialog-centered">
                                            <div className="modal-content">
                                                <div className="modal-header" data-bs-theme="dark">
                                                    <h1 className="modal-title fs-5" id="removeModalLabel">SELL PRICE</h1>
                                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div className="modal-body">
                                                    <div className="mb-1">
                                                        
                                                        <input type="text" className="form-control" id="recipient-name"/>
                                                    </div>
                                                </div>
                                                <div className="modal-footer">
                                                    <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                                    <button className="btn btn-primary btn-confirm" >Confirm</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="shop__details-bottom">
                          
                          <div className="tagged_as">
                              <b>Tags :</b>
                              <Link href="/shop">Silver,</Link>
                              <Link href="/shop">Pink,</Link>
                              <Link href="/shop">Green</Link>
                          </div>
                          
                      </div> */}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="product__desc-wrap">
                                <ul className="nav nav-tabs" id="descriptionTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link active" id="description-tab" data-bs-toggle="tab" data-bs-target="#equipment" type="button" role="tab" aria-controls="equipment" aria-selected="true" tabIndex={-1}>Equipment</button>
                                    </li>
                                    {/* <li className="nav-item" role="presentation">
                                  <button className="nav-link" id="info-tab" data-bs-toggle="tab" data-bs-target="#info" type="button" role="tab" aria-controls="info" aria-selected="false" tabIndex={-1}>Additional Information</button>
                              </li>
                              <li className="nav-item" role="presentation">
                                  <button className="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews" aria-selected="false" tabIndex={-1}>Reviews (0)</button>
                              </li> */}
                                </ul>
                                <div className="tab-content" id="descriptionTabContent">
                                    <div className="tab-pane animation-none fade show active" id="equipment" role="tabpanel" aria-labelledby="equipment-tab">
                                        <div className="equipment-list row row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-sm-2 row-cols-1" >
                                            {product.equipment.map((item, i) => {
                                                return (
                                                    <div className="equipment-list_item" key={i}>
                                                        <Image src={product.equipment[i]} alt="img" style={{ height: 'auto' }} />
                                                    </div>


                                                )
                                            })
                                            }
                                        </div>
                                        {/* <div className="img_border">
                                    <Image src={product.equipment[0]} alt="img" style={{height:'auto'}} />
                   
                                </div> */}
                                    </div>
                                    {/* <div className="tab-pane animation-none fade" id="info" role="tabpanel" aria-labelledby="info-tab">
                                  <table className="table table-sm">
                                      <tbody>
                                          <tr>
                                              <th scope="row">General</th>
                                              <td>PS5 Digital Platform</td>
                                          </tr>
                                          <tr>
                                              <th scope="row">Technical Information</th>
                                              <td>Qualcomm Snapdragon XR2</td>
                                          </tr>
                                          <tr>
                                              <th scope="row">Display</th>
                                              <td>3664 x 1920</td>
                                          </tr>
                                          <tr>
                                              <th scope="row">RAM & Storage</th>
                                              <td>8GB/256GB</td>
                                          </tr>
                                          <tr>
                                              <th scope="row">Included</th>
                                              <td>PS5 VR Streaming Assistant</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                              <div className="tab-pane animation-none fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                                  <div className="product__desc-review">
                                      <div className="product__desc-review-title mb-15">
                                          <h5 className="title">Customer Reviews (0)</h5>
                                      </div>
                                      <div className="left-rc">
                                          <p>No reviews yet</p>
                                      </div>
                                      <div className="right-rc">
                                          <Link href="#">Write a review</Link>
                                      </div>
                                  </div>
                              </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="related__product-area">
                        {/* related products start */}
                        <RelatedProducts />
                        {/* related products end */}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ShopDetailsArea;