import { HandlerContext } from "$fresh/server.ts";

function assertIsNetAddr(addr: Deno.Addr): asserts addr is Deno.NetAddr {
  if (!["tcp", "udp"].includes(addr.transport)) {
    throw new Error("Not a network address");
  }
}

export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  _ctx.remoteAddr;
  assertIsNetAddr(_ctx.remoteAddr);
  const { hostname, port } = _ctx.remoteAddr;
  const message =
    `You connected from the following address: ${hostname} port: ${port}`;
  return new Response(message);
};
