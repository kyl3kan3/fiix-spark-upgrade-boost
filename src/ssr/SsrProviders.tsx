import type { FilledContext } from "react-helmet-async";
import { AppProviders, type AppProvidersSsrProps } from "@/providers/AppProviders";
import type { BlogSsrPayload } from "./blogSsr";

/** @deprecated Use AppProviders with `ssr` prop — kept for entry-server import stability. */
export function SsrProviders({
  location,
  helmetContext,
  blog,
  children,
}: {
  location: string;
  helmetContext: FilledContext;
  blog?: BlogSsrPayload | null;
  children: React.ReactNode;
}) {
  const ssr: AppProvidersSsrProps = { location, helmetContext, blog };
  return <AppProviders ssr={ssr}>{children}</AppProviders>;
}