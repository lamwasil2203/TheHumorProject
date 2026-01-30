export const metadata = {
  title: 'Hello World',
  description: 'A simple Next.js Hello World page',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
