import { DIRECTORY_BADGES } from "@/data/directoryBadges";

/** Directory badge row for the homepage footer (moved from homepage body). */
const FooterDirectoryBadges = () => (
  <nav aria-label="Directories and comparisons" className="w-full max-w-4xl">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {DIRECTORY_BADGES.map((badge) => (
        <a
          key={badge.href}
          href={badge.href}
          target="_blank"
          rel={"rel" in badge ? badge.rel : "nofollow noopener noreferrer"}
          className="flex min-h-20 items-center justify-center rounded-lg border border-border bg-card px-3 py-2"
        >
          <img
            src={badge.src}
            alt={badge.alt}
            width={badge.width}
            height={badge.height}
            loading="lazy"
            decoding="async"
            className="max-h-14 max-w-full object-contain"
          />
        </a>
      ))}
    </div>
  </nav>
);

export default FooterDirectoryBadges;