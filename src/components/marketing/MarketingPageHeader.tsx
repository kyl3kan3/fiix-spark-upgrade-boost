type MarketingPageHeaderProps = {
  title: string;
  className?: string;
};

/** Single-purpose page title — no eyebrow, tagline, or helper copy. */
const MarketingPageHeader = ({ title, className = "" }: MarketingPageHeaderProps) => (
  <header
    className={`container mx-auto max-w-5xl px-4 pt-8 pb-6 md:pt-10 md:pb-8 ${className}`.trim()}
  >
    <h1 className="font-headline text-4xl font-bold tracking-normal text-foreground text-balance md:text-5xl">
      {title}
    </h1>
  </header>
);

export default MarketingPageHeader;
