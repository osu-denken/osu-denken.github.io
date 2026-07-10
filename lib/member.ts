// web-api の util/permission.ts の Role と一致させること
export const Role = {
  Member: 1 << 1,
  Other: 1 << 2,
  Executive: 1 << 3,
  Manager: 1 << 4,
  Accountant: 1 << 5,
  ChiefClerk: 1 << 6,
  ViceLeader: 1 << 7,
  Leader: 1 << 8,
} as const;

// web-api の util/permission.ts の Permission と一致させること
export const Permission = {
  DiscordInviteView: 1 << 0,
  MemberView: 1 << 1,
  BlogEdit: 1 << 2,
  MemberManage: 1 << 3,
  MemberApprove: 1 << 4,
  MemberPermissionEdit: 1 << 5,
  MemberRoleEdit: 1 << 6,
  MemberDelete: 1 << 7,
  PageEdit: 1 << 8,
  SwitchBotControl: 1 << 9,
} as const;

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

// web-api の util/permission.ts と一致させること
const MEMBER_DEFAULT_PERMISSIONS =
  Permission.DiscordInviteView | Permission.MemberView | Permission.BlogEdit;

const EXECUTIVE_DEFAULT_PERMISSIONS =
  MEMBER_DEFAULT_PERMISSIONS |
  Permission.MemberManage |
  Permission.MemberApprove |
  Permission.MemberPermissionEdit |
  Permission.MemberRoleEdit |
  Permission.MemberDelete |
  Permission.PageEdit |
  Permission.SwitchBotControl;

const EXECUTIVE_ROLES =
  Role.Manager | Role.Accountant | Role.ChiefClerk | Role.ViceLeader | Role.Leader;

/**
 * 役職だけで既に与えられる権限。個人単位で足す意味がないものを隠すのに使う
 * @param roleBits 役職ビット
 */
export function rolePermissions(roleBits: number): number {
  const roles = roleBits & EXECUTIVE_ROLES ? roleBits | Role.Executive : roleBits;

  let permissions = 0;
  if (roles & Role.Member) permissions |= MEMBER_DEFAULT_PERMISSIONS;
  if (roles & Role.Other) permissions |= MEMBER_DEFAULT_PERMISSIONS;
  if (roles & Role.Executive) permissions |= EXECUTIVE_DEFAULT_PERMISSIONS;

  return permissions;
}

/**
 * 必要な権限をすべて持っているか
 * @param permissions 実効権限ビット
 * @param required 必要な権限ビット
 */
export const hasPermission = (permissions: number, required: number): boolean =>
  (permissions & required) === required;

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
 * 役職ビットを表示用の文字列にする
 * @param roleBits 役職ビット
 */
export const roleLabel = (roleBits: number): string =>
  ROLE_ENTRIES.filter(([bit]) => roleBits & bit).map(([, label]) => label).join("/") || "-";

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
