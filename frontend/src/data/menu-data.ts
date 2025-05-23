// type
type IMenuDataType = {
  id: number;
  title: string;
  link: string;
  sub_menu?: {
      title: string;
      link: string;
  }[];
}

const menu_data:IMenuDataType[] = [
  {
    id:1,
    title:'Home',
    link:'/',
    // sub_menu:[
    //   {title:'Home One',link:'/'},
    //   // {title:'Home Two',link:'/home-2'},
    // ]
  },
  {
    id:2,
    title:'TOURNAMENT',
    link:'#',
    sub_menu:[
      {title:'Play Now',link:'/tournament'},
      // {title:'TOURNAMENT Single',link:'/tournament-details'},
    ]
  },
  // {
  //   id:3,
  //   title:'ABOUT US',
  //   link:'/about',
  // },
  {
       id:3,
      title:'SHOP',
       link:'/shop',
     },
     {
      id:4,
    title:'My Heroes',
    link:'/team-details',
     },
  // {
  //   id:4,
  //   title:'PAGES',
  //   link:'#',
  //   sub_menu:[
  //     {title:'Gaming Shop',link:'/shop'},
  //     {title:'Shop Details',link:'/shop-details/1'},
  //     {title:'Our Services',link:'/services'},
  //     {title:'Services Details',link:'/service-details'},
  //     {title:'Player Details',link:'/team-details'},
  //   ]
  // },
  // {
  //   id:5,
  //   title:'News',
  //   link:'#',
  //   sub_menu:[
  //     {title:'Our Blog',link:'/blog'},
  //     {title:'Blog Details',link:'/blog-details'}
  //   ]
  // },
  // {
  //   id:6,
  //   title:'CONTACT',
  //   link:'/contact',
  // },
]

export default menu_data;