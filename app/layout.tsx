import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onboarding Time Tracker',
  description: 'Track client onboarding time for Ali and Elizabeth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0f1e', color: '#fff', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
