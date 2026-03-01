import './globals.css'
import { Inter } from 'next/font/google'
import ThemeProvider from './components/ThemeProvider'
import FloatingBubbles from './components/FloatingBubbles'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Caption Votes',
  description: 'Pick the funnier caption',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300`}>

        {/* ── Light mode background ── */}
        <div className="fixed inset-0 -z-10 dark:opacity-0 transition-opacity duration-300
          bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,92,246,0.08),transparent),linear-gradient(to_bottom_right,#faf8ff,#f3f0ff,#faf8ff)]" />

        {/* ── Dark mode background ── */}
        <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100 transition-opacity duration-300 bg-[#07060f]" />
        {/* violet glow — top centre */}
        <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100 transition-opacity duration-300
          bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(109,40,217,0.18),transparent)]" />
        {/* faint fuchsia — bottom right */}
        <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100 transition-opacity duration-300
          bg-[radial-gradient(ellipse_50%_40%_at_85%_100%,rgba(168,85,247,0.08),transparent)]" />

        <FloatingBubbles />
        {/* z-[1] keeps all page content above the z-0 bubble layer */}
        <div className="relative z-[1]">
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}
