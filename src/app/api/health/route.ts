// Lightweight health endpoint used by the keep-alive pinger to wake / check the
// Render free-tier instance without rendering the full page.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", time: new Date().toISOString() });
}
