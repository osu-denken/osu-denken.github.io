import "../styles/globals.css";
import type { AppProps } from "next/app";
import type { NextPageWithLayout } from "./api/NextPageWithLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Head from "next/head";
// import { useEffect } from "react";

// import { initializeApp, getApp, getApps } from "firebase/app";

// const firebaseConfig = {
//   apiKey: "AIzaSyAq6xQfhr6jbRxOK0Ds1y-5NfwZLgZ0U40",
//   authDomain: "osu-denken-auth.firebaseapp.com",
//   projectId: "osu-denken-auth",
//   storageBucket: "osu-denken-auth.firebasestorage.app",
//   messagingSenderId: "252294046970",
//   appId: "1:252294046970:web:83f4f732098e613bd2d543"
// };

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
//   useEffect(() => {
//     if (typeof window !== "undefined") {
// //      const analytics = getAnalytics(app);
//     }
//   }, []);
  
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
