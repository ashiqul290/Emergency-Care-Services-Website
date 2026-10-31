import { useState } from 'react'

const staffRoles = [
  { value: 'professional', label: 'পেশাজীবী' },
  { value: 'administrator', label: 'অ্যাডমিন' },
]

function formatUpdatedAt(value) {
  if (!value) return 'এখনো আপডেট হয়নি'
  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function AdminOperationsOverview({
  cities,
  listings,
  requests,
  managedAreas,
  staffAccounts,
  requestOperations,
  addManagedArea,
  updateManagedArea,
  removeManagedArea,
  addStaffAccount,
  removeStaffAccount,
}) {
  const [areaSearch, setAreaSearch] = useState('')
  const [areaMode, setAreaMode] = useState('search')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const [areaEdits, setAreaEdits] = useState({})
  const [staffForm, setStaffForm] = useState({ name: '', email: '', role: 'professional' })
  const [staffFeedback, setStaffFeedback] = useState('')
  const [staffError, setStaffError] = useState('')
  const [operationFeedback, setOperationFeedback] = useState('')
  const [operationError, setOperationError] = useState('')

  const getRequestStatus = (request) => (
    requestOperations[request.id]?.status
    ?? (request.status === 'approved' ? 'completed' : request.status === 'rejected' ? 'cancelled' : 'new')
  )
  const uniqueCustomers = new Set(requests.map((request) => request.customerName.trim()).filter(Boolean)).size
  const nurses = listings.filter((listing) => /nurs|নার্স/i.test(`${listing.title} ${listing.category}`)).length
  const urgentCount = requests.filter((request) => requestOperations[request.id]?.emergencyRequired).length
  const openCount = requests.filter((request) => ['open', 'assigned'].includes(getRequestStatus(request))).length
  const newCount = requests.filter((request) => getRequestStatus(request) === 'new').length
  const providerCount = listings.filter((listing) => (
    listing.ownerType === 'person' || listing.ownerType === 'company'
    || listing.type === 'person' || listing.type === 'company'
  )).length
  const filteredCities = cities.filter((city) => (
    `${city.name} ${city.englishName}`.toLocaleLowerCase().includes(areaSearch.trim().toLocaleLowerCase())
  ))

  function getCurrentLocation() {
    setLocationMessage('')
    if (!navigator.geolocation) {
      setLocationMessage('এই ব্রাউজারে অবস্থান শনাক্ত করার সুবিধা নেই।')
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationMessage(
          `অবস্থান শনাক্ত হয়েছে (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})। তালিকা থেকে কাছের এলাকাটি বেছে নিন। অবস্থান শুধু এই ব্রাউজারেই দেখা হচ্ছে।`,
        )
      },
      (locationError) => {
        const messages = {
          1: 'অবস্থান ব্যবহারের অনুমতি দেওয়া হয়নি।',
          2: 'বর্তমান অবস্থান পাওয়া যায়নি।',
          3: 'অবস্থান শনাক্ত করতে সময় শেষ হয়েছে। আবার চেষ্টা করুন।',
        }
        setLocationMessage(messages[locationError.code] ?? 'অবস্থান শনাক্ত করা যায়নি।')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }

  function addArea(cityId) {
    try {
      addManagedArea(cityId)
      setSelectedCityId('')
      setOperationError('')
      setOperationFeedback('এলাকাটি পরিচালনার তালিকায় যোগ হয়েছে।')
    } catch (error) {
      setOperationError(error.message)
      setOperationFeedback('')
    }
  }

  function saveArea(area) {
    const edits = areaEdits[area.cityId] ?? area
    try {
      updateManagedArea(area.cityId, { status: edits.status, note: edits.note })
      setAreaEdits((current) => {
        const updated = { ...current }
        delete updated[area.cityId]
        return updated
      })
      setOperationError('')
      setOperationFeedback('এলাকার অবস্থা ও নোট সংরক্ষণ হয়েছে।')
    } catch (error) {
      setOperationError(`এলাকার তথ্য সংরক্ষণ করা যায়নি: ${error.message}`)
      setOperationFeedback('')
    }
  }

  function addStaff(event) {
    event.preventDefault()
    setStaffError('')
    setStaffFeedback('')
    try {
      addStaffAccount(staffForm)
      setStaffForm({ name: '', email: '', role: 'professional' })
      setStaffFeedback('টিম তালিকায় অ্যাক্সেস রেকর্ড যোগ হয়েছে।')
    } catch (error) {
      setStaffError(error.message)
    }
  }

  return (
    <div className="admin-operations">
      <section aria-label="সুপার অ্যাডমিন সারাংশ" className="ops-metrics">
        {[
          ['মোট রিকোয়েস্ট', requests.length],
          ['চলমান', openCount],
          ['নতুন', newCount],
          ['জরুরি', urgentCount],
          ['নার্সিং তালিকা', nurses],
          ['প্রোভাইডার', providerCount],
          ['রিভিউ বাকি', listings.filter((listing) => listing.status === 'pending').length],
          ['টিম অ্যাকাউন্ট', staffAccounts.length],
          ['গ্রাহক', uniqueCustomers],
        ].map(([label, value]) => (
          <article className="ops-metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section aria-labelledby="ops-areas-title" className="ops-panel">
        <header className="ops-panel-heading">
          <div>
            <span className="section-kicker">এলাকা পরিচালনা</span>
            <h2 id="ops-areas-title">এলাকার অবস্থা</h2>
            <p>এলাকা অনুযায়ী সেবার অবস্থা ও অপারেশন নোট সংরক্ষণ করুন।</p>
          </div>
          <span className="ops-count">{managedAreas.length}টি এলাকা</span>
        </header>

        {operationError && <p className="ops-feedback is-error" role="alert">{operationError}</p>}
        {operationFeedback && <p className="ops-feedback is-success" role="status">{operationFeedback}</p>}
        {managedAreas.length > 0 ? (
          <div className="ops-area-list">
            {managedAreas.map((area) => {
              const city = cities.find((item) => item.id === area.cityId)
              if (!city) return null
              const edits = areaEdits[area.cityId] ?? area
              return (
                <article className="ops-area-row" key={area.cityId}>
                  <div className="ops-area-name">
                    <strong>{city.name}</strong>
                    <span>{city.englishName}</span>
                    <small>আপডেট: {formatUpdatedAt(area.updatedAt)}</small>
                  </div>
                  <label>
                    অবস্থা
                    <select
                      onChange={(event) => setAreaEdits((current) => ({
                        ...current,
                        [area.cityId]: { ...edits, status: event.target.value },
                      }))}
                      value={edits.status}
                    >
                      <option value="open">চলমান (পাইলট)</option>
                      <option value="limited">সীমিত</option>
                      <option value="paused">সাময়িক বন্ধ</option>
                    </select>
                  </label>
                  <label className="ops-area-note">
                    নোট (ঐচ্ছিক)
                    <input
                      onChange={(event) => setAreaEdits((current) => ({
                        ...current,
                        [area.cityId]: { ...edits, note: event.target.value },
                      }))}
                      placeholder="এলাকার জন্য নোট"
                      value={edits.note}
                    />
                  </label>
                  <button className="ops-primary-button" onClick={() => saveArea(area)} type="button">সংরক্ষণ</button>
                  <button
                    aria-label={`${city.name} পরিচালনার তালিকা থেকে সরান`}
                    className="ops-icon-button"
                    onClick={() => removeManagedArea(area.cityId)}
                    type="button"
                  >
                    সরান
                  </button>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="ops-empty">এখনো কোনো এলাকা বাছাই করা হয়নি। নিচের তালিকা থেকে এলাকা যোগ করুন।</p>
        )}

        <div className="ops-area-finder">
          <div>
            <span className="section-kicker">এলাকা যোগ বা পরিবর্তন</span>
            <h3>এলাকা খুঁজুন</h3>
          </div>
          <div className="ops-mode-tabs" role="group" aria-label="এলাকা খোঁজার পদ্ধতি">
            <button
              aria-pressed={areaMode === 'search'}
              className={areaMode === 'search' ? 'active' : ''}
              onClick={() => setAreaMode('search')}
              type="button"
            >
              নাম দিয়ে খুঁজুন
            </button>
            <button
              aria-pressed={areaMode === 'list'}
              className={areaMode === 'list' ? 'active' : ''}
              onClick={() => setAreaMode('list')}
              type="button"
            >
              তালিকা থেকে বাছুন
            </button>
          </div>
          {areaMode === 'search' ? (
            <label className="ops-search-field">
              <span className="visually-hidden">এলাকা খুঁজুন</span>
              <input
                onChange={(event) => setAreaSearch(event.target.value)}
                placeholder="এলাকার নাম লিখুন..."
                type="search"
                value={areaSearch}
              />
            </label>
          ) : (
            <label className="ops-area-select">
              <span className="visually-hidden">তালিকা থেকে এলাকা বাছুন</span>
              <select onChange={(event) => setSelectedCityId(event.target.value)} value={selectedCityId}>
                <option value="">এলাকা বাছুন</option>
                {cities.map((city) => <option key={city.id} value={city.id}>{city.name} · {city.englishName}</option>)}
              </select>
            </label>
          )}
          {areaMode === 'search' && (
            <div className="ops-city-results">
              {filteredCities.slice(0, 12).map((city) => {
                const alreadyManaged = managedAreas.some((area) => area.cityId === city.id)
                return (
                  <button
                    aria-pressed={selectedCityId === city.id}
                    className={selectedCityId === city.id ? 'selected' : ''}
                    disabled={alreadyManaged}
                    key={city.id}
                    onClick={() => setSelectedCityId(city.id)}
                    type="button"
                  >
                    {city.name}<small>{alreadyManaged ? 'যোগ করা আছে' : city.englishName}</small>
                  </button>
                )
              })}
              {filteredCities.length === 0 && <p className="ops-muted">কোনো এলাকা মেলেনি।</p>}
            </div>
          )}
          <div className="ops-area-tools">
            <button className="ops-primary-button" disabled={!selectedCityId} onClick={() => addArea(selectedCityId)} type="button">
              নির্বাচিত এলাকা যোগ করুন
            </button>
            <button className="ops-secondary-button" onClick={getCurrentLocation} type="button">আমার অবস্থান শনাক্ত করুন</button>
          </div>
          {locationMessage && <p className="ops-muted" role="status">{locationMessage}</p>}
        </div>
      </section>

      <section aria-labelledby="ops-access-title" className="ops-panel ops-access-grid">
        <div className="ops-access-copy">
          <span className="ops-access-icon" aria-hidden="true">◇</span>
          <span className="section-kicker">Role-based access</span>
          <h2 id="ops-access-title">টিম অ্যাক্সেস</h2>
          <p>স্থানীয় demo-তে টিমের নাম, ইমেইল ও দায়িত্বের তালিকা রাখুন। পাসওয়ার্ড বা সংবেদনশীল লগইন তথ্য সংরক্ষণ করা হয় না।</p>
          <ul>
            <li>অ্যাডমিন ও পেশাজীবীর অ্যাক্সেস তালিকা</li>
            <li>এই তালিকা বাস্তব authentication বা permission প্রয়োগ করে না</li>
          </ul>
          {staffAccounts.length > 0 ? (
            <div className="ops-staff-list">
              {staffAccounts.map((staff) => (
                <article key={staff.id}>
                  <div>
                    <strong>{staff.name || staff.email}</strong>
                    <span>{staff.email} · {staffRoles.find((role) => role.value === staff.role)?.label}</span>
                  </div>
                  <button
                    aria-label={`${staff.email} টিম তালিকা থেকে সরান`}
                    className="ops-icon-button"
                    onClick={() => removeStaffAccount(staff.id)}
                    type="button"
                  >
                    সরান
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="ops-muted">এখনো কোনো টিম অ্যাক্সেস রেকর্ড নেই।</p>
          )}
        </div>
        <form className="ops-staff-form" onSubmit={addStaff}>
          <h3>টিম রেকর্ড যোগ করুন</h3>
          <label>
            নাম
            <input
              onChange={(event) => setStaffForm((current) => ({ ...current, name: event.target.value }))}
              required
              value={staffForm.name}
            />
          </label>
          <label>
            কাজের ইমেইল
            <input
              autoComplete="email"
              onChange={(event) => setStaffForm((current) => ({ ...current, email: event.target.value }))}
              required
              type="email"
              value={staffForm.email}
            />
          </label>
          <label>
            দায়িত্ব
            <select
              onChange={(event) => setStaffForm((current) => ({ ...current, role: event.target.value }))}
              value={staffForm.role}
            >
              {staffRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </label>
          {staffError && <p className="ops-feedback is-error" role="alert">{staffError}</p>}
          {staffFeedback && <p className="ops-feedback is-success" role="status">{staffFeedback}</p>}
          <button className="ops-primary-button" type="submit">টিম রেকর্ড যোগ করুন <span aria-hidden="true">→</span></button>
        </form>
      </section>
    </div>
  )
}

export default AdminOperationsOverview
