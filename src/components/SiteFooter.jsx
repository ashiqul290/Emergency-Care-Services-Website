import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useAppData } from '../context/useAppData.js'
import BrandLogo from './BrandLogo.jsx'

function SiteFooter() {
  const { selectedCity } = useAppData()

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link className="brand footer-brand" to="/" aria-label="Emergency & Care Services — Home">
            <BrandLogo />
          </Link>
          <p>আপনার এলাকার জরুরি যোগাযোগ ও প্রয়োজনীয় সেবা—এক জায়গায়, আপনার পাশে।</p>
          <span className="footer-location">
            <Icon name="location" size={15} />
            নির্বাচিত শহর: {selectedCity?.name ?? 'সব শহর'}
          </span>
        </div>

        <nav className="footer-links" aria-label="ফুটার নেভিগেশন">
          <h2>দ্রুত লিংক</h2>
          <Link to="/">হোম ড্যাশবোর্ড</Link>
          <Link to="/emergency-services">জরুরি সেবার নম্বর</Link>
          <Link to="/help-guide">সহায়তা নেওয়ার নিয়ম</Link>
          <Link to="/my-requests">আমার আবেদন</Link>
        </nav>

        <div className="footer-emergency">
          <h2>জরুরি প্রয়োজনে</h2>
          <p>তাৎক্ষণিক সহায়তার জন্য সরকারি জরুরি নম্বরে কল করুন।</p>
          <a className="footer-emergency-call" href="tel:999">
            <span className="footer-call-icon"><Icon name="phone" size={17} /></span>
            <span><small>জাতীয় জরুরি সেবা</small><strong>৯৯৯</strong></span>
            <Icon className="footer-call-arrow" name="arrow" size={18} />
          </a>
          <a className="footer-secondary-call" href="tel:102">
            ফায়ার সার্ভিস <strong>১০২</strong>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© Emergency &amp; Care Services — জরুরি সময়ে তথ্যভিত্তিক সহায়তা</span>
        <span className="footer-disclaimer">প্রয়োজনে সরকারি উৎস থেকে নম্বর যাচাই করুন।</span>
      </div>
    </footer>
  )
}

export default SiteFooter
