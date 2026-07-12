// 権限まわりの定義は web-api/src/util/permission.ts から
import { Permission, Role, hasPermission, resolvePermissions } from "@shared/permission";

export { Permission, Role, hasPermission };

/**
 * 役職だけで既に与えられる権限。個人単位で足す意味がないものを隠すのに使う
 * @param roleBits 役職ビット
 */
export const rolePermissions = (roleBits: number): number => resolvePermissions(roleBits);

export const PERMISSION_ENTRIES: readonly [number, string][] = [
  [Permission.DiscordInviteView, "Discord招待コード閲覧"],
  [Permission.MemberView, "部員閲覧"],
  [Permission.BlogEdit, "ブログ編集"],
  [Permission.MemberManage, "部員管理"],
  [Permission.MemberApprove, "部員承認"],
  [Permission.MemberPermissionEdit, "部員権限変更"],
  [Permission.MemberRoleEdit, "部員役職変更"],
  [Permission.MemberDelete, "部員削除"],
  [Permission.PageEdit, "ページ編集"],
  [Permission.SwitchBotControl, "SwitchBot操作"],
  [Permission.PrivatePostView, "非公開記事閲覧"],
  [Permission.PrivatePostEdit, "非公開記事編集"],
  [Permission.ImageUpload, "画像追加"],
  [Permission.ImageDelete, "画像削除"],
  [Permission.InviteCodeCreate, "招待コード作成"],
  [Permission.LogView, "ログ閲覧"],
];

// 表示は上位の役職から並べる
export const ROLE_ENTRIES: readonly [number, string][] = [
  [Role.Leader, "部長"],
  [Role.ViceLeader, "副部長"],
  [Role.ChiefClerk, "主務"],
  [Role.Accountant, "会計"],
  [Role.Manager, "マネージャー"],
  [Role.Executive, "幹部"],
  [Role.Member, "部員"],
  [Role.Other, "その他"],
];

export type MemberStatus = "pre-active" | "active" | "withdrawn" | "graduated" | "rejected";

const STATUS_LABELS: Record<MemberStatus, string> = {
  "pre-active": "承認待ち",
  active: "在籍",
  withdrawn: "退部",
  graduated: "卒業",
  rejected: "却下",
};

export interface PublicMember {
  studentId: string;
  name: string;
  furigana: string | null;
  status: MemberStatus;
  roleBits: number;
  joinDate: string | null;
  leaveDate: string | null;
}

/** 部員管理画面の一覧が扱う項目。電話番号は含まない */
export interface AdminMember extends PublicMember {
  id: number;
  email: string;
  permBits: number;
  approvedAt: string | null;
  hasAccount: boolean;
}

/** /members/detail が返す1名分。電話番号を含む */
export interface MemberDetail extends AdminMember {
  tel: string | null;
  customData: Record<string, any>;
}

/** 承認・却下を経ずに直接切り替えてよい在籍状態 */
export const EDITABLE_STATUSES: MemberStatus[] = ["active", "withdrawn", "graduated"];

/**
 * 役職ビットを表示用の文字列にする。
 * ROLE_ENTRIES は上位の役職から並んでいるので、最上位のものだけを返す
 * @param roleBits 役職ビット
 */
export const roleLabel = (roleBits: number): string =>
  ROLE_ENTRIES.find(([bit]) => roleBits & bit)?.[1] ?? "-";

/**
 * 在籍状態を表示用の文字列にする
 * @param status 在籍状態
 */
export const statusLabel = (status: MemberStatus): string => STATUS_LABELS[status] ?? status;

/**
 * 日付を表示用の文字列にする
 * @param date YYYY-MM-DD
 * @return YYYY/MM/DD
 */
export const dateLabel = (date: string | null): string =>
  date ? date.slice(0, 10).replace(/-/g, "/") : "-";
