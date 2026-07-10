import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiFetch, apiJson, readIdToken, redirectToLogin } from "@lib/api";
import { AdminMember, hasPermission, MemberStatus, Permission } from "@lib/member";
import { MemberRow } from "@components/portal/MemberRow";
import { MemberPanel } from "@components/portal/MemberPanel";

const FILTERS: { id: MemberStatus | "all"; label: string }[] = [
  { id: "pre-active", label: "承認待ち" },
  { id: "active", label: "在籍" },
  { id: "graduated", label: "卒業" },
  { id: "withdrawn", label: "退部" },
  { id: "all", label: "すべて" },
];

const AdminMembersPage: NextPage = () => {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [permissions, setPermissions] = useState(0);
  const [filter, setFilter] = useState<MemberStatus | "all">("pre-active");
  const [msg, setMsg] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 一覧から引き直すので、再読込やフィルタ切替で消えた部員のパネルは自然に閉じる
  const selected = members.find(m => m.id === selectedId) ?? null;

  const load = useCallback(async (status: MemberStatus | "all") => {
    const query = status === "all" ? "" : `?status=${status}`;
    const data: any = await apiJson(`/members/list${query}`, { method: "POST" });

    setMembers(data.members ?? []);
  }, []);

  useEffect(() => {
    if (!readIdToken()) {
      window.location.href = `/?i=${encodeURIComponent("portal/admin/members/")}#login`;
      return;
    }

    // 自分の実効権限は /portal が返す。403 ならこの画面を開く資格がない
    apiFetch("/portal", { method: "POST" })
      .then(async res => {
        if (res.status === 401) {
          redirectToLogin("portal/admin/members/");
          return;
        }

        const data: any = await res.json();
        setPermissions(data.permissions ?? 0);
      })
      .catch(e => console.error("Failed to load portal:", e));
  }, []);

  useEffect(() => {
    if (!hasPermission(permissions, Permission.MemberManage)) return;

    load(filter).catch(e => {
      console.error("Failed to load members:", e);
      setMsg("名簿の取得に失敗しました。");
    });
  }, [permissions, filter, load]);

  const reload = () => {
    setMsg("");
    load(filter).catch(e => console.error("Failed to reload members:", e));
  };

  if (permissions && !hasPermission(permissions, Permission.MemberManage)) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>部員管理</h1>
          <p className={styles.description}>この画面を開く権限がありません。</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>部員管理</h1>
        {msg ? <div className={portalStyles.notice}>{msg}</div> : ``}

        <div className={portalStyles.tabContainer}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`${portalStyles.tabButton} ${filter === f.id ? portalStyles.active : ""}`}
              onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        <div className={portalStyles.tableScroll}>
        <table>
          <thead>
            <tr>
              <th>学籍番号</th>
              <th>氏名</th>
              <th>役職</th>
              <th>在籍</th>
              <th>アカウント</th>
              <th>入部日</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <MemberRow
                key={member.id}
                member={member}
                selected={member.id === selectedId}
                onSelect={() => setSelectedId(member.id === selectedId ? null : member.id)} />
            ))}
          </tbody>
        </table>
        </div>

        {members.length === 0 && <p className={styles.description}>該当する部員はいません。</p>}

        {selected && (
          <MemberPanel
            member={selected}
            permissions={permissions}
            onChanged={reload}
            onClose={() => setSelectedId(null)}
            onError={setMsg} />
        )}
      </main>
    </div>
  );
};

export default AdminMembersPage;
