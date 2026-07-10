import { useEffect, useRef, useState } from "react";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";
import { AdminMember, hasPermission, MemberDetail, Permission } from "@lib/member";
import { MemberEditor } from "./MemberEditor";

interface MemberPanelProps {
  member: AdminMember;
  /** 操作する側の実効権限 */
  permissions: number;
  onChanged: () => void;
  onClose: () => void;
  onError: (message: string) => void;
}

interface DetailResponse {
  member: MemberDetail;
  canEditTel: boolean;
}

/**
 * 部員1名の編集パネル。
 * 表の内側に置くと横スクロールに巻き込まれるため、表の外に出している。
 */
export const MemberPanel = ({ member, permissions, onChanged, onClose, onError }: MemberPanelProps) => {
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const root = useRef<HTMLElement>(null);

  const canApprove = hasPermission(permissions, Permission.MemberApprove);

  // 電話番号は一覧には載らない。開いたときだけ取りに行き、サーバ側で閲覧が記録される
  useEffect(() => {
    setDetail(null);

    // 表の下に出るので、選んだ部員が画面外にならないよう送る
    root.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    apiJson<DetailResponse>("/members/detail", {
      method: "POST",
      body: JSON.stringify({ id: member.id })
    })
      .then(setDetail)
      .catch(e => {
        console.error("Failed to load member detail:", e);
        onError("部員情報の取得に失敗しました。");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id]);

  const decide = (action: "approve" | "reject") => {
    apiJson(`/members/${action}`, { method: "POST", body: JSON.stringify({ id: member.id }) })
      .then((data: any) => {
        if (!data.success) throw new Error(data.message ?? "失敗しました");
        onChanged();
      })
      .catch(e => {
        console.error(`Failed to ${action} member:`, e);
        onError(action === "approve" ? "承認に失敗しました。" : "却下に失敗しました。");
      });
  };

  return (
    <section className={portalStyles.memberPanel} ref={root}>
      <div className={portalStyles.pageHeader}>
        <h3>{member.studentId} {member.name}</h3>
        <button type="button" className={portalStyles.portal} onClick={onClose}>閉じる</button>
      </div>

      {!detail && <p>読み込み中…</p>}

      {detail && member.status === "pre-active" && canApprove && (
        <div className={portalStyles.inputGroup}>
          <button type="button" className={portalStyles.portal}
            onClick={() => decide("approve")}>承認</button>
          <button type="button" className={portalStyles.portal} style={{ backgroundColor: "#a66666" }}
            onClick={() => confirm(`${member.name} の仮登録を却下しますか？`) && decide("reject")}>却下</button>
        </div>
      )}

      {detail && (
        <MemberEditor
          detail={detail.member}
          permissions={permissions}
          canEditTel={detail.canEditTel}
          onSaved={onChanged}
          onError={onError} />
      )}
    </section>
  );
};
