module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { system, message } = req.body;
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(200).json({ text: 'エラー：OPENAI_API_KEYが未設定です' });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: system || 'あなたは優秀な参謀です。' },
          { role: 'user', content: message }
        ]
      })
    });
    const d = await r.json();
    if (!r.ok) return res.status(200).json({ text: 'APIエラー：' + JSON.stringify(d) });
    return res.status(200).json({ text: d.choices[0].message.content });
  } catch (e) {
    return res.status(200).json({ text: 'エラー：' + e.message });
  }
};
