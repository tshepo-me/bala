import { connection } from "next/server";

/** Liveness probe for the load balancer / container orchestrator. */
export async function GET() {
  await connection();
  return Response.json({ status: "ok", service: "bala-web", time: new Date().toISOString() });
}
