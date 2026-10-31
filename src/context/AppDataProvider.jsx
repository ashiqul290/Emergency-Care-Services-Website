import { useState } from 'react'
import { initialCities } from '../data/cities.js'
import { AppDataContext } from './appDataContext.js'

const CITIES_KEY = 'city-care-cities'
const LISTINGS_KEY = 'city-care-listings'
const REQUESTS_KEY = 'city-care-requests'
const SELECTED_CITY_KEY = 'city-care-selected-city'
const DEMO_USER_KEY = 'city-care-demo-user'
const ALL_CITIES_ID = 'all'

function readStoredArray(key, fallback) {
  const stored = window.localStorage.getItem(key)
  if (!stored) return fallback

  const value = JSON.parse(stored)
  return Array.isArray(value) ? value : fallback
}

export function AppDataProvider({ children }) {
  const [cities, setCities] = useState(() => readStoredArray(CITIES_KEY, initialCities))
  const [listings, setListings] = useState(() => readStoredArray(LISTINGS_KEY, []))
  const [requests, setRequests] = useState(() => readStoredArray(REQUESTS_KEY, []))
  const [selectedCityId, setSelectedCityId] = useState(() => (
    window.localStorage.getItem(SELECTED_CITY_KEY) || 'dhaka'
  ))
  const [user, setUser] = useState(() => window.localStorage.getItem(DEMO_USER_KEY))

  const selectedCity = selectedCityId === ALL_CITIES_ID
    ? null
    : cities.find((city) => city.id === selectedCityId) ?? cities[0]

  function chooseCity(cityId) {
    window.localStorage.setItem(SELECTED_CITY_KEY, cityId)
    setSelectedCityId(cityId)
  }

  function addCity(city) {
    const updatedCities = [...cities, city]
    window.localStorage.setItem(CITIES_KEY, JSON.stringify(updatedCities))
    setCities(updatedCities)
  }

  function removeCity(cityId) {
    const updatedCities = cities.filter((city) => city.id !== cityId)
    if (updatedCities.length === 0) throw new Error('অন্তত একটি শহর তালিকায় রাখতে হবে।')
    window.localStorage.setItem(CITIES_KEY, JSON.stringify(updatedCities))
    setCities(updatedCities)
    if (selectedCityId === cityId && updatedCities.length > 0) {
      chooseCity(updatedCities[0].id)
    }
  }

  function addListing(listing) {
    const updatedListings = [{ ...listing, id: crypto.randomUUID(), status: 'pending' }, ...listings]
    window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(updatedListings))
    setListings(updatedListings)
  }

  function updateListingStatus(listingId, status) {
    const updatedListings = listings.map((listing) => (
      listing.id === listingId ? { ...listing, status } : listing
    ))
    window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(updatedListings))
    setListings(updatedListings)
  }

  function removeListing(listingId) {
    const updatedListings = listings.filter((listing) => listing.id !== listingId)
    window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(updatedListings))
    setListings(updatedListings)
  }

  function addRequest(request) {
    const updatedRequests = [{
      ...request,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }, ...requests]
    window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(updatedRequests))
    setRequests(updatedRequests)
  }

  function updateRequestStatus(requestId, status) {
    const updatedRequests = requests.map((request) => (
      request.id === requestId ? { ...request, status } : request
    ))
    window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(updatedRequests))
    setRequests(updatedRequests)
  }

  function removeRequest(requestId) {
    const updatedRequests = requests.filter((request) => request.id !== requestId)
    window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(updatedRequests))
    setRequests(updatedRequests)
  }

  function login(email, displayName = '') {
    const signedInAs = displayName || email
    window.localStorage.setItem(DEMO_USER_KEY, signedInAs)
    setUser(signedInAs)
  }

  function logout() {
    window.localStorage.removeItem(DEMO_USER_KEY)
    setUser(null)
  }

  const value = {
    cities,
    listings,
    requests,
    selectedCity,
    selectedCityId,
    chooseCity,
    addCity,
    removeCity,
    addListing,
    updateListingStatus,
    removeListing,
    addRequest,
    updateRequestStatus,
    removeRequest,
    user,
    login,
    logout,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
