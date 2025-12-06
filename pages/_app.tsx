import "../styles/globals.css";
import type { AppProps } from "next/app";
import type { NextPageWithLayout } from "./api/NextPageWithLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Head from "next/head";

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {  
  const getLayout =
    Component.getLayout ?? ((page) => (
    <div className="App">
      <Head>
        <title>大阪産業大学 電子計算研究部</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      {page}
      <Footer />
    </div>
  ));
  
  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
