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

- `/` — শহরভিত্তিক Dashboard, listing submit, জরুরি যোগাযোগ ও category directory
- `/emergency-services` — সব জরুরি সেবার নম্বর
- `/help-guide` — সাহায্য চাওয়ার ধাপ
- `/my-requests` — customer-এর পণ্য ও সেবা আবেদনের অবস্থা
- `/admin` — demo login-এর পর local listing/order approve এবং city পরিচালনা

প্রতিটি পেজের component ও page-specific stylesheet তার নিজস্ব `src/pages/` subfolder-এ রাখা হয়েছে। Listing, শহর, customer request ও নির্বাচিত শহর browser-এর `localStorage`-এ থাকে। Navbar-এর login-ও UI demo: কোনো server-side authentication নেই, password সংরক্ষণ বা যাচাই হয় না। `/admin` route-এ demo login gate আছে, কিন্তু এটি real authentication বা role-based authorization নয়। Production-এ প্রকাশের আগে backend, database ও secure authentication যুক্ত করতে হবে।
