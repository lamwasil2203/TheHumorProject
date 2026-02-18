import './globals.css'
import ThemeProvider from './components/ThemeProvider'

export const metadata = {
  title: 'Caption Battle',
  description: 'Pick the funnier caption',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen transition-colors duration-300
          bg-gradient-to-br from-violet-50 via-slate-50 to-fuchsia-50 text-slate-900
          dark:text-slate-100"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}
      >
        <div className="fixed inset-0 -z-10 transition-colors duration-300
          bg-gradient-to-br from-violet-50 via-slate-50 to-fuchsia-50
          dark:from-[#0f0b1a] dark:via-[#110d1f] dark:to-[#0f0b1a]" />
        <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100 transition-opacity duration-300
          bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.15),transparent),radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(236,72,153,0.1),transparent)]" />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
