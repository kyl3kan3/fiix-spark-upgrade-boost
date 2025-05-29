
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
      notificationType: requestData.notificationType,
      bodyLength: requestData.body?.length || 0
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
    console.log("Email details:", { 
      from: "MaintenEase <onboarding@resend.dev>",
      to, 
      subject, 
      bodyLength: body.length 
    });

    // Use Resend's default verified domain instead of custom domain
    const emailResponse = await resend.emails.send({
      from: "MaintenEase <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: body,
    });

    console.log("Resend API response received:", JSON.stringify(emailResponse, null, 2));

    if (emailResponse.error) {
      console.error("Resend returned error:", JSON.stringify(emailResponse.error, null, 2));
      const errorResponse = {
        success: false,
        error: `Resend error: ${emailResponse.error.message || JSON.stringify(emailResponse.error)}`
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!emailResponse.data) {
      console.error("No data returned from Resend API");
      const errorResponse = {
        success: false,
        error: "No data returned from email service"
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Email sent successfully! Message ID:", emailResponse.data.id);
    console.log("=== EDGE FUNCTION SUCCESS ===");

    const successResponse = {
      success: true,
      data: emailResponse.data
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("=== EDGE FUNCTION ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error details:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error?.stack);
    
    const errorResponse = {
      success: false,
      error: `Email sending failed: ${error?.message || 'Unknown error occurred'}`,
      details: error?.name || 'UnknownError'
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
