import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['www.gutenberg.org'], // allowed for book covers
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval'
                https://www.classicnooks.com
                https://www.google.com/recaptcha/
                https://www.gstatic.com/recaptcha/
                https://www.googletagmanager.com
                https://www.google-analytics.com
                https://plausible.io;
              style-src 'self' 'unsafe-inline'
                https://www.classicnooks.com
                https://fonts.googleapis.com;
              img-src 'self' data: blob:
                https://www.classicnooks.com
                https://www.gutenberg.org
                https://www.gstatic.com
                https://www.google.com
                https://www.google-analytics.com;
              connect-src 'self'
                https://www.classicnooks.com
                https://www.gutenberg.org
                https://www.google.com
                https://www.gstatic.com
                https://www.google-analytics.com
                https://plausible.io;
              font-src 'self' data: https://fonts.gstatic.com;
              frame-src 'self'
                https://www.google.com/recaptcha/
                https://recaptcha.google.com/recaptcha/;
              object-src 'none';
              base-uri 'self';
              frame-ancestors 'none';
            `
              .replace(/\s{2,}/g, ' ')
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
