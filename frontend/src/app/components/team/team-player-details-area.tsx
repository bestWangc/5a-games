import React from 'react';
import Image from 'next/image';
import Dots from '../svg/dots';
import HeroShow from './hero-show';
import bg from '@/assets/img/bg/team_details_bg.jpg';
import t_d_img_1 from '@/assets/img/team/team_details.jpg';
import t_d_img_2 from '@/assets/img/team/team_details01.jpg';
import t_d_img_3 from '@/assets/img/team/team_details02.jpg';

const TeamDetailsArea = () => {
  const imgStyle = {width:'100%',height:'auto'}
  return (
    <section className="team__details-area section-pb-120" style={{backgroundImage:`url(${bg.src})`}}>
    <div className="container">
        <div className="row">
            <div className="col-12">
                
                <div className="team__details-content">
                    {/* <span className="sub-title">our team member</span> */}
                    {/* <h2 className="title">My Hero</h2> */}
                    <HeroShow/>
                    {/* <Equipments/> */}
                </div>
            </div>
        </div>
    </div>
</section>
  );
};

export default TeamDetailsArea;