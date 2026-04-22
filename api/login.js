module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body;
  const correctPassword = process.env.COUNCIL_PASSWORD || 'council2024';
  
  if (password === correctPassword) {
    return res.status(200).json({ 
      success: true,
      token: 'council_' + Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000)
    });
  } else {
    return res.status(401).json({ success: false, error: 'パスワードが違います' });
  }
};
