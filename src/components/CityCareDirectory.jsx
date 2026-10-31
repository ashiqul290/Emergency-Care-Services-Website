import { useState } from 'react'
import { useAppData } from '../context/useAppData.js'
import { popularCategories } from '../data/listingCategories.js'

function CityCareDirectory() {
  const { cities, chooseCity, selectedCity } = useAppData()
  const [categorySearch, setCategorySearch] = useState('')
  const shownCategories = popularCategories.filter((category) => (
    category.toLocaleLowerCase().includes(categorySearch.trim().toLocaleLowerCase())
  ))

  return (
    <section className="city-care-directory">
      <div className="section-wrap">
        <div className="city-care-heading">
          <span className="section-kicker">আপনার এলাকার তথ্য</span>
          <h2>City Care — সারা বাংলাদেশের শহরভিত্তিক পণ্য ও সেবা</h2>
          <p>আপনার শহর বেছে নিন — City Care-তে বাংলাদেশের প্রতিটি জেলার পণ্য, সেবা, দোকান, কোম্পানি, ডাক্তার, বাসা ভাড়া ও জরুরি নম্বর পাবেন।</p>
        </div>

        <div className="directory-block">
          <h3>সব শহর ও জেলা</h3>
          <div className="city-chip-list">
            {cities.map((city) => (
              <button
                className={`directory-chip${city.id === selectedCity?.id ? ' active' : ''}`}
                key={city.id}
                onClick={() => chooseCity(city.id)}
                type="button"
              >
                {city.name} <span>({city.englishName})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="directory-block category-directory">
          <div className="category-directory-heading">
            <h3>জনপ্রিয় সেবা ও পণ্য ক্যাটাগরি</h3>
            <label className="category-search">
              <span className="visually-hidden">ক্যাটাগরি খুঁজুন</span>
              <input
                onChange={(event) => setCategorySearch(event.target.value)}
                placeholder="ক্যাটাগরি খুঁজুন..."
                type="search"
                value={categorySearch}
              />
            </label>
          </div>
          <div className="category-chip-list">
            {shownCategories.map((category) => (
              <span className="category-chip" key={category}>{category}</span>
            ))}
            {shownCategories.length === 0 && <p className="no-category-results">এই নামে কোনো ক্যাটাগরি পাওয়া যায়নি।</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CityCareDirectory
