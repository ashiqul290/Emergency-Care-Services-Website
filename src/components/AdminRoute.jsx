import { Link } from 'react-router-dom'
import { useAppData } from '../context/useAppData.js'

function AdminRoute({ children }) {
  const { user } = useAppData()

  if (!user) {
    return (
      <section className="admin-access-gate section-wrap">
        <div className="admin-access-card">
          <span className="login-dialog-mark" aria-hidden="true">+</span>
          <span className="section-kicker">অ্যাডমিন অ্যাক্সেস</span>
          <h1>আগে লগইন করুন</h1>
          <p>অ্যাডমিন ড্যাশবোর্ড দেখতে উপরের navbar-এর লগইন বাটনে লগইন করুন।</p>
          <Link className="button button-primary" to="/">হোমে ফিরে যান</Link>
          <small>Demo mode: লগইনটি আসল password যাচাই করে না।</small>
        </div>
      </section>
    )
  }

  return children
}

export default AdminRoute
