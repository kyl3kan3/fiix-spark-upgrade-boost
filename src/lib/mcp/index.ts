import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listWorkOrders from "./tools/list-work-orders";
import createWorkOrder from "./tools/create-work-order";
import listAssets from "./tools/list-assets";
import listLocations from "./tools/list-locations";
import listRequests from "./tools/list-requests";

// Use the direct project issuer because SUPABASE_URL may point at a Lovable proxy.
const projectRef = "wwgljhpuulhljumrhscg";

export default defineMcp({
  name: "maintenease-mcp",
  title: "MaintenEase",
  version: "0.1.0",
  instructions:
    "Tools for MaintenEase, a CMMS. Use these tools to list and create work orders, browse assets and locations, and read the maintenance request inbox for the signed-in user's company. All tools are tenant-scoped by RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listWorkOrders, createWorkOrder, listAssets, listLocations, listRequests],
});
