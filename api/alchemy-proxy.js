export default async function handler(req, res) {
  try {
    const alchemyUrl = `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`;

    const response = await fetch(alchemyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
