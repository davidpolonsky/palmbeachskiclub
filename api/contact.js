export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields: name, email, subject, message' });
  }

  const text = [
    `New Contact Message — Palm Beach Ski Club`,
    ``,
    `From:    ${name}`,
    `Email:   ${email}`,
    `Subject: ${subject}`,
    ``,
    `Message:`,
    message,
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
        subject: `[PBSC Contact] ${subject}`,
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
