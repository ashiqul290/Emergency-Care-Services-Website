import { useState } from 'react'
import { useAppData } from '../../context/useAppData.js'
import { listingTypes } from '../../data/listingCategories.js'
import './AdminDashboardPage.css'

function AdminDashboardPage() {
  const {
    cities,
    listings,
    requests,
    addCity,
    removeCity,
    updateListingStatus,
    removeListing,
    updateRequestStatus,
    removeRequest,
  } = useAppData()
  const [cityForm, setCityForm] = useState({ name: '', englishName: '' })
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const pendingListings = listings.filter((listing) => listing.status === 'pending')
  const approvedListings = listings.filter((listing) => listing.status === 'approved')
  const pendingRequests = requests.filter((request) => request.status === 'pending')

  function submitCity(event) {
    event.preventDefault()
    setError('')
    setFeedback('')
    const englishName = cityForm.englishName.trim()
    const id = englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    if (!cityForm.name.trim() || !id) {
      setError('বাংলা ও ইংরেজি শহরের নাম লিখুন।')
      return
    }
    if (cities.some((city) => city.id === id)) {
      setError('এই শহরটি আগে থেকেই তালিকায় আছে।')
      return
    }

    try {
      addCity({ id, name: cityForm.name.trim(), englishName })
      setCityForm({ name: '', englishName: '' })
      setFeedback('নতুন শহর যোগ হয়েছে।')
    } catch (saveError) {
      setError(`শহর যোগ করা যায়নি: ${saveError.message}`)
    }
  }

  function deleteCity(city) {
    if (
      listings.some((listing) => listing.cityId === city.id)
      || requests.some((request) => request.cityId === city.id)
    ) {
      setError('এই শহরের listing বা আবেদন আছে। আগে সেগুলো সরিয়ে নিন, তারপর শহর মুছুন।')
      setFeedback('')
      return
    }

    try {
      removeCity(city.id)
      setError('')
      setFeedback(`${city.name} তালিকা থেকে মুছে দেওয়া হয়েছে।`)
    } catch (saveError) {
      setError(`শহর মুছে ফেলা যায়নি: ${saveError.message}`)
    }
  }

  function changeListingStatus(listing, status) {
    try {
      updateListingStatus(listing.id, status)
      setError('')
      setFeedback(status === 'approved' ? 'তথ্যটি অনুমোদিত হয়েছে।' : 'তথ্যটি মুছে দেওয়া হয়েছে।')
    } catch (saveError) {
      setError(`তথ্য আপডেট করা যায়নি: ${saveError.message}`)
    }
  }

  function deleteListing(listing) {
    try {
      removeListing(listing.id)
      setError('')
      setFeedback('তথ্যটি মুছে দেওয়া হয়েছে।')
    } catch (saveError) {
      setError(`তথ্য মুছে ফেলা যায়নি: ${saveError.message}`)
    }
  }

  function changeRequestStatus(request, status) {
    try {
      updateRequestStatus(request.id, status)
      setError('')
      setFeedback(status === 'approved' ? 'আবেদনটি অনুমোদিত হয়েছে।' : 'আবেদনটি প্রত্যাখ্যান করা হয়েছে।')
    } catch (saveError) {
      setError(`আবেদনের অবস্থা আপডেট করা যায়নি: ${saveError.message}`)
    }
  }

  function deleteRequest(request) {
    try {
      removeRequest(request.id)
      setError('')
      setFeedback('আবেদনটি মুছে দেওয়া হয়েছে।')
    } catch (saveError) {
      setError(`আবেদন মুছে ফেলা যায়নি: ${saveError.message}`)
    }
  }

  return (
    <div className="admin-page section-wrap">
      <header className="admin-page-heading">
        <div>
          <span className="section-kicker">পরিচালনা</span>
          <h1>অ্যাডমিন ড্যাশবোর্ড</h1>
          <p>ইউজারের জমা দেওয়া তথ্য অনুমোদন করুন এবং শহরের তালিকা পরিচালনা করুন।</p>
        </div>
        <span className="admin-demo-badge">Local demo</span>
      </header>

      <div className="admin-notice" role="note">
        Demo mode: ড্যাশবোর্ড দেখতে login লাগে, তবে login আসল password যাচাই করে না এবং role-based security নেই। সব তথ্য শুধু এই browser-এর localStorage-এ থাকে।
      </div>
      {feedback && <p className="admin-feedback admin-success" role="status">{feedback}</p>}
      {error && <p className="admin-feedback admin-error" role="alert">{error}</p>}

      <section className="admin-stats" aria-label="তথ্যের সারাংশ">
        <div><span>মোট শহর</span><strong>{cities.length}</strong></div>
        <div><span>অনুমোদনের অপেক্ষায়</span><strong>{pendingListings.length}</strong></div>
        <div><span>প্রকাশিত তথ্য</span><strong>{approvedListings.length}</strong></div>
        <div><span>নতুন ক্রেতা আবেদন</span><strong>{pendingRequests.length}</strong></div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="section-kicker">Customer requests</span>
            <h2>পণ্য ও সেবার আবেদন</h2>
          </div>
          <span className="admin-count">{pendingRequests.length}টি অপেক্ষায়</span>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="admin-empty">নতুন কোনো ক্রেতা আবেদন নেই।</div>
        ) : (
          <div className="admin-listing-grid">
            {pendingRequests.map((request) => (
              <article className="admin-listing-card" key={request.id}>
                <div className="admin-listing-meta">
                  <span>{request.listingType === 'product' ? 'পণ্য' : 'সেবা'}</span>
                  <span>{request.category}</span>
                </div>
                <h3>{request.listingTitle}</h3>
                <p>আবেদনকারী: {request.customerName}</p>
                {request.message && <p>{request.message}</p>}
                <div className="admin-listing-details">
                  <span>{request.cityName}</span>
                  <a href={`tel:${request.phone.replace(/[^\d+]/g, '')}`}>{request.phone}</a>
                </div>
                <div className="admin-actions">
                  <button className="admin-approve" onClick={() => changeRequestStatus(request, 'approved')} type="button">আবেদন অনুমোদন</button>
                  <button className="admin-delete" onClick={() => changeRequestStatus(request, 'rejected')} type="button">প্রত্যাখ্যান</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="section-kicker">Moderation</span>
            <h2>অনুমোদনের অপেক্ষায়</h2>
          </div>
          <span className="admin-count">{pendingListings.length}টি</span>
        </div>
        {pendingListings.length === 0 ? (
          <div className="admin-empty">নতুন কোনো তথ্য অনুমোদনের অপেক্ষায় নেই।</div>
        ) : (
          <div className="admin-listing-grid">
            {pendingListings.map((listing) => (
              <article className="admin-listing-card" key={listing.id}>
                <div className="admin-listing-meta">
                  <span>{listingTypes.find((type) => type.id === listing.type)?.label ?? listing.type}</span>
                  <span>{listing.category}</span>
                </div>
                <h3>{listing.title}</h3>
                <p>{listing.description}</p>
                <div className="admin-listing-details">
                  <span>{listing.cityName}</span>
                  <a href={`tel:${listing.phone.replace(/[^\d+]/g, '')}`}>{listing.phone}</a>
                </div>
                <div className="admin-actions">
                  <button className="admin-approve" onClick={() => changeListingStatus(listing, 'approved')} type="button">অনুমোদন করুন</button>
                  <button className="admin-delete" onClick={() => deleteListing(listing)} type="button">মুছুন</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="section-kicker">Request history</span>
            <h2>সম্পন্ন আবেদন</h2>
          </div>
          <span className="admin-count">{requests.length - pendingRequests.length}টি</span>
        </div>
        {requests.filter((request) => request.status !== 'pending').length === 0 ? (
          <div className="admin-empty">এখনো কোনো আবেদন সম্পন্ন হয়নি।</div>
        ) : (
          <div className="admin-listing-grid">
            {requests.filter((request) => request.status !== 'pending').map((request) => (
              <article className="admin-listing-card" key={request.id}>
                <div className="admin-listing-meta">
                  <span>{request.status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}</span>
                  <span>{request.category}</span>
                </div>
                <h3>{request.listingTitle}</h3>
                <p>আবেদনকারী: {request.customerName}</p>
                <div className="admin-listing-details">
                  <span>{request.cityName}</span>
                  <a href={`tel:${request.phone.replace(/[^\d+]/g, '')}`}>{request.phone}</a>
                </div>
                <div className="admin-actions">
                  <button className="admin-delete" onClick={() => deleteRequest(request)} type="button">আবেদন মুছুন</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-panel city-admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="section-kicker">Locations</span>
            <h2>শহর পরিচালনা</h2>
          </div>
          <span className="admin-count">{cities.length}টি</span>
        </div>
        <form className="city-admin-form" onSubmit={submitCity}>
          <label>
            শহরের বাংলা নাম
            <input onChange={(event) => setCityForm({ ...cityForm, name: event.target.value })} placeholder="যেমন: ঢাকা" required value={cityForm.name} />
          </label>
          <label>
            ইংরেজি নাম
            <input onChange={(event) => setCityForm({ ...cityForm, englishName: event.target.value })} placeholder="যেমন: Dhaka" required value={cityForm.englishName} />
          </label>
          <button className="admin-approve" type="submit">শহর যোগ করুন</button>
        </form>
        <div className="admin-city-list">
          {cities.map((city) => (
            <div className="admin-city-row" key={city.id}>
              <span>{city.name} <small>{city.englishName}</small></span>
              <button aria-label={`${city.name} মুছুন`} className="admin-delete" onClick={() => deleteCity(city)} type="button">মুছুন</button>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="section-kicker">Published</span>
            <h2>অনুমোদিত তথ্য</h2>
          </div>
          <span className="admin-count">{approvedListings.length}টি</span>
        </div>
        {approvedListings.length === 0 ? (
          <div className="admin-empty">এখনো কোনো তথ্য প্রকাশ করা হয়নি।</div>
        ) : (
          <div className="admin-listing-grid">
            {approvedListings.map((listing) => (
              <article className="admin-listing-card" key={listing.id}>
                <div className="admin-listing-meta">
                  <span>{listingTypes.find((type) => type.id === listing.type)?.label ?? listing.type}</span>
                  <span>{listing.category}</span>
                </div>
                <h3>{listing.title}</h3>
                <p>{listing.description}</p>
                <div className="admin-listing-details">
                  <span>{listing.cityName}</span>
                  <a href={`tel:${listing.phone.replace(/[^\d+]/g, '')}`}>{listing.phone}</a>
                </div>
                <div className="admin-actions">
                  <button className="admin-delete" onClick={() => deleteListing(listing)} type="button">প্রকাশিত তথ্য মুছুন</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminDashboardPage
