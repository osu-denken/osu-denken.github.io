import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import { useState } from "react";
import { Prism as Pre } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const DebugPage: NextPage = () => {
    const [info, setInfo] = useState<any>(null);
    const [portalData, setPortalData] = useState<any>(null);
    const [membersData, setMembersData] = useState<any>(null);
    const [memberMe, setMemberMe] = useState<any>(null);
    const [memberCount, setMemberCount] = useState<any>(null);
    const [blogList, setBlogList] = useState<any>(null);
    const [blogList2, setBlogList2] = useState<any>(null);
    const [blogData, setBlogData] = useState<any>(null);
    const [blogData2, setBlogData2] = useState<any>(null);
    const [_localStorage, _setLocalStorage] = useState<any>(null);

    const fetchWithAuth = (url: string) => {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("idToken")}`
            }
        }).then(res => res.json());
    };

    const fetchInfo = () => fetchWithAuth("https://api.osudenken4dev.workers.dev/user/info").then(setInfo);
    const fetchPortal = () => fetchWithAuth("https://api.osudenken4dev.workers.dev/portal").then(setPortalData);
    const fetchMembers = () => fetchWithAuth("https://api.osudenken4dev.workers.dev/portal/members").then(setMembersData);
    const fetchMemberMe = () => fetchWithAuth("https://api.osudenken4dev.workers.dev/portal/member/me").then(setMemberMe);
    const fetchMemberCount = () => fetch("https://api.osudenken4dev.workers.dev/portal/memberCount", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }).then(res => res.json()).then(setMemberCount);

    const fetchBlogList = () => fetchWithAuth("https://api.osudenken4dev.workers.dev/v1/blog/list").then(setBlogList);
    const fetchBlogList2 = () => fetchWithAuth("https://api.osudenken4dev.workers.dev/v2/blog/list").then(setBlogList2);

    const fetchBlogData = (page: string) => {
        fetch("https://api.osudenken4dev.workers.dev/v1/blog/get?page=" + encodeURIComponent(page), {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }).then(res => res.json()).then(setBlogData);
    };

    const fetchBlogData2 = (page: string) => {
        fetch("https://api.osudenken4dev.workers.dev/v2/blog/get?page=" + encodeURIComponent(page), {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }).then(res => res.json()).then(setBlogData2);
    };

    const initLocalStorage = () => _setLocalStorage(localStorage);

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1>Debug</h1>


                <h2>localStorage</h2>
                <input type="submit" onClick={initLocalStorage} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(_localStorage, null, 2)}</Pre>


                <h2>/user/info</h2>
                <input type="submit" onClick={fetchInfo} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(info, null, 2)}</Pre>


                <h2>/portal</h2>
                <input type="submit" onClick={fetchPortal} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(portalData, null, 2)}</Pre>


                <h2>/portal/members</h2>
                <input type="submit" onClick={fetchMembers} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(membersData, null, 2)}</Pre>


                <h2>/portal/member/me</h2>
                <input type="submit" onClick={fetchMemberMe} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(memberMe, null, 2)}</Pre>

                <h2>/portal/memberCount</h2>
                <input type="submit" onClick={fetchMemberCount} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(memberCount, null, 2)}</Pre>

                <h2>/v1/blog/list</h2>
                <input type="submit" onClick={fetchBlogList} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(blogList, null, 2)}</Pre>

                <h2>/v2/blog/list</h2>
                <input type="submit" onClick={fetchBlogList2} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(blogList2, null, 2)}</Pre>

                <h2>/v1/blog/get</h2>
                <form onSubmit={e => {
                    e.preventDefault();
                    const page = new FormData(e.currentTarget).get("page") as string;
                    fetchBlogData(page);
                }}>
                    <input type="text" name="page" placeholder="page" />
                    <input type="submit" value="取得" />
                    <Pre language="json" style={okaidia}>{JSON.stringify(blogData, null, 2)}</Pre>
                </form>

                <h2>/v2/blog/get</h2>
                <form onSubmit={e => {
                    e.preventDefault();
                    const page = new FormData(e.currentTarget).get("page_v2") as string;
                    fetchBlogData2(page);
                }}>
                    <input type="text" name="page_v2" placeholder="page" />
                    <input type="submit" value="取得" />
                    <Pre language="json" style={okaidia}>{JSON.stringify(blogData2, null, 2)}</Pre>
                </form>
            </main>
        </div>
    );
};

export default DebugPage;
