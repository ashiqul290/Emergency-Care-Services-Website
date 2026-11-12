import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppData } from '../context/useAppData.js'
import LoginDialog from './LoginDialog.jsx'

const roleHome = {
  superadmin: '/admin',
  admin: '/admin',
  customer: '/my-requests',
  provider: '/provider',
  user: '/user-dashboard',
}

function RoleRoute({ children, role }) {
  const { user, profile, login } = useAppData()
  const [loginOpen, setLoginOpen] = useState(false)

  if (!user) {
    return (
      <section className="admin-access-gate section-wrap">
        <div className="admin-access-card">
          <span className="login-dialog-mark" aria-hidden="true">+</span>
          <span className="section-kicker">অ্যাকাউন্ট প্রয়োজন</span>
          <h1>ড্যাশবোর্ড দেখতে লগইন করুন</h1>
          <p>আপনার অ্যাকাউন্টের ধরন অনুযায়ী সঠিক ড্যাশবোর্ড দেখানো হবে</p>
          <button className="button button-primary" onClick={() => setLoginOpen(true)} type="button">
            লগইন করুন
          </button>
          <small>Frontend demo: role নিরাপদ authentication বা authorization নয়।</small>
        </div>
        {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} onLogin={login} />}
      </section>
    )
  }

  if (profile?.role !== role) {
    return <Navigate replace to={roleHome[profile?.role] ?? '/'} />
  }

  return children
}

export default RoleRoute
