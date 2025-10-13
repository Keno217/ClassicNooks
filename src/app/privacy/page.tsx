import Navbar from '@/components/Navbar';

export default function Privacy() {
  return (
    <>
      <Navbar />
      <main
        className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8'
        role='main'
        aria-label='Terms of Service and Privacy Policy'
      >
        <div
          className='max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-10'
          role='article'
        >
          <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center'>
            Terms of Service & Privacy
          </h1>
          <section className='mb-12' aria-labelledby='terms-heading'>
            <h2
              id='terms-heading'
              className='text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200'
            >
              Terms of Service
            </h2>
            <div className='space-y-8'>
              <div>
                <h3 className='text-lg sm:text-xl font-semibold text-gray-800 mb-3'>
                  1. Acknowledgment of Project Gutenberg
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 ml-2'>
                  <li>
                    ClassicNooks provides access to classic literary works that
                    are freely available in the public domain through Project
                    Gutenberg.
                  </li>
                  <li>
                    We gratefully acknowledge Project Gutenberg for curating and
                    maintaining these works, and we comply with the Project
                    Gutenberg License.
                  </li>
                  <li>
                    <span className='inline-block border border-gray-400 px-2 py-0.5 rounded bg-gray-100 text-sm'>
                      Project Gutenberg™
                    </span>{' '}
                    is a registered trademark. It may not be used if you charge
                    for the eBooks or use them without following the terms of
                    use available at{' '}
                    <a
                      href='https://www.gutenberg.org/policy/license.html'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline'
                    >
                      www.gutenberg.org/policy/license.html
                    </a>
                    .
                  </li>
                  <li>
                    All books provided through this platform are free for
                    non-commercial use.
                  </li>
                  <li>
                    We do not sell, modify, or claim ownership of any text from
                    Project Gutenberg.
                  </li>
                  <li>
                    Each eBook remains in the public domain and is offered to
                    users in accordance with the Project Gutenberg terms.
                  </li>
                  <li>
                    All book cover images displayed on this site are sourced
                    from{' '}
                    <span className='inline-block border border-gray-400 px-2 py-0.5 rounded bg-gray-100 text-sm'>
                      Project Gutenberg™
                    </span>{' '}
                    and are believed to be in the public domain. If any image is
                    found to be subject to copyright, it will be promptly
                    removed upon notification.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className='text-lg sm:text-xl font-semibold text-gray-800 mb-3'>
                  2. Use of the Platform
                </h3>
                <p className='text-gray-700 mb-3'>
                  By using ClassicNooks, you agree to:
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700 ml-2'>
                  <li>Use the app only for lawful and personal purposes.</li>
                  <li>
                    Not redistribute or sell Project Gutenberg materials for
                    profit.
                  </li>
                  <li>
                    Acknowledge that ClassicNooks is an independent project and
                    not affiliated with or endorsed by{' '}
                    <span className='inline-block border border-gray-400 px-2 py-0.5 rounded bg-gray-100 text-sm'>
                      Project Gutenberg™
                    </span>
                    .
                  </li>
                </ul>
                <p className='text-gray-700 mt-3'>
                  ClassicNooks may enhance the reading experience by offering
                  features such as bookmarking, reading progress tracking, or
                  user collections &mdash; but all book content remains sourced
                  from Project Gutenberg.
                </p>
              </div>
            </div>
          </section>
          <section className='mb-12' aria-labelledby='privacy-heading'>
            <h2
              id='privacy-heading'
              className='text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200'
            >
              Privacy and Data Handling
            </h2>

            <p className='text-gray-700 mb-6'>
              We value your privacy and are committed to maintaining
              transparency about how we handle user data.
            </p>
            <div className='space-y-8'>
              <div>
                <h3 className='text-lg sm:text-xl font-semibold text-gray-800 mb-3'>
                  3.1 Data We Collect
                </h3>
                <ul className='list-disc list-inside space-y-2 text-gray-700 ml-2'>
                  <li>
                    We do not collect or store any personally identifiable
                    information (PII) such as your name, email, address, or IP.
                  </li>
                  <li>
                    However, we may store minimal non-identifiable data to
                    provide app functionality, including:
                    <ul className='list-circle list-inside ml-6 mt-2 space-y-1'>
                      <li>Reading preferences and progress</li>
                      <li>Favorite books or library lists</li>
                      <li>Anonymous session or authentication tokens</li>
                    </ul>
                  </li>
                  <li>
                    All such data is completely anonymous and cannot be used to
                    identify you.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className='text-lg sm:text-xl font-semibold text-gray-800 mb-3'>
                  3.2 How We Store Data
                </h3>
                <p className='text-gray-700 mb-3'>
                  User data is stored in a secured database protected by
                  encryption and access controls.
                </p>
                <p className='text-gray-700 mb-3'>This data:</p>
                <ul className='list-disc list-inside space-y-2 text-gray-700 ml-2'>
                  <li>Contains no personal identifiers</li>
                  <li>
                    Is used only for app functionality (e.g., remembering your
                    saved books)
                  </li>
                  <li>Is never sold, shared, or used for advertising</li>
                </ul>
                <p className='text-gray-700 mt-3'>
                  We employ best security practices to safeguard all stored data
                  from unauthorized access or modification.
                </p>
              </div>
              <div>
                <h3 className='text-lg sm:text-xl font-semibold text-gray-800 mb-3'>
                  3.3 Cookies and Local Storage
                </h3>
                <p className='text-gray-700 mb-3'>
                  We may use cookies or local storage to:
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-700 ml-2'>
                  <li>Save your reading preferences and dark/light mode</li>
                  <li>Maintain session continuity</li>
                </ul>
                <p className='text-gray-700 mt-3'>
                  No tracking or third-party analytics cookies are used.
                </p>
                <p className='text-gray-700'>
                  All cookies are limited to improving the in-app experience.
                </p>
              </div>
            </div>
          </section>
          <section className='mb-12' aria-labelledby='changes-heading'>
            <h2
              id='changes-heading'
              className='text-2xl sm:text-3xl font-semibold text-gray-800 mb-4'
            >
              4. Changes to These Terms
            </h2>
            <ul className='list-disc list-inside space-y-2 text-gray-700 ml-2'>
              <li>
                We may update these Terms and Privacy Policy from time to time.
              </li>
              <li>
                Any changes will be reflected on this page with a revised
                &ldquo;Effective Date.&rdquo;
              </li>
            </ul>
          </section>
          <section className='mb-8' aria-labelledby='contact-heading'>
            <h2
              id='contact-heading'
              className='text-2xl sm:text-3xl font-semibold text-gray-800 mb-4'
            >
              5. Contact
            </h2>
            <p className='text-gray-700 mb-2'>
              For questions or concerns about these Terms or our privacy
              practices, contact us at:
            </p>
            <p className='text-gray-700'>
              <a
                href='mailto:privacy@classicnooks.com'
                className='text-blue-600 hover:underline'
              >
                privacy@classicnooks.com
              </a>
            </p>
          </section>
          <footer
            className='mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-600'
            role='contentinfo'
          >
            <p className='mb-2'>© {new Date().getFullYear()} Kenan Velagic.</p>
            <p className='mb-1'>Book content provided by Project Gutenberg.</p>
            <p>
              Use of these materials is subject to the Project Gutenberg
              License.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
