import { HandlerContext } from "$fresh/server.ts";

function assertIsNetAddr(addr: Deno.Addr): asserts addr is Deno.NetAddr {
  if (!["tcp", "udp"].includes(addr.transport)) {
    throw new Error("Not a network address");
  }
}

type IpStackResult = {
  /**
   * e.g. "110.4.192.213"
   */
  ip: string;
  /**
   * e.g. "ipv4";
   */
  type: string;
  /**
   * e.g. "AS",
   */
  continent_code: string;
  /**
   * e.g. "Asia",
   */
  continent_name: string;
  /**
   * e.g. "JP",
   */
  country_code: string;
  /**
   *  "e.g. Japan",
   */
  country_name: string;
  /**
   * e.g. "14",
   */
  region_code: string;
  /**
   * e.g. "Kanagawa",
   */
  region_name: string;
  /**
   * e.g. "Yokohama"
   */
  city: string;
  /**
   * e.g. "231-0004"
   */
  zip: string;
  /**
   * e.g. 35.44960021972656,
   */
  latitude: number;
  /**
   * e.g. 139.63919067382812,
   */
  longitude: number;
  location: {
    /**
     * e.g. 1848354
     */
    geoname_id: number;
    /**
     * e.g. "Tokyo",
     */
    capital: string;
    languages: {
      /**
       * e.g. "ja",
       */
      code: string;
      /**
       * e.g. "Japanese",
       */
      name: string;
      /**
       * e.g. "日本語"
       */
      native: string;
    }[];

    /**
     * e.g.  "https://assets.ipstack.com/flags/jp.svg",
     */
    country_flag: string;
    /**
     * e.g.  "🇯🇵",
     */
    country_flag_emoji: string;
    /**
     * e.g. "U+1F1EF U+1F1F5",
     */
    country_flag_emoji_unicode: string;
    /**
     * e.g. "81",
     */
    calling_code: string;

    is_eu: boolean;
  };
};

function getKeys<T>(obj: Record<string, unknown>): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

const ipStackAccessKey = Deno.env.get("IPSTACK_ACCESS_KEY");

async function getCountry(hostname: string) {
  const resp = await fetch(
    `http://api.ipstack.com/${hostname}?access_key=${ipStackAccessKey}`,
  );
  const json = await resp.json() as IpStackResult;
  let txt = "";
  getKeys<IpStackResult>(json).forEach((x) => {
    if (x === "location") {
      return;
    }
    let value = json[x];
    if (!value) {
      value = "-";
    }

    txt += `${x}: ${value}\n`;
  });
  return txt;
}

export const handler = async (
  _req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  _ctx.remoteAddr;
  assertIsNetAddr(_ctx.remoteAddr);
  const { hostname, port } = _ctx.remoteAddr;
  const whois = await getCountry(hostname);
  const message =
    `You connected from the following address: ${hostname} port: ${port}\n\n` +
    `whois: ${whois}`;
  return new Response(message);
};
