
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

serve(async (request: Request) => {
  // Allow browser preflight requests
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    // Read private API credentials from Supabase secrets
    const appId = Deno.env.get("ADZUNA_APP_ID");
    const appKey = Deno.env.get("ADZUNA_APP_KEY");

    if (!appId || !appKey) {
      console.error("Adzuna API credentials are missing.");

      return jsonResponse({
        error: "Job search is not configured yet. Please try again later.",
      }, 500);
    }

    const body = await request.json();

    const keyword =
      typeof body.keyword === "string"
        ? body.keyword.trim().slice(0, 100)
        : "";

    const location =
      typeof body.location === "string"
        ? body.location.trim().slice(0, 100)
        : "";

    if (!keyword || !location) {
      return jsonResponse({
        error: "Please enter a job title and location.",
      }, 400);
    }

    // Search jobs in India using the Adzuna API
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: "10",
      what: keyword,
      where: location,
      "content-type": "application/json",
    });

    const apiUrl =
      "https://api.adzuna.com/v1/api/jobs/in/search/1?" +
      params.toString();

    const response = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error("Adzuna returned status:", response.status);

      return jsonResponse({
        error: "The job provider could not complete your search. Please try again.",
      }, 502);
    }

    const payload = await response.json();

    const results = Array.isArray(payload.results)
      ? payload.results
      : [];

    // Return only the fields COSMOS needs
    const jobs = results.map((job: Record<string, any>) => ({
      title: job.title || "Job title unavailable",
      company: job.company?.display_name || "Company not listed",
      location: job.location?.display_name || location,
      postedAt: job.created
        ? new Date(job.created).toLocaleDateString("en-IN")
        : "",
      description: job.description || "No description available.",
      url: job.redirect_url || "",
    }));

    return jsonResponse({ jobs });
  } catch (error) {
    console.error("COSMOS job search failed:", error);

    return jsonResponse({
      error: "Unable to search jobs right now. Please try again.",
    }, 500);
  }
});
