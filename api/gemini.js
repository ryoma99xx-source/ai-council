module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) return res.status(200).json({ text: 'エラー：APIキーが未設定です。' });

    // 試行するモデルの優先順位リスト（新しい順）
    // 1.5系が全滅している可能性を考慮して 1.0系も混ぜます
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.0-pro',
      'gemini-pro'
    ];

    let lastError = "";

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt || "テスト" }] }] })
          }
        );

        const data = await response.json();

        if (response.ok && data.candidates) {
          return res.status(200).json({ 
            text: `【成功モデル: ${model}】\n\n${data.candidates[0].content.parts[0].text}` 
          });
        } else {
          lastError = data.error ? `${data.error.status}: ${data.error.message}` : "Unknown error";
          // 次のモデルを試す
          continue;
        }
      } catch (e) {
        lastError = e.message;
        continue;
      }
    }

    // 全モデルが失敗した場合、最後に発生したエラーを詳細に返す
    return res.status(200).json({ 
      text: `全モデル試行失敗。最新のエラー: ${lastError}\n\nヒント: APIキー作成直後は数時間〜1日程度、最新モデル(1.5)が使えないケースがあります。その場合は gemini-pro が反応するはずです。` 
    });

  } catch (e) {
    return res.status(200).json({ text: 'システムエラー：' + e.message });
  }
};
