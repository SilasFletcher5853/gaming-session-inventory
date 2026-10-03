import { createServer } from "node:http";
import { InfraiClient } from "./infrai_client.js";
import { signOutOthers } from "./session_policy.js";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("INFRAI_API_KEY is required");
const client = new InfraiClient(key);
const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/sessions/sign-out-others") { res.writeHead(404).end(); return; }
  try {
    const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(chunk as Buffer);
    const result = await signOutOthers(client, JSON.parse(Buffer.concat(chunks).toString("utf8")));
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result));
  } catch (error) {
    const status = (error as { status?: number }).status && (error as { status: number }).status < 500 ? 400 : 500;
    res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify({ error: error instanceof Error ? error.message : "request failed" }));
  }
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("session service listening"));
