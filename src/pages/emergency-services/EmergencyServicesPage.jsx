import EmergencyDirectory from '../../components/EmergencyDirectory.jsx'
import './EmergencyServicesPage.css'

function EmergencyServicesPage() {
  return (
    <div className="emergency-services-page">
      <header className="route-page-heading section-wrap">
        <span className="section-kicker">দ্রুত যোগাযোগ</span>
        <h1>জরুরি সেবার নম্বর</h1>
        <p>জরুরি পরিস্থিতিতে প্রয়োজনীয় সরকারি ও সহায়তা সেবার নম্বর খুঁজুন।</p>
      </header>
      <EmergencyDirectory />
    </div>
  )
}

export default EmergencyServicesPage
