# Public Folder

This folder contains static assets that are served as-is by Vite.

## Image Usage

Place images here if you want to reference them with absolute paths (starting with `/`).

### Example:
```jsx
<img src="/placeholder-product.jpg" alt="Product" />
```

### Folder structure suggestion:
```
public/
├── images/
│   ├── products/      # Product images
│   ├── placeholders/  # Placeholder images
│   └── logos/         # Logo images
└── README.md
```

## Note

- Files in `/public` are copied to the build output as-is
- Use this for assets that don't need processing
- For assets you want to import in components, use `/src/assets` instead

