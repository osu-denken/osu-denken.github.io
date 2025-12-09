import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import { useEffect, useState } from "react";
import { Prism as Pre } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const DebugPage : NextPage = () => {
    const [idToken, setIdToken] = useState("");
    const [info, setInfo] = useState<any>(null);
    const [_localStorage, _setLocalStorage] = useState<any>(null);
    
    useEffect(() => {
        setIdToken(localStorage.getItem("idToken") || "");
        _setLocalStorage(localStorage);

        const res = fetch("https://api.osudenken4dev.workers.dev/user/info", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("idToken")}`
            }
        }).then(res => res.json()).then(data => {
            setInfo(data);
        });
    }, []);

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1>Debug</h1>
                <p className={styles.description}>
                    
                    idToken
                    <br />
                    <code className="linebreak">{idToken}</code>
                </p>
                
                <h2>localStorage</h2>
                <Pre language="json" style={okaidia}>{JSON.stringify(_localStorage, null, 2)}</Pre>

                <h2>user/info</h2>
                <Pre language="json" style={okaidia}>{JSON.stringify(info, null, 2)}</Pre>
            </main>
        </div>
    );
};

export default DebugPage;