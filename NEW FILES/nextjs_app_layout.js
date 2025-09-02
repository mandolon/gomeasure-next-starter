// pages/_app.js
import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&display=swap" rel="stylesheet" />
        
        {/* Leaflet CSS */}
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
        />
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" 
        />
        
        {/* External scripts loaded dynamically in components */}
        <script 
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          defer
        />
        <script 
          src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"
          defer
        />
        <script 
          src="https://unpkg.com/esri-leaflet"
          defer
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

/*
DIRECTORY STRUCTURE for your Next.js app:

gomeasure-order-app/
├── package.json
├── pages/
│   ├── _app.js
│   ├── index.js (landing page)
│   └── order/
│       └── index.js (main order form)
├── components/
│   ├── Header.js
│   ├── StepNavigation.js
│   ├── PropertyDetails.js
│   ├── Schedule.js
│   ├── Contact.js
│   ├── Review.js
│   ├── Sidebar.js
│   ├── StickyFooter.js
│   ├── AddressAutocomplete.js
│   └── MapEstimator.js
├── styles/
│   ├── globals.css
│   ├── Order.module.css
│   ├── Schedule.module.css
│   ├── Header.module.css
│   ├── StickyFooter.module.css
│   ├── StepNavigation.module.css
│   ├── Sidebar.module.css
│   ├── AddressAutocomplete.module.css
│   ├── MapEstimator.module.css
│   ├── PropertyDetails.module.css
│   ├── Contact.module.css
│   └── Review.module.css
└── public/
    └── (static assets if needed)

SETUP INSTRUCTIONS:

1. Create a new Next.js app:
   npx create-next-app@latest gomeasure-order-app
   cd gomeasure-order-app

2. Install dependencies:
   npm install leaflet leaflet-draw esri-leaflet

3. Replace the generated files with the code provided above

4. Create all the component and style files as shown

5. Run the development server:
   npm run dev

6. Navigate to http://localhost:3000/order to see the form

KEY FEATURES IMPLEMENTED:

✅ Multi-step form with Property, Schedule, Contact, Review steps
✅ Enhanced scheduling with separate interior/exterior appointments
✅ Interactive map with drawing tools for area measurement
✅ Address autocomplete with geocoding
✅ Responsive design with mobile sticky footer
✅ Real-time pricing calculations
✅ Form validation and state management
✅ Step navigation with progress indicators
✅ What's included lists (residential vs commercial)
✅ Second contact person option
✅ Terms acceptance checkboxes

The enhanced scheduling from your second file has been fully integrated, allowing users to book separate appointments for interior and exterior scans with individual calendar pickers and time slots.
*/