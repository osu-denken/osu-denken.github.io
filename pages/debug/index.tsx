import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import { useEffect, useState } from "react";
import { Prism as Pre } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const DebugPage : NextPage = () => {
    const [info, setInfo] = useState<any>(null);
    const [portalData, setPortalData] = useState<any>(null);
    const [blogList, setBlogList] = useState<any>(null);
    const [blogData, setBlogData] = useState<string>();
    const [blogData2, setBlogData2] = useState<string>();

    const [_localStorage, _setLocalStorage] = useState<any>(null);

    
    useEffect(() => {
        _setLocalStorage(localStorage);

        fetch("https://api.osudenken4dev.workers.dev/user/info", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("idToken")}`
            }
        }).then(res => res.json()).then(data => {
            setInfo(data);
        });

        fetch("https://api.osudenken4dev.workers.dev/portal", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("idToken")}`
            }
        }).then(res => res.json()).then(data => {
            setPortalData(data);
        });

        fetch("https://api.osudenken4dev.workers.dev/blog/list", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("idToken")}`
            }
        }).then(res => res.json()).then(data => {
            setBlogList(data);
        });
    }, []);

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1>Debug</h1>
                {/* <p className={styles.description}>
                </p> */}
                
                <h2>localStorage</h2>
                <Pre language="json" style={okaidia}>{JSON.stringify(_localStorage, null, 2)}</Pre>

                <h2>/user/info</h2>
                <Pre language="json" style={okaidia}>{JSON.stringify(info, null, 2)}</Pre>

                <h2>/portal</h2>
                <Pre language="json" style={okaidia}>{JSON.stringify(portalData, null, 2)}</Pre>

                <h2>/blog/list</h2>
                <Pre language="json" style={okaidia}>{JSON.stringify(blogList, null, 2)}</Pre>

                <h2>/v1/blog/get</h2>
                <form onSubmit={e => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    const page = form.get("page") as string;
                    fetch("https://api.osudenken4dev.workers.dev/v1/blog/get?page=" + encodeURIComponent(page), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    .then(res => res.json())
                    .then(data => {
                        setBlogData(data);
                    }
                    );
                }}>
                    <label>
                        page: <input type="text" name="page" />
                    </label>
                    <br />
                    <input type="submit" value="取得する" />

                    <Pre language="json" style={okaidia} id="blogData">
                        {JSON.stringify(blogData, null, 2)}
                    </Pre>
                </form>

                <h2>/v2/blog/get</h2>
                <form onSubmit={e => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    const page = form.get("page_v2") as string;
                    fetch("https://api.osudenken4dev.workers.dev/v2/blog/get?page=" + encodeURIComponent(page), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    .then(res => res.json())
                    .then(data => {
                        setBlogData2(data);
                    }
                    );
                }}>
                    <label>
                        page: <input type="text" name="page_v2" />
                    </label>
                    <br />
                    <input type="submit" value="取得する" />

                    <Pre language="json" style={okaidia} id="blogData_v2">
                        {JSON.stringify(blogData2, null, 2)}
                    </Pre>
                </form>
            </main>
        </div>
    );
};

export default DebugPage;