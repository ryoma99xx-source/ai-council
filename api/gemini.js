module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) return res.status(200).json({ text: 'エラー：APIキーが未設定です。' });

    // 1. エンドポイントを v1 に変更
    // 2. モデル名をシンプルな gemini-1.5-flash に固定
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt || "Hello" }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // エラーの詳細をそのまま画面に出す
      const errorMsg = data.error ? `${data.error.status}: ${data.error.message}` : '不明なエラー';
      return res.status(200).json({ text: `修正版(v1)でもエラー：${errorMsg}` });
    }

    if (data.candidates && data.candidates[0].content) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(200).json({ text: 'エラー：正常な応答が得られませんでした。' });
    }

  } catch (e) {
    return res.status(200).json({ text: '例外発生：' + e.message });
  }
};
