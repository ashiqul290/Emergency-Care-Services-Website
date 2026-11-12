import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import AddListingWizard from './AddListingWizard.jsx'
import { listingTypes } from '../data/listingCategories.js'
import { useAppData } from '../context/useAppData.js'

function LocalListingBoard() {
  const { activeCities, categories, listings, selectedCity, addListing, addRequest, user, profile } = useAppData()
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState('product')
  const [activeCategory, setActiveCategory] = useState('')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [requestingListing, setRequestingListing] = useState(null)
  const [formSuccess, setFormSuccess] = useState('')
  const [requestError, setRequestError] = useState('')
  const [manualOrderFeedback, setManualOrderFeedback] = useState('')
  const [manualOrderError, setManualOrderError] = useState('')
  const [manualOrderForm, setManualOrderForm] = useState({
    customerName: user ?? '',
    phone: '',
    deliveryAddress: '',
    items: '',
  })
  const [requestForm, setRequestForm] = useState({
    customerName: user ?? '',
    phone: '',
    message: '',
  })

  const displayedType = activeType === 'manual-order' && !selectedCity ? 'product' : activeType
  const browseListings = useMemo(() => listings.filter((listing) => (
    listing.status === 'approved'
    && (listing.cityId === 'all' || activeCities.some((city) => city.id === listing.cityId))
    && (displayedType === 'company' || displayedType === 'person'
      ? listing.ownerType === displayedType
      : listing.type === displayedType)
    && (!selectedCity || listing.cityId === selectedCity.id || listing.cityId === 'all')
  )), [activeCities, displayedType, listings, selectedCity])
  const visibleListings = activeCategory
    ? browseListings.filter((listing) => listing.category === activeCategory)
    : browseListings
  const listingGroups = useMemo(() => {
    const groups = new Map()
    visibleListings.forEach((listing) => {
      const group = groups.get(listing.category) ?? []
      group.push(listing)
      groups.set(listing.category, group)
    })
    return Array.from(groups, ([category, categoryListings]) => ({ category, listings: categoryListings }))
  }, [visibleListings])
  const categoryCounts = useMemo(() => browseListings.reduce((counts, listing) => {
    counts.set(listing.category, (counts.get(listing.category) ?? 0) + 1)
    return counts
  }, new Map()), [browseListings])

  const availableCategories = categories[displayedType === 'product' ? 'product' : 'service']
  const shownCategories = showAllCategories ? availableCategories : availableCategories.slice(0, 12)
  const visibleTypes = listingTypes.filter((type) => (
    type.id !== 'manual-order' || selectedCity
  ))

  function submitListing(listing) {
    setFormSuccess('')
    addListing({ ...listing, ownerEmail: profile?.email ?? '', submittedBy: user ?? '' })
    setFormOpen(false)
    setFormSuccess('আপনার তথ্য জমা হয়েছে। প্রকাশের আগে অ্যাডমিন অনুমোদন করবেন')
  }

  function submitRequest(event) {
    event.preventDefault()
    setRequestError('')
    if (!requestingListing) return

    try {
      addRequest({
        listingId: requestingListing.id,
        listingTitle: requestingListing.title,
        listingType: requestingListing.type,
        category: requestingListing.category,
        cityId: requestingListing.cityId,
        cityName: requestingListing.cityName,
        customerName: requestForm.customerName.trim(),
        phone: requestForm.phone.trim(),
        message: requestForm.message.trim(),
        submittedBy: user ?? '',
        submittedByEmail: profile?.email ?? '',
      })
      setRequestingListing(null)
      setRequestForm({ customerName: user ?? '', phone: '', message: '' })
      navigate('/my-requests')
    } catch (error) {
      setRequestError(`আবেদন জমা দেওয়া যায়নি: ${error.message}`)
    }
  }

  function submitManualOrderForm(event) {
    event.preventDefault()
    setManualOrderError('')
    setManualOrderFeedback('')

    try {
      addRequest({
        listingId: '',
        listingTitle: `ম্যানুয়াল অর্ডার — ${selectedCity?.englishName ?? 'সব শহর'}`,
        listingType: 'manual-order',
        category: 'লোকাল বাজার',
        cityId: selectedCity?.id ?? 'all',
        cityName: selectedCity?.name ?? 'সব শহর',
        customerName: manualOrderForm.customerName.trim(),
        phone: manualOrderForm.phone.trim(),
        deliveryAddress: manualOrderForm.deliveryAddress.trim(),
        message: manualOrderForm.items.trim(),
        submittedBy: user ?? '',
        submittedByEmail: profile?.email ?? '',
      })
      setManualOrderForm({
        customerName: user ?? '',
        phone: '',
        deliveryAddress: '',
        items: '',
      })
      setManualOrderFeedback('আপনার অর্ডার পাঠানো হয়েছে।')
    } catch (error) {
      setManualOrderError(`অর্ডার পাঠানো যায়নি: ${error.message}`)
    }
  }

  function renderListingCard(listing) {
    return (
      <article className="public-listing-card" key={listing.id}>
        {listing.image ? (
          <img className="public-listing-image" alt={listing.title} src={listing.image} />
        ) : (
          <div className="public-listing-image-placeholder" aria-hidden="true">
            <Icon name="building" size={30} />
          </div>
        )}
        <span className="public-listing-category">{listing.category}</span>
        <h3>{listing.title}</h3>
        <p>{listing.description}</p>
        {listing.submitterName && (
          <span className="public-listing-owner">
            {listing.ownerImage && <img alt="" src={listing.ownerImage} />}
            {listing.submitterName}
          </span>
        )}
        {listing.type === 'product' && (
          <div className="public-product-details">
            <strong>৳ {listing.price}</strong>
            {listing.stock && <span>স্টক: {listing.stock}</span>}
          </div>
        )}
        <div className="public-listing-footer">
          <span><Icon name="location" size={15} />{listing.cityName}</span>
          {listing.phone && <a href={`tel:${listing.phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" size={15} />{listing.phone}</a>}
          {listing.whatsapp && (
            <a href={`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`} rel="noreferrer" target="_blank">
              WhatsApp
            </a>
          )}
          {(listing.mapLink || listing.coordinates) && (
            <a
              href={listing.mapLink || `https://maps.google.com/?q=${listing.coordinates.latitude},${listing.coordinates.longitude}`}
              rel="noreferrer"
              target="_blank"
            >
              ম্যাপ দেখুন
            </a>
          )}
        </div>
        {(listing.type === 'product' || listing.type === 'service') && (
          <>
            <button
              aria-controls={requestingListing?.id === listing.id ? `request-form-${listing.id}` : undefined}
              aria-expanded={requestingListing?.id === listing.id}
              className="listing-request-button"
              onClick={() => {
                setRequestError('')
                setRequestingListing(requestingListing?.id === listing.id ? null : listing)
              }}
              type="button"
            >
              {requestingListing?.id === listing.id ? 'আবেদন বন্ধ করুন' : 'পণ্য / সেবা নিতে আবেদন করুন'}
            </button>
            {requestingListing?.id === listing.id && (
              <form className="listing-request-form" id={`request-form-${listing.id}`} onSubmit={submitRequest}>
                <h4>আবেদনের তথ্য</h4>
                <label>
                  আপনার নাম
                  <input
                    autoComplete="name"
                    onChange={(event) => setRequestForm({ ...requestForm, customerName: event.target.value })}
                    required
                    value={requestForm.customerName}
                  />
                </label>
                <label>
                  যোগাযোগ নম্বর
                  <input
                    autoComplete="tel"
                    inputMode="tel"
                    onChange={(event) => setRequestForm({ ...requestForm, phone: event.target.value })}
                    required
                    type="tel"
                    value={requestForm.phone}
                  />
                </label>
                <label>
                  অতিরিক্ত তথ্য <span>(ঐচ্ছিক)</span>
                  <textarea
                    onChange={(event) => setRequestForm({ ...requestForm, message: event.target.value })}
                    rows="2"
                    value={requestForm.message}
                  />
                </label>
                {requestError && <p className="form-feedback form-error" role="alert">{requestError}</p>}
                <button className="button button-primary request-submit" type="submit">আবেদন জমা দিন</button>
              </form>
            )}
          </>
        )}
      </article>
    )
  }

  return (
    <section className="listing-board section-wrap">
      <div className="listing-type-tabs" role="group" aria-label="তথ্যের ধরন">
        {visibleTypes.map((type) => (
          <button
            aria-pressed={displayedType === type.id}
            className={`listing-type-tab${displayedType === type.id ? ' active' : ''}`}
            key={type.id}
            onClick={() => {
              if (type.id === 'emergency') {
                document.getElementById('emergency-directory')?.scrollIntoView({ behavior: 'smooth' })
                return
              }
              if (type.id === 'manual-order') {
                setActiveType(type.id)
                setActiveCategory('')
                setFormOpen(false)
                setFormSuccess('')
                setManualOrderError('')
                setManualOrderFeedback('')
                return
              }
              setActiveType(type.id)
              setActiveCategory('')
              setFormOpen(false)
              setFormSuccess('')
            }}
            type="button"
          >
            {type.id === 'emergency' && <span className="tab-alert" aria-hidden="true">!</span>}
            {type.label}
          </button>
        ))}
      </div>

      {displayedType !== 'emergency' && displayedType !== 'manual-order' && (
        <section className="listing-category-browser" aria-labelledby="listing-categories-title">
          <div className="listing-category-heading">
            <div>
              <span className="section-kicker">আপনার পছন্দের সেবা</span>
              <h2 id="listing-categories-title">ক্যাটাগরি থেকে খুঁজুন</h2>
            </div>
            {availableCategories.length > 12 && (
              <button
                className="category-show-more"
                onClick={() => setShowAllCategories((current) => !current)}
                type="button"
              >
                {showAllCategories ? 'কম দেখুন' : 'সব ক্যাটাগরি দেখুন'}
              </button>
            )}
          </div>
          <div className="listing-category-grid" role="group" aria-label="ক্যাটাগরি দিয়ে খুঁজুন">
            <button
              aria-pressed={!activeCategory}
              className={`listing-category-card category-tone-0${!activeCategory ? ' active' : ''}`}
              onClick={() => setActiveCategory('')}
              type="button"
            >
              <span className="category-card-icon" aria-hidden="true"><Icon name="building" size={18} /></span>
              <strong>সব ক্যাটাগরি</strong>
              <small>{browseListings.length}টি তথ্য</small>
            </button>
            {shownCategories.map((category, index) => (
              <button
                aria-pressed={activeCategory === category}
                className={`listing-category-card category-tone-${(index % 6) + 1}${activeCategory === category ? ' active' : ''}`}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                <span className="category-card-icon" aria-hidden="true"><Icon name="bag" size={18} /></span>
                <strong>{category}</strong>
                <small>{categoryCounts.get(category) ?? 0}টি তথ্য</small>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="listing-board-heading">
        <div>
          <span className="section-kicker">{selectedCity?.name ?? 'সব শহর'}</span>
          <h2>
            {displayedType === 'manual-order'
              ? `ম্যানুয়াল অর্ডার — ${selectedCity?.englishName ?? 'সব শহর'}`
              : `${listingTypes.find((type) => type.id === displayedType)?.label} খুঁজুন`}
          </h2>
        </div>
        {displayedType !== 'manual-order' && (
          <button className="add-listing-button" onClick={() => {
            setFormOpen(!formOpen)
            setFormSuccess('')
          }} aria-controls={formOpen ? 'add-listing-dialog' : undefined} aria-expanded={formOpen} type="button">
            <span aria-hidden="true">＋</span> তথ্য যোগ করুন
          </button>
        )}
      </div>

      {formSuccess && <p className="form-feedback form-success" role="status">{formSuccess}</p>}

      {displayedType === 'manual-order' && selectedCity && (
        <div
          className="manual-order-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveType('product')
              setActiveCategory('')
            }
          }}
        >
          <section
            aria-labelledby="manual-order-title"
            aria-modal="true"
            className="manual-order-modal"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setActiveType('product')
                setActiveCategory('')
              }
            }}
            role="dialog"
          >
            <button
              aria-label="ম্যানুয়াল অর্ডার বন্ধ করুন"
              autoFocus
              className="manual-order-close"
              onClick={() => {
                setActiveType('product')
                setActiveCategory('')
              }}
              type="button"
            >
              ×
            </button>
            <h2 id="manual-order-title">ম্যানুয়াল অর্ডার — {selectedCity?.englishName ?? 'সব শহর'}</h2>
            <form className="listing-request-form manual-order-form" onSubmit={submitManualOrderForm}>
              <h3>স্থানীয় বাজার থেকে যা কিছু দরকার লিখে দিন। আমাদের টিম ডেলিভারি ম্যানের মাধ্যমে পৌঁছে দেবে।</h3>
              <label>
                আপনার নাম *
                <input
                  autoComplete="name"
                  onChange={(event) => setManualOrderForm({ ...manualOrderForm, customerName: event.target.value })}
                  required
                  value={manualOrderForm.customerName}
                />
              </label>
              <label>
                মোবাইল নম্বর *
                <input
                  autoComplete="tel"
                  inputMode="tel"
                  onChange={(event) => setManualOrderForm({ ...manualOrderForm, phone: event.target.value })}
                  required
                  type="tel"
                  value={manualOrderForm.phone}
                />
              </label>
              <label>
                ডেলিভারি ঠিকানা *
                <textarea
                  onChange={(event) => setManualOrderForm({ ...manualOrderForm, deliveryAddress: event.target.value })}
                  required
                  rows="2"
                  value={manualOrderForm.deliveryAddress}
                />
              </label>
              <label>
                কী কী লাগবে? *
                <textarea
                  onChange={(event) => setManualOrderForm({ ...manualOrderForm, items: event.target.value })}
                  placeholder="পণ্যের নাম ও পরিমাণ লিখুন"
                  required
                  rows="3"
                  value={manualOrderForm.items}
                />
              </label>
              {manualOrderError && <p className="form-feedback form-error" role="alert">{manualOrderError}</p>}
              {manualOrderFeedback && <p className="form-feedback form-success" role="status">{manualOrderFeedback}</p>}
              <button className="button button-primary request-submit" type="submit">অর্ডার পাঠান</button>
            </form>
          </section>
        </div>
      )}

      {formOpen && (
        <AddListingWizard
          categories={categories}
          cities={activeCities}
          initialOwnerType={activeType === 'company' || activeType === 'person' ? activeType : 'person'}
          initialType={activeType === 'service' ? 'service' : 'product'}
          onClose={() => setFormOpen(false)}
          onSubmit={submitListing}
          selectedCity={selectedCity}
        />
      )}

      {displayedType !== 'manual-order' && (
        <div className="listing-results" aria-live="polite">
          {visibleListings.length === 0 ? (
          <div className="listing-empty">
            <span className="empty-search-icon"><Icon name="location" size={27} /></span>
            <h3>এখনো কোনো তথ্য নেই</h3>
            <p>{selectedCity ? `${selectedCity.name} শহরে` : 'সব শহরে'} প্রথম তথ্যটি যোগ করুন। অ্যাডমিন অনুমোদনের পর এটি এখানে দেখা যাবে।</p>
          </div>
          ) : activeCategory ? (
            <div className="listing-filtered-grid">{visibleListings.map(renderListingCard)}</div>
          ) : (
            listingGroups.map((group, index) => (
              <section className="listing-shelf" key={group.category}>
                <header className="listing-shelf-heading">
                  <div>
                    <span className={`listing-shelf-icon category-tone-${(index % 6) + 1}`} aria-hidden="true">
                      <Icon name="building" size={17} />
                    </span>
                    <div>
                      <h3>{group.category}</h3>
                      <span>{group.listings.length}টি তথ্য পাওয়া গেছে</span>
                    </div>
                  </div>
                  <div className="listing-shelf-actions">
                    <button
                      aria-label={`${group.category} ক্যাটাগরির সব তথ্য দেখুন`}
                      className="listing-shelf-more"
                      onClick={() => setActiveCategory(group.category)}
                      type="button"
                    >
                      সব দেখুন <Icon name="arrow" size={15} />
                    </button>
                    <button
                      aria-label={`${group.category} তালিকায় আগের তথ্য`}
                      className="listing-shelf-arrow"
                      onClick={(event) => event.currentTarget.closest('.listing-shelf').querySelector('.listing-shelf-track')?.scrollBy({ left: -300, behavior: 'smooth' })}
                      type="button"
                    >
                      <span aria-hidden="true">‹</span>
                    </button>
                    <button
                      aria-label={`${group.category} তালিকায় পরের তথ্য`}
                      className="listing-shelf-arrow"
                      onClick={(event) => event.currentTarget.closest('.listing-shelf').querySelector('.listing-shelf-track')?.scrollBy({ left: 300, behavior: 'smooth' })}
                      type="button"
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  </div>
                </header>
                <div className="listing-shelf-track">{group.listings.map(renderListingCard)}</div>
              </section>
            ))
          )}
        </div>
      )}
    </section>
  )
}

export default LocalListingBoard
