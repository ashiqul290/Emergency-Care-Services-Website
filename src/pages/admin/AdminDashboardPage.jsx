import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../../context/useAppData.js'
import { listingTypes } from '../../data/listingCategories.js'
import BrandLogo from '../../components/BrandLogo.jsx'
import AdminOperationsOverview from './AdminOperationsOverview.jsx'
import EmergencyServiceManagement from './EmergencyServiceManagement.jsx'
import './AdminDashboardPage.css'

const adminSections = [
  { id: 'overview', label: 'ড্যাশবোর্ড', symbol: '▦' },
  { id: 'requests', label: 'Customer requests', symbol: '↗', countKey: 'pendingRequests' },
  { id: 'listings', label: 'তথ্য অনুমোদন', symbol: '▤', countKey: 'pendingListings' },
  { id: 'categories', label: 'ক্যাটাগরি পরিচালনা', symbol: '◇', countKey: 'categories' },
  { id: 'history', label: 'আবেদনের ইতিহাস', symbol: '◷', countKey: 'completedRequests' },
  { id: 'cities', label: 'শহর পরিচালনা', symbol: '⌖', countKey: 'cities' },
  { id: 'emergency-services', label: 'জরুরি সেবা পরিচালনা', symbol: '☎', countKey: 'emergencyServices' },
  { id: 'published', label: 'প্রকাশিত তথ্য', symbol: '✓', countKey: 'approvedListings' },
]

