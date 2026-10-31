import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import { listingTypes, popularCategories } from '../data/listingCategories.js'
import { useAppData } from '../context/useAppData.js'

function LocalListingBoard() {
  const { cities, listings, selectedCity, addListing, addRequest, user } = useAppData()
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState('product')
  const [formOpen, setFormOpen] = useState(false)
  const [requestingListing, setRequestingListing] = useState(null)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [requestError, setRequestError] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    phone: '',
    cityId: selectedCity?.id ?? '',
  })
  const [requestForm, setRequestForm] = useState({
    customerName: user ?? '',
    phone: '',
    message: '',
  })

  const visibleListings = useMemo(() => listings.filter((listing) => (
    listing.status === 'approved'
    && listing.type === activeType
    && listing.cityId === selectedCity?.id
  )), [activeType, listings, selectedCity])

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function submitListing(event) {
    event.preventDefault()
    setFormError('')
    setFormSuccess('')
    const city = cities.find((item) => item.id === form.cityId)

    if (!city) {
      setFormError('একটি শহর নির্বাচন করুন।')
      return
    }

    try {
      addListing({
        ...form,
        type: activeType,
        cityName: city.name,
        createdAt: new Date().toISOString(),
      })
      setForm({
        title: '',
        category: '',
        description: '',
        phone: '',
        cityId: city.id,
      })
      setFormOpen(false)
      setFormSuccess('আপনার তথ্য জমা হয়েছে। প্রকাশের আগে অ্যাডমিন অনুমোদন করবেন।')
    } catch (error) {
      setFormError(`তথ্য সংরক্ষণ করা যায়নি: ${error.message}`)
    }
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
      })
      setRequestingListing(null)
      setRequestForm({ customerName: user ?? '', phone: '', message: '' })
      navigate('/my-requests')
    } catch (error) {
      setRequestError(`আবেদন জমা দেওয়া যায়নি: ${error.message}`)
    }
  }

  return (
    <section className="listing-board section-wrap">
      <div className="listing-type-tabs" role="tablist" aria-label="তথ্যের ধরন">
        {listingTypes.map((type) => (
          <button
            aria-selected={activeType === type.id}
            className={`listing-type-tab${activeType === type.id ? ' active' : ''}`}
            key={type.id}
            onClick={() => {
              setActiveType(type.id)
              setFormOpen(false)
              setFormSuccess('')
              setFormError('')
            }}
            role="tab"
            type="button"
          >
            {type.id === 'emergency' && <span className="tab-alert" aria-hidden="true">!</span>}
            {type.label}
          </button>
        ))}
      </div>

      <div className="listing-board-heading">
        <div>
          <span className="section-kicker">{selectedCity?.name ?? 'শহর নির্বাচন করুন'}</span>
          <h2>{listingTypes.find((type) => type.id === activeType)?.label} খুঁজুন</h2>
        </div>
        <button className="add-listing-button" onClick={() => {
          setFormOpen(!formOpen)
          setFormError('')
          setFormSuccess('')
          setForm((current) => ({ ...current, cityId: selectedCity?.id ?? '' }))
        }} type="button">
          <span aria-hidden="true">＋</span> তথ্য যোগ করুন
        </button>
      </div>

      {formSuccess && <p className="form-feedback form-success" role="status">{formSuccess}</p>}

      {formOpen && (
        <form className="listing-form" onSubmit={submitListing}>
          <div className="listing-form-heading">
            <div>
              <span className="section-kicker">নতুন তথ্য</span>
              <h3>আপনার তথ্য জমা দিন</h3>
            </div>
            <button className="form-close" onClick={() => setFormOpen(false)} type="button" aria-label="ফর্ম বন্ধ করুন">×</button>
          </div>
          <label>
            নাম / শিরোনাম
            <input autoComplete="organization" name="title" onChange={updateField} required value={form.title} />
          </label>
          <div className="listing-form-row">
            <label>
              ক্যাটাগরি
              <select name="category" onChange={updateField} required value={form.category}>
                <option value="">ক্যাটাগরি বেছে নিন</option>
                {popularCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label>
              শহর
              <select name="cityId" onChange={updateField} required value={form.cityId}>
                {cities.map((city) => <option key={city.id} value={city.id}>{city.name} ({city.englishName})</option>)}
              </select>
            </label>
          </div>
          <label>
            বিবরণ
            <textarea name="description" onChange={updateField} required rows="3" value={form.description} />
          </label>
          <label>
            যোগাযোগ নম্বর
            <input autoComplete="tel" inputMode="tel" name="phone" onChange={updateField} required type="tel" value={form.phone} />
          </label>
          {formError && <p className="form-feedback form-error" role="alert">{formError}</p>}
          <button className="button button-primary listing-submit" type="submit">অনুমোদনের জন্য জমা দিন</button>
          <p className="form-help">জমা দেওয়া তথ্য অ্যাডমিন অনুমোদন করার পর সবার কাছে দেখা যাবে।</p>
        </form>
      )}

      <div className="listing-results" aria-live="polite">
        {visibleListings.length > 0 ? visibleListings.map((listing) => (
          <article className="public-listing-card" key={listing.id}>
            <span className="public-listing-category">{listing.category}</span>
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <div className="public-listing-footer">
              <span><Icon name="location" size={15} />{listing.cityName}</span>
              <a href={`tel:${listing.phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" size={15} />{listing.phone}</a>
            </div>
            {(listing.type === 'product' || listing.type === 'service') && (
              <>
                <button
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
                  <form className="listing-request-form" onSubmit={submitRequest}>
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
        )) : (
          <div className="listing-empty">
            <span className="empty-search-icon"><Icon name="location" size={27} /></span>
            <h3>এখনো কোনো তথ্য নেই</h3>
            <p>{selectedCity?.name ?? 'এই শহরে'} প্রথম তথ্যটি যোগ করুন। অ্যাডমিন অনুমোদনের পর এটি এখানে দেখা যাবে।</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default LocalListingBoard
