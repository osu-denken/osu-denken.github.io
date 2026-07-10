import { useState } from "react";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";
import {
  AdminMember,
  hasPermission,
  MemberDetail,
  Permission,
  roleLabel,
  statusLabel,
} from "@lib/member";
import { MemberEditor } from "./MemberEditor";

interface MemberRowProps {
  member: AdminMember;
  /** 操作する側の実効権限 */
  permissions: number;
  onChanged: () => void;
  onError: (message: string) => void;
}

interface DetailResponse {
  member: MemberDetail;
  canEditTel: boolean;
}

export const MemberRow = ({ member, permissions, onChanged, onError }: MemberRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<DetailResponse | null>(null);

  const canApprove = hasPermission(permissions, Permission.MemberApprove);

  // 電話番号は一覧には載らない。開いたときだけ取りに行き、サーバ側で閲覧が記録される
  const open = () => {
    setExpanded(true);
    if (detail) return;

    apiJson<DetailResponse>("/members/detail", {
      method: "POST",
      body: JSON.stringify({ id: member.id })
    })
      .then(setDetail)
      .catch(e => {
        console.error("Failed to load member detail:", e);
        onError("部員情報の取得に失敗しました。");
      });
  };

  const toggle = () => expanded ? setExpanded(false) : open();

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
    <>
      <tr>
        <td>{member.studentId}</td>
        <td><ruby>{member.name}<rp>（</rp><rt>{member.furigana}</rt><rp>）</rp></ruby></td>
        <td>{roleLabel(member.roleBits)}</td>
        <td>{statusLabel(member.status)}</td>
        <td>{member.hasAccount ? "あり" : "なし"}</td>
        <td>{member.joinDate?.slice(0, 10) ?? "-"}</td>
        <td>
          <button type="button" className={portalStyles.portal} onClick={toggle}>
            {expanded ? "閉じる" : "編集"}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7}>
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
          </td>
        </tr>
      )}
    </>
  );
};
