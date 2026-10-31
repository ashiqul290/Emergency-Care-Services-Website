# সহায়তা — জরুরি সেবা

বাংলাদেশের জরুরি যোগাযোগ নম্বর ও প্রাথমিক নির্দেশনা দেখানোর জন্য তৈরি একটি responsive React + Vite starter project।

## চালু করুন

```bash
npm install
npm run dev
```

Production build যাচাই করতে:

```bash
npm run build
```

## Project structure

```text
src/
├── components/
│   ├── CityCareDirectory.jsx
│   ├── EmergencyDirectory.jsx
│   ├── HelpSteps.jsx
│   ├── HeroSection.jsx
│   ├── Icon.jsx
│   ├── LocalListingBoard.jsx
│   ├── SiteFooter.jsx
│   └── SiteHeader.jsx
├── data/
│   ├── cities.js
│   ├── listingCategories.js
│   └── emergencyServices.js
├── context/
│   ├── appDataContext.js
│   ├── AppDataProvider.jsx
│   └── useAppData.js
├── pages/
│   ├── dashboard/
│   │   ├── DashboardPage.jsx
│   │   └── DashboardPage.css
│   ├── emergency-services/
│   │   ├── EmergencyServicesPage.jsx
│   │   └── EmergencyServicesPage.css
│   ├── help-guide/
│   │   ├── HelpGuidePage.jsx
│   │   └── HelpGuidePage.css
│   ├── customer-dashboard/
│   │   ├── CustomerDashboardPage.jsx
│   │   └── CustomerDashboardPage.css
│   └── admin/
│       ├── AdminDashboardPage.jsx
│       └── AdminDashboardPage.css
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

Reusable UI components `src/components/`-এ, নম্বরের তথ্য `src/data/`-এ, আর application composition `src/App.jsx`-এ রাখা হয়েছে। জরুরি নম্বর পরিবর্তিত হতে পারে—প্রকাশের আগে সংশ্লিষ্ট সরকারি উৎস থেকে তথ্য যাচাই করুন।

## আলাদা পেজ

- `/` — শহরভিত্তিক Dashboard, পণ্য/সেবা submit, জরুরি যোগাযোগ, manual order ও category directory
- `/emergency-services` — সব জরুরি সেবার নম্বর
- `/help-guide` — সাহায্য চাওয়ার ধাপ
- `/my-requests` — customer-এর পণ্য ও সেবা আবেদনের অবস্থা
- `/profile` — নাম, ইমেইল ও প্রোফাইল ছবি সম্পাদনা
- `/admin` — demo login-এর পর local listing/order approve এবং city পরিচালনা

“তথ্য যোগ করুন” ফর্মে চার ধাপে পণ্য/সেবা ও ব্যক্তি/কোম্পানি বেছে, যোগাযোগ, ব্যক্তি/কোম্পানির পরিচিতির ছবি, পণ্য/সেবার আলাদা ছবি, বিবরণ, WhatsApp/ম্যাপ এবং সব শহর বা নির্দিষ্ট শহর নির্বাচন করা যায়। পণ্যের জন্য মূল্য বাধ্যতামূলক, স্টক ঐচ্ছিক; ছবিতে আপলোডের MB সীমা নেই এবং ব্রাউজারে রাখার আগে ছবি স্বয়ংক্রিয়ভাবে resize/compress হয়। তারপরও browser storage সীমাবদ্ধতা প্রযোজ্য। বর্তমান লোকেশন ব্যবহার করলে ব্রাউজারের অনুমতি প্রয়োজন। এই demo-তে SMS পাঠানো হয় না।

“ম্যানুয়াল অর্ডার” ট্যাবে সরাসরি নাম, মোবাইল, ডেলিভারি ঠিকানা ও প্রয়োজনীয় বাজারের তালিকা জমা দিলে তা admin dashboard-এর customer requests-এ pending order হিসেবে দেখা যায়।

প্রতিটি পেজের component ও page-specific stylesheet তার নিজস্ব `src/pages/` subfolder-এ রাখা হয়েছে। Listing, শহর, customer request, profile ও নির্বাচিত শহর browser-এর `localStorage`-এ থাকে। Navbar-এর login-ও UI demo: কোনো server-side authentication নেই, password সংরক্ষণ বা যাচাই হয় না। `ashiquldeveloper11@gmail.com` দিয়ে লগইন করলে `/admin` route-এ যায়; অন্য email `/my-requests`-এ যায়। Header-এর profile menu থেকে profile, আবেদন বা logout করা যায়। `/admin` route-এ demo login gate আছে, কিন্তু এটি real authentication বা role-based authorization নয়। Production-এ প্রকাশের আগে backend, database ও secure authentication যুক্ত করতে হবে।
