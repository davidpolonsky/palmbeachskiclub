export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, level, terrain, message } = req.body || {};

  if (!name || !email || !level) {
    return res.status(400).json({ error: 'Missing required fields: name, email, level' });
  }

  const text = [
    `New Waitlist Request — Palm Beach Ski Club`,
    ``,
    `Name:             ${name}`,
    `Email:            ${email}`,
    `Ski Level:        ${level}`,
    `Favorite Terrain: ${terrain || '(not provided)'}`,
    `Message:          ${message || '(none)'}`,
  ].join('\n');

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: 'info@palmbeachskiclub.org' }] }],
        from: { email: 'noreply@palmbeachskiclub.org', name: 'Palm Beach Ski Club' },
        reply_to: { email, name },
        subject: 'New Waitlist Request — Palm Beach Ski Club',
        content: [{ type: 'text/plain', value: text }],
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    }

    const err = await response.text();
    console.error('SendGrid error:', err);
    return res.status(502).json({ error: 'Email delivery failed' });
  } catch (e) {
    console.error('Handler error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
