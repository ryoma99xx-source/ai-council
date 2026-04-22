module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) return res.status(200).json({ text: 'エラー：GEMINI_API_KEYが未設定です' });

    // gemini-1.5-flashを使用（v1 APIで安定）
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const d = await r.json();
    if (!r.ok) return res.status(200).json({ text: 'APIエラー：' + JSON.stringify(d) });
    return res.status(200).json({ text: d.candidates[0].content.parts[0].text });
  } catch (e) {
    return res.status(200).json({ text: 'エラー：' + e.message });
  }
};
