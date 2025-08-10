import './globals.css';
import React from 'react';

export const metadata = {
  title: 'API Explorer',
  description: 'Introspect and visualize APIs (OpenAPI/GraphQL)'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
