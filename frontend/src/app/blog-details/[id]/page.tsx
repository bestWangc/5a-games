import { Metadata } from "next";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/header/header";
import Footer from "@/layout/footer/footer";
import blog_data from "@/data/blog-data";
import BreadcrumbAreaThree from "../../components/breadcrumb/breadcrumb-area-3";
import BlogDetailsArea from "../../components/blog-details/blog-details-area";

export const metadata: Metadata = {
  title: "Blog Details Page",
};

export default function BlogDetailsPage({params}:{params:{id:string}}) {
  const blog = blog_data.find(b => Number(b.id) === Number(params.id))!;
  return (
    <Wrapper>
      {/* header start */}
      <Header />
      {/* header end */}

      {/* main area start */}
      <main className="main--area">
        {/* breadcrumb area start */}
        <BreadcrumbAreaThree title="BLOG DETAILS" subtitle="BLOG DETAILS" />
        {/* breadcrumb area end */}

        {/* blog area start */}
        <BlogDetailsArea blog={blog} />
        {/* blog area end */}
      </main>
      {/* main area end */}

      {/* footer start */}
      <Footer />
      {/* footer end */}
    </Wrapper>
  );
}
