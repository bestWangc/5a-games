import { StaticImageData } from "next/image";

export interface IHero {
  id: number;
  img: StaticImageData;
  title: string;
  price: number;
  description: string;
  equipment:Array<StaticImageData>;
  level:string;
  owner:string;
}