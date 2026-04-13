import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    if (message.length < 20) {
      return NextResponse.json({ error: 'Message is too short.' }, { status: 400 })
    }

    // ── Send via Resend (if configured) or log to console ────────────────────
    const RESEND_KEY = process.env.RESEND_API_KEY
    const TO_EMAIL   = process.env.CONTACT_EMAIL || 'hello@elitemensguide.com'

    if (RESEND_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Elite Men\'s Guide <noreply@elitemensguide.com>',
          to:   [TO_EMAIL],
          reply_to: email,
          subject: `[Contact] ${subject} — from ${name}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#0d1f33;border-bottom:3px solid #d4a017;padding-bottom:8px">
                New Contact Form Submission
              </h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;width:100px">Name:</td><td>${name}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555">Subject:</td><td>${subject}</td></tr>
              </table>
              <h3 style="color:#0d1f33;margin-top:24px">Message:</h3>
              <p style="background:#f7f7f7;padding:16px;border-radius:6px;white-space:pre-wrap">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
              <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
              <p style="color:#999;font-size:12px">Sent from elitemensguide.com contact form</p>
            </div>
          `,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Resend error:', err)
        return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
      }
    } else {
      // No email provider configured — log to console (dev mode)
      console.log('\n📬 Contact form submission:')
      console.log(`  Name:    ${name}`)
      console.log(`  Email:   ${email}`)
      console.log(`  Subject: ${subject}`)
      console.log(`  Message: ${message}\n`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
