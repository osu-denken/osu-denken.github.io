import useEmblaCarousel from "embla-carousel-react";
import styles from "./workcard.module.css"
import Autoplay from "embla-carousel-autoplay";

type Props = {
  work: {
    id: number;
    title: string;
    overview?: string;
    description?: string;
    images: string[];
    link?: string;
  };
};

const WorkCard = ({ work }: Props) => {
  if (!work) return null;

  // ループと、ドラッグでの切り替えを有効に
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false })
  ]);
  
  return (
    <div className={styles.card}>
      <h3 className={styles.workTitle}>
        {work.link ? (
          <a href={work.link} target="_blank" rel="noopener noreferrer" className={styles.workLink}>
            {work.title}
          </a>
        ) : (
          work.title
        )}
      </h3>
      {work.overview && <p className={styles.workDescription}>{work.overview}</p>}

      {/* 作品の中の画像カルーセル */}
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {work.images.map((src, index) => (
            <div className={styles.emblaSlide} key={index}>
              <img src={src} alt={`${work.title}-${index}`} className={styles.workImage} />
            </div>
          ))}
        </div>
      </div>
      
      {/* 作品の情報 */}
        <div className={styles.workInfo}>
        {work.description && (
          <p dangerouslySetInnerHTML={{ __html: work.description }} />
        )}
        {work.link && (
          <a href={work.link} target="_blank" rel="noopener noreferrer" className={styles.workLink}>
            作品ページへ
          </a>
        )}
        </div>
    </div>
  );
};

export default WorkCard;
