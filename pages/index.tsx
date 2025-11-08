import { useEffect, useRef } from 'react';
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { Icon } from "@iconify/react";

const HomePage: NextPage = () => {
  const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const charCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const blurCanvas = blurCanvasRef.current;
    const charCanvas = charCanvasRef.current;
    if (!blurCanvas || !charCanvas) return;

    const blurCtx = blurCanvas.getContext('2d');
    const charCtx = charCanvas.getContext('2d');
    if (!blurCtx || !charCtx) return;

    const BGCOLOR = '#121212';
    const FADE_ALPHA = 0.08;
    const COUNT = 12;
    const FOCUS_DISTANCE = 150;
    const DEPTH = 500;
    const SPEED = 1.5;
    const GLITCH_PROB = 0.98;
    const CHAR_SIZE = 20;

    document.documentElement.style.backgroundColor = BGCOLOR;
    document.body.style.backgroundColor = BGCOLOR;
    blurCanvas.style.backgroundColor = BGCOLOR;
    charCanvas.style.backgroundColor = 'transparent';

    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const rand = (range: number) => (Math.random() - 0.5) * range;
    const withAlpha = (hex: string, alpha: number) => {
      const value = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
        .toString(16)
        .padStart(2, '0');
      return `${hex}${value}`;
    };

    class Particle {
      x = 0;
      y = 0;
      z = 0;
      ch = '0';
      doBug = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = rand(viewport.width);
        this.y = rand(viewport.height);
        this.z = Math.random() * DEPTH;
        this.ch = Math.random() > 0.5 ? '0' : '1';
        this.doBug = 0;
      }

      update() {
        if ((this.z -= SPEED) < 1) this.reset();

        if (Math.random() < 0.0001) this.doBug = Math.floor(Math.random() * 330) + 30;
        if (this.doBug) {
          this.reset();
          this.doBug--;
        }
      }

      draw() {
        const scale = FOCUS_DISTANCE / (FOCUS_DISTANCE + this.z);
        const x = (this.x * scale) + (viewport.width * 0.5);
        const y = (this.y * scale) + (viewport.height * 0.5);

        if (x < 0 || x > viewport.width || y < 0 || y > viewport.height) return;

        const size = Math.max(1, CHAR_SIZE * scale);
        const alpha = Math.min(1, Math.max(0.1, (DEPTH - this.z) / DEPTH));
        const chars = [{ color: withAlpha('#1eff28', alpha), x, y }];

        if (Math.random() > GLITCH_PROB) {
          const offsetX = rand(16);
          const offsetY = rand(12);
          chars.push({ color: withAlpha('#ff3c3c', alpha), x: x + offsetX, y: y + offsetY });
          chars.push({ color: withAlpha('#5ae6ff', alpha), x: x - offsetX, y: y - offsetY });
        }

        const font = `${size}px Fira Code, monospace`;
        blurCtx.font = font;
        charCtx.font = font;
        chars.forEach(({ color, x: cx, y: cy }) => {
          blurCtx.fillStyle = color;
          blurCtx.fillText(this.ch, cx, cy);
          charCtx.fillStyle = color;
          charCtx.fillText(this.ch, cx, cy);
        });
      }
    }

    const resize = () => {
      viewport.width = window.innerWidth;
      viewport.height = window.innerHeight;
      blurCanvas.width = viewport.width;
      blurCanvas.height = viewport.height;
      charCanvas.width = viewport.width;
      charCanvas.height = viewport.height;
      blurCtx.fillStyle = BGCOLOR;
      blurCtx.fillRect(0, 0, viewport.width, viewport.height);
      charCtx.clearRect(0, 0, viewport.width, viewport.height);
      particles.forEach(p => p.reset());
    };

    const fadeBlur = () => {
      blurCtx.fillStyle = `rgba(18, 18, 18, ${FADE_ALPHA})`;
      blurCtx.fillRect(0, 0, viewport.width, viewport.height);
    };

    const clearCharLayer = () => {
      charCtx.clearRect(0, 0, viewport.width, viewport.height);
    };

    let animationFrameId = 0;
    const animate = () => {
      fadeBlur();
      clearCharLayer();
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const particles = Array.from({ length: COUNT }, () => new Particle());

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={styles.container}>
      <canvas
        ref={blurCanvasRef}
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      />
      <canvas
        ref={charCanvasRef}
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
      />
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: '#12121266', pointerEvents: 'none', zIndex: 2 }}
      />
      <main className={styles.main} style={{ position: 'relative', zIndex: 3 }}>
        <h1 className={styles.title}>電子計算研究部</h1>
        <h2 className={styles.bold}>大阪産業大学</h2>

        <div className={styles.iconContainer}>
          <a href="https://www.osaka-sandai.ac.jp/club_circle/club/233" title="大阪産業大学公式サイト">
            <Icon
              icon="mdi:university"
              width="2em"
              height="2em"
              style={{ color: "white" }}
            />
          </a>
          <a href="https://x.com/osu_denken" title="X (旧Twitter)">
            <Icon
              icon="mdi:twitter"
              width="2em"
              height="2em"
              style={{ color: "white" }}
            />
          </a>
          <a href="https://osu-denken.github.io/blog/2025/11/03/sandai-discord.html" title="Discordサーバーへの参加方法 (大産大生限定)">
            <Icon
              icon="mdi:discord"
              width="2em"
              height="2em"
              style={{ color: "white" }}
            />
          </a>
          <a href="https://github.com/osu-denken" title="GitHub">
            <Icon
              icon="mdi:github"
              width="2em"
              height="2em"
              style={{ color: "white" }}
            />
          </a>
        </div>

        <div className={styles.terminalContainer}>
        <iframe className={styles.terminal} src="./terminal.html"></iframe>
        </div>

        <div className={styles.grid}>
          <a href="./about/" className={styles.card}>
            <h2>紹介 &rarr;</h2>
            <p>電子計算研究部についての大まかな紹介です。</p>
          </a>

          <a href="./works/" className={styles.card}>
            <h2>作品 &rarr;</h2>
            <p>創作したものを記載しているページです。</p>
          </a>

          <a href="./blog/" className={styles.card}>
            <h2>ブログ &rarr;</h2>
            <p>電研のメンバーが記述する記事をまとめたものです。</p>
          </a>

          <a href="./other/" className={styles.card}>
            <h2>その他 &rarr;</h2>
            <p>これらに該当しないものを記載する予定です。</p>
          </a>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
