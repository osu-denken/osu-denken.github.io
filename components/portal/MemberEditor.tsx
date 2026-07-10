import { useState } from "react";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";
import {
  EDITABLE_STATUSES,
  hasPermission,
  MemberDetail,
  Permission,
  PERMISSION_ENTRIES,
  ROLE_ENTRIES,
  rolePermissions,
  statusLabel,
} from "@lib/member";
import { BitMultiSelect } from "./BitMultiSelect";

interface MemberEditorProps {
  detail: MemberDetail;
  /** 操作する側の実効権限 */
  permissions: number;
  canEditTel: boolean;
  onSaved: () => void;
  onError: (message: string) => void;
}

interface Draft {
  name: string;
  furigana: string;
  tel: string;
  roleBits: number;
  permBits: number;
  status: MemberDetail["status"];
  leaveDate: string;
}

const toDraft = (m: MemberDetail): Draft => ({
  name: m.name,
  furigana: m.furigana ?? "",
  tel: m.tel ?? "",
  roleBits: m.roleBits,
  permBits: m.permBits,
  status: m.status,
  leaveDate: m.leaveDate?.slice(0, 10) ?? "",
});

export const MemberEditor = ({ detail, permissions, canEditTel, onSaved, onError }: MemberEditorProps) => {
  const [draft, setDraft] = useState<Draft>(toDraft(detail));
  const [saving, setSaving] = useState(false);

  const canEditRoles = hasPermission(permissions, Permission.MemberRoleEdit);
  const canEditPerms = hasPermission(permissions, Permission.MemberPermissionEdit);
  const canEditStatus = hasPermission(permissions, Permission.MemberDelete);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });

  // 役職で既に満たしている権限は、個人単位で足しても意味がないので選ばせない
  const granted = rolePermissions(draft.roleBits);
  const grantablePermissions = PERMISSION_ENTRIES.filter(([bit]) => !(granted & bit));

  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(detail));
  const leaving = draft.status === "withdrawn" || draft.status === "graduated";

  const save = () => {
    setSaving(true);

    apiJson("/members/update", {
      method: "POST",
      body: JSON.stringify({
        id: detail.id,
        name: draft.name,
        furigana: draft.furigana,
        ...(canEditTel ? { tel: draft.tel } : {}),
        roleBits: draft.roleBits,
        permBits: draft.permBits & ~granted,
        status: draft.status,
        leaveDate: leaving ? draft.leaveDate || null : null,
      })
    })
      .then((data: any) => {
        if (!data.success) throw new Error(data.message ?? "保存に失敗しました");
        onSaved();
      })
      .catch(e => {
        console.error("Failed to update member:", e);
        onError(e instanceof Error ? e.message : "保存に失敗しました");
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className={portalStyles.memberEditor}>
      <div className={portalStyles.field}>
        <label>氏名</label>
        <input type="text" className={portalStyles.portal} value={draft.name}
          onChange={e => set("name", e.target.value)} />
      </div>

      <div className={portalStyles.field}>
        <label>ふりがな</label>
        <input type="text" className={portalStyles.portal} value={draft.furigana}
          onChange={e => set("furigana", e.target.value)} />
      </div>

      <div className={portalStyles.field}>
        <label>メールアドレス</label>
        <p>{detail.email}</p>
      </div>

      {canEditTel && (
        <div className={portalStyles.field}>
          <label>電話番号</label>
          <input type="tel" className={portalStyles.portal} value={draft.tel}
            onChange={e => set("tel", e.target.value)} />
        </div>
      )}

      <div className={portalStyles.field}>
        <label>役職</label>
        <BitMultiSelect entries={ROLE_ENTRIES} value={draft.roleBits} disabled={!canEditRoles}
          onChange={bits => set("roleBits", bits)} />
      </div>

      <div className={portalStyles.field}>
        <label>権限</label>
        <BitMultiSelect entries={grantablePermissions} value={draft.permBits & ~granted}
          disabled={!canEditPerms} onChange={bits => set("permBits", bits)} />
      </div>

      {/* 仮登録の在籍状態は承認・却下でしか変えられない */}
      {detail.status !== "pre-active" && (
        <div className={portalStyles.field}>
          <label>在籍</label>
          <select className={portalStyles.portal} value={draft.status} disabled={!canEditStatus}
            onChange={e => set("status", e.target.value as Draft["status"])}>
            {EDITABLE_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </div>
      )}

      {leaving && (
        <div className={portalStyles.field}>
          <label>{draft.status === "graduated" ? "卒業日" : "退部日"}</label>
          <input type="date" className={portalStyles.portal} value={draft.leaveDate}
            disabled={!canEditStatus} onChange={e => set("leaveDate", e.target.value)} />
        </div>
      )}

      <div className={portalStyles.inputGroup}>
        <button type="button" className={portalStyles.portal} disabled={!dirty || saving} onClick={save}>
          {saving ? "保存中…" : "保存"}
        </button>
        <button type="button" className={portalStyles.portal} disabled={!dirty || saving}
          onClick={() => setDraft(toDraft(detail))}>
          取り消し
        </button>
      </div>
    </div>
  );
};
