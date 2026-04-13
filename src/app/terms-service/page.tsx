import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of Use for Elite Men\'s Guide — please read before using this site.',
  alternates: { canonical: 'https://elitemensguide.com/terms-service' },
}

const LAST_UPDATED = 'April 2026'
const SITE_NAME    = "Elite Men's Guide"
const COMPANY      = "Elite Men's Group, LLC"
const SITE_URL     = 'https://elitemensguide.com'
const CONTACT      = 'contact@elitemensguide.com'

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__header">
        <div className="legal-page__header-inner">
          <div className="legal-page__breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>Terms of Use</span>
          </div>
          <h1 className="legal-page__title">Terms of Use</h1>
          <p className="legal-page__meta">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="legal-page__body">
        <div className="legal-page__toc">
          <div className="legal-page__toc-label">Contents</div>
          <ol>
            <li><a href="#informational">Informational Purposes Only</a></li>
            <li><a href="#obligations">User Obligations</a></li>
            <li><a href="#license">License Grant</a></li>
            <li><a href="#prohibited">Prohibited Activities</a></li>
            <li><a href="#intellectual">Intellectual Property</a></li>
            <li><a href="#third-party">Third-Party Links</a></li>
            <li><a href="#disclaimer">Disclaimer of Warranties</a></li>
            <li><a href="#liability">Limitation of Liability</a></li>
            <li><a href="#indemnification">Indemnification</a></li>
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="#changes">Changes to These Terms</a></li>
            <li><a href="#governing">Governing Law</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ol>
        </div>

        <div className="legal-page__content">

          <p className="legal-page__intro">
            Please read these Terms of Use carefully before using {SITE_URL} (the <strong>"Site"</strong>).
            By accessing or using the Site, you agree to be bound by these terms. If you do not agree, please do not use the Site.
            These Terms apply to all visitors, users, and anyone else who accesses the Site.
          </p>

          <section id="informational">
            <h2>1. Informational Purposes Only — Not Medical Advice</h2>
            <p>
              {SITE_NAME} is an independent, editorial health and fitness publication. All content published on this Site —
              including articles, guides, videos, and infographics — is provided <strong>for general informational and
              educational purposes only</strong>. It is not intended to substitute for professional medical advice,
              diagnosis, or treatment.
            </p>
            <p>
              Always seek the advice of your physician or another qualified health provider with any questions you may have
              regarding a medical condition. Never disregard professional medical advice or delay seeking it because of
              something you have read on this Site. If you think you may have a medical emergency, call your doctor or
              emergency services immediately.
            </p>
          </section>

          <section id="obligations">
            <h2>2. User Obligations</h2>
            <p>By using this Site, you agree that you:</p>
            <ul>
              <li>Are at least 18 years of age.</li>
              <li>Will provide accurate information if you contact us or submit any form.</li>
              <li>Will not use the Site for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Will not attempt to gain unauthorised access to any part of the Site or its infrastructure.</li>
              <li>Will not transmit any harmful, offensive, or disruptive content.</li>
            </ul>
          </section>

          <section id="license">
            <h2>3. License Grant</h2>
            <p>
              {COMPANY} grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the
              Site for your personal, non-commercial use only. This licence does not include the right to:
            </p>
            <ul>
              <li>Reproduce, duplicate, copy, sell, resell, or exploit any portion of the Site.</li>
              <li>Use data mining, robots, scrapers, or similar data-gathering tools on the Site.</li>
              <li>Frame or mirror any content from the Site without prior written consent.</li>
            </ul>
          </section>

          <section id="prohibited">
            <h2>4. Prohibited Activities</h2>
            <p>You agree not to engage in any of the following:</p>
            <ul>
              <li>Using the Site in any way that violates applicable local, national, or international laws.</li>
              <li>Transmitting unsolicited commercial communications (spam).</li>
              <li>Attempting to interfere with the proper working of the Site.</li>
              <li>Uploading or transmitting viruses, malware, or any other malicious code.</li>
              <li>Collecting or harvesting personally identifiable information from the Site.</li>
              <li>Impersonating any person or entity or misrepresenting your affiliation with any person or entity.</li>
            </ul>
          </section>

          <section id="intellectual">
            <h2>5. Intellectual Property</h2>
            <p>
              All content on this Site — including text, graphics, logos, images, audio clips, and software — is the
              property of {COMPANY} or its content suppliers and is protected by applicable copyright, trademark, and
              other intellectual property laws. The compilation of all content on this Site is the exclusive property
              of {COMPANY}.
            </p>
            <p>
              You may print or download a single copy of content from the Site for your own personal, non-commercial use
              provided you keep all copyright and proprietary notices intact. Any other use requires prior written
              permission from {COMPANY}.
            </p>
          </section>

          <section id="third-party">
            <h2>6. Third-Party Links</h2>
            <p>
              The Site may contain links to third-party websites or services that are not owned or controlled by {COMPANY}.
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of
              any third-party sites or services. We encourage you to review the privacy policy and terms of any
              third-party site you visit.
            </p>
            <p>
              Some links on this Site may be affiliate links. This means we may earn a small commission if you click
              through and make a purchase, at no additional cost to you. This does not influence our editorial content
              or recommendations.
            </p>
          </section>

          <section id="disclaimer">
            <h2>7. Disclaimer of Warranties</h2>
            <p>
              The Site and all content are provided on an <strong>"as is" and "as available"</strong> basis without any
              warranties of any kind, either express or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              {COMPANY} does not warrant that the Site will be uninterrupted, error-free, or free of viruses or other
              harmful components, or that defects will be corrected.
            </p>
          </section>

          <section id="liability">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, {COMPANY} and its officers, directors, employees, and
              agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages —
              including but not limited to loss of profits, data, goodwill, or other intangible losses — resulting from:
            </p>
            <ul>
              <li>Your access to or use of (or inability to access or use) the Site.</li>
              <li>Any conduct or content of any third party on the Site.</li>
              <li>Any content obtained from the Site.</li>
              <li>Unauthorised access, use, or alteration of your transmissions or content.</li>
            </ul>
          </section>

          <section id="indemnification">
            <h2>9. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless {COMPANY} and its officers, directors, employees, and
              agents from and against any claims, liabilities, damages, losses, and expenses — including reasonable legal
              fees — arising out of or in any way connected with your access to or use of the Site, your violation of
              these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section id="privacy">
            <h2>10. Privacy</h2>
            <p>
              Your use of the Site is also governed by our Privacy Policy, which is incorporated into these Terms by
              reference. Please review our Privacy Policy to understand our practices.
            </p>
          </section>

          <section id="changes">
            <h2>11. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms of Use at any time. We will indicate the date of the most recent
              revision at the top of this page. Your continued use of the Site after any changes constitutes your
              acceptance of the new Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          <section id="governing">
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without
              regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the
              exclusive jurisdiction of the courts located in the United States.
            </p>
          </section>

          <section id="contact">
            <h2>13. Contact Us</h2>
            <p>If you have any questions about these Terms of Use, please contact us:</p>
            <ul>
              <li><strong>Email:</strong> <a href={`mailto:${CONTACT}`}>{CONTACT}</a></li>
              <li><strong>Website:</strong> <a href={SITE_URL}>{SITE_URL}</a></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  )
}
