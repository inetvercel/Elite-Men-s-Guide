'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const form = e.currentTarget
    const data = {
      name:    (form.elements.namedItem('name')    as HTMLInputElement).value,
      email:   (form.elements.namedItem('email')   as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Something went wrong')
      }
      setStatus('success')
      form.reset()
    } catch (err: any) {
      setStatus('error')
      setError(err.message || 'Failed to send message')
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero__inner">
          <p className="contact-hero__eyebrow">Get in Touch</p>
          <h1 className="contact-hero__title">Contact Us</h1>
          <p className="contact-hero__sub">
            Have a question, tip, or partnership inquiry? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="contact-body">
        <div className="contact-grid">

          {/* ── Sidebar info ── */}
          <aside className="contact-info">
            <div className="contact-info__block">
              <div className="contact-info__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75"/>
                </svg>
              </div>
              <h3>Email Us</h3>
              <p>We typically respond within 1–2 business days.</p>
              <a href="mailto:hello@elitemensguide.com">hello@elitemensguide.com</a>
            </div>

            <div className="contact-info__block">
              <div className="contact-info__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
              </div>
              <h3>Editorial</h3>
              <p>For article submissions, corrections, or editorial feedback.</p>
              <a href="mailto:editorial@elitemensguide.com">editorial@elitemensguide.com</a>
            </div>

            <div className="contact-info__block">
              <div className="contact-info__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"/>
                </svg>
              </div>
              <h3>Advertising</h3>
              <p>For partnership and advertising opportunities.</p>
              <a href="mailto:advertising@elitemensguide.com">advertising@elitemensguide.com</a>
            </div>
          </aside>

          {/* ── Contact form ── */}
          <div className="contact-form-wrap">
            {status === 'success' ? (
              <div className="contact-success">
                <div className="contact-success__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h2>Message Sent!</h2>
                <p>Thanks for reaching out. We&apos;ll get back to you within 1–2 business days.</p>
                <button className="contact-success__btn" onClick={() => setStatus('idle')}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label htmlFor="name">Full Name <span>*</span></label>
                    <input
                      id="name" name="name" type="text"
                      placeholder="John Smith"
                      required minLength={2}
                    />
                  </div>
                  <div className="contact-form__field">
                    <label htmlFor="email">Email Address <span>*</span></label>
                    <input
                      id="email" name="email" type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="contact-form__field">
                  <label htmlFor="subject">Subject <span>*</span></label>
                  <select id="subject" name="subject" required defaultValue="">
                    <option value="" disabled>Select a topic…</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Article Feedback">Article Feedback</option>
                    <option value="Editorial Submission">Editorial Submission</option>
                    <option value="Advertising & Partnerships">Advertising &amp; Partnerships</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="contact-form__field">
                  <label htmlFor="message">Message <span>*</span></label>
                  <textarea
                    id="message" name="message"
                    rows={6}
                    placeholder="Write your message here…"
                    required minLength={20}
                  />
                </div>

                {status === 'error' && (
                  <div className="contact-form__error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="contact-form__submit"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <>
                      <span className="contact-form__spinner" />
                      Sending…
                    </>
                  ) : 'Send Message'}
                </button>

                <p className="contact-form__privacy">
                  Your information is kept private and never shared. See our{' '}
                  <a href="/terms-service/">Terms of Use</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
