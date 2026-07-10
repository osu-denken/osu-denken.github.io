import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import { useState } from "react";
import { Prism as Pre } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { apiJson } from "@lib/api";

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
    const [userData, setUserData] = useState<any>(null);
    const [_localStorage, _setLocalStorage] = useState<any>(null);

    const post = (path: string) => apiJson(path, { method: "POST" });
    const postAnon = (path: string) => apiJson(path, { method: "POST", auth: false });

    const fetchInfo = () => post("/user/info").then(setInfo);
    const fetchPortal = () => post("/portal").then(setPortalData);
    const fetchMembers = () => post("/portal/members").then(setMembersData);
    const fetchMemberMe = () => post("/portal/member/me").then(setMemberMe);
    const fetchMemberCount = () => postAnon("/portal/memberCount").then(setMemberCount);

    const fetchBlogList = () => post("/v1/blog/list").then(setBlogList);
    const fetchBlogList2 = () => post("/v2/blog/list").then(setBlogList2);

    const fetchBlogData = (page: string) =>
        postAnon("/v1/blog/get?page=" + encodeURIComponent(page)).then(setBlogData);

    const fetchBlogData2 = (page: string) =>
        postAnon("/v2/blog/get?page=" + encodeURIComponent(page)).then(setBlogData2);

    const fetchSwitchBotList = () => post("/switchbot/list").then(setSwitchBotList);
    const [switchBotList, setSwitchBotList] = useState<any>(null);

    const fetchSwitchBotValidate = () => post("/switchbot/validate").then(setSwitchBotValidate);
    const [switchBotValidate, setSwitchBotValidate] = useState<any>(null);

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

                <h2>/user/login</h2>
                <form onSubmit={e => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const email = formData.get("username");
                    const password = formData.get("password");
  
                    apiJson("/user/login", {
                        method: "POST",
                        auth: false,
                        body: JSON.stringify({ email, password })
                    }).then(setUserData);
                }}>
                    <input type="text" name="username" />
                    <input type="password" name="password" />
                    <input type="submit" value="取得" />
                    <Pre language="json" style={okaidia}>{JSON.stringify(userData, null, 2)}</Pre>
                </form>

                <h2>v1/switchbot/validate</h2>
                <input type="submit" onClick={fetchSwitchBotValidate} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(switchBotValidate, null, 2)}</Pre>

                <h2>v1/switchbot/list</h2>
                <input type="submit" onClick={fetchSwitchBotList} value="取得" />
                <Pre language="json" style={okaidia}>{JSON.stringify(switchBotList, null, 2)}</Pre>
            </main>
        </div>
    );
};

export default DebugPage;
