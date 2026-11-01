import { useState } from 'react'
import { initialCities } from '../data/cities.js'
import { emergencyServices as initialEmergencyServices } from '../data/emergencyServices.js'
import { popularCategories, productCategories } from '../data/listingCategories.js'
import { AppDataContext } from './appDataContext.js'

const CITIES_KEY = 'city-care-cities'
const LISTINGS_KEY = 'city-care-listings'
const REQUESTS_KEY = 'city-care-requests'
const SELECTED_CITY_KEY = 'city-care-selected-city'
const DEMO_USER_KEY = 'city-care-demo-user'
const DEMO_PROFILE_KEY = 'city-care-demo-profile'
const DEMO_ACCOUNTS_KEY = 'city-care-demo-accounts'
const ADMIN_AREAS_KEY = 'city-care-admin-areas'
const ADMIN_OPERATIONS_KEY = 'city-care-admin-operations'
const ADMIN_STAFF_KEY = 'city-care-admin-staff'
const EMERGENCY_SERVICES_KEY = 'city-care-emergency-services'
const HIDDEN_EMERGENCY_SERVICES_KEY = 'city-care-hidden-emergency-services'
const LISTING_CATEGORIES_KEY = 'city-care-listing-categories'
const ALL_CITIES_ID = 'all'
const SUPERADMIN_EMAIL = 'ashiquldeveloper11@gmail.com'
const ACCOUNT_ROLES = ['superadmin', 'admin', 'customer', 'provider', 'user']
const SIGNUP_ROLES = ['customer', 'provider', 'user']

function readStoredArray(key, fallback) {
  const stored = window.localStorage.getItem(key)
  if (!stored) return fallback

  const value = JSON.parse(stored)
  return Array.isArray(value) ? value : fallback
}

function readStoredCategories() {
  const stored = window.localStorage.getItem(LISTING_CATEGORIES_KEY)
  if (!stored) {
    return { product: productCategories, service: popularCategories }
  }

  const value = JSON.parse(stored)
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('সংরক্ষিত ক্যাটাগরির তথ্য সঠিক নয়।')
  }

  return {
    product: Array.isArray(value.product) ? value.product : productCategories,
    service: Array.isArray(value.service) ? value.service : popularCategories,
  }
}

