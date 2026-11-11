import Icon from './Icon.jsx'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/useAppData.js'

function EmergencyDirectory() {
  const { emergencyServices, hiddenEmergencyServiceIds } = useAppData()
  const visibleServices = emergencyServices.filter((service) => (
    !hiddenEmergencyServiceIds.includes(service.id)
  ))

  return (
    <section className="directory-section section-wrap" id="emergency-directory">
      <div className="section-heading">
        <div>
          <span className="section-kicker">দ্রুত যোগাযোগ</span>
          <h2>জনপ্রিয় জরুরি সেবা</h2>
        </div>
        <Link className="text-link" to="/emergency-services">
          সব নম্বর দেখুন <Icon name="arrow" size={17} />
        </Link>
      </div>

      <div className="service-grid">
        {visibleServices.map((service) => (
          <article className={`service-card${service.featured ? ' service-card-featured' : ''}`} key={service.id}>
            <div className="service-card-top">
              <span className="service-icon"><Icon name={service.icon} size={22} /></span>
              <span className="service-category">{service.category}</span>
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <a className="service-number" href={`tel:${service.dialNumber}`} aria-label={`${service.title}, ${service.number} নম্বরে কল করুন`}>
              <span>কল করুন</span>
              <strong>{service.number}</strong>
              <span className="service-arrow" aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
      <p className="directory-disclaimer">
        জরুরি নম্বর ও সেবার তথ্য পরিবর্তিত হতে পারে । প্রয়োজনে সংশ্লিষ্ট সরকারি উৎস থেকে নম্বর যাচাই করুন।
      </p>
    </section>
  )
}

export default EmergencyDirectory