function AdminDashboardPage() {
  const navigate = useNavigate()
  const {
    profile,
    cities,
    activeCities,
    listings,
    requests,
    categories,
    emergencyServices,
    managedAreas,
    staffAccounts,
    requestOperations,
    hiddenEmergencyServiceIds,
    addCity,
    addCategory,
    updateCategory,
    removeCategory,
    toggleCityActive,
    removeCity,
    addStaffAccount,
    removeStaffAccount,
    accounts,
    updateAccountRole,
    hideEmergencyService,
    restoreEmergencyService,
    addEmergencyService,
    updateEmergencyService,
    removeEmergencyService,
    updateListingStatus,
    removeListing,
    updateRequestStatus,
    removeRequest,
    logout,
  } = useAppData()
  const [cityForm, setCityForm] = useState({ name: '', englishName: '' })
  const [categoryType, setCategoryType] = useState('product')
  const [categoryName, setCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState('')
  const [categoryEditName, setCategoryEditName] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('overview')
  const isSuperadmin = profile?.role === 'superadmin'
  const visibleSections = adminSections.filter((section) => (
    isSuperadmin || !['cities', 'emergency-services'].includes(section.id)
  ))

  const pendingListings = listings.filter((listing) => listing.status === 'pending')
  const approvedListings = listings.filter((listing) => listing.status === 'approved')
  const pendingRequests = requests.filter((request) => request.status === 'pending')
  const completedRequests = requests.filter((request) => request.status !== 'pending')
  const requestMetrics = [
    { label: 'অপেক্ষায়', value: pendingRequests.length, color: '#e8a23b' },
    { label: 'অনুমোদিত', value: requests.filter((request) => request.status === 'approved').length, color: '#36a878' },
    { label: 'প্রত্যাখ্যাত', value: requests.filter((request) => request.status === 'rejected').length, color: '#d9433f' },
  ]
  const listingTypeMetrics = [
    { label: 'পণ্য', value: listings.filter((listing) => listing.type === 'product').length, color: '#7861e8' },
    { label: 'সেবা', value: listings.filter((listing) => listing.type === 'service').length, color: '#35aab5' },
    { label: 'কোম্পানি', value: listings.filter((listing) => listing.type === 'company').length, color: '#e8a23b' },
    { label: 'ব্যক্তি', value: listings.filter((listing) => listing.type === 'person').length, color: '#d9789c' },
    { label: 'জরুরি নম্বর', value: listings.filter((listing) => listing.type === 'emergency').length, color: '#d9433f' },
  ]
  const maxListingCount = Math.max(...listingTypeMetrics.map((item) => item.value), 1)

  function signOut() {
    try {
      logout()
      navigate('/', { replace: true })
    } catch (logoutError) {
      setError(`লগআউট করা যায়নি: ${logoutError.message}`)
    }
  }

  function getSectionCount(key) {
    const counts = {
      pendingRequests: pendingRequests.length,
      pendingListings: pendingListings.length,
      categories: categories.product.length + categories.service.length,
      completedRequests: completedRequests.length,
      cities: activeCities.length,
      emergencyServices: emergencyServices.length,
      approvedListings: approvedListings.length,
    }
    return counts[key] ?? 0
  }

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
      || managedAreas.some((area) => area.cityId === city.id)
    ) {
      setError('এই শহরের listing, আবেদন বা পরিচালিত এলাকার তথ্য আছে। আগে সংশ্লিষ্ট তথ্য সরিয়ে নিন, তারপর শহর মুছুন।')
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

  function changeCityStatus(city) {
    try {
      toggleCityActive(city.id)
      setError('')
      setFeedback(`${city.name} ${city.active === false ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`)
    } catch (saveError) {
      setError(`শহরের অবস্থা পরিবর্তন করা যায়নি: ${saveError.message}`)
      setFeedback('')
    }
  }

  function submitCategory(event) {
    event.preventDefault()
    setError('')
    setFeedback('')
    try {
      addCategory(categoryType, categoryName)
      setCategoryName('')
      setFeedback('নতুন ক্যাটাগরি যোগ হয়েছে।')
    } catch (saveError) {
      setError(`ক্যাটাগরি যোগ করা যায়নি: ${saveError.message}`)
    }
  }

  function saveCategory(category) {
    try {
      updateCategory(categoryType, category, categoryEditName)
      setEditingCategory('')
      setCategoryEditName('')
      setError('')
      setFeedback('ক্যাটাগরির নাম আপডেট হয়েছে।')
    } catch (saveError) {
      setError(`ক্যাটাগরি আপডেট করা যায়নি: ${saveError.message}`)
      setFeedback('')
    }
  }

  function deleteCategory(category) {
    try {
      removeCategory(categoryType, category)
      setError('')
      setFeedback('ক্যাটাগরি মুছে দেওয়া হয়েছে।')
    } catch (saveError) {
      setError(`ক্যাটাগরি মুছে ফেলা যায়নি: ${saveError.message}`)
      setFeedback('')
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

  function renderRequestCards(items, completed = false) {
    if (items.length === 0) {
      return <div className="admin-empty">{completed ? 'এখনো কোনো আবেদন সম্পন্ন হয়নি।' : 'নতুন কোনো ক্রেতা আবেদন নেই।'}</div>
    }

    return (
      <div className="admin-listing-grid">
        {items.map((request) => (
          <article className="admin-listing-card" key={request.id}>
            <div className="admin-listing-meta">
              <span>{request.listingType === 'manual-order' ? 'ম্যানুয়াল অর্ডার' : request.listingType === 'product' ? 'পণ্য' : 'সেবা'}</span>
              <span>{request.category}</span>
              {completed && <span>{request.status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}</span>}
            </div>
            <h3>{request.listingTitle}</h3>
            <p>আবেদনকারী: {request.customerName}</p>
            {request.message && <p>{request.message}</p>}
            <div className="admin-listing-details">
              <span>{request.cityName}</span>
              {request.deliveryAddress && <span>ডেলিভারি ঠিকানা: {request.deliveryAddress}</span>}
              <a href={`tel:${request.phone.replace(/[^\d+]/g, '')}`}>{request.phone}</a>
            </div>
            <div className="admin-actions">
              {completed ? (
                <button className="admin-delete" onClick={() => deleteRequest(request)} type="button">আবেদন মুছুন</button>
              ) : (
                <>
                  <button className="admin-approve" onClick={() => changeRequestStatus(request, 'approved')} type="button">আবেদন অনুমোদন</button>
                  <button className="admin-delete" onClick={() => changeRequestStatus(request, 'rejected')} type="button">প্রত্যাখ্যান</button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    )
  }

  function renderListingCards(items, published = false) {
    if (items.length === 0) {
      return <div className="admin-empty">{published ? 'এখনো কোনো তথ্য প্রকাশ করা হয়নি।' : 'নতুন কোনো তথ্য অনুমোদনের অপেক্ষায় নেই।'}</div>
    }

    return (
      <div className="admin-listing-grid">
        {items.map((listing) => (
          <article className="admin-listing-card" key={listing.id}>
            <div className="admin-listing-meta">
              <span>{listingTypes.find((type) => type.id === listing.type)?.label ?? listing.type}</span>
              {listing.ownerType && <span>{listing.ownerType === 'company' ? 'কোম্পানি' : 'ব্যক্তি'}</span>}
              <span>{listing.category}</span>
            </div>
            {listing.image && <img className="admin-listing-image" alt={listing.title} src={listing.image} />}
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            {listing.type === 'product' && (
              <p className="admin-product-details">
                মূল্য: ৳ {listing.price}{listing.stock ? ` · স্টক: ${listing.stock}` : ''}
              </p>
            )}
            <div className="admin-listing-details">
              <span>{listing.cityName}</span>
              {listing.submitterName && (
                <span className="admin-listing-owner">
                  {listing.ownerImage && <img alt="" src={listing.ownerImage} />}
                  {listing.submitterName}
                </span>
              )}
              {listing.phone && <a href={`tel:${listing.phone.replace(/[^\d+]/g, '')}`}>{listing.phone}</a>}
              {listing.whatsapp && <a href={`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`} rel="noreferrer" target="_blank">WhatsApp</a>}
              {(listing.mapLink || listing.coordinates) && (
                <a
                  href={listing.mapLink || `https://maps.google.com/?q=${listing.coordinates.latitude},${listing.coordinates.longitude}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  ম্যাপ
                </a>
              )}
            </div>
            <div className="admin-actions">
              {published ? (
                <button className="admin-delete" onClick={() => deleteListing(listing)} type="button">প্রকাশিত তথ্য মুছুন</button>
              ) : (
                <>
                  <button className="admin-approve" onClick={() => changeListingStatus(listing, 'approved')} type="button">অনুমোদন করুন</button>
                  <button className="admin-delete" onClick={() => deleteListing(listing)} type="button">মুছুন</button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    )
  }

  function renderCities() {
    return (
      <>
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
              <button
                aria-label={`${city.name} ${city.active === false ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করুন`}
                aria-pressed={city.active !== false}
                className={`admin-city-status${city.active === false ? ' is-inactive' : ''}`}
                onClick={() => changeCityStatus(city)}
                type="button"
              >
                {city.active === false ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
              </button>
              <button aria-label={`${city.name} মুছুন`} className="admin-delete" onClick={() => deleteCity(city)} type="button">মুছুন</button>
            </div>
          ))}
        </div>
      </>
    )
  }

  function renderCategories() {
    const typeCategories = categories[categoryType]

    return (
      <div className="admin-category-manager">
        <div className="admin-category-tabs" role="group" aria-label="ক্যাটাগরির ধরন">
          <button
            aria-pressed={categoryType === 'product'}
            className={categoryType === 'product' ? 'active' : ''}
            onClick={() => {
              setCategoryType('product')
              setEditingCategory('')
            }}
            type="button"
          >
            পণ্যের ক্যাটাগরি <span>{categories.product.length}</span>
          </button>
          <button
            aria-pressed={categoryType === 'service'}
            className={categoryType === 'service' ? 'active' : ''}
            onClick={() => {
              setCategoryType('service')
              setEditingCategory('')
            }}
            type="button"
          >
            সেবার ক্যাটাগরি <span>{categories.service.length}</span>
          </button>
        </div>

        <form className="admin-category-form" onSubmit={submitCategory}>
          <label>
            নতুন ক্যাটাগরির নাম
            <input
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="যেমন: ফার্মেসি"
              required
              value={categoryName}
            />
          </label>
          <button className="admin-approve" type="submit">ক্যাটাগরি যোগ করুন</button>
        </form>

        <div className="admin-category-list">
          {typeCategories.map((category) => (
            <article className="admin-category-row" key={category}>
              {editingCategory === category ? (
                <form
                  className="admin-category-edit"
                  onSubmit={(event) => {
                    event.preventDefault()
                    saveCategory(category)
                  }}
                >
                  <input
                    aria-label={`${category} ক্যাটাগরির নতুন নাম`}
                    autoFocus
                    onChange={(event) => setCategoryEditName(event.target.value)}
                    required
                    value={categoryEditName}
                  />
                  <button className="admin-approve" type="submit">সংরক্ষণ</button>
                  <button
                    className="admin-category-cancel"
                    onClick={() => {
                      setEditingCategory('')
                      setCategoryEditName('')
                    }}
                    type="button"
                  >
                    বাতিল
                  </button>
                </form>
              ) : (
                <>
                  <strong>{category}</strong>
                  <div>
                    <button
                      className="admin-category-edit-button"
                      onClick={() => {
                        setEditingCategory(category)
                        setCategoryEditName(category)
                      }}
                      type="button"
                    >
                      পরিবর্তন
                    </button>
                    <button className="admin-delete" onClick={() => deleteCategory(category)} type="button">মুছুন</button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    )
  }

  function renderSection() {
    if (activeSection === 'overview') {
      return (
        <>
          <section className="admin-stats" aria-label="তথ্যের সারাংশ">
            <div><span>সক্রিয় শহর</span><strong>{activeCities.length}</strong><small>frontend-এ দৃশ্যমান</small></div>
            <div><span>নতুন customer requests</span><strong>{pendingRequests.length}</strong><small>অনুমোদনের অপেক্ষায়</small></div>
            <div><span>অনুমোদনের অপেক্ষায়</span><strong>{pendingListings.length}</strong><small>নতুন listing</small></div>
            <div><span>প্রকাশিত তথ্য</span><strong>{approvedListings.length}</strong><small>সবার জন্য দৃশ্যমান</small></div>
          </section>

          <div className="admin-chart-grid">
            <section className="admin-panel admin-chart-panel">
              <div className="admin-panel-heading">
                <div><span className="section-kicker">Overview</span><h2>Customer request অবস্থা</h2></div>
                <span className="admin-count">{requests.length}টি মোট</span>
              </div>
              {requests.length === 0 ? (
                <div className="admin-empty">চার্ট দেখানোর মতো আবেদন এখনো নেই।</div>
              ) : (
                <div className="request-chart">
                  <div
                    aria-label={requestMetrics.map((item) => `${item.label}: ${item.value}`).join(', ')}
                    className="request-chart-ring"
                    role="img"
                    style={{
                      '--pending-angle': `${(requestMetrics[0].value / requests.length) * 360}deg`,
                      '--approved-angle': `${((requestMetrics[0].value + requestMetrics[1].value) / requests.length) * 360}deg`,
                      '--pending-color': requestMetrics[0].color,
                      '--approved-color': requestMetrics[1].color,
                      '--rejected-color': requestMetrics[2].color,
                    }}
                  >
                    <span><strong>{requests.length}</strong><small>মোট আবেদন</small></span>
                  </div>
                  <div className="request-chart-legend">
                    {requestMetrics.map((metric) => (
                      <div key={metric.label}>
                        <span className="chart-legend-dot" style={{ '--legend-color': metric.color }} />
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="admin-panel admin-chart-panel">
              <div className="admin-panel-heading">
                <div><span className="section-kicker">Listings</span><h2>ধরন অনুযায়ী তথ্য</h2></div>
                <span className="admin-count">{listings.length}টি মোট</span>
              </div>
              <div className="listing-type-chart">
                {listingTypeMetrics.map((metric) => (
                  <div className="listing-type-bar-row" key={metric.label}>
                    <span>{metric.label}</span>
                    <div className="listing-type-track">
                      <span style={{ width: `${metric.value === 0 ? 0 : Math.max((metric.value / maxListingCount) * 100, 4)}%`, '--bar-color': metric.color }} />
                    </div>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
          {isSuperadmin && (
            <AdminOperationsOverview
              accounts={accounts}
              addStaffAccount={addStaffAccount}
              listings={listings}
              removeStaffAccount={removeStaffAccount}
              requestOperations={requestOperations}
              requests={requests}
              staffAccounts={staffAccounts}
              updateAccountRole={updateAccountRole}
            />
          )}
        </>
      )
    }

    if (activeSection === 'requests') return renderRequestCards(pendingRequests)
    if (activeSection === 'listings') return renderListingCards(pendingListings)
    if (activeSection === 'categories') return renderCategories()
    if (activeSection === 'history') return renderRequestCards(completedRequests, true)
    if (activeSection === 'cities') return renderCities()
    if (activeSection === 'emergency-services') {
      return (
        <EmergencyServiceManagement
          hiddenServiceIds={hiddenEmergencyServiceIds}
          onAdd={addEmergencyService}
          onHide={hideEmergencyService}
          onRemove={removeEmergencyService}
          onRestore={restoreEmergencyService}
          onUpdate={updateEmergencyService}
          services={emergencyServices}
        />
      )
    }
    return renderListingCards(approvedListings, true)
  }

  const activeSectionInfo = visibleSections.find((section) => section.id === activeSection)

  return (
    <div className="admin-layout">
      <aside aria-label="অ্যাডমিন সাইডবার" className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link aria-label="হোম পেজে যান" to="/">
            <BrandLogo subtitle="ADMIN PANEL" />
          </Link>
        </div>
        <span className="admin-sidebar-label">WORKSPACE</span>
        <nav aria-label="অ্যাডমিন ড্যাশবোর্ড" className="admin-sidebar-nav">
          {visibleSections.map((section) => (
            <button
              aria-current={activeSection === section.id ? 'page' : undefined}
              className={`admin-sidebar-link${activeSection === section.id ? ' active' : ''}`}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              <span aria-hidden="true" className="admin-sidebar-symbol">{section.symbol}</span>
              <span>{section.label}</span>
              {section.countKey && <small>{getSectionCount(section.countKey)}</small>}
            </button>
          ))}
        </nav>
      </aside>

      <section aria-labelledby="admin-title" className="admin-workspace">
        <header className="admin-workspace-header">
          <div>
            <span className="section-kicker">পরিচালনা / {activeSectionInfo?.label}</span>
            <h1 id="admin-title">{activeSectionInfo?.label}</h1>
            <p>পণ্য, সেবা, আবেদন ও শহর পরিচালনা করুন।</p>
          </div>
          <div className="admin-header-actions">
            <button className="admin-logout" onClick={signOut} type="button">লগআউট</button>
          </div>
        </header>

        {feedback && <p className="admin-feedback admin-success" role="status">{feedback}</p>}
        {error && <p className="admin-feedback admin-error" role="alert">{error}</p>}

        {activeSection !== 'overview' && (
          <section className="admin-panel admin-section-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="section-kicker">{activeSectionInfo?.label}</span>
                <h2>{activeSectionInfo?.label}</h2>
              </div>
              <span className="admin-count">
                {activeSection === 'requests' && `${pendingRequests.length}টি অপেক্ষায়`}
                {activeSection === 'listings' && `${pendingListings.length}টি`}
                {activeSection === 'categories' && `${categories.product.length + categories.service.length}টি`}
                {activeSection === 'history' && `${completedRequests.length}টি`}
                {activeSection === 'cities' && `${activeCities.length}/${cities.length}টি সক্রিয়`}
                {activeSection === 'emergency-services' && `${emergencyServices.length}টি`}
                {activeSection === 'published' && `${approvedListings.length}টি`}
              </span>
            </div>
            {renderSection()}
          </section>
        )}
        {activeSection === 'overview' && renderSection()}
      </section>
    </div>
  )
}

export default AdminDashboardPage
