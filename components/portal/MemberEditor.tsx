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
  email: string;
  tel: string;
  roleBits: number;
  permBits: number;
  status: MemberDetail["status"];
  joinDate: string;
  leaveDate: string;
}

// input[type=date] は YYYY-MM-DD しか受け付けない。移行前の "2022/05/26" を救う
const toDate = (value: string | null) => value?.replace(/\//g, "-").slice(0, 10) ?? "";

const toDraft = (m: MemberDetail): Draft => ({
  name: m.name,
  furigana: m.furigana ?? "",
  email: m.email,
  tel: m.tel ?? "",
  roleBits: m.roleBits,
  permBits: m.permBits,
  status: m.status,
  joinDate: toDate(m.joinDate),
  leaveDate: toDate(m.leaveDate),
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
  const isPreActive = detail.status === "pre-active";

  const save = () => {
    setSaving(true);

    apiJson("/members/update", {
      method: "POST",
      body: JSON.stringify({
        id: detail.id,
        name: draft.name,
        furigana: draft.furigana,
        email: draft.email,
        ...(canEditTel ? { tel: draft.tel } : {}),
        roleBits: draft.roleBits,
        permBits: draft.permBits & ~granted,
        joinDate: draft.joinDate || null,
        ...(isPreActive ? {} : { status: draft.status, leaveDate: leaving ? draft.leaveDate || null : null }),
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

  const text = (key: keyof Draft, type = "text") => (
    <input type={type} className={portalStyles.portal} value={draft[key] as string}
      onChange={e => set(key, e.target.value as Draft[typeof key])} />
  );

  return (
    <div className={portalStyles.memberEditor}>
      <section className={portalStyles.editorSection}>
        <h4>基本情報</h4>
        <div className={portalStyles.fieldGrid}>
          <div className={portalStyles.field}><label>学籍番号</label><p>{detail.studentId}</p></div>
          <div className={portalStyles.field}><label>氏名</label>{text("name")}</div>
          <div className={portalStyles.field}><label>ふりがな</label>{text("furigana")}</div>
          <div className={portalStyles.field}><label>メールアドレス</label>{text("email", "email")}</div>
          {canEditTel && <div className={portalStyles.field}><label>電話番号</label>{text("tel", "tel")}</div>}
        </div>
      </section>

      <section className={portalStyles.editorSection}>
        <h4>在籍</h4>
        <div className={portalStyles.fieldGrid}>
          {/* 仮登録の在籍状態は承認・却下でしか変えられない */}
          {!isPreActive && (
            <div className={portalStyles.field}>
              <label>状態</label>
              <select className={portalStyles.portal} value={draft.status} disabled={!canEditStatus}
                onChange={e => set("status", e.target.value as Draft["status"])}>
                {EDITABLE_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            </div>
          )}

          <div className={portalStyles.field}><label>入部日</label>{text("joinDate", "date")}</div>

          {leaving && (
            <div className={portalStyles.field}>
              <label>{draft.status === "graduated" ? "卒業日" : "退部日"}</label>
              <input type="date" className={portalStyles.portal} value={draft.leaveDate}
                disabled={!canEditStatus} onChange={e => set("leaveDate", e.target.value)} />
            </div>
          )}
        </div>
      </section>

      <section className={portalStyles.editorSection}>
        <h4>役職と権限</h4>
        <div className={portalStyles.fieldGrid}>
          <div className={portalStyles.field}>
            <label>役職</label>
            <BitMultiSelect entries={ROLE_ENTRIES} value={draft.roleBits} disabled={!canEditRoles}
              onChange={bits => set("roleBits", bits)} />
          </div>
          <div className={portalStyles.field}>
            <label>権限</label>
            <BitMultiSelect entries={grantablePermissions} value={draft.permBits & ~granted}
              disabled={!canEditPerms} placeholder="役職の権限のみ"
              onChange={bits => set("permBits", bits)} />
          </div>
        </div>
      </section>

      <div className={portalStyles.editorActions}>
        <button type="button" className={portalStyles.portal} disabled={!dirty || saving} onClick={save}>
          {saving ? "保存中…" : "保存"}
        </button>
        <button type="button" className={portalStyles.portal} disabled={!dirty || saving}
          onClick={() => setDraft(toDraft(detail))}>
          取り消し
        </button>
        {dirty && <span className={portalStyles.hint}>未保存の変更があります</span>}
      </div>
    </div>
  );
};
