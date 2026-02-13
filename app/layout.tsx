import './globals.css'

export const metadata = {
  title: 'Caption Likes',
  description: 'Browse liked captions and their images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen text-stone-900"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50" />
        {children}
      </body>
    </html>
  )
}
