module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) return res.status(200).json({ text: 'エラー：APIキーが未設定です。' });

    // 画像の「Run settings」に表示されていた最新モデル名に合わせます
    const model = 'gemini-3-flash-preview'; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt || "こんにちは" }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ 
        text: `APIエラー(${model}): ${data.error?.message || '不明なエラー'}` 
      });
    }

    return res.status(200).json({ text: data.candidates[0].content.parts[0].text });

  } catch (e) {
    return res.status(200).json({ text: 'システム例外：' + e.message });
  }
};
