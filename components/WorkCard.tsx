import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import styles from "./workcard.module.css";
import { fontAwesomeIconName, Work } from "@lib/works";

type Props = {
  work: Work;
  canEdit?: boolean;
};

const WorkCard = ({ work, canEdit = false }: Props) => {
  const autoplay = useMemo(
    () => work.images.length > 1 ? Autoplay({ delay: 3000, stopOnInteraction: false }) : undefined,
    [work.images.length]
  );
  const [emblaRef] = useEmblaCarousel(
    { loop: work.images.length > 1 },
    autoplay ? [autoplay] : []
  );

  if (!work) return null;

  const formatDate = (date?: string) => date?.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1/$2/$3");

  return (
    <article className={styles.card}>
      <div className={styles.titleRow}>
        <h2 className={styles.workTitle}>{work.title}</h2>
        {canEdit && (
          <Link
            href={`/portal/page/?path=content%2Fworks.json&id=${work.id}`}
            className={styles.editButton}
            title="この作品を編集"
            aria-label={`${work.title}を編集`}
          >
            <Icon icon="fa6-solid:pen-to-square" />
          </Link>
        )}
      </div>

      <div className={styles.metadata}>
        {work.author && <span className={styles.author}>{work.author}</span>}
        {(work.createdAt || work.updatedAt) && (
          <div className={styles.dates}>
            {work.createdAt && <span className={styles.date}>制作日: {formatDate(work.createdAt)}</span>}
            {work.updatedAt && <span className={styles.date}>更新日: {formatDate(work.updatedAt)}</span>}
          </div>
        )}
        {work.category && <span className={styles.category}>{work.category}</span>}
        {work.tags?.filter(tag => tag !== work.category).map(tag => <span className={styles.tag} key={tag}>{tag}</span>)}
      </div>

      {work.overview && <p className={styles.overview}>{work.overview}</p>}

      {work.images.length > 0 && (
        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {work.images.map((src, index) => (
              <div className={styles.emblaSlide} key={`${src}-${index}`}>
                <img src={src} alt={`${work.title}の画像 ${index + 1}`} className={styles.workImage} />
              </div>
            ))}
          </div>
        </div>
      )}

      {work.description && (
        <div className={styles.workInfo}>
          <div dangerouslySetInnerHTML={{ __html: work.description }} />
        </div>
      )}

      {work.links && work.links.length > 0 && (
        <div className={styles.links}>
          {work.links.map((link, index) => {
            const iconName = fontAwesomeIconName(link.icon);
            return (
              <a
                key={`${link.url}-${index}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={iconName ? styles.iconLink : styles.textLink}
                title={iconName ? link.label : undefined}
                aria-label={iconName ? link.label : undefined}
              >
                {iconName ? <Icon icon={iconName} /> : link.label}
              </a>
            );
          })}
        </div>
      )}
    </article>
  );
};

export default WorkCard;
