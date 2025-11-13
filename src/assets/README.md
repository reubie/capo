# Assets Folder

This folder is for images and other assets that you want to import directly in your React components.

## Usage

### Importing images:
```jsx
import logo from './assets/logo.png';
import productImage from './assets/products/gift-card.jpg';

// Then use in JSX:
<img src={logo} alt="Logo" />
```

### Folder structure suggestion:
```
assets/
├── images/
│   ├── products/      # Product images
│   ├── cards/         # Business card images
│   ├── icons/         # Icon images
│   └── logos/         # Logo images
└── README.md
```

## Alternative: Public Folder

For static assets that don't need processing, you can also place them in the `/public` folder at the project root. These can be referenced with absolute paths:

```jsx
<img src="/placeholder-product.jpg" alt="Product" />
```

