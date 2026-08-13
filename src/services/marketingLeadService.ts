import { supabase } from "@/integrations/supabase/client";

type TemplateLeadInput = {
  email: string;
  sourceSlug: string;
  sourceUrl: string;
  templateTitle: string;
};

export async function submitTemplateLead({
  email,
  sourceSlug,
  sourceUrl,
  templateTitle,
}: TemplateLeadInput): Promise<void> {
  const { error } = await supabase.from("marketing_leads").insert({
    name: `Template download: ${templateTitle}`.slice(0, 120),
    email,
    company: null,
    phone: null,
    message: `Requested the free ${templateTitle}.`,
    source_slug: sourceSlug,
    source_url: sourceUrl,
  });

  if (error) throw error;
}
