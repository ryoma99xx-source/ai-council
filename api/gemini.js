module.exports = async (req, res) => {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(200).json({ text: 'エラー：APIキー(GEMINI_API_KEY)が設定されていません。VercelのEnvironment Variablesを確認してください。' });
    }

    // 現在最も安定しているモデルを指定
    const model = 'gemini-1.5-flash';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt || "こんにちは" }] }]
        })
      }
    );

    const data = await response.json();

    // API呼び出しに失敗した場合（400番台や500番台のエラー）
    if (!response.ok) {
      const errorMsg = data.error ? `${data.error.status}: ${data.error.message}` : '不明なAPIエラー';
      return res.status(200).json({ text: `Google APIエラー発生：${errorMsg}` });
    }

    // 正常なレスポンスの解析
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(200).json({ text: 'エラー：Geminiからの応答形式が空でした。内容がブロックされた可能性があります。' });
    }

  } catch (e) {
    // ネットワークエラーやコード自体のバグ
    return res.status(200).json({ text: 'システムエラー：' + e.message });
  }
};
