import { useState } from 'react'
import Icon from '../../components/Icon.jsx'

const iconOptions = [
  { value: 'phone', label: 'ফোন' },
  { value: 'fire', label: 'আগুন ও উদ্ধার' },
  { value: 'shield', label: 'নিরাপত্তা' },
  { value: 'child', label: 'শিশু সহায়তা' },
  { value: 'ambulance', label: 'অ্যাম্বুলেন্স' },
]

const emptyService = {
  category: '',
  title: '',
  description: '',
  number: '',
  dialNumber: '',
  icon: 'phone',
}

function EmergencyServiceManagement({
  services,
  hiddenServiceIds,
  onAdd,
  onUpdate,
  onRemove,
  onHide,
  onRestore,
}) {
  const [form, setForm] = useState(emptyService)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  function resetForm() {
    setForm(emptyService)
    setEditingId('')
  }

  function submitService(event) {
    event.preventDefault()
    setError('')
    setFeedback('')
    const service = {
      ...form,
      category: form.category.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      number: form.number.trim(),
      dialNumber: form.dialNumber.trim().replace(/[^\d+]/g, ''),
    }

    if (!service.category || !service.title || !service.description || !service.number || !service.dialNumber) {
      setError('সব ঘর পূরণ করুন এবং কল করার নম্বর দিন।')
      return
    }
    if (!/^\+?\d{3,15}$/.test(service.dialNumber)) {
      setError('কল করার নম্বরটি ৩ থেকে ১৫টি সংখ্যার মধ্যে লিখুন।')
      return
    }

    try {
      if (editingId) {
        onUpdate(editingId, service)
        setFeedback('জরুরি সেবার কার্ড আপডেট হয়েছে।')
      } else {
        onAdd(service)
        setFeedback('নতুন জরুরি সেবার কার্ড যোগ হয়েছে।')
      }
      resetForm()
    } catch (saveError) {
      setError(`কার্ড সংরক্ষণ করা যায়নি: ${saveError.message}`)
    }
  }

  function editService(service) {
    setForm({
      category: service.category,
      title: service.title,
      description: service.description,
      number: service.number,
      dialNumber: service.dialNumber,
      icon: service.icon,
    })
    setEditingId(service.id)
    setError('')
    setFeedback('')
  }

  function deleteService(service) {
    if (!window.confirm(`“${service.title}” কার্ডটি স্থায়ীভাবে মুছবেন?`)) return
    try {
      onRemove(service.id)
      if (editingId === service.id) resetForm()
      setError('')
      setFeedback('জরুরি সেবার কার্ড মুছে দেওয়া হয়েছে।')
    } catch (removeError) {
      setError(`কার্ড মুছে ফেলা যায়নি: ${removeError.message}`)
    }
  }

  return (
    <div className="admin-operations">
      <section aria-labelledby="emergency-service-management-title" className="ops-panel">
        <header className="ops-panel-heading">
          <div>
            <span className="section-kicker">জরুরি সেবা পরিচালনা</span>
            <h2 id="emergency-service-management-title">জনপ্রিয় জরুরি সেবা কার্ড</h2>
            <p>এখানে যোগ বা পরিবর্তন করা কার্ড হোম ড্যাশবোর্ড ও জরুরি সেবার তালিকায় দেখা যাবে।</p>
          </div>
          <span className="ops-count">
            {services.filter((service) => !hiddenServiceIds.includes(service.id)).length}টি প্রকাশিত
          </span>
        </header>

        {error && <p className="ops-feedback is-error" role="alert">{error}</p>}
        {feedback && <p className="ops-feedback is-success" role="status">{feedback}</p>}

        <div className="ops-emergency-list">
          {services.length > 0 ? services.map((service) => {
            const isHidden = hiddenServiceIds.includes(service.id)
            return (
              <article className={`ops-emergency-card${isHidden ? ' is-hidden' : ''}`} key={service.id}>
                <span className="ops-service-icon"><Icon name={service.icon} size={18} /></span>
                <div className="ops-emergency-copy">
                  <span>{service.category}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <a className="ops-emergency-number" href={`tel:${service.dialNumber}`}>{service.number}</a>
                <span className={`ops-status-badge ${isHidden ? 'status-cancelled' : 'status-completed'}`}>
                  {isHidden ? 'লুকানো' : 'প্রকাশিত'}
                </span>
                <div className="ops-form-actions">
                  <button className="ops-secondary-button" onClick={() => editService(service)} type="button">সম্পাদনা</button>
                  {isHidden ? (
                    <button className="ops-primary-button" onClick={() => onRestore(service.id)} type="button">প্রকাশ করুন</button>
                  ) : (
                    <button className="ops-secondary-button" onClick={() => onHide(service.id)} type="button">লুকান</button>
                  )}
                  <button
                    aria-label={`${service.title} কার্ড মুছুন`}
                    className="ops-icon-button"
                    onClick={() => deleteService(service)}
                    type="button"
                  >
                    মুছুন
                  </button>
                </div>
              </article>
            )
          }) : (
            <p className="ops-empty">এখনো কোনো জরুরি সেবার কার্ড নেই। নিচের ফর্ম থেকে যোগ করুন।</p>
          )}
        </div>
      </section>

      <section aria-labelledby="emergency-service-form-title" className="ops-panel">
        <header className="ops-panel-heading">
          <div>
            <span className="section-kicker">{editingId ? 'কার্ড সম্পাদনা' : 'নতুন কার্ড'}</span>
            <h2 id="emergency-service-form-title">{editingId ? 'জরুরি সেবার তথ্য আপডেট করুন' : 'জরুরি সেবার কার্ড যোগ করুন'}</h2>
          </div>
        </header>
        <form className="ops-emergency-form" onSubmit={submitService}>
          <label>
            ক্যাটাগরি
            <input
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="যেমন: আগুন ও উদ্ধার"
              required
              value={form.category}
            />
          </label>
          <label>
            সেবার নাম
            <input
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="যেমন: ফায়ার সার্ভিস"
              required
              value={form.title}
            />
          </label>
          <label className="ops-emergency-description">
            বিবরণ
            <textarea
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="এই নম্বরে কী ধরনের সহায়তা পাওয়া যায়?"
              required
              rows="3"
              value={form.description}
            />
          </label>
          <label>
            দেখানোর নম্বর
            <input
              onChange={(event) => setForm((current) => ({ ...current, number: event.target.value }))}
              placeholder="যেমন: ১০২"
              required
              value={form.number}
            />
          </label>
          <label>
            কল করার নম্বর
            <input
              inputMode="tel"
              onChange={(event) => setForm((current) => ({ ...current, dialNumber: event.target.value }))}
              placeholder="যেমন: 102"
              required
              value={form.dialNumber}
            />
          </label>
          <label>
            আইকন
            <select
              onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
              value={form.icon}
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <div className="ops-form-actions ops-emergency-form-actions">
            <button className="ops-primary-button" type="submit">{editingId ? 'পরিবর্তন সংরক্ষণ' : 'কার্ড যোগ করুন'}</button>
            {editingId && (
              <button className="ops-secondary-button" onClick={resetForm} type="button">সম্পাদনা বাতিল</button>
            )}
          </div>
        </form>
        <p className="ops-muted">
          জাতীয় জরুরি সেবা ৯৯৯-এর হিরো ও ফুটার কল-লিংক আলাদা; ৯৯৯ কার্ড মুছলেও সেগুলো সচল থাকবে।
        </p>
      </section>
    </div>
  )
}

export default EmergencyServiceManagement
