const badges = [
  {
    href: "https://verifieddr.com/website/maintenease-com",
    src: "https://verifieddr.com/badge/maintenease-com.svg?metric=truedr",
    alt: "Verified domain rating for maintenease.com",
    width: 220,
    height: 68,
  },
  {
    href: "https://startupbase.io/products/maintenease?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light",
    src: "https://statics.startupbase.io/site/badges/launched-on-sb.svg",
    alt: "Launched on StartupBase",
    width: 185,
    height: 55,
  },
  {
    href: "https://saasgrow.app?ref=maintenease.com",
    src: "https://saasgrow.app/api/badge?type=featured&style=blue",
    alt: "MaintenEase featured on SaaSGrow",
    width: 240,
    height: 54,
  },
  {
    href: "https://seoreceipts.com/site/maintenease-293/?ref=badge&utm_source=embed&utm_medium=badge&utm_campaign=status-auto",
    src: "https://seoreceipts.com/api/badge?slug=maintenease-293&mode=auto&theme=paper&size=card",
    alt: "Google Search Console stats for maintenease.com",
    width: 220,
    height: 68,
    rel: "nofollow sponsored noopener noreferrer",
  },
  {
    href: "https://www.foundrlist.com/product/maintenease?utm_source=badge&utm_medium=embed",
    src: "https://www.foundrlist.com/api/badge/maintenease",
    alt: "Featured on FoundrList",
    width: 150,
    height: 48,
  },
  {
    href: "https://findly.tools/maintenease?utm_source=maintenease",
    src: "https://findly.tools/badges/findly-tools-badge-light.svg",
    alt: "Featured on Findly.tools",
    width: 175,
    height: 55,
  },
  {
    href: "https://neeed.directory",
    src: "https://neeed.directory/badges/neeed-badge-light.svg",
    alt: "Featured on neeed.directory",
    width: 139,
    height: 44,
  },
  {
    href: "https://orynth.dev/projects/maintenease",
    src: "https://orynth.dev/api/badge/maintenease?theme=light&style=default",
    alt: "Featured on Orynth",
    width: 260,
    height: 80,
  },
  {
    href: "https://daniellaunches.com/tools/maintenease",
    src: "https://daniellaunches.com/badge.svg",
    alt: "Featured on DanielLaunches",
    width: 200,
    height: 44,
  },
] as const;

const TrustBadges = () => (
  <section
    aria-labelledby="trust-badges-heading"
    className="border-y border-border/70 bg-muted/30 py-12 md:py-16"
    data-testid="trust-badges"
  >
    <div className="container mx-auto max-w-6xl px-4">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="label-eyebrow mb-2">Independent directories</p>
        <h2 id="trust-badges-heading" className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Featured, verified, and launched
        </h2>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Find MaintenEase across software directories, launch communities, and independent website reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <a
            key={badge.href}
            href={badge.href}
            target="_blank"
            rel={"rel" in badge ? badge.rel : "noopener noreferrer"}
            className="flex min-h-24 items-center justify-center rounded-xl border border-border bg-card px-5 py-4 shadow-sm outline-none transition-[border-color,box-shadow,transform] duration-200 hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <img
              src={badge.src}
              alt={badge.alt}
              width={badge.width}
              height={badge.height}
              loading="lazy"
              decoding="async"
              className="max-h-[68px] max-w-full rounded-sm object-contain ring-1 ring-black/10 dark:ring-white/10"
            />
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBadges;
