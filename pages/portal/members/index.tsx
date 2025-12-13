import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { useEffect, useState } from "react";

const MembersPage : NextPage = () => {
  const [members, setMembers] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("idToken");

    if (!token) {
      const encoded = encodeURIComponent("portal/members/");
      window.location.href = "/?i=" + encoded + "#login";
    }

    fetch("https://api.osudenken4dev.workers.dev/portal/members", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("idToken")}`
      }
    }).then(res => res.json()).then(data => {
      setMembers(data);
    });
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>構成員名簿</h1>
        <p className={styles.description}>
          情報に誤りがある場合、ご連絡ください。<br />
        </p>
        <table>
          <thead>
            <tr>
              <th>学籍番号</th>
              <th>氏名</th>
              {/* <th>メールアドレス</th> */}
              <th>役割</th>
              <th>入部日</th>
            </tr>
          </thead>
          <tbody>
            {members && members.map((member: any) => (
              <tr key={member.num}>
                <td>{member.num}</td>
                <td><ruby>{member.name}<rp>（</rp><rt>{member.furigana}</rt><rp>）</rp></ruby></td>
                {/* <td>{member.email ? member.email : `s${(member.num as string).toLowerCase()}@ge.osaka-sandai.ac.jp`}</td> */}
                <td>{member.role}</td>
                <td>{member.joinDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default MembersPage;