export function AppDataProvider({ children }) {
  const [cities, setCities] = useState(() => (
    readStoredArray(CITIES_KEY, initialCities).map((city) => ({ ...city, active: city.active !== false }))
  ))
  const [listings, setListings] = useState(() => readStoredArray(LISTINGS_KEY, []))
  const [requests, setRequests] = useState(() => readStoredArray(REQUESTS_KEY, []))
  const [categories, setCategories] = useState(readStoredCategories)
  const [emergencyServices, setEmergencyServices] = useState(() => (
    readStoredArray(EMERGENCY_SERVICES_KEY, initialEmergencyServices)
  ))
  const [managedAreas, setManagedAreas] = useState(() => readStoredArray(ADMIN_AREAS_KEY, []))
  const [staffAccounts, setStaffAccounts] = useState(() => readStoredArray(ADMIN_STAFF_KEY, []))
  const [hiddenEmergencyServiceIds, setHiddenEmergencyServiceIds] = useState(() => (
    readStoredArray(HIDDEN_EMERGENCY_SERVICES_KEY, [])
  ))
  const [requestOperations, setRequestOperations] = useState(() => {
    const stored = window.localStorage.getItem(ADMIN_OPERATIONS_KEY)
    if (!stored) return {}
    const value = JSON.parse(stored)
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  })
  const [selectedCityId, setSelectedCityId] = useState(() => (
    window.localStorage.getItem(SELECTED_CITY_KEY) || 'dhaka'
  ))
  const [user, setUser] = useState(() => window.localStorage.getItem(DEMO_USER_KEY))
  const [accounts, setAccounts] = useState(() => readStoredArray(DEMO_ACCOUNTS_KEY, []))
  const [profile, setProfile] = useState(() => {
    const storedProfile = window.localStorage.getItem(DEMO_PROFILE_KEY)
    if (storedProfile) {
      const value = JSON.parse(storedProfile)
      if (value && typeof value.email === 'string') {
        return {
          ...value,
          role: value.role ?? (value.email.toLowerCase() === SUPERADMIN_EMAIL ? 'superadmin' : 'user'),
        }
      }
    }

    const storedUser = window.localStorage.getItem(DEMO_USER_KEY)
    if (!storedUser) return null
    return {
      name: storedUser.includes('@') ? '' : storedUser,
      email: storedUser.includes('@') ? storedUser : '',
      image: '',
      role: storedUser.toLowerCase() === SUPERADMIN_EMAIL ? 'superadmin' : 'user',
    }
  })

  const activeCities = cities.filter((city) => city.active !== false)
  const selectedCity = selectedCityId === ALL_CITIES_ID
    ? null
    : activeCities.find((city) => city.id === selectedCityId) ?? activeCities[0] ?? null

  function chooseCity(cityId) {
    window.localStorage.setItem(SELECTED_CITY_KEY, cityId)
    setSelectedCityId(cityId)
  }

  function addCity(city) {
    const updatedCities = [...cities, { ...city, active: true }]
    window.localStorage.setItem(CITIES_KEY, JSON.stringify(updatedCities))
    setCities(updatedCities)
  }

  function toggleCityActive(cityId) {
    const city = cities.find((item) => item.id === cityId)
    if (!city) throw new Error('শহরটি তালিকায় পাওয়া যায়নি।')

    const active = city.active === false
    const updatedCities = cities.map((item) => (
      item.id === cityId ? { ...item, active } : item
    ))
    window.localStorage.setItem(CITIES_KEY, JSON.stringify(updatedCities))
    setCities(updatedCities)

    if (!active && selectedCityId === cityId) {
      const nextActiveCity = updatedCities.find((item) => item.active !== false)
      chooseCity(nextActiveCity?.id ?? ALL_CITIES_ID)
    }
  }

  function removeCity(cityId) {
    const updatedCities = cities.filter((city) => city.id !== cityId)
    if (updatedCities.length === 0) throw new Error('অন্তত একটি শহর তালিকায় রাখতে হবে।')
    window.localStorage.setItem(CITIES_KEY, JSON.stringify(updatedCities))
    setCities(updatedCities)
    if (selectedCityId === cityId && updatedCities.length > 0) {
      chooseCity(updatedCities.find((city) => city.active !== false)?.id ?? ALL_CITIES_ID)
    }
  }

  function addCategory(type, name) {
    if (!['product', 'service'].includes(type)) throw new Error('একটি বৈধ ক্যাটাগরির ধরন বেছে নিন।')
    const normalizedName = name.trim()
    if (!normalizedName) throw new Error('ক্যাটাগরির নাম লিখুন।')
    if (categories[type].some((category) => category.toLocaleLowerCase() === normalizedName.toLocaleLowerCase())) {
      throw new Error('এই ক্যাটাগরিটি আগে থেকেই আছে।')
    }

    const updatedCategories = {
      ...categories,
      [type]: [...categories[type], normalizedName],
    }
    window.localStorage.setItem(LISTING_CATEGORIES_KEY, JSON.stringify(updatedCategories))
    setCategories(updatedCategories)
  }

  function updateCategory(type, currentName, nextName) {
    if (!['product', 'service'].includes(type)) throw new Error('একটি বৈধ ক্যাটাগরির ধরন বেছে নিন।')
    const normalizedName = nextName.trim()
    if (!normalizedName) throw new Error('ক্যাটাগরির নাম লিখুন।')
    if (!categories[type].includes(currentName)) throw new Error('ক্যাটাগরিটি তালিকায় পাওয়া যায়নি।')
    if (categories[type].some((category) => (
      category !== currentName && category.toLocaleLowerCase() === normalizedName.toLocaleLowerCase()
    ))) {
      throw new Error('এই নামে আরেকটি ক্যাটাগরি আগে থেকেই আছে।')
    }

    const updatedCategories = {
      ...categories,
      [type]: categories[type].map((category) => category === currentName ? normalizedName : category),
    }
    const updatedListings = listings.map((listing) => (
      listing.type === type && listing.category === currentName
        ? { ...listing, category: normalizedName }
        : listing
    ))
    window.localStorage.setItem(LISTING_CATEGORIES_KEY, JSON.stringify(updatedCategories))
    if (updatedListings.some((listing, index) => listing !== listings[index])) {
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(updatedListings))
      setListings(updatedListings)
    }
    setCategories(updatedCategories)
  }

  function removeCategory(type, name) {
    if (!['product', 'service'].includes(type)) throw new Error('একটি বৈধ ক্যাটাগরির ধরন বেছে নিন।')
    if (!categories[type].includes(name)) throw new Error('ক্যাটাগরিটি তালিকায় পাওয়া যায়নি।')
    if (categories[type].length <= 1) throw new Error('অন্তত একটি ক্যাটাগরি রাখতে হবে।')

    const updatedCategories = {
      ...categories,
      [type]: categories[type].filter((category) => category !== name),
    }
    window.localStorage.setItem(LISTING_CATEGORIES_KEY, JSON.stringify(updatedCategories))
    setCategories(updatedCategories)
  }

  function addManagedArea(cityId) {
    if (!cities.some((city) => city.id === cityId)) {
      throw new Error('তালিকা থেকে একটি বৈধ এলাকা বেছে নিন।')
    }
    if (managedAreas.some((area) => area.cityId === cityId)) {
      throw new Error('এলাকাটি ইতিমধ্যে পরিচালনার তালিকায় আছে।')
    }

    const updatedAreas = [
      ...managedAreas,
      { cityId, status: 'open', note: '', updatedAt: new Date().toISOString() },
    ]
    window.localStorage.setItem(ADMIN_AREAS_KEY, JSON.stringify(updatedAreas))
    setManagedAreas(updatedAreas)
  }

  function updateManagedArea(cityId, updates) {
    const updatedAreas = managedAreas.map((area) => (
      area.cityId === cityId
        ? { ...area, ...updates, updatedAt: new Date().toISOString() }
        : area
    ))
    if (!updatedAreas.some((area) => area.cityId === cityId)) {
      throw new Error('পরিচালিত এলাকাটি খুঁজে পাওয়া যায়নি।')
    }
    window.localStorage.setItem(ADMIN_AREAS_KEY, JSON.stringify(updatedAreas))
    setManagedAreas(updatedAreas)
  }

  function removeManagedArea(cityId) {
    const updatedAreas = managedAreas.filter((area) => area.cityId !== cityId)
    window.localStorage.setItem(ADMIN_AREAS_KEY, JSON.stringify(updatedAreas))
    setManagedAreas(updatedAreas)
  }

  function addStaffAccount(account) {
    const email = account.email.trim().toLowerCase()
    if (!email) throw new Error('একটি বৈধ ইমেইল লিখুন।')
    if (staffAccounts.some((staff) => staff.email === email)) {
      throw new Error('এই ইমেইলটি ইতিমধ্যে টিম তালিকায় আছে।')
    }

    const updatedStaff = [
      ...staffAccounts,
      {
        id: crypto.randomUUID(),
        name: account.name.trim(),
        email,
        role: account.role,
        createdAt: new Date().toISOString(),
      },
    ]
    window.localStorage.setItem(ADMIN_STAFF_KEY, JSON.stringify(updatedStaff))
    setStaffAccounts(updatedStaff)
  }

  function removeStaffAccount(staffId) {
    const updatedStaff = staffAccounts.filter((staff) => staff.id !== staffId)
    window.localStorage.setItem(ADMIN_STAFF_KEY, JSON.stringify(updatedStaff))
    setStaffAccounts(updatedStaff)
  }

  function hideEmergencyService(serviceId) {
    if (hiddenEmergencyServiceIds.includes(serviceId)) return
    const updatedIds = [...hiddenEmergencyServiceIds, serviceId]
    window.localStorage.setItem(HIDDEN_EMERGENCY_SERVICES_KEY, JSON.stringify(updatedIds))
    setHiddenEmergencyServiceIds(updatedIds)
  }

  function addEmergencyService(service) {
    const updatedServices = [{ ...service, id: crypto.randomUUID(), featured: false }, ...emergencyServices]
    window.localStorage.setItem(EMERGENCY_SERVICES_KEY, JSON.stringify(updatedServices))
    setEmergencyServices(updatedServices)
  }

  function updateEmergencyService(serviceId, updates) {
    const updatedServices = emergencyServices.map((service) => (
      service.id === serviceId ? { ...service, ...updates } : service
    ))
    if (!updatedServices.some((service) => service.id === serviceId)) {
      throw new Error('জরুরি সেবার কার্ডটি খুঁজে পাওয়া যায়নি।')
    }
    window.localStorage.setItem(EMERGENCY_SERVICES_KEY, JSON.stringify(updatedServices))
    setEmergencyServices(updatedServices)
  }

  function removeEmergencyService(serviceId) {
    const updatedServices = emergencyServices.filter((service) => service.id !== serviceId)
    window.localStorage.setItem(EMERGENCY_SERVICES_KEY, JSON.stringify(updatedServices))
    setEmergencyServices(updatedServices)
    const updatedHiddenIds = hiddenEmergencyServiceIds.filter((id) => id !== serviceId)
    window.localStorage.setItem(HIDDEN_EMERGENCY_SERVICES_KEY, JSON.stringify(updatedHiddenIds))
    setHiddenEmergencyServiceIds(updatedHiddenIds)
  }

  function restoreEmergencyService(serviceId) {
    const updatedIds = hiddenEmergencyServiceIds.filter((id) => id !== serviceId)
    window.localStorage.setItem(HIDDEN_EMERGENCY_SERVICES_KEY, JSON.stringify(updatedIds))
    setHiddenEmergencyServiceIds(updatedIds)
  }

  function updateRequestOperation(requestId, updates) {
    const updatedOperations = {
      ...requestOperations,
      [requestId]: {
        ...requestOperations[requestId],
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    }
    window.localStorage.setItem(ADMIN_OPERATIONS_KEY, JSON.stringify(updatedOperations))
    setRequestOperations(updatedOperations)
  }

  function addListing(listing) {
    const updatedListings = [{ ...listing, id: crypto.randomUUID(), status: 'pending' }, ...listings]
    try {
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(updatedListings))
    } catch (error) {
      if (
        error.name === 'QuotaExceededError'
        || error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        || error.message.toLowerCase().includes('quota')
      ) {
        throw new Error('ব্রাউজারের স্টোরেজ পূর্ণ। ছবি স্বয়ংক্রিয়ভাবে কমপ্রেস করা হয়েছে; জায়গা খালি করে আবার জমা দিন।')
      }
      throw error
    }
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

  function login(email, displayName = '', requestedRole) {
    const normalizedEmail = email.trim().toLowerCase()
    const existingAccount = accounts.find((account) => account.email === normalizedEmail)
    const role = normalizedEmail === SUPERADMIN_EMAIL
      ? 'superadmin'
      : SIGNUP_ROLES.includes(requestedRole)
        ? requestedRole
        : ACCOUNT_ROLES.includes(existingAccount?.role)
          ? existingAccount.role
          : 'user'
    const nextProfile = {
      name: displayName || existingAccount?.name || '',
      email: normalizedEmail,
      image: existingAccount?.image || '',
      role,
    }
    const updatedAccounts = [
      ...accounts.filter((account) => account.email !== normalizedEmail),
      nextProfile,
    ]
    const signedInAs = nextProfile.name || normalizedEmail
    window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
    window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(nextProfile))
    window.localStorage.setItem(DEMO_USER_KEY, signedInAs)
    setAccounts(updatedAccounts)
    setUser(signedInAs)
    setProfile(nextProfile)
  }

  function updateProfile(details) {
    if (!profile) throw new Error('প্রোফাইল তথ্য পাওয়া যায়নি।')
    const updatedProfile = {
      ...profile,
      ...details,
      name: details.name.trim(),
      email: details.email.trim().toLowerCase(),
    }
    const updatedAccounts = [
      ...accounts.filter((account) => account.email !== profile.email && account.email !== updatedProfile.email),
      updatedProfile,
    ]
    window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
    window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(updatedProfile))
    window.localStorage.setItem(DEMO_USER_KEY, updatedProfile.name || updatedProfile.email)
    setAccounts(updatedAccounts)
    setUser(updatedProfile.name || updatedProfile.email)
    setProfile(updatedProfile)
  }

  function updateAccountRole(email, role) {
    const normalizedEmail = email.trim().toLowerCase()
    if (!['admin', 'customer', 'provider', 'user'].includes(role)) {
      throw new Error('বৈধ অ্যাকাউন্টের ধরন বেছে নিন।')
    }
    if (normalizedEmail === SUPERADMIN_EMAIL) {
      throw new Error('প্রধান সুপার অ্যাডমিন অ্যাকাউন্টের role পরিবর্তন করা যাবে না।')
    }

    const account = accounts.find((item) => item.email === normalizedEmail)
    if (!account) throw new Error('এই ইমেইলের কোনো demo account পাওয়া যায়নি।')
    const updatedAccounts = accounts.map((item) => (
      item.email === normalizedEmail ? { ...item, role } : item
    ))
    window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
    setAccounts(updatedAccounts)
    if (profile?.email === normalizedEmail) {
      const updatedProfile = { ...profile, role }
      window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(updatedProfile))
      setProfile(updatedProfile)
    }
  }

  function logout() {
    window.localStorage.removeItem(DEMO_USER_KEY)
    setUser(null)
    setProfile(null)
  }

  const value = {
    cities,
    activeCities,
    listings,
    requests,
    categories,
    emergencyServices,
    managedAreas,
    staffAccounts,
    hiddenEmergencyServiceIds,
    requestOperations,
    selectedCity,
    selectedCityId,
    chooseCity,
    addCity,
    addCategory,
    updateCategory,
    removeCategory,
    toggleCityActive,
    removeCity,
    addManagedArea,
    updateManagedArea,
    removeManagedArea,
    addStaffAccount,
    removeStaffAccount,
    hideEmergencyService,
    restoreEmergencyService,
    addEmergencyService,
    updateEmergencyService,
    removeEmergencyService,
    updateRequestOperation,
    addListing,
    updateListingStatus,
    removeListing,
    addRequest,
    updateRequestStatus,
    removeRequest,
    user,
    profile,
    accounts,
    login,
    updateProfile,
    updateAccountRole,
    logout,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
