import { Metadata } from "next";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/header/header";
import Footer from "@/layout/footer/footer";
import BreadcrumbAreaThree from "../../components/breadcrumb/breadcrumb-area-3";
import ShopDetailsArea from "../../components/shop-details/shop-details-area";
import product_data from "@/data/hero-data";

export const metadata: Metadata = {
  title: "Shop Details Page",
};

export default function ShopDetailsPage({params}:{params: { id: string }}) {
  const product = product_data.find((p) => Number(p.id) === Number(params.id));
  return (
    <Wrapper>
      {/* header start */}
      <Header />
      {/* header end */}

      {/* main area start */}
      <main className="main--area">
        {/* breadcrumb area start */}
        <BreadcrumbAreaThree title="Hero Detail" subtitle="Hero Detail" />
        {/* breadcrumb area end */}

        {/* shop details area start */}
        {product && <ShopDetailsArea product={product} />}
        {/* shop details area end */}
      </main>
      {/* main area end */}

      {/* footer start */}
      <Footer />
      {/* footer end */}
    </Wrapper>
  );
}
