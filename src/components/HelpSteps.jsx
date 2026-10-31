import Icon from './Icon.jsx'
import { Link } from 'react-router-dom'

const steps = [
  {
    number: '০১',
    title: 'নিজেকে নিরাপদে রাখুন',
    description: 'বিপদের স্থান থেকে নিরাপদ দূরত্বে সরে যান, যদি তা সম্ভব হয়।',
  },
  {
    number: '০২',
    title: 'সঠিক নম্বরে কল করুন',
    description: 'আপনার পরিস্থিতির জন্য উপযুক্ত জরুরি সেবায় ফোন করুন।',
  },
  {
    number: '০৩',
    title: 'পরিষ্কারভাবে তথ্য দিন',
    description: 'আপনার অবস্থান, কী ঘটেছে এবং কার সহায়তা প্রয়োজন তা জানান।',
  },
]

function HelpSteps() {
  return (
    <section className="steps-section" id="how-it-works">
      <div className="section-wrap steps-inner">
        <div className="section-heading steps-heading">
          <div>
            <span className="section-kicker">শান্ত থাকুন, পদক্ষেপ নিন</span>
            <h2>সহায়তা চাইতে এই ধাপগুলো অনুসরণ করুন</h2>
          </div>
          <Link className="text-link" to="/emergency-services">
            জরুরি নম্বর দেখুন <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HelpSteps
