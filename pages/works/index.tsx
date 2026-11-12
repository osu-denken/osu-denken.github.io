import fs from "fs";
import path from "path";
import type { GetStaticProps, NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import styles from "@styles/Page.module.css";
import pageStyles from "@styles/Works.module.css";
import WorkCard from "@components/WorkCard";
import { Icon } from "@iconify/react";
import { parseWorks, Work } from "@lib/works";
import { apiFetch } from "@lib/api";
import { hasPermission, Permission } from "@lib/member";

interface WorksPageProps { works: Work[]; }

const WorksPage: NextPage<WorksPageProps> = ({ works }) => {
  const [canEdit, setCanEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("idToken")) return;
    let cancelled = false;
    apiFetch("/portal", { method: "POST" })
      .then(async response => {
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setCanEdit(hasPermission(data.permissions ?? 0, Permission.PageEdit));
      })
      .catch(error => console.error("Failed to load works permission:", error));
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => Array.from(new Set(works.map(w => w.category).filter(Boolean))) as string[], [works]);
  const categoryNames = useMemo(() => new Set(works.map(work => work.category).filter(Boolean)), [works]);
  const tags = useMemo(() => Array.from(new Set(works.flatMap(work => (work.tags ?? []).filter(item => !categoryNames.has(item))))), [works, categoryNames]);

  const filteredWorks = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    return works.filter(work => {
      const matchesSearch = !keyword || [
        work.title, work.overview, work.description, work.author, work.category, ...(work.tags ?? [])
      ].some(value => value?.toLocaleLowerCase().includes(keyword));
      return matchesSearch && (!category || work.category === category) && (!tag || work.tags?.includes(tag));
    });
  }, [works, search, category, tag]);

  return (
    <div className={styles.container}>
      <main className={`${styles.main} ${pageStyles.page}`}>
        <h1>作品</h1>
        <p className={styles.description}>部員が創作したものを紹介します！</p>

        <div className={pageStyles.toolbar}>
          <label className={pageStyles.searchBox}>
            <Icon icon="fa6-solid:magnifying-glass" />
            <input
              className={pageStyles.searchInput}
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="作品名・概要・作者などで検索"
              aria-label="作品を検索"
            />
          </label>
          <button
            type="button"
            className={pageStyles.filterButton}
            onClick={() => setFiltersOpen(open => !open)}
            aria-expanded={filtersOpen}
            aria-label="絞り込み"
            title="絞り込み"
          >
            <Icon icon="fa6-solid:sliders" />
          </button>
        </div>

        {filtersOpen && (
          <div className={pageStyles.filterPanel}>
            <div className={pageStyles.filterGroup}>
              <span className={pageStyles.filterLabel}>カテゴリ</span>
              <button type="button" className={`${pageStyles.filterChip} ${!category ? pageStyles.active : ""}`} onClick={() => setCategory("")}>すべて</button>
              {categories.map(item => (
                <button type="button" key={item} className={`${pageStyles.filterChip} ${category === item ? pageStyles.active : ""}`} onClick={() => setCategory(category === item ? "" : item)}>{item}</button>
              ))}
            </div>
            {tags.length > 0 && (
              <div className={pageStyles.filterGroup}>
                <span className={pageStyles.filterLabel}>タグ</span>
                <button type="button" className={`${pageStyles.filterChip} ${!tag ? pageStyles.active : ""}`} onClick={() => setTag("")}>すべて</button>
                {tags.map(item => (
                  <button type="button" key={item} className={`${pageStyles.filterChip} ${tag === item ? pageStyles.active : ""}`} onClick={() => setTag(tag === item ? "" : item)}>{item}</button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={pageStyles.worksGrid}>
          {filteredWorks.length > 0
            ? filteredWorks.map(work => <WorkCard key={work.id} work={work} canEdit={canEdit} />)
            : <p className={pageStyles.emptyState}>該当する作品がありません。</p>}
        </div>
      </main>
    </div>
  );
};

export const getStaticProps: GetStaticProps<WorksPageProps> = async () => {
  const source = fs.readFileSync(path.join(process.cwd(), "content", "works.json"), "utf8");
  return { props: { works: parseWorks(source) } };
};

export default WorksPage;
