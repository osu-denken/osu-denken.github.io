import ReactMarkdown from "react-markdown";
import breaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import styles from "@styles/PageContent.module.css";

interface MarkdownContentProps {
  body: string;
}

/**
 * 固定ページの本文。
 * iframe や style 付きの img を書けるよう生の HTML を通す。
 * 編集できるのは PageEdit を持つ幹部だけという前提に立っている
 */
export const MarkdownContent = ({ body }: MarkdownContentProps) => (
  <div className={styles.pageContent}>
    <ReactMarkdown remarkPlugins={[remarkGfm, breaks]} rehypePlugins={[rehypeRaw]}>
      {body}
    </ReactMarkdown>
  </div>
);
