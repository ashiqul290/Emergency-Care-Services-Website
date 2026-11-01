import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAppData } from '../context/useAppData.js'
import LoginDialog from './LoginDialog.jsx'

function AdminRoute({ children }) {
  const { user, profile, login } = useAppData()
  const [loginOpen, setLoginOpen] = useState(false)

  if (!user) {
    return (
      <section className="admin-access-gate section-wrap">
        <div className="admin-access-card">
          <span className="login-dialog-mark" aria-hidden="true">+</span>
          <span className="section-kicker">অ্যাডমিন অ্যাক্সেস</span>
          <h1>আগে লগইন করুন</h1>
          <p>অ্যাডমিন ড্যাশবোর্ড খুলতে আপনার account-এ লগইন করুন।</p>
          <button className="button button-primary" onClick={() => setLoginOpen(true)} type="button">
            লগইন করুন
          </button>
          <Link className="button button-primary" to="/">হোমে ফিরে যান</Link>
          <small>Demo mode: লগইনটি আসল password যাচাই করে না।</small>
        </div>
        {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} onLogin={login} />}
      </section>
    )
  }

  if (!['admin', 'superadmin'].includes(profile?.role)) {
    const destinations = {
      customer: '/my-requests',
      provider: '/provider',
      user: '/user-dashboard',
    }
    return <Navigate replace to={destinations[profile?.role] ?? '/'} />
  }

  return children
}

export default AdminRoute
