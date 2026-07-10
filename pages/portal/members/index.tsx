import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiJson, readIdToken } from "@lib/api";
import { hasPermission, Permission, PublicMember, roleLabel, statusLabel } from "@lib/member";

const editorHref = (studentId: string) =>
  `/portal/admin/members/?student=${encodeURIComponent(studentId)}`;

const MembersPage : NextPage = () => {
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [permissions, setPermissions] = useState(0);

  const canManage = hasPermission(permissions, Permission.MemberManage);

  useEffect(() => {
    if (!readIdToken()) {
      const encoded = encodeURIComponent("portal/members/");
      window.location.href = "/?i=" + encoded + "#login";
    }

    apiJson<PublicMember[]>("/portal/members", { method: "GET" })
      .then(data => setMembers(data ?? []))
      .catch(e => console.error("Failed to load members:", e));

    // 編集ボタンの出し分けに使う。表示上の配慮で、実際の防御はサーバ側
    apiJson<{ permissions?: number }>("/portal", { method: "POST" })
      .then(data => setPermissions(data.permissions ?? 0))
      .catch(e => console.error("Failed to load permissions:", e));
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
              <th>役割</th>
              <th>在籍</th>
              <th>入部日</th>
              {canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.studentId}>
                <td>{member.studentId}</td>
                <td><ruby>{member.name}<rp>（</rp><rt>{member.furigana}</rt><rp>）</rp></ruby></td>
                <td>{roleLabel(member.roleBits)}</td>
                <td>{statusLabel(member.status)}</td>
                <td>{member.joinDate?.slice(0, 10)}</td>
                {canManage && (
                  <td>
                    <Link className={portalStyles.portal} href={editorHref(member.studentId)}>編集</Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default MembersPage;
