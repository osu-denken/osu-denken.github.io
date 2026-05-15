import { NextPage } from 'next';

const NotFound: NextPage = () => {
  return (
    <div>
      <h1>404 - ページが見つかりません</h1>
      <p>お探しのページは削除されたか、URLが間違っています。</p>
      <a href="/">ホームに戻る</a>
    </div>
  );
}

export default NotFound;