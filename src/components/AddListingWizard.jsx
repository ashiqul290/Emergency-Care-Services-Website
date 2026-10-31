import { useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { popularCategories, productCategories } from '../data/listingCategories.js'
import './AddListingWizard.css'

const listingChoices = [
  { id: 'product', title: 'পণ্য', subtitle: 'বিক্রির জন্য পণ্য', icon: 'bag' },
  { id: 'service', title: 'সেবা', subtitle: 'দক্ষতা বা সার্ভিস', icon: 'wrench' },
]

const ownerChoices = [
  { id: 'person', title: 'ব্যক্তি', subtitle: 'নিজের নামে', icon: 'user' },
  { id: 'company', title: 'কোম্পানি', subtitle: 'প্রতিষ্ঠানের নামে', icon: 'building' },
]

const steps = ['ধরন', 'যোগাযোগ', 'বিস্তারিত', 'লোকেশন']

async function compressImage(file, maxDimension) {
  const objectUrl = URL.createObjectURL(file)
  const image = new Image()

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = () => reject(new Error('ছবিটি খোলা যায়নি।'))
      image.src = objectUrl
    })

    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
    let width = Math.max(1, Math.round(image.naturalWidth * scale))
    let height = Math.max(1, Math.round(image.naturalHeight * scale))

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('ছবি প্রক্রিয়াকরণ করা যাচ্ছে না।')
      context.drawImage(image, 0, 0, width, height)

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => result ? resolve(result) : reject(new Error('ছবিটি কমপ্রেস করা যায়নি।')),
          'image/webp',
          Math.max(0.5, 0.78 - attempt * 0.05),
        )
      })

      if (blob.size <= 240 * 1024 || attempt === 5) {
        return await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => (
            typeof reader.result === 'string'
              ? resolve(reader.result)
              : reject(new Error('ছবিটি পড়া যায়নি।'))
          )
          reader.onerror = () => reject(new Error('ছবিটি পড়া যায়নি।'))
          reader.readAsDataURL(blob)
        })
      }

      width = Math.max(1, Math.round(width * 0.8))
      height = Math.max(1, Math.round(height * 0.8))
    }

    throw new Error('ছবিটি কমপ্রেস করা যায়নি।')
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function AddListingWizard({
  cities,
  initialOwnerType = 'person',
  initialType = 'product',
  selectedCity,
  onClose,
  onSubmit,
}) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState(initialType)
  const [ownerType, setOwnerType] = useState(initialOwnerType)
  const [cityMode, setCityMode] = useState(selectedCity ? 'specific' : 'all')
  const [citySearch, setCitySearch] = useState('')
  const [form, setForm] = useState({
    title: '',
    submitterName: '',
    category: '',
    description: '',
    phone: '',
    whatsapp: '',
    mapLink: '',
    coordinates: null,
    cityId: selectedCity?.id ?? 'all',
    price: '',
    stock: '',
    image: '',
    ownerImage: '',
  })
  const [error, setError] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const listingImageInputRef = useRef(null)
  const ownerImageInputRef = useRef(null)
  const contactFormRef = useRef(null)
  const detailsFormRef = useRef(null)

  const selectedCityName = cityMode === 'all'
    ? 'সব শহর'
    : cities.find((city) => city.id === form.cityId)?.name
  const filteredCities = cities.filter((city) => (
    `${city.name} ${city.englishName}`.toLocaleLowerCase().includes(citySearch.trim().toLocaleLowerCase())
  ))

  function updateField(event) {
    const { name } = event.target
    let { value } = event.target

    if (name === 'price' || name === 'stock') {
      value = value.replace(/[০-৯]/g, (digit) => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
      value = name === 'price'
        ? value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
        : value.replace(/[^0-9]/g, '')
    }

    setForm((current) => ({ ...current, [name]: value }))
  }

  async function updateImage(event, fieldName) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    setError('')
    if (!file.type.startsWith('image/')) {
      setError('একটি image file বেছে নিন।')
      input.value = ''
      return
    }
    try {
      const compressedImage = await compressImage(file, fieldName === 'ownerImage' ? 480 : 1200)
      setForm((current) => ({ ...current, [fieldName]: compressedImage }))
    } catch (imageError) {
      setError(`ছবিটি প্রস্তুত করা যায়নি: ${imageError.message}`)
    } finally {
      input.value = ''
    }
  }

  function addCurrentLocation() {
    setError('')
    if (!navigator.geolocation) {
      setError('এই ব্রাউজারে বর্তমান লোকেশন নেওয়া যাচ্ছে না।')
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          coordinates: { latitude: coords.latitude, longitude: coords.longitude },
        }))
        setLocationLoading(false)
      },
      (locationError) => {
        setLocationLoading(false)
        if (locationError.code === locationError.PERMISSION_DENIED) {
          setError('লোকেশন ব্যবহারের অনুমতি দিন, অথবা পরে চেষ্টা করুন।')
        } else if (locationError.code === locationError.POSITION_UNAVAILABLE) {
          setError('বর্তমান লোকেশন পাওয়া যায়নি। আবার চেষ্টা করুন।')
        } else if (locationError.code === locationError.TIMEOUT) {
          setError('লোকেশন পেতে সময় বেশি লাগছে। আবার চেষ্টা করুন।')
        } else {
          setError('লোকেশন নেওয়া যায়নি। আবার চেষ্টা করুন।')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  function continueWizard() {
    setError('')
    if (step === 2 && !contactFormRef.current?.reportValidity()) return
    if (step === 3) {
      if (!detailsFormRef.current?.reportValidity()) return
      if (type === 'product') {
        if (!Number.isFinite(Number(form.price))) {
          setError('একটি সঠিক মূল্য লিখুন।')
          return
        }
        if (form.stock && !Number.isSafeInteger(Number(form.stock))) {
          setError('স্টকের পরিমাণটি সঠিক পূর্ণ সংখ্যা লিখুন।')
          return
        }
      }
    }
    setStep((current) => Math.min(current + 1, 4))
  }

  function submitWizard(event) {
    event.preventDefault()
    setError('')
    const city = cityMode === 'all' ? null : cities.find((item) => item.id === form.cityId)

    if (form.mapLink) {
      try {
        const mapUrl = new URL(form.mapLink)
        if (mapUrl.protocol !== 'https:' && mapUrl.protocol !== 'http:') {
          setError('ম্যাপ লিংকে http বা https ঠিকানা ব্যবহার করুন।')
          return
        }
      } catch {
        setError('একটি সঠিক Google Map লিংক লিখুন।')
        return
      }
    }

    if (cityMode === 'specific' && !city) {
      setError('একটি শহর নির্বাচন করুন।')
      return
    }

    try {
      const { whatsapp, mapLink, coordinates, ...listingDetails } = form
      onSubmit({
        ...listingDetails,
        ...(type === 'service' && { whatsapp, mapLink, coordinates }),
        ...(type === 'product' && {
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : '',
        }),
        type,
        ownerType,
        cityId: city?.id ?? 'all',
        cityName: city?.name ?? 'সব শহর',
        createdAt: new Date().toISOString(),
      })
    } catch (submitError) {
      setError(`তথ্য জমা দেওয়া যায়নি: ${submitError.message}`)
    }
  }

  return (
    <div
      className="add-listing-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-labelledby="add-listing-title"
        aria-modal="true"
        className="add-listing-wizard"
        role="dialog"
      >
        <div className="wizard-grabber" aria-hidden="true" />
        <button
          aria-label="ফর্ম বন্ধ করুন"
          className="wizard-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <header className="wizard-header">
          <span className="section-kicker">নতুন তথ্য যোগ করুন</span>
          <h2 id="add-listing-title">পণ্য / সেবা যোগ করুন</h2>
          <p>৪টি সহজ ধাপে জমা দিন — অ্যাডমিন অনুমোদনের পর নির্বাচিত শহরে প্রকাশিত হবে</p>
        </header>

        <div aria-label={`ধাপ ${step} / ৪`} className="wizard-progress">
          {steps.map((label, index) => (
            <div className="wizard-progress-step" key={label}>
              <span className={index < step ? 'complete' : ''} />
              <small>{label}</small>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="wizard-step">
            <h3>আপনি কী যোগ করতে চান?</h3>
            <div className="wizard-choice-grid">
              {listingChoices.map((choice) => (
                <button
                  aria-pressed={type === choice.id}
                  className={`wizard-choice-card${type === choice.id ? ' selected' : ''}`}
                  key={choice.id}
                  onClick={() => {
                    setType(choice.id)
                    setForm((current) => ({ ...current, category: '' }))
                  }}
                  type="button"
                >
                  <Icon name={choice.icon} size={24} />
                  <strong>{choice.title}</strong>
                  <small>{choice.subtitle}</small>
                </button>
              ))}
            </div>
            <h3>আপনি কে?</h3>
            <div className="wizard-choice-grid">
              {ownerChoices.map((choice) => (
                <button
                  aria-pressed={ownerType === choice.id}
                  className={`wizard-choice-card${ownerType === choice.id ? ' selected' : ''}`}
                  key={choice.id}
                  onClick={() => setOwnerType(choice.id)}
                  type="button"
                >
                  <Icon name={choice.icon} size={24} />
                  <strong>{choice.title}</strong>
                  <small>{choice.subtitle}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="wizard-step add-listing-wizard-form" onSubmit={(event) => event.preventDefault()} ref={contactFormRef}>
            <label>
              নাম ({ownerType === 'company' ? 'কোম্পানি' : 'ব্যক্তি'}) *
              <input
                autoComplete={ownerType === 'company' ? 'organization' : 'name'}
                name="submitterName"
                onChange={updateField}
                placeholder={ownerType === 'company' ? 'যেমন: রহিম এন্টারপ্রাইজ' : 'আপনার নাম লিখুন'}
                required
                value={form.submitterName}
              />
            </label>
            <label>
              মোবাইল নম্বর *
              <input
                autoComplete="tel"
                inputMode="tel"
                name="phone"
                onChange={updateField}
                placeholder="01XXXXXXXXX"
                required
                type="tel"
                value={form.phone}
              />
            </label>
            <div className="wizard-image-upload">
              <span>{ownerType === 'company' ? 'কোম্পানির' : 'ব্যক্তির'} ছবি (ঐচ্ছিক)</span>
              <input
                accept="image/*"
                aria-label={`${ownerType === 'company' ? 'কোম্পানির' : 'ব্যক্তির'} ছবি নির্বাচন করুন`}
                className="wizard-image-input"
                onChange={(event) => updateImage(event, 'ownerImage')}
                ref={ownerImageInputRef}
                type="file"
              />
              <button
                className="wizard-image-button"
                onClick={() => ownerImageInputRef.current?.click()}
                type="button"
              >
                {form.ownerImage ? 'অন্য ছবি নির্বাচন করুন' : '＋ ছবি নির্বাচন করুন'}
              </button>
              <small>আপনার বা প্রতিষ্ঠানের পরিচিতির ছবি যোগ করুন</small>
              {form.ownerImage && (
                <div className="wizard-image-preview">
                  <img alt="ব্যক্তি বা প্রতিষ্ঠানের ছবির preview" src={form.ownerImage} />
                  <button
                    onClick={() => {
                      setForm((current) => ({ ...current, ownerImage: '' }))
                      if (ownerImageInputRef.current) ownerImageInputRef.current.value = ''
                    }}
                    type="button"
                  >
                    ছবি সরান
                  </button>
                </div>
              )}
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="wizard-step add-listing-wizard-form" onSubmit={(event) => event.preventDefault()} ref={detailsFormRef}>
            <h3>আপনার {type === 'product' ? 'পণ্যের' : 'সেবার'} বিস্তারিত</h3>
            <label>
              শিরোনাম *
              <input
                name="title"
                onChange={updateField}
                placeholder={type === 'product' ? 'পণ্যের নাম লিখুন' : 'যেমন: রাজশাহীর আম / এসি সার্ভিসিং'}
                required
                value={form.title}
              />
            </label>
            <label>
              ক্যাটাগরি
              <select name="category" onChange={updateField} required value={form.category}>
                <option value="">{type === 'product' ? 'ক্যাটাগরি বাছাই করুন' : 'ক্যাটাগরি বেছে নিন'}</option>
                {(type === 'product' ? productCategories : popularCategories).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              বিস্তারিত বিবরণ
              <textarea
                name="description"
                onChange={updateField}
                placeholder="আপনার পণ্য বা সেবা সম্পর্কে লিখুন"
                required
                rows="3"
                value={form.description}
              />
            </label>
            <div className="wizard-image-upload">
              <span>{type === 'product' ? 'পণ্যের' : 'সেবার'} ছবি (ঐচ্ছিক)</span>
              <input
                accept="image/*"
                aria-label={`${type === 'product' ? 'পণ্য' : 'সেবা'}র ছবি নির্বাচন করুন`}
                className="wizard-image-input"
                onChange={(event) => updateImage(event, 'image')}
                ref={listingImageInputRef}
                type="file"
              />
              <button
                className="wizard-image-button"
                onClick={() => listingImageInputRef.current?.click()}
                type="button"
              >
                {form.image ? 'অন্য ছবি নির্বাচন করুন' : '＋ ছবি নির্বাচন করুন'}
              </button>
              <small>পণ্য বা সেবার জন্য আলাদা ছবি যোগ করুন</small>
              {form.image && (
                <div className="wizard-image-preview">
                  <img alt="পণ্য বা সেবার ছবির preview" src={form.image} />
                  <button
                    onClick={() => {
                      setForm((current) => ({ ...current, image: '' }))
                      if (listingImageInputRef.current) listingImageInputRef.current.value = ''
                    }}
                    type="button"
                  >
                    ছবি সরান
                  </button>
                </div>
              )}
            </div>
            {type === 'product' && (
              <div className="wizard-fields-row">
                <label>
                  মূল্য (৳) *
                  <input
                    inputMode="decimal"
                    name="price"
                    onChange={updateField}
                    placeholder="যেমন: ২৫০"
                    required
                    type="text"
                    value={form.price}
                  />
                </label>
                <label>
                  পরিমাণ / স্টক
                  <input
                    inputMode="numeric"
                    name="stock"
                    onChange={updateField}
                    placeholder="যেমন: ১০"
                    type="text"
                    value={form.stock}
                  />
                </label>
              </div>
            )}
            {type === 'service' && (
              <>
                <label>
                  WhatsApp নম্বর (ঐচ্ছিক)
                  <input
                    autoComplete="tel"
                    inputMode="tel"
                    name="whatsapp"
                    onChange={updateField}
                    placeholder="01XXXXXXXXX"
                    type="tel"
                    value={form.whatsapp}
                  />
                </label>
                <label>
                  Google Map লিংক (ঐচ্ছিক)
                  <input
                    name="mapLink"
                    onChange={updateField}
                    placeholder="https://maps.google.com/..."
                    type="url"
                    value={form.mapLink}
                  />
                </label>
                <div className="wizard-current-location">
                  <span>লোকেশন (ম্যাপে দেখানোর জন্য)</span>
                  <button disabled={locationLoading} onClick={addCurrentLocation} type="button">
                    <Icon name="location" size={16} />
                    {locationLoading ? 'লোকেশন নেওয়া হচ্ছে…' : form.coordinates ? '✓ লোকেশন যুক্ত হয়েছে' : 'বর্তমান লোকেশন যুক্ত করুন'}
                  </button>
                  <small>রাইড সার্ভিস বা দোকানের লোকেশন দিলে সিটি ম্যাপে দেখাবে।</small>
                </div>
              </>
            )}
          </form>
        )}

        {step === 4 && (
          <div className="wizard-step">
            <h3>কোথায় দেখাতে হবে?</h3>
            <div className="wizard-choice-grid">
              <button
                aria-pressed={cityMode === 'all'}
                className={`wizard-choice-card${cityMode === 'all' ? ' selected' : ''}`}
                onClick={() => setCityMode('all')}
                type="button"
              >
                <Icon name="building" size={24} />
                <strong>সব শহর</strong>
                <small>সারা বাংলাদেশে দেখাবে</small>
              </button>
              <button
                aria-pressed={cityMode === 'specific'}
                className={`wizard-choice-card${cityMode === 'specific' ? ' selected' : ''}`}
                onClick={() => {
                  setCityMode('specific')
                  if (form.cityId === 'all') {
                    setForm((current) => ({ ...current, cityId: selectedCity?.id ?? cities[0]?.id ?? '' }))
                  }
                }}
                type="button"
              >
                <Icon name="location" size={24} />
                <strong>নির্দিষ্ট শহর</strong>
                <small>বাছাই করা শহরে দেখাবে</small>
              </button>
            </div>
            {cityMode === 'specific' && (
              <>
                <input
                  aria-label="শহর খুঁজুন"
                  className="wizard-city-search"
                  onChange={(event) => setCitySearch(event.target.value)}
                  placeholder="শহর খুঁজুন..."
                  type="search"
                  value={citySearch}
                />
                <div className="wizard-city-grid">
                  {filteredCities.map((city) => (
                    <button
                      aria-pressed={form.cityId === city.id}
                      className={form.cityId === city.id ? 'selected' : ''}
                      key={city.id}
                      onClick={() => setForm((current) => ({ ...current, cityId: city.id }))}
                      type="button"
                    >
                      {city.englishName}
                    </button>
                  ))}
                  {filteredCities.length === 0 && <p>এই নামে কোনো শহর পাওয়া যায়নি।</p>}
                </div>
              </>
            )}
            <p className="wizard-approval-note">
              জমা দেওয়ার পর অ্যাডমিন অনুমোদন করলে {selectedCityName} পেজে প্রকাশিত হবে।
            </p>
          </div>
        )}

        {error && <p className="form-feedback form-error wizard-error" role="alert">{error}</p>}

        <footer className="wizard-footer">
          {step > 1 ? (
            <button className="wizard-back" onClick={() => {
              setError('')
              setStep((current) => current - 1)
            }} type="button">
              ← আগের ধাপ
            </button>
          ) : <span />}
          {step < 4 ? (
            <button className="wizard-next" onClick={continueWizard} type="button">
              পরের ধাপ <Icon name="arrow" size={17} />
            </button>
          ) : (
            <button className="wizard-next" onClick={submitWizard} type="button">
              অনুমোদনের জন্য জমা দিন
            </button>
          )}
        </footer>
      </section>
    </div>
  )
}

export default AddListingWizard
