import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "./components/Navbar";
import Head from "next/head";
import { useEffect } from "react";

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "osu-denken-web.firebaseapp.com",
  projectId: "osu-denken-web",
  storageBucket: "osu-denken-web.firebasestorage.app",
  messagingSenderId: "302700681902",
  appId: "1:302700681902:web:3dedcf68544f9f00b8eb3f",
  measurementId: "G-K8FSER9QG2",
};

let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
//      const analytics = getAnalytics(app);
    }
  }, []);
  
  //return <Component {...pageProps} />
  return (
    <div className="App">
      <Head>
        <title>大阪産業大学 電子計算研究部</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
