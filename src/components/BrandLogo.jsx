function BrandLogo({ subtitle }) {
  return (
    <>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <path
            d="M20 33s-12-7.5-12-16a7 7 0 0 1 12-4.8 7 7 0 0 1 12 4.8c0 8.5-12 16-12 16Z"
            fill="white"
            fillOpacity=".18"
            stroke="white"
            strokeWidth="1.5"
          />
          <path d="M9 21h7l3-6 4 11 3-5h5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="brand-logo-copy">
        <strong>Emergency &amp; Care</strong>
        <strong>Services</strong>
        {subtitle && <small>{subtitle}</small>}
      </span>
    </>
  )
}

export default BrandLogo
