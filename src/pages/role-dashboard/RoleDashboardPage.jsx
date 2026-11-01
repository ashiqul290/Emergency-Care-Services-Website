import { Link } from 'react-router-dom'
import { useAppData } from '../../context/useAppData.js'
import './RoleDashboardPage.css'

const listingStatus = {
  pending: 'অনুমোদনের অপেক্ষায়',
  approved: 'প্রকাশিত',
  rejected: 'অনুমোদিত হয়নি',
}

function RoleDashboardPage({ role }) {
  const { listings, requests, profile, user } = useAppData()
  const isProvider = role === 'provider'
  const ownListings = listings.filter((listing) => (
    profile?.email
      ? listing.ownerEmail === profile.email
        || (!listing.ownerEmail && listing.submittedBy === user)
      : Boolean(user && listing.submittedBy === user)
  ))
  const ownedListingIds = new Set(ownListings.map((listing) => listing.id))
  const providerRequests = requests.filter((request) => ownedListingIds.has(request.listingId))
  const displayName = profile?.name || 'ব্যবহারকারী'

  if (!isProvider) {
    return (
      <section className="role-dashboard section-wrap">
        <header className="role-dashboard-heading">
          <div>
            <span className="section-kicker">ব্যক্তিগত অ্যাকাউন্ট</span>
            <h1>স্বাগতম, {displayName}</h1>
            <p>সেবা খুঁজুন, জরুরি তথ্য দেখুন এবং নিজের প্রোফাইল পরিচালনা করুন।</p>
          </div>
          <Link className="button button-primary" to="/profile">প্রোফাইল পরিচালনা</Link>
        </header>
        <div className="role-dashboard-links">
          <Link to="/emergency-services"><strong>জরুরি সেবা</strong><span>জরুরি যোগাযোগ ও প্রয়োজনীয় সেবা দেখুন</span></Link>
          <Link to="/help-guide"><strong>সহায়তা নির্দেশিকা</strong><span>প্রয়োজনীয় সহায়তার তথ্য পড়ুন</span></Link>
          <Link to="/"><strong>সেবা ও পণ্য খুঁজুন</strong><span>আপনার এলাকার প্রকাশিত listing দেখুন</span></Link>
        </div>
      </section>
    )
  }

  return (
    <section className="role-dashboard section-wrap">
      <header className="role-dashboard-heading">
        <div>
          <span className="section-kicker">প্রোভাইডার ওয়ার্কস্পেস</span>
          <h1>আমার সেবা ও আবেদন</h1>
          <p>আপনার জমা দেওয়া listing-এর অনুমোদন এবং সেগুলোর আবেদন দেখুন।</p>
        </div>
        <Link className="button button-primary" to="/">নতুন সেবা জমা দিন</Link>
      </header>

      <div className="role-dashboard-stats">
        <article><span>আমার listing</span><strong>{ownListings.length}</strong></article>
        <article><span>অনুমোদনের অপেক্ষায়</span><strong>{ownListings.filter((listing) => listing.status === 'pending').length}</strong></article>
        <article><span>আমার সেবার আবেদন</span><strong>{providerRequests.length}</strong></article>
      </div>

      <section aria-labelledby="provider-listings-title" className="role-dashboard-panel">
        <div className="role-dashboard-panel-heading">
          <div><span className="section-kicker">সেবা পরিচালনা</span><h2 id="provider-listings-title">আমার listing</h2></div>
        </div>
        {ownListings.length === 0 ? (
          <p className="role-dashboard-empty">এখনো কোনো listing জমা দেননি। হোমপেজ থেকে নতুন সেবা বা পণ্যের তথ্য জমা দিন।</p>
        ) : (
          <div className="role-dashboard-list">
            {ownListings.map((listing) => (
              <article className="role-dashboard-card" key={listing.id}>
                <div>
                  <span>{listing.category} · {listing.cityName}</span>
                  <h3>{listing.title}</h3>
                  <p>{listing.description}</p>
                </div>
                <span className={`role-status ${listing.status}`}>{listingStatus[listing.status] ?? listing.status}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="provider-requests-title" className="role-dashboard-panel">
        <div className="role-dashboard-panel-heading">
          <div><span className="section-kicker">গ্রাহকের যোগাযোগ</span><h2 id="provider-requests-title">আমার listing-এর আবেদন</h2></div>
        </div>
        {providerRequests.length === 0 ? (
          <p className="role-dashboard-empty">আপনার প্রকাশিত listing-এ এখনো কোনো আবেদন আসেনি।</p>
        ) : (
          <div className="role-dashboard-list">
            {providerRequests.map((request) => (
              <article className="role-dashboard-card" key={request.id}>
                <div>
                  <span>{request.category} · {request.cityName}</span>
                  <h3>{request.listingTitle}</h3>
                  <p>আবেদনকারী: {request.customerName} · যোগাযোগ: {request.phone}</p>
                  {request.message && <p>{request.message}</p>}
                </div>
                <span className={`role-status ${request.status}`}>{listingStatus[request.status] ?? request.status}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default RoleDashboardPage
