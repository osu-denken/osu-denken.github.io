import "@styles/globals.css";
import type { AppProps } from "next/app";
import type { NextPageWithLayout } from "@lib/types/NextPageWithLayout";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";
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
        <meta name="description" content="大阪産業大学 電子計算研究部の公式サイト。作品やブログ、活動内容を紹介しています。" />
        <link rel="icon" href="/favicon.ico" />

        {/* OGP (Open Graph Protocol) */}
        <meta property="og:site_name" content="大阪産業大学 電子計算研究部" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="大阪産業大学 電子計算研究部" />
        <meta
          property="og:description"
          content="大阪産業大学 電子計算研究部の公式サイト。作品やブログ、活動内容を紹介しています。"
        />
        <meta property="og:url" content="https://osu-denken.github.io/" />
        <meta property="og:image" content="https://osu-denken.github.io/icon.png" />
        <meta property="og:locale" content="ja_JP" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@osu_denken" />
        <meta name="twitter:title" content="大阪産業大学 電子計算研究部" />
        <meta
          name="twitter:description"
          content="大阪産業大学 電子計算研究部の公式サイト。作品やブログ、活動内容を紹介しています。"
        />
        <meta name="twitter:image" content="https://osu-denken.github.io/icon.png" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="大阪産業大学 電子計算研究部 - 作品一覧"
          href="/feed.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="電研ブログ"
          href="/blog/feed.xml"
        />
      </Head>

      <Navbar />
      {page}
      <Footer />
    </div>
  ));
  
  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
