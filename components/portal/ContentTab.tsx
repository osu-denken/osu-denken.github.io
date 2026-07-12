import { useMemo, useState } from "react";
import portalStyles from "@styles/Portal.module.css";
import { hasPermission, Permission } from "@lib/member";
import { BlogTab } from "@components/portal/BlogTab";
import { PrivatePostTab } from "@components/portal/PrivatePostTab";
import { PageTab } from "@components/portal/PageTab";
import { ImageTab } from "@components/portal/ImageTab";

type SubTab = "blog" | "private" | "page" | "image";

interface ContentTabProps {
  permissions: number;
  setMsg: (msg: string) => void;
}

/** サブタブを開くのに要る権限。ここに無いものは誰でも開ける */
const SUB_PERMISSIONS: Partial<Record<SubTab, number>> = {
  blog: Permission.BlogEdit,
  private: Permission.PrivatePostView,
  page: Permission.PageEdit,
};

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "blog", label: "ブログ" },
  { id: "private", label: "非公開記事" },
  { id: "page", label: "ページ" },
  { id: "image", label: "画像" },
];

/**
 * コンテンツ編集をまとめたタブ。ブログ・非公開記事・ページ・画像をサブタブで切り替える。
 */
export const ContentTab = ({ permissions, setMsg }: ContentTabProps) => {
  const canOpen = (tab: SubTab) => {
    const required = SUB_PERMISSIONS[tab];
    return required === undefined || hasPermission(permissions, required);
  };

  const visibleTabs = useMemo(() => SUB_TABS.filter(t => canOpen(t.id)), [permissions]);

  const [active, setActive] = useState<SubTab>(visibleTabs[0]?.id ?? "image");

  // 権限的に開けるタブが選ばれているか保証する
  const activeTab = visibleTabs.some(t => t.id === active) ? active : visibleTabs[0]?.id ?? "image";

  return (
    <div className={portalStyles.tabPane}>
      <div className={portalStyles.subTabBar}>
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            className={`${portalStyles.subTabButton} ${activeTab === tab.id ? portalStyles.subActive : ""}`}
            onClick={() => setActive(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "blog" && canOpen("blog") && <BlogTab setMsg={setMsg} />}
      {activeTab === "private" && canOpen("private") && <PrivatePostTab permissions={permissions} setMsg={setMsg} />}
      {activeTab === "page" && canOpen("page") && <PageTab />}
      {activeTab === "image" && <ImageTab permissions={permissions} setMsg={setMsg} />}
    </div>
  );
};
