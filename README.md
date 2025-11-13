# Capo 靠谱 (kàopǔ)

A modern, responsive web application built with React and TailwindCSS for managing gift cards (Gifticon) and business card networks.

## Features

### 🏠 Landing Page
- Diagonal split-screen design with "Gifticon" and "Network" sections
- Interactive hover/tap effects with smooth transitions
- Central logo with side-by-side text alignment
- Responsive design optimized for mobile and desktop
- Modern sepia/brown color scheme with low-poly background
- Clickable logo in top-left corner

### 🔐 Authentication
- Phone number + OTP authentication
- Registration with manual entry or business card upload (OCR-ready)
- Clean, minimal design matching the landing theme
- Sepia/brown color scheme throughout

### 🎁 Gifticon Page
- E-commerce style product grid with product images
- Purchase flow with QR code generation
- WhatsApp sharing functionality
- Purchase history tracking
- Brown/sepia color scheme matching landing page

### 📇 Network Page
- Business card storage and management
- Search and filter functionality (by date, name, company)
- Upload/take photos of business cards
- Clean grid/list display of saved cards with images
- Brown/sepia color scheme matching landing page

## Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client
- **Lucide React** - Icons

## Design & Color Scheme

The application uses a cohesive sepia/brown color palette:
- **Primary Brown**: `#8B4513` (Saddle Brown)
- **Dark Brown**: `#5C4033`
- **Light Cream**: `#F5E6D3`
- **Accent**: Yellow for highlights

All pages maintain visual consistency with the landing page design.

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, for API configuration):
```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm start
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── ProductCard.jsx
│   └── CardPreview.jsx
├── pages/              # Page components
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Gifticon.jsx
│   └── Network.jsx
├── utils/              # Utility functions
│   ├── api.js          # Axios configuration and API functions
│   └── helpers.js      # Helper functions
├── App.jsx             # Main app component with routing
├── main.jsx            # Entry point
└── index.css           # Global styles

public/
└── images/             # Static images
    ├── background-img.png
    └── logo.png
```

## API Integration

The app is ready for backend integration. All API calls are configured in `src/utils/api.js`:

- **Authentication**: `authAPI.login()`, `authAPI.register()`, `authAPI.sendOTP()`, `authAPI.uploadBusinessCard()`
- **Gifticon**: `gifticonAPI.getProducts()`, `gifticonAPI.purchase()`, `gifticonAPI.getPurchaseHistory()`
- **Network**: `networkAPI.getCards()`, `networkAPI.addCard()`, `networkAPI.deleteCard()`

Currently, the app uses mock data. Replace the TODO comments in the page components with actual API calls.

## Responsive Design

The app is fully responsive and optimized for:
- Mobile devices (iPhone 13+)
- Tablets
- Desktop screens

All layouts adapt using TailwindCSS responsive utilities.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest, including iOS Safari)
- Mobile browsers

## Development

### Available Scripts

- `npm start` or `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT

## Author

Reubie (r.nguyo27@gmail.com)
