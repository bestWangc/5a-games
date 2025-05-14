import abo from "@/assets/img/hero/abo.png";
import zed from "@/assets/img/hero/zed.png";
import adam from "@/assets/img/hero/adam.png";
import cado from "@/assets/img/hero/cado.png";
import amon from "@/assets/img/hero/amon.png";
import anubis from "@/assets/img/hero/anubis.png";
import arthur from "@/assets/img/hero/arthur.png";
import arya from "@/assets/img/hero/arya.png";
import asuka from "@/assets/img/hero/asuka.png";
import barbo from "@/assets/img/hero/barbo.png";
import weapon_1 from "@/assets/img/equipment/1.png"; 
import weapon_2 from "@/assets/img/equipment/2.png"; 
import weapon_3 from "@/assets/img/equipment/3.png"; 
import weapon_4 from "@/assets/img/equipment/4.png"; 

import { IHero } from "@/types/hero-type";

const hero_data: IHero[] = [
  {
    id: 1,
    img: abo,
    title: "abo",
    price: 29,
    description:
      "",
    equipment: [weapon_1,weapon_4],
    level: "SSR",
    owner:"0x12",
  },
  {
    id: 2,
    img: zed,
    title: "Frostfire",
    price: 69,
    description:
      "",
    equipment: [],
    level: "1",
    owner:"0x12",
  },
  {
    id: 3,
    img: zed,
    title: "Frostfire",
    price: 69,
    description:
      "",
    equipment: [weapon_2],
    level: "1",
    owner:"0x12",
  },
  {
    id: 4,
    img: amon,
    title: "amon",
    price: 49,
    description:
      "",
      owner:"0x12",
    equipment: [weapon_1, weapon_2,weapon_4],
    level: "SR",
  },
  {
    id: 5,
    img: anubis,
    title: "Golden Crown",
    price: 19,
    description:
      "",
    equipment: [weapon_1, weapon_2, weapon_3],
    level: "SR",owner:"0x12",
  },
  {
    id: 6,
    img: arthur,
    title: "gaming mouse",
    price: 59,
    owner:"0x12",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",

    equipment: [weapon_3,weapon_4],
    level: "SR",
  },
  {
    id: 7,
    img: arya,
    title: "Headphone - X",
    price: 29,
    owner:"0x12",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",

    equipment: [weapon_1, weapon_2, weapon_3,weapon_4],
    level: "SSR",
  },
  {
    id: 8,
    img: asuka,
    title: "replica gun",
    price: 49,
    owner:"0x12",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",

    equipment: [weapon_1, weapon_2, weapon_3,weapon_4],
    level: "SR",
  },
  {
    id: 9,
    img: barbo,
    title: "gun robot",
    price: 109,
owner:"0x12",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",

    equipment: [weapon_1, weapon_2, weapon_3,weapon_4],
    level: "SR",
  },
];

export default hero_data;
