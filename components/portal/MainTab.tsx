import Link from "next/link";
import { Icon } from "@iconify/react";
import portalStyles from "@styles/Portal.module.css";
import { hasPermission, Permission } from "@lib/member";
import { GitHubOrgsJoin } from "@components/portal/GitHubOrgsJoin";

interface MainTabProps {
  userName: string;
  permissions: number;
  discordInviteUrl: string;
}

interface Action {
  label: string;
  description: string;
  icon: string;
  href: string;
  external?: boolean;
  /** undefined なら誰でも表示 */
  permission?: number;
}

/**
 * メニューの1行。内部リンクと外部リンクを吸収する。
 */
const ActionItem = ({ action }: { action: Action }) => {
  const inner = (
    <>
      <Icon icon={action.icon} className={portalStyles.menuIcon} />
      <span className={portalStyles.menuText}>
        <span className={portalStyles.menuLabel}>{action.label}</span>
        <span className={portalStyles.menuDesc}>{action.description}</span>
      </span>
      <Icon icon="fa6-solid:chevron-right" className={portalStyles.menuChevron} />
    </>
  );

  if (action.external) {
    return (
      <a className={portalStyles.menuItem} href={action.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link className={portalStyles.menuItem} href={action.href}>
      {inner}
    </Link>
  );
};

export const MainTab = ({ userName, permissions, discordInviteUrl }: MainTabProps) => {
  // メンバー全般向け
  const memberActions: Action[] = [
    {
      label: "Discordに参加",
      description: "部内のDiscordサーバーへ参加します。",
      icon: "fa6-brands:discord",
      href: discordInviteUrl || "#",
      external: true,
      permission: Permission.DiscordInviteView,
    },
  ];

  // 管理・幹部向け
  const adminActions: Action[] = [
    {
      label: "招待コードの作成",
      description: "新入部員向けの招待コードを発行します。",
      icon: "fa6-solid:ticket",
      href: "/portal/invite/",
      permission: Permission.InviteCodeCreate,
    },
    {
      label: "構成員名簿",
      description: "部員の一覧を閲覧します。",
      icon: "fa6-solid:address-book",
      href: "/portal/members/",
      permission: Permission.MemberManage,
    },
    {
      label: "部員管理",
      description: "承認・役職・権限などを管理します。",
      icon: "fa6-solid:users-gear",
      href: "/portal/admin/members/",
      permission: Permission.MemberManage,
    },
    {
      label: "ワンタイムパスワード管理",
      description: "部の共有アカウントのOTPを管理します。",
      icon: "fa6-solid:shield-halved",
      href: "https://totp.kmmz.jp/?email=osudenken4dev@gmail.com",
      external: true,
      permission: Permission.MemberManage,
    },
  ];

  const visible = (actions: Action[]) =>
    actions.filter(a => a.permission === undefined || hasPermission(permissions, a.permission));

  const memberVisible = visible(memberActions);
  const adminVisible = visible(adminActions);

  return (
    <div className={portalStyles.tabPane}>
      <div className={portalStyles.welcome}>
        <h1 className={portalStyles.welcomeTitle}>ようこそ、{userName} さん</h1>
        <p className={portalStyles.welcomeSub}>電研ポータルへようこそ。上のタブから各機能を利用できます。</p>
      </div>

      {memberVisible.length > 0 && (
        <>
          <h2 className={portalStyles.sectionTitle}>メニュー</h2>
          <nav className={portalStyles.menuList}>
            {memberVisible.map(a => <ActionItem key={a.label} action={a} />)}
          </nav>
        </>
      )}

      {adminVisible.length > 0 && (
        <>
          <h2 className={portalStyles.sectionTitle}>管理</h2>
          <nav className={portalStyles.menuList}>
            {adminVisible.map(a => <ActionItem key={a.label} action={a} />)}
          </nav>
        </>
      )}

      <h2 className={portalStyles.sectionTitle}>GitHub Organization</h2>
      <GitHubOrgsJoin />
    </div>
  );
};
