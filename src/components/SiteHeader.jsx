import { useState } from 'react'
import Icon from './Icon.jsx'
import { NavLink } from 'react-router-dom'
import { useAppData } from '../context/useAppData.js'
import LoginDialog from './LoginDialog.jsx'

function SiteHeader() {
  const { cities, selectedCity, chooseCity, user, login, logout } = useAppData()
  const [loginOpen, setLoginOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="সহায়তা — হোম">
        <span className="brand-mark" aria-hidden="true">+</span>
        <span>সহায়তা<span className="brand-dot">.</span></span>
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
        {user && <span className="header-user">{user}</span>}
        <button
          className={`header-login${user ? ' is-logged-in' : ''}`}
          onClick={() => {
            setLogoutError('')
            if (user) {
              try {
                logout()
              } catch (error) {
                setLogoutError(`লগআউট করা যায়নি: ${error.message}`)
              }
            } else {
              setLoginOpen(true)
            }
          }}
          type="button"
        >
          <Icon name={user ? 'shield' : 'user'} size={16} />
          <span>{user ? 'লগআউট' : 'লগইন'}</span>
        </button>
        {logoutError && <span className="header-error" role="alert">{logoutError}</span>}
      </div>
      {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} onLogin={login} />}
    </header>
  )
}

export default SiteHeader
