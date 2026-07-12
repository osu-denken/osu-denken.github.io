import { useCallback, useEffect, useState } from "react";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";
import { Skeleton } from "@components/portal/Skeleton";

/** /logs/list が返す1件 */
interface LogEntry {
  type: string;
  ts: number;
  message: string;
  ip: string;
  userAgent: string;
}

interface LogListResponse {
  logs: LogEntry[];
  cursor: string | null;
  complete: boolean;
}

interface LogTabProps {
  setMsg: (msg: string) => void;
}

/**
 * タイムスタンプを表示用の文字列にする
 * @param ts エポックミリ秒
 */
const timeLabel = (ts: number): string =>
  ts ? new Date(ts).toLocaleString("ja-JP", { hour12: false }) : "-";

export const LogTab = ({ setMsg }: LogTabProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");

  const load = useCallback(async (nextCursor: string | null, reset: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type.trim()) params.set("type", type.trim());
      if (nextCursor) params.set("cursor", nextCursor);
      params.set("limit", "50");

      const data = await apiJson<LogListResponse>(`/logs/list?${params.toString()}`);
      setLogs(prev => (reset ? data.logs : [...prev, ...data.logs]));
      setCursor(data.cursor);
      setComplete(data.complete);
    } catch (e) {
      console.error("Failed to load logs:", e);
      setMsg("ログの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [type, setMsg]);

  // 初回とフィルタ変更時に読み直す
  useEffect(() => {
    load(null, true);
  }, [load]);

  return (
    <div className={portalStyles.tabPane}>
      <h1>操作ログ</h1>
      <p className={styles.description}>
        入部申請・承認・ログインなどの操作記録です。種別で絞り込めます。
      </p>

      <div className={portalStyles.inputGroup}>
        <input
          type="text"
          className={portalStyles.portal}
          placeholder="種別で絞り込み (例: member_approve)"
          value={type}
          onChange={e => setType(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") load(null, true); }} />
        <button type="button" className={portalStyles.portal} onClick={() => load(null, true)} disabled={loading}>
          絞り込み
        </button>
      </div>

      <div className={portalStyles.tableScroll}>
        <table>
          <thead>
            <tr>
              <th>日時</th>
              <th>種別</th>
              <th>内容</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={`${log.ts}-${i}`}>
                <td style={{ whiteSpace: "nowrap" }}>{timeLabel(log.ts)}</td>
                <td>{log.type}</td>
                <td>{log.message}</td>
                <td style={{ whiteSpace: "nowrap" }}>{log.ip}</td>
              </tr>
            ))}
            {loading && logs.length === 0 && Array.from({ length: 8 }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                <td><Skeleton width="9rem" height="0.9rem" /></td>
                <td><Skeleton width="6rem" height="0.9rem" /></td>
                <td><Skeleton width="80%" height="0.9rem" /></td>
                <td><Skeleton width="5rem" height="0.9rem" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && !loading && (
        <p className={styles.description}>ログはありません。</p>
      )}

      {!complete && logs.length > 0 && (
        <div className={portalStyles.inputGroup}>
          <button
            type="button"
            className={portalStyles.portal}
            onClick={() => load(cursor, false)}
            disabled={loading}>
            {loading ? "読み込み中…" : "さらに読み込む"}
          </button>
        </div>
      )}
    </div>
  );
};
