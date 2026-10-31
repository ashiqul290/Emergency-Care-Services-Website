const iconPaths = {
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  ambulance: (
    <>
      <path d="M3 7h11v11H3z" />
      <path d="M14 11h4l3 3v4h-7z" />
      <path d="M7 11v4m-2-2h4" />
      <circle cx="7.5" cy="19" r="1.5" />
      <circle cx="17.5" cy="19" r="1.5" />
    </>
  ),
  fire: (
    <path d="M12 22c4.2 0 7-2.8 7-6.7 0-3.1-1.6-5.3-4.8-8.3.2 2.4-.8 3.6-1.7 4.2C12.8 7.5 10 4.4 7 2c.8 4.1-.1 6-1.6 8.3C4.2 12.1 3 13.7 3 16c0 3.5 2.8 6 6.2 6-.8-1-.9-2-.5-3.1.5-1.2 1.5-2.1 2.6-3.4.1 1.8.8 2.9 1.7 3.7.7.7.7 1.8 0 2.8Z" />
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      <path d="M5 13H3m18 0h-2" />
    </>
  ),
  phone: (
    <>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.7L7.7 9.5a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.7-.6l2.8.5a2 2 0 0 1 1.7 2.8Z" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
}

function Icon({ name, size = 22, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  )
}

export default Icon
