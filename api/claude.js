module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { system, message, max_tokens } = req.body;
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return res.status(200).json({ text: 'エラー：ANTHROPIC_API_KEYが未設定です' });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: max_tokens || 1000,
        system: system || 'あなたは優秀な参謀です。',
        messages: [{ role: 'user', content: message }]
      })
    });
    const d = await r.json();
    if (!r.ok) return res.status(200).json({ text: 'APIエラー：' + JSON.stringify(d) });
    return res.status(200).json({ text: d.content[0].text });
  } catch (e) {
    return res.status(200).json({ text: 'エラー：' + e.message });
  }
};
