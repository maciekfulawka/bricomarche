const url = "https://www.bricomarche.pl/kosa-spalinowa-bp520-27-t-nac";

const fetchItem = async (key, shop) => {
  const res = await fetch(url, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "pl,en;q=0.9",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "sec-ch-ua":
        '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      cookie: `device_view=full; pos_select=${key};`,
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  });
  const b = await res.text();
  const cut = b.match(/data-offer-price="(\d+)"/);
  return {
    price: Number(cut[1]) / 100,
    name: shop.posname,
    availability: shop.availability_name,
  };
};

const main = async () => {
  const resProduct = await fetch(url);
  const restText = await resProduct.text();
  const matchId = restText.match(/product_id=(\d+)/);
  if (!matchId) {
    console.error("Product id not found");
    return;
  }

  const productId = Number(matchId[1]);

  const res = await fetch(
    `https://www.bricomarche.pl/product/get-pos-offers?product_id=${productId}`
  );
  const shops = await res.json();
  const keys = Object.keys(shops);

  const results = [];
  for (key of keys) {
    const shop = shops[key];
    if (!shop.availability_name.includes("Niedostępny")) {
      console.log("GET", shop.posname);
      const r = await fetchItem(key, shop);
      results.push(r);
    } else {
      console.log("SKIP", shop.posname, " -> ", shop.availability_name);
    }
  }

  const sorted = results.sort((a, b) => {
    if (a.price < b.price) {
      return 1;
    }
    return a.price > b.price ? -1 : 0;
  });

  sorted.map((s) => console.log(s.price, s.name, s.availability));
};

main();
