import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import { useEffect } from "react";

const PortalPage : NextPage = () => {
  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (!token) window.location.href = "/?i=portal/#login";
  
    const name = localStorage.getItem("name");
    if (name) {
      const heading = document.getElementById("title");
      if (heading) {
        heading.textContent = `ようこそ、${name} さん`;
      }
    }

  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 id="title">ようこそ、Unknown さん</h1>
        <p className={styles.description}>
          
        </p>
      </main>
    </div>
  );
};

export default PortalPage;