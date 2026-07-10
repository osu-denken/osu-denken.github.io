import fs from "fs";
import path from "path";
import type { GetStaticProps, NextPage } from "next";
import styles from "@styles/Page.module.css";
import WorkCard from "@components/WorkCard";
import { parseWorks, Work } from "@lib/works";

interface WorksPageProps {
  works: Work[];
}

const WorksPage: NextPage<WorksPageProps> = ({ works }) => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>作品</h1>
        <p className={styles.description}>
          部員が創作したものを紹介します！
        </p>

        {/* 作品の一覧リスト（縦並び、またはグリッド） */}
        <div className={styles.worksGrid}>
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
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
