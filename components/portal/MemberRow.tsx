import { useState } from "react";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";
import {
  AdminMember,
  hasPermission,
  Permission,
  PERMISSION_ENTRIES,
  ROLE_ENTRIES,
  roleLabel,
  statusLabel,
} from "@lib/member";

interface MemberRowProps {
  member: AdminMember;
  /** 操作する側の実効権限 */
  permissions: number;
  onChanged: () => void;
  onError: (message: string) => void;
}

/** チェックボックスでビットを組み立てる */
const BitCheckboxes = ({ entries, value, onChange, disabled }: {
  entries: readonly [number, string][];
  value: number;
  onChange: (next: number) => void;
  disabled: boolean;
}) => (
  <div className={portalStyles.inputGroup}>
    {entries.map(([bit, label]) => (
      <label key={bit} style={{ marginRight: 8, whiteSpace: "nowrap" }}>
        <input
          type="checkbox"
          checked={Boolean(value & bit)}
          disabled={disabled}
          onChange={e => onChange(e.target.checked ? value | bit : value & ~bit)} />
        {label}
      </label>
    ))}
  </div>
);

export const MemberRow = ({ member, permissions, onChanged, onError }: MemberRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const [roleBits, setRoleBits] = useState(member.roleBits);
  const [permBits, setPermBits] = useState(member.permBits);

  const canApprove = hasPermission(permissions, Permission.MemberApprove);
  const canEditRoles = hasPermission(permissions, Permission.MemberRoleEdit);
  const canEditPerms = hasPermission(permissions, Permission.MemberPermissionEdit);
  const canLeave = hasPermission(permissions, Permission.MemberDelete);

  const call = async (path: string, body: Record<string, unknown>) => {
    try {
      const data: any = await apiJson(path, { method: "POST", body: JSON.stringify({ id: member.id, ...body }) });
      if (!data.success) throw new Error(data.message ?? "失敗しました");
      onChanged();
    } catch (e) {
      console.error(`Failed to call ${path}:`, e);
      onError(e instanceof Error ? e.message : "失敗しました");
    }
  };

  return (
    <>
      <tr>
        <td>{member.studentId}</td>
        <td><ruby>{member.name}<rp>（</rp><rt>{member.furigana}</rt><rp>）</rp></ruby></td>
        <td>{roleLabel(member.roleBits)}</td>
        <td>{statusLabel(member.status)}</td>
        <td>{member.joinDate?.slice(0, 10) ?? "-"}</td>
        <td>
          <button type="button" className={portalStyles.portal} onClick={() => setExpanded(!expanded)}>
            {expanded ? "閉じる" : "編集"}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={6}>
            <p>{member.email}{member.tel ? ` / ${member.tel}` : ""}</p>

            {member.status === "pre-active" && canApprove && (
              <div className={portalStyles.inputGroup}>
                <button type="button" className={portalStyles.portal}
                  onClick={() => call("/members/approve", {})}>承認</button>
                <button type="button" className={portalStyles.portal} style={{ backgroundColor: "#a66666" }}
                  onClick={() => call("/members/reject", {})}>却下</button>
              </div>
            )}

            <h4>役職</h4>
            <BitCheckboxes entries={ROLE_ENTRIES} value={roleBits} onChange={setRoleBits} disabled={!canEditRoles} />
            {canEditRoles && (
              <button type="button" className={portalStyles.portal}
                onClick={() => call("/members/roles", { roleBits })}>役職を保存</button>
            )}

            <h4>追加権限 (役職のデフォルト権限に上乗せされます)</h4>
            <BitCheckboxes entries={PERMISSION_ENTRIES} value={permBits} onChange={setPermBits} disabled={!canEditPerms} />
            {canEditPerms && (
              <button type="button" className={portalStyles.portal}
                onClick={() => call("/members/permissions", { permBits })}>権限を保存</button>
            )}

            {member.status === "active" && canLeave && (
              <>
                <h4>在籍終了</h4>
                <div className={portalStyles.inputGroup}>
                  <button type="button" className={portalStyles.portal}
                    onClick={() => confirm(`${member.name} を卒業にしますか？`) && call("/members/leave", { status: "graduated" })}>
                    卒業
                  </button>
                  <button type="button" className={portalStyles.portal} style={{ backgroundColor: "#a66666" }}
                    onClick={() => confirm(`${member.name} を退部にしますか？`) && call("/members/leave", { status: "withdrawn" })}>
                    退部
                  </button>
                </div>
              </>
            )}
          </td>
        </tr>
      )}
    </>
  );
};
