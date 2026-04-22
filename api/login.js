const crypto = require('crypto');

// パスワードはハッシュで保存（デフォルト: council2024）
const DEFAULT_PASSWORD_HASH = 'a8f5f167f44f4964e6c998dee827110c'; // MD5 of 'council2024'

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  
  // 環境変数からパスワードハッシュを取得（設定されていればそちらを使用）
  const storedHash = process.env.PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
  
  if (md5(password) === storedHash) {
    // 簡易トークン生成
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (24 * 60 * 60 * 1000); // 24時間
    
    return res.status(200).json({ 
      success: true, 
      token,
      expires
    });
  } else {
    return res.status(401).json({ 
      success: false, 
      error: 'パスワードが違います' 
    });
  }
};
