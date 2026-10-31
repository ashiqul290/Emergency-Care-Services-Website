import { useState } from 'react'
import Icon from './Icon.jsx'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/useAppData.js'
import LoginDialog from './LoginDialog.jsx'
import BrandLogo from './BrandLogo.jsx'

const ADMIN_EMAIL = 'ashiquldeveloper11@gmail.com'

function SiteHeader() {
  const { cities, selectedCity, chooseCity, user, profile, login, logout } = useAppData()
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const isAdmin = profile?.email?.toLowerCase() === ADMIN_EMAIL

  function signIn(email, displayName) {
    login(email, displayName)
    navigate(email.trim().toLowerCase() === ADMIN_EMAIL ? '/admin' : '/my-requests')
  }

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="Emergency & Care Services — Home">
        <BrandLogo />
      </NavLink>

      <nav className="main-nav" aria-label="প্রধান নেভিগেশন">
        <NavLink to="/emergency-services">জরুরি সেবা</NavLink>
        <NavLink to="/help-guide">সহায়তা</NavLink>
      </nav>

      <details className="city-picker">
        <summary>
          <Icon name="location" size={16} />
          <span>{selectedCity?.name ?? 'সব শহর'}</span>
          <span className="city-picker-chevron">⌄</span>
        </summary>
        <div className="city-picker-menu">
          <p>আপনার শহর বেছে নিন</p>
          <div className="city-picker-options">
            <button
              className={!selectedCity ? 'selected' : ''}
              onClick={(event) => {
                chooseCity('all')
                event.currentTarget.closest('details').open = false
              }}
              type="button"
            >
              সব শহর <span>All cities</span>
            </button>
            {cities.map((city) => (
              <button
                className={city.id === selectedCity?.id ? 'selected' : ''}
                key={city.id}
                onClick={(event) => {
                  chooseCity(city.id)
                  event.currentTarget.closest('details').open = false
                }}
                type="button"
              >
                {city.name} <span>{city.englishName}</span>
              </button>
            ))}
          </div>
        </div>
      </details>

      <div className="header-account">
        {user ? (
          <details className="header-profile-menu">
            <summary className="header-login is-logged-in">
              <span className="header-profile-avatar">
                {profile?.image ? <img src={profile.image} alt="" /> : <Icon name="user" size={16} />}
              </span>
              <span>{isAdmin ? 'ড্যাশবোর্ড' : 'প্রোফাইল'}</span>
              <span aria-hidden="true" className="header-menu-chevron">⌄</span>
            </summary>
            <div className="header-profile-dropdown">
              <div className="header-profile-summary">
                <strong>{profile?.name || (isAdmin ? 'অ্যাডমিন' : 'ব্যবহারকারী')}</strong>
                <span>{profile?.email || user}</span>
              </div>
              {isAdmin ? (
                <Link to="/admin" onClick={(event) => { event.currentTarget.closest('details').open = false }}>
                  <Icon name="building" size={16} />
                  অ্যাডমিন ড্যাশবোর্ড
                </Link>
              ) : (
                <>
                  <Link to="/profile" onClick={(event) => { event.currentTarget.closest('details').open = false }}>
                    <Icon name="user" size={16} />
                    প্রোফাইল দেখুন
                  </Link>
                  <Link to="/my-requests" onClick={(event) => { event.currentTarget.closest('details').open = false }}>
                    <Icon name="bag" size={16} />
                    আমার আবেদন
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setLogoutError('')
                  try {
                    logout()
                    navigate('/')
                  } catch (error) {
                    setLogoutError(`লগআউট করা যায়নি: ${error.message}`)
                  }
                }}
                type="button"
              >
                <Icon name="shield" size={16} />
                লগআউট
              </button>
            </div>
          </details>
        ) : (
          <button className="header-login" onClick={() => setLoginOpen(true)} type="button">
            <Icon name="user" size={16} />
            <span>লগইন</span>
          </button>
        )}
        {logoutError && <span className="header-error" role="alert">{logoutError}</span>}
      </div>
      {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} onLogin={signIn} />}
    </header>
  )
}

export default SiteHeader
