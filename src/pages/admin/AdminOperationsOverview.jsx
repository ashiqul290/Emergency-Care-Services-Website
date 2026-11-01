import { useState } from 'react'

const staffRoles = [
  { value: 'professional', label: 'পেশাজীবী' },
  { value: 'administrator', label: 'অ্যাডমিন' },
]

function AdminOperationsOverview({
  listings,
  requests,
  staffAccounts,
  accounts,
  requestOperations,
  addStaffAccount,
  removeStaffAccount,
  updateAccountRole,
}) {
  const [staffForm, setStaffForm] = useState({ name: '', email: '', role: 'professional' })
  const [staffFeedback, setStaffFeedback] = useState('')
  const [staffError, setStaffError] = useState('')
  const [accountError, setAccountError] = useState('')

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

  function changeAccountRole(email, role) {
    setAccountError('')
    try {
      updateAccountRole(email, role)
    } catch (error) {
      setAccountError(error.message)
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

      <section aria-labelledby="ops-accounts-title" className="ops-panel">
        <header className="ops-panel-heading">
          <div>
            <span className="section-kicker">ডেমো অ্যাকাউন্ট পরিচালনা</span>
            <h2 id="ops-accounts-title">অ্যাকাউন্টের role</h2>
            <p>নিবন্ধিত local demo account-গুলোর dashboard role নির্ধারণ করুন।</p>
          </div>
          <span className="ops-count">{accounts.length}টি অ্যাকাউন্ট</span>
        </header>
        <p className="ops-muted">এটি শুধু এই browser-এ কাজ করে; বাস্তব অনুমতি ও নিরাপত্তার জন্য backend প্রয়োজন।</p>
        {accountError && <p className="ops-feedback is-error" role="alert">{accountError}</p>}
        {accounts.length === 0 ? (
          <p className="ops-empty">এখনো কোনো demo account তৈরি হয়নি।</p>
        ) : (
          <div className="ops-staff-list">
            {accounts.map((account) => (
              <article key={account.email}>
                <div>
                  <strong>{account.name || account.email}</strong>
                  <span>{account.email}</span>
                </div>
                <label>
                  <span className="visually-hidden">{account.email} account role</span>
                  <select
                    disabled={account.email === 'ashiquldeveloper11@gmail.com'}
                    onChange={(event) => changeAccountRole(account.email, event.target.value)}
                    value={account.role}
                  >
                    <option value="user">ব্যবহারকারী</option>
                    <option value="customer">কাস্টমার</option>
                    <option value="provider">প্রোভাইডার</option>
                    <option value="admin">অ্যাডমিন</option>
                    {account.role === 'superadmin' && <option value="superadmin">সুপার অ্যাডমিন</option>}
                  </select>
                </label>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminOperationsOverview
