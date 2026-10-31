import { Link } from 'react-router-dom'
import { useAppData } from '../../context/useAppData.js'
import './CustomerDashboardPage.css'

const requestStatus = {
  pending: { label: 'অনুমোদনের অপেক্ষায়', className: 'pending' },
  approved: { label: 'অনুমোদিত', className: 'approved' },
  rejected: { label: 'অনুমোদিত হয়নি', className: 'rejected' },
}

function CustomerDashboardPage() {
  const { requests } = useAppData()
  const sortedRequests = [...requests].sort((first, second) => (
    new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  ))

  return (
    <section className="customer-dashboard section-wrap">
      <header className="customer-dashboard-heading">
        <div>
          <span className="section-kicker">আপনার কার্যক্রম</span>
          <h1>আমার আবেদন</h1>
          <p>পণ্য বা সেবার জন্য করা আবেদনের অবস্থা এখানে দেখুন।</p>
        </div>
        <Link className="button button-primary" to="/">পণ্য ও সেবা দেখুন</Link>
      </header>

      <div className="customer-request-list">
        {sortedRequests.length === 0 ? (
          <div className="customer-request-empty">
            <span className="empty-search-icon" aria-hidden="true">⌕</span>
            <h2>এখনো কোনো আবেদন নেই</h2>
            <p>আপনার শহরের dashboard থেকে পণ্য বা সেবা বেছে আবেদন করতে পারবেন।</p>
            <Link className="customer-empty-link" to="/">Dashboard-এ যান</Link>
          </div>
        ) : sortedRequests.map((request) => {
          const status = requestStatus[request.status] ?? requestStatus.pending
          return (
            <article className="customer-request-card" key={request.id}>
              <div className="customer-request-top">
                <span className={`request-status ${status.className}`}>{status.label}</span>
                <time dateTime={request.createdAt}>
                  {new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium' }).format(new Date(request.createdAt))}
                </time>
              </div>
              <div className="customer-request-body">
                <div>
                  <span className="customer-request-category">{request.category} · {request.cityName}</span>
                  <h2>{request.listingTitle}</h2>
                  <p>আবেদনকারী: {request.customerName} · যোগাযোগ: {request.phone}</p>
                  {request.message && <p className="customer-request-message">{request.message}</p>}
                </div>
                <span className="customer-request-kind">
                  {request.listingType === 'product' ? 'পণ্য' : 'সেবা'}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default CustomerDashboardPage
