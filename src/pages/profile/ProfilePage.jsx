import { useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAppData } from '../../context/useAppData.js'
import './ProfilePage.css'

function ProfilePage() {
  const { user, profile, updateProfile } = useAppData()
  const imageInput = useRef(null)
  const [details, setDetails] = useState(() => ({
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    image: profile?.image ?? '',
  }))
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  if (!user || !profile) return <Navigate to="/" replace />

  function chooseImage(event) {
    const input = event.currentTarget
    const [file] = input.files ?? []
    if (!file) return
    setError('')
    setFeedback('')

    if (!file.type.startsWith('image/')) {
      setError('শুধু ছবি ফাইল আপলোড করুন।')
      input.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('ছবিটি পড়া যায়নি। আবার চেষ্টা করুন।')
      } else {
        setDetails((current) => ({ ...current, image: reader.result }))
      }
      input.value = ''
    }
    reader.onerror = () => {
      setError('ছবিটি পড়া যায়নি। আবার চেষ্টা করুন।')
      input.value = ''
    }
    reader.readAsDataURL(file)
  }

  function saveProfile(event) {
    event.preventDefault()
    setError('')
    setFeedback('')
    try {
      updateProfile(details)
      setFeedback('আপনার প্রোফাইল আপডেট হয়েছে।')
    } catch (saveError) {
      setError(`প্রোফাইল সংরক্ষণ করা যায়নি: ${saveError.message}`)
    }
  }

  return (
    <section className="profile-page section-wrap">
      <header className="profile-page-heading">
        <div>
          <span className="section-kicker">অ্যাকাউন্ট</span>
          <h1>আমার প্রোফাইল</h1>
          <p>আপনার নাম, ইমেইল ও প্রোফাইল ছবি পরিবর্তন করুন।</p>
        </div>
        <Link className="button button-primary" to="/my-requests">আমার আবেদন</Link>
      </header>

      <form className="profile-edit-card" onSubmit={saveProfile}>
        <div className="profile-photo-section">
          <div className="profile-photo">
            {details.image ? (
              <img src={details.image} alt="প্রোফাইল ছবি" />
            ) : (
              <span aria-hidden="true">{(details.name || details.email || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="profile-photo-copy">
            <strong>প্রোফাইল ছবি</strong>
            <span>আপনার পছন্দের একটি ছবি যোগ করুন।</span>
            <input
              accept="image/*"
              aria-label="প্রোফাইল ছবি নির্বাচন করুন"
              className="profile-image-input"
              onChange={chooseImage}
              ref={imageInput}
              type="file"
            />
            <button className="profile-image-button" onClick={() => imageInput.current?.click()} type="button">
              ছবি বাছাই করুন
            </button>
          </div>
        </div>

        <div className="profile-edit-fields">
          <label>
            আপনার নাম
            <input
              autoComplete="name"
              onChange={(event) => setDetails((current) => ({ ...current, name: event.target.value }))}
              placeholder="আপনার পূর্ণ নাম"
              required
              value={details.name}
            />
          </label>
          <label>
            ইমেইল
            <input
              autoComplete="email"
              onChange={(event) => setDetails((current) => ({ ...current, email: event.target.value }))}
              required
              type="email"
              value={details.email}
            />
          </label>
        </div>

        {error && <p className="profile-feedback profile-error" role="alert">{error}</p>}
        {feedback && <p className="profile-feedback profile-success" role="status">{feedback}</p>}
        <div className="profile-form-actions">
          <button className="button button-primary" type="submit">পরিবর্তন সংরক্ষণ</button>
          <Link className="profile-cancel-link" to="/my-requests">বাতিল</Link>
        </div>
      </form>
    </section>
  )
}

export default ProfilePage
