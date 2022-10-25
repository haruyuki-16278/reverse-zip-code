import { serve } from "https://deno.land/std/http/server.ts";
import { serveDir } from "https://deno.land/std/http/file_server.ts";
import { parse } from "https://deno.land/std/encoding/csv.ts";
import { BufReader } from "https://deno.land/std/io/buffer.ts";

const zipCodeAddressListFile = await Deno.readTextFile(new URL("./18FUKUI.CSV", import.meta.url));
const zipCodeAddressList = await parse(zipCodeAddressListFile);

serve(async (req) => {
  const { pathname, searchParams } = new URL(req.url);

  const address = searchParams.get('address');
  if (!address) return new Response('invalid address');

  const pref = address.split('県')[0] + '県';
  const city = address.indexOf('市') > 0 ? address.replace(pref, '').split('市')[0] + '市' : '';
  const town = address.indexOf('町') > 0 ? address.replace(pref, '').replace(city, '').split('町')[0] + '町' : '';
  // section of villege
  const sov = address.replace(pref, '').replace(city, '').replace(town, '').split(/[0-9]/)[0]

  for (let zipCodeAddress of zipCodeAddressList) {
    if (zipCodeAddress[6] === pref &&
        (zipCodeAddress[7] === city || zipCodeAddress[7] === town) &&
        (zipCodeAddress[8] === town || zipCodeAddress[8] === sov || zipCodeAddress[8] === town + sov )) {
      return new Response(zipCodeAddress[2]);
    }
  }

  return new Response(`${pref}${city}${town}${sov}`);
});

