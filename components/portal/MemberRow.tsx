import portalStyles from "@styles/Portal.module.css";
import { AdminMember, dateLabel, roleLabel, statusLabel } from "@lib/member";

interface MemberRowProps {
  member: AdminMember;
  selected: boolean;
  onSelect: () => void;
}

export const MemberRow = ({ member, selected, onSelect }: MemberRowProps) => (
  <tr className={selected ? portalStyles.selectedRow : ""}>
    <td>{member.studentId}</td>
    <td><ruby>{member.name}<rp>（</rp><rt>{member.furigana}</rt><rp>）</rp></ruby></td>
    <td>{roleLabel(member.roleBits)}</td>
    <td>{statusLabel(member.status)}</td>
    <td>{member.hasAccount ? "あり" : "なし"}</td>
    <td>{dateLabel(member.joinDate)}</td>
    <td>
      <button type="button" className={portalStyles.portal} onClick={onSelect}>
        {selected ? "閉じる" : "編集"}
      </button>
    </td>
  </tr>
);
