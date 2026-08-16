import { useEffect, useId, useState } from "react";
import { CheckCircle2, Download, LoaderCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAttributionMetadata, trackMarketingEvent } from "@/lib/analytics/marketingEvents";
import { submitTemplateLead } from "@/services/marketingLeadService";

const emailSchema = z.string().trim().email("Enter a valid work email").max(255);

type TemplateDownloadFormProps = {
  sourceSlug: string;
  templateTitle: string;
  downloadPath: string;
  downloadFilename: string;
  downloads?: {
    label: string;
    format: string;
    path: string;
    filename: string;
  }[];
};

const TemplateDownloadForm = ({
  sourceSlug,
  templateTitle,
  downloadPath,
  downloadFilename,
  downloads,
}: TemplateDownloadFormProps) => {
  const emailId = useId();
  const errorId = `${emailId}-error`;
  const { toast } = useToast();
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const choices = downloads?.length
    ? downloads
    : [{ label: "Spreadsheet", format: "CSV", path: downloadPath, filename: downloadFilename }];
  const [selectedPath, setSelectedPath] = useState(choices[0].path);
  const selectedDownload = choices.find((choice) => choice.path === selectedPath) ?? choices[0];

  useEffect(() => {
    void trackMarketingEvent({
      eventType: "lead_form_view",
      pageSlug: sourceSlug,
      dedupeKey: `template_form_view:${sourceSlug}`,
    });
  }, [sourceSlug]);

  const startDownload = (resource = selectedDownload) => {
    void trackMarketingEvent({
      eventType: "template_download",
      pageSlug: sourceSlug,
      metadata: {
        resource: templateTitle,
        format: resource.format,
        filename: resource.filename,
      },
    });
    const anchor = document.createElement("a");
    anchor.href = resource.path;
    anchor.download = resource.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError("");
    const form = new FormData(event.currentTarget);

    // Honeypot: real visitors never see or focus this field.
    if (String(form.get("website_url") ?? "")) return;

    const parsedEmail = emailSchema.safeParse(String(form.get("email") ?? ""));
    if (!parsedEmail.success) {
      setEmailError(parsedEmail.error.issues[0]?.message ?? "Enter a valid work email");
      return;
    }

    setSubmitting(true);
    try {
      await submitTemplateLead({
        email: parsedEmail.data,
        sourceSlug,
        sourceUrl: window.location.href,
        templateTitle,
      });

      setSubmitted(true);
      startDownload(selectedDownload);
      void trackMarketingEvent({
        eventType: "lead_submit",
        pageSlug: sourceSlug,
        metadata: {
          resource: templateTitle,
          format: selectedDownload.format,
          ...getAttributionMetadata(),
        },
      });
    } catch {
      toast({
        variant: "destructive",
        title: "The download could not start",
        description: "Please try again or email hello@maintenease.com and we will send the template.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6" aria-live="polite">
        <CheckCircle2 className="h-9 w-9 text-primary" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold text-foreground text-balance">Your template is downloading</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          If it did not start, choose the format below. You can download every version without entering your email again.
        </p>
        <div className="mt-5 grid gap-2">
          {choices.map((choice) => (
            <Button
              key={choice.path}
              type="button"
              variant={choice.path === selectedDownload.path ? "default" : "outline"}
              onClick={() => startDownload(choice)}
              className="min-h-11 justify-start transition-[transform,background-color,box-shadow,border-color] duration-150 active:scale-[0.96]"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              {choice.label} ({choice.format})
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Instant download</p>
      <h2 className="mt-2 text-2xl font-semibold text-foreground text-balance">Get the free template</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
        Enter your email and the selected download will start immediately.
      </p>

      {choices.length > 1 ? (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-foreground">Choose a format</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {choices.map((choice, index) => {
              const choiceId = `${emailId}-format-${index}`;
              return (
                <label
                  key={choice.path}
                  htmlFor={choiceId}
                  className={`flex min-h-11 cursor-pointer items-center rounded-xl px-3 py-2 text-sm font-medium shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.96] ${choice.path === selectedPath ? "bg-primary/10 text-primary shadow-[0_0_0_2px_hsl(var(--primary))]" : "bg-background text-foreground hover:bg-muted/50"}`}
                >
                  <input
                    id={choiceId}
                    type="radio"
                    name="download_format"
                    value={choice.path}
                    checked={choice.path === selectedPath}
                    onChange={() => setSelectedPath(choice.path)}
                    className="mr-2 h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span>{choice.label}<span className="ml-1 text-xs text-muted-foreground">{choice.format}</span></span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-6">
        <Label htmlFor={emailId}>Work email</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={255}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? errorId : undefined}
          className="mt-2 min-h-11"
          placeholder="you@company.com"
        />
        {emailError ? <p id={errorId} className="mt-2 text-sm text-destructive">{emailError}</p> : null}
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <Label htmlFor={`${emailId}-website`}>Website</Label>
        <Input id={`${emailId}-website`} name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="mt-4 min-h-11 w-full transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.96]"
      >
        {submitting ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        {submitting ? "Preparing download…" : `Download free ${selectedDownload.format}`}
      </Button>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        No spam. We use your email to provide this resource and improve our maintenance guides. See our{" "}
        <a href="/privacy" className="font-medium text-primary underline underline-offset-2 hover:no-underline">privacy policy</a>.
      </p>
    </form>
  );
};

export default TemplateDownloadForm;
