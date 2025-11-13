# Background Images

Place background images here and reference them with absolute paths.

## Example Usage:

### In CSS/Tailwind:
```jsx
<div className="bg-[url('/images/background.jpg')] bg-cover bg-center">
```

### In inline styles:
```jsx
<div style={{ backgroundImage: "url('/images/background.jpg')" }}>
```

### With overlay:
```jsx
<div 
  className="relative"
  style={{ backgroundImage: "url('/images/background.jpg')" }}
>
  <div className="absolute inset-0 bg-black/50"></div>
  {/* Your content */}
</div>
```

