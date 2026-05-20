import React, { useState } from "react";
import { Link2, Check, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
 url: string;
 title: string;
 description?: string;
 label?: string;
 className?: string;
 variant?: "default" | "compact";
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
 url,
 title,
 description,
 label = "Share",
 className,
 variant = "default",
}) => {
 const [copied, setCopied] = useState(false);
 const enc = encodeURIComponent;
 const shareText = description ? `${title} — ${description}` : title;

 const links = {
 x: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`,
 linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
 facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
 };

 const handleCopy = async () => {
 try {
 await navigator.clipboard.writeText(url);
 setCopied(true);
 window.setTimeout(() => setCopied(false), 1800);
 } catch {
 // ignore — clipboard may be unavailable in some browsers
 }
 };

 const handleNative = async () => {
 if (typeof navigator !== "undefined" && "share" in navigator) {
 try {
 await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
 title,
 text: shareText,
 url,
 });
 return true;
 } catch {
 // user cancelled or unsupported — fall through to copy
 }
 }
 return false;
 };

 const btnClass =
 variant === "compact"
 ? "h-8 w-8 p-0"
 : "h-9 px-3";

 return (
 <div className={cn("flex flex-wrap items-center gap-2", className)}>
 {label && variant === "default" && (
 <span className="mr-1 text-sm font-medium text-foreground">{label}:</span>
 )}
 <a
 href={links.x}
 target="_blank"
 rel="noopener noreferrer"
 aria-label="Share on X (Twitter)"
 className={cn(
 "inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:border-maintenease-500 hover:text-maintenease-600",
 btnClass,
 )}
 >
 <Twitter className="h-4 w-4" />
 {variant === "default" && <span className="ml-2 text-sm">X</span>}
 </a>
 <a
 href={links.linkedin}
 target="_blank"
 rel="noopener noreferrer"
 aria-label="Share on LinkedIn"
 className={cn(
 "inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:border-maintenease-500 hover:text-maintenease-600",
 btnClass,
 )}
 >
 <Linkedin className="h-4 w-4" />
 {variant === "default" && <span className="ml-2 text-sm">LinkedIn</span>}
 </a>
 <a
 href={links.facebook}
 target="_blank"
 rel="noopener noreferrer"
 aria-label="Share on Facebook"
 className={cn(
 "inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:border-maintenease-500 hover:text-maintenease-600",
 btnClass,
 )}
 >
 <Facebook className="h-4 w-4" />
 {variant === "default" && <span className="ml-2 text-sm">Facebook</span>}
 </a>
 <Button
 type="button"
 size="sm"
 variant="outline"
 onClick={async () => {
 const used = await handleNative();
 if (!used) handleCopy();
 }}
 aria-label={copied ? "Link copied" : "Copy link"}
 className={cn(
 "border-border text-foreground hover:border-maintenease-500 hover:text-maintenease-600",
 variant === "compact" ? "h-8 w-8 p-0" : "h-9 px-3",
 )}
 >
 {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
 {variant === "default" && (
 <span className="ml-2 text-sm">{copied ? "Copied" : "Copy link"}</span>
 )}
 </Button>
 </div>
 );
};

export default ShareButtons;