import './globals.css'

export const metadata = {
  title: 'Public Captions',
  description: 'Browse public captions and their images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className="min-h-screen text-stone-900"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}
      >
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50" />
        {children}
      </body>
    </html>
  )
}
