import { useState } from 'react'

function LoginDialog({ onClose, onLogin }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')

  const isSignup = mode === 'signup'
  const accountRoles = [
    { value: 'customer', label: 'কাস্টমার' },
    { value: 'provider', label: 'প্রোভাইডার' },
    { value: 'user', label: 'সাধারণ ব্যবহারকারী' },
  ]

  function submitAccount(event) {
    event.preventDefault()
    setError('')

    if (isSignup && password !== confirmPassword) {
      setError('দুটি পাসওয়ার্ড মিলছে না।')
      return
    }

    try {
      onLogin(email.trim(), isSignup ? name.trim() : '', isSignup ? role : undefined)
      onClose()
    } catch (loginError) {
      setError(`${isSignup ? 'অ্যাকাউন্ট তৈরি' : 'লগইন'} করা যায়নি: ${loginError.message}`)
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <div
      className="login-overlay"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-labelledby="login-title"
        aria-describedby="login-description"
        aria-modal="true"
        className="login-dialog"
        role="dialog"
      >
        <button
          aria-label="লগইন ফর্ম বন্ধ করুন"
          autoFocus
          className="login-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <div className="login-dialog-mark" aria-hidden="true">+</div>
        <span className="section-kicker">আপনার অ্যাকাউন্ট</span>
        <h2 id="login-title">{isSignup ? 'নতুন অ্যাকাউন্ট খুলুন' : 'আবার স্বাগতম'}</h2>
        <p className="login-description" id="login-description">
          {isSignup ? 'আপনার তথ্য দিয়ে অ্যাকাউন্ট তৈরি করুন।' : 'আপনার তথ্য দিয়ে লগইন করুন।'}
        </p>

        <div className="account-mode-tabs" role="group" aria-label="অ্যাকাউন্টের ধরন">
          <button
            aria-pressed={!isSignup}
            className={!isSignup ? 'active' : ''}
            onClick={() => changeMode('login')}
            type="button"
          >
            লগইন
          </button>
          <button
            aria-pressed={isSignup}
            className={isSignup ? 'active' : ''}
            onClick={() => changeMode('signup')}
            type="button"
          >
            সাইন আপ
          </button>
        </div>

        <form className="login-form" onSubmit={submitAccount}>
          {isSignup && (
            <label>
              আপনার নাম
              <input
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="আপনার পূর্ণ নাম"
                required
                value={name}
              />
            </label>
          )}
          {isSignup && (
            <label>
              অ্যাকাউন্টের ধরন
              <select onChange={(event) => setRole(event.target.value)} value={role}>
                {accountRoles.map((accountRole) => (
                  <option key={accountRole.value} value={accountRole.value}>{accountRole.label}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            ইমেইল
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            পাসওয়ার্ড
            <input
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="কমপক্ষে ৬ অক্ষর"
              required
              type="password"
              value={password}
            />
          </label>
          {isSignup && (
            <label>
              পাসওয়ার্ড নিশ্চিত করুন
              <input
                autoComplete="new-password"
                minLength={6}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="পাসওয়ার্ড আবার লিখুন"
                required
                type="password"
                value={confirmPassword}
              />
            </label>
          )}
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit">
            {isSignup ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}
          </button>
        </form>

        <p className="login-demo-note">
          এটি frontend demo: role শুধু এই ব্রাউজারে সংরক্ষিত হয়। Backend authentication না থাকায় role বাছাই কোনো নিরাপত্তা নিয়ন্ত্রণ নয়; পাসওয়ার্ড সংরক্ষণ করা হয় না।
        </p>
      </section>
    </div>
  )
}

export default LoginDialog
