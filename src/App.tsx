import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { NavigationHeader } from './components/NavigationHeader'
import { Footer } from './components/landingSections'
import { AboutPage } from './pages/AboutPage'
import { BuildsPage } from './pages/BuildsPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { BookingPage } from './pages/BookingPage'
import { StartPage } from './pages/StartPage'
import { CheckoutRetainerPage } from './pages/CheckoutRetainerPage'
import { OperatorBookingPage } from './pages/OperatorBookingPage'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { WelcomePage } from './pages/WelcomePage'

export default function App() {
  const pathname = useLocation().pathname
  const isHome = pathname === '/'
  const hideFooter = isHome || pathname === '/welcome'

  return (
    <div
      className={
        isHome
          ? 'flex min-h-dvh flex-col overflow-x-hidden overflow-y-hidden'
          : 'flex min-h-dvh flex-col'
      }
    >
      <NavigationHeader />
      <main
        className={
          isHome
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
            : 'flex flex-1 flex-col'
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/builds" element={<BuildsPage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/operator-booking" element={<OperatorBookingPage />} />
          <Route
            path="/checkout-retainer"
            element={<CheckoutRetainerPage />}
          />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <DashboardPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </main>
      {!hideFooter ? <Footer /> : null}
    </div>
  )
}
