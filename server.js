import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.138.0/http/file_server.ts";
import { parse } from "https://deno.land/std@0.79.0/encoding/csv.ts";
import { BufReader } from "https://deno.land/std@0.79.0/io/bufio.ts";

const zipCodeAddressListFile = await Deno.open('18FUKUI.CSV');
let zipCodeAddressList;
try {
  const buf = BufReader.create(zipCodeAddressListFile);
  zipCodeAddressList = await parse(buf);
  console.log(zipCodeAddressList[5])
} catch {
  file.close()
}

serve(async (req) => {
  const { pathname, searchParams } = new URL(req.url);
  console.log('requested', pathname);

  const address = searchParams.get('address');
  console.log(address);
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

