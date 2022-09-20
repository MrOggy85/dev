import { HandlerContext } from "$fresh/server.ts";

function assertIsNetAddr(addr: Deno.Addr): asserts addr is Deno.NetAddr {
  if (!["tcp", "udp"].includes(addr.transport)) {
    throw new Error("Not a network address");
  }
}

async function getCountry(hostname: string) {
  const p = Deno.run({
    cmd: ["whois", hostname],
    stdout: "piped",
   });

   const output = await p.output() // "piped" must be set
   const outStr = new TextDecoder().decode(output);
   return outStr;
}

export const handler = async (_req: Request, _ctx: HandlerContext): Response => {
  _ctx.remoteAddr;
  assertIsNetAddr(_ctx.remoteAddr);
  const { hostname, port } = _ctx.remoteAddr;
  const whois = await getCountry(hostname)
  const message =
    `You connected from the following address: ${hostname} port: ${port}\n\n`
    + `whois: ${whois}`
  return new Response(message);
};
