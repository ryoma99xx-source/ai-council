module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(200).json({ text: 'エラー：APIキーが未設定です。' });
    }

    // モデル名を '-latest' 付き、またはより汎用的なものに変更
    // これで解決しない場合は 'gemini-1.0-pro' も試せますが、通常はこれで通ります
    const model = 'gemini-1.5-flash-latest';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt || "Hello" }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error ? `${data.error.status}: ${data.error.message}` : '不明なAPIエラー';
      return res.status(200).json({ text: `Google APIエラー発生：${errorMsg}` });
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(200).json({ text: 'エラー：応答が空でした。内容がブロックされた可能性があります。' });
    }

  } catch (e) {
    return res.status(200).json({ text: 'システムエラー：' + e.message });
  }
};
