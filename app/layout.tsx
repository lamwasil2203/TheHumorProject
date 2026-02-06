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
      <body className="bg-stone-50 min-h-screen text-stone-900">
        {children}
      </body>
    </html>
  )
}
