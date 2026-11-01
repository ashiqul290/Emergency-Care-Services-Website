import { useState } from 'react'
import Icon from './Icon.jsx'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/useAppData.js'
import LoginDialog from './LoginDialog.jsx'
import BrandLogo from './BrandLogo.jsx'

const roleHome = {
  superadmin: '/admin',
  admin: '/admin',
  provider: '/provider',
  customer: '/my-requests',
  user: '/user-dashboard',
}

const roleLabels = {
  superadmin: 'সুপার অ্যাডমিন',
  admin: 'অ্যাডমিন',
  provider: 'প্রোভাইডার',
  customer: 'কাস্টমার',
  user: 'ব্যবহারকারী',
}

function SiteHeader() {
  const { activeCities, selectedCity, chooseCity, user, profile, accounts, login, logout } = useAppData()
  const navigate = useNavigate()
  const [citySearch, setCitySearch] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'
  const filteredCities = activeCities.filter((city) => (
    `${city.name} ${city.englishName}`.toLocaleLowerCase().includes(citySearch.trim().toLocaleLowerCase())
  ))

  function signIn(email, displayName, role) {
    login(email, displayName, role)
    const normalizedEmail = email.trim().toLowerCase()
    const resolvedRole = normalizedEmail === 'ashiquldeveloper11@gmail.com'
      ? 'superadmin'
      : role ?? accounts.find((account) => account.email === normalizedEmail)?.role ?? 'user'
    navigate(roleHome[resolvedRole] ?? '/user-dashboard')
  }

  return (
    <>
      <div className="contact-bar">
        <div className="contact-bar-inner">
          <span>সিটি কেয়ার কল সেন্টার</span>
          <a
            className="contact-whatsapp"
            href="https://wa.me/8801907968086"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp-এ যোগাযোগ করুন: 01907-968086"
          >
            <Icon name="phone" size={14} />
            <span>01907-968086</span>
          </a>
        </div>
      </div>

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
            <input
              aria-label="শহর খুঁজুন"
              className="city-picker-search"
              onChange={(event) => setCitySearch(event.target.value)}
              placeholder="শহর খুঁজুন..."
              type="search"
              value={citySearch}
            />
            <div className="city-picker-options">
              <button
                className={!selectedCity ? 'selected' : ''}
                onClick={(event) => {
                  chooseCity('all')
                  setCitySearch('')
                  event.currentTarget.closest('details').open = false
                }}
                type="button"
              >
                সব শহর <span>All cities</span>
              </button>
              {filteredCities.map((city) => (
                <button
                  className={city.id === selectedCity?.id ? 'selected' : ''}
                  key={city.id}
                  onClick={(event) => {
                    chooseCity(city.id)
                    setCitySearch('')
                    event.currentTarget.closest('details').open = false
                  }}
                  type="button"
                >
                  {city.name} <span>{city.englishName}</span>
                </button>
              ))}
              {filteredCities.length === 0 && <p className="city-picker-empty">এই নামে কোনো শহর পাওয়া যায়নি।</p>}
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
                <span>{roleLabels[profile?.role] ?? 'ড্যাশবোর্ড'}</span>
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
                    {profile?.role === 'superadmin' ? 'সুপার অ্যাডমিন ড্যাশবোর্ড' : 'অ্যাডমিন ড্যাশবোর্ড'}
                  </Link>
                ) : profile?.role === 'provider' ? (
                  <Link to="/provider" onClick={(event) => { event.currentTarget.closest('details').open = false }}>
                    <Icon name="building" size={16} />
                    প্রোভাইডার ড্যাশবোর্ড
                  </Link>
                ) : profile?.role === 'customer' ? (
                  <Link to="/my-requests" onClick={(event) => { event.currentTarget.closest('details').open = false }}>
                    <Icon name="bag" size={16} />
                    আমার আবেদন
                  </Link>
                ) : (
                  <Link to="/user-dashboard" onClick={(event) => { event.currentTarget.closest('details').open = false }}>
                    <Icon name="user" size={16} />
                    ব্যবহারকারী ড্যাশবোর্ড
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/profile" onClick={(event) => { event.currentTarget.closest('details').open = false }}>
                    <Icon name="user" size={16} />
                    প্রোফাইল দেখুন
                  </Link>
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
    </>
  )
}

export default SiteHeader
