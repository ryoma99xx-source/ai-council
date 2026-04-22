module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { system, message } = req.body;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(400).json({ error: 'Anthropic APIキーが未設定' });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: message }]
    })
  });
  const d = await r.json();
  if (!r.ok) return res.status(r.status).json(d);
  res.json({ text: d.content[0].text });
};
