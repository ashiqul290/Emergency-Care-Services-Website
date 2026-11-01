import Icon from './Icon.jsx'
import { Link } from 'react-router-dom'

function HeroSection() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          বাংলাদেশে জরুরি সহায়তার তথ্য
        </div>
        <h1>জরুরি মুহূর্তে,<br /><span>পাশে আছি আমরা।</span></h1>
        <p className="hero-description">
          বিপদের সময়ে সঠিক নম্বর ও প্রয়োজনীয় তথ্য হাতের কাছে রাখুন।
          আপনার জরুরি সহায়তা পেতে নিচের নির্দেশনা অনুসরণ করুন।
        </p>
        <div className="hero-actions">
          <a
            className="button button-primary"
            href="tel:01907968086"
          >
            <Icon name="phone" size={18} />
            01907-968086 নম্বরে কল করুন
          </a>
          <Link className="button button-secondary" to="/emergency-services">
            জরুরি নম্বর দেখুন
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="hero-note">
          <Icon name="location" size={17} />
          <span>বাংলাদেশজুড়ে জরুরি নম্বরের তথ্য</span>
        </div>
      </div>

      <aside className="urgent-card" aria-label="জরুরি নির্দেশনা">
        <div className="urgent-card-top">
          <span className="urgent-icon"><Icon name="phone" size={22} /></span>
          <span className="urgent-label">জরুরি পরিস্থিতি?</span>
        </div>
        <h2>প্রথমে নিরাপদ জায়গায় যান।</h2>
        <p>নিজে নিরাপদ থাকুন, তারপর জরুরি সেবায় যোগাযোগ করুন।</p>
        <a className="urgent-number" href="tel:999">
          <span>জাতীয় জরুরি সেবা</span>
          <strong>৯৯৯</strong>
          <Icon name="arrow" size={20} />
        </a>
        <div className="urgent-footnote">
          <span className="status-dot" />
          সরকারি জরুরি নম্বর
        </div>
        <span className="card-decoration" aria-hidden="true">+</span>
      </aside>
    </section>
  )
}

export default HeroSection
