import HeroSection from '../../components/HeroSection.jsx'
import LocalListingBoard from '../../components/LocalListingBoard.jsx'
import EmergencyDirectory from '../../components/EmergencyDirectory.jsx'
import CityCareDirectory from '../../components/CityCareDirectory.jsx'
import './DashboardPage.css'

function DashboardPage() {
  return (
    <>
      <HeroSection />
      <LocalListingBoard />
      <EmergencyDirectory />
      <CityCareDirectory />
    </>
  )
}

export default DashboardPage
