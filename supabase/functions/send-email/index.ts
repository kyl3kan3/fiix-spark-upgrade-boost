
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  to: string;
  subject: string;
  body: string;
  userId: string;
  notificationType: string;
  referenceId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== EDGE FUNCTION START ===");
  console.log("Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing email request...");
    
    // Check if API key exists
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Checking for RESEND_API_KEY...", apiKey ? "✓ Found" : "✗ Missing");
    
    if (!apiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      const errorResponse = {
        success: false,
        error: "Email service not configured - missing API key"
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Initializing Resend client...");
    const resend = new Resend(apiKey);

    console.log("Parsing request body...");
    const requestData = await req.json() as EmailNotificationRequest;
    console.log("Request data received:", {
      to: requestData.to,
      subject: requestData.subject,
      userId: requestData.userId,
      notificationType: requestData.notificationType
    });

    const { to, subject, body, userId, notificationType, referenceId } = requestData;

    if (!to || !subject || !body || !userId) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject, body: !!body, userId: !!userId });
      const errorResponse = {
        success: false,
        error: "Missing required fields: to, subject, body, userId"
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Sending email via Resend...");
    console.log("Email details:", { to, subject, bodyLength: body.length });

    // Send the email using your verified domain
    const emailResponse = await resend.emails.send({
      from: "MaintenEase <noreply@admiralparkway.com>",
      to: [to],
      subject: subject,
      html: body,
    });

    console.log("Resend response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend returned error:", emailResponse.error);
      const errorResponse = {
        success: false,
        error: `Resend error: ${emailResponse.error.message || 'Unknown Resend error'}`
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Email sent successfully via Resend!");
    console.log("=== EDGE FUNCTION SUCCESS ===");

    const successResponse = {
      success: true,
      data: emailResponse
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("=== EDGE FUNCTION ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    const errorResponse = {
      success: false,
      error: error.message || "Unknown error occurred"
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
