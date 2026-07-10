import type { GetStaticProps, NextPage } from "next";
import styles from "@styles/Page.module.css";
import { MarkdownContent } from "@components/MarkdownContent";
import { PageContent, readPageContent } from "@lib/page-content";

const AboutPage: NextPage<PageContent> = ({ title, body }) => (
  <div className={styles.container}>
    <main className={styles.main}>
      <h1>{title}</h1>
      <MarkdownContent body={body} />
    </main>
  </div>
);

export const getStaticProps: GetStaticProps<PageContent> = async () => ({
  props: readPageContent("about")
});

export default AboutPage;
