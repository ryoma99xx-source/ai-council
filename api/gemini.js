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

    // まず利用可能なモデルを確認してから呼び出す
    const models = ['gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro'];
    
    for (const model of models) {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const d = await r.json();
      if (r.ok) return res.status(200).json({ text: d.candidates[0].content.parts[0].text });
    }
    
    return res.status(200).json({ text: 'エラー：利用可能なGeminiモデルが見つかりませんでした' });
  } catch (e) {
    return res.status(200).json({ text: 'エラー：' + e.message });
  }
};
