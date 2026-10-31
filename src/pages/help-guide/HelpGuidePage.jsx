import HelpSteps from '../../components/HelpSteps.jsx'
import './HelpGuidePage.css'

function HelpGuidePage() {
  return (
    <div className="help-guide-page">
      <header className="route-page-heading section-wrap">
        <span className="section-kicker">জরুরি সহায়তা</span>
        <h1>সহায়তা নেওয়ার নিয়ম</h1>
        <p>জরুরি পরিস্থিতিতে নিরাপদে ও পরিষ্কারভাবে সহায়তা চাইতে এই ধাপগুলো অনুসরণ করুন।</p>
      </header>
      <HelpSteps />
    </div>
  )
}

export default HelpGuidePage
