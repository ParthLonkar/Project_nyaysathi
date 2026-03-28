# Tailwind CSS Setup - Quick Start

## What's Changed

The NyaySathi frontend has been updated to use **Tailwind CSS** for faster, more efficient styling. All custom CSS classes have been converted to Tailwind utility classes.

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install the new Tailwind CSS dependencies:
- `tailwindcss` - The Tailwind CSS framework
- `postcss` - Required for Tailwind to work
- `autoprefixer` - Automatically adds vendor prefixes to CSS

### 2. Files Added/Updated

**New Files:**
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

**Updated Files:**
- `package.json` - Added Tailwind dev dependencies
- `src/App.css` - Converted to Tailwind directives
- All component files (`.jsx`) - Updated to use Tailwind classes

## Running the Project

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will run on `http://localhost:5173`

## Tailwind CSS Basics

### Utility Classes

Tailwind uses utility classes to style elements:

```jsx
// Instead of custom CSS classes:
<div className="navbar">

// Now use Tailwind utilities:
<div className="sticky top-0 z-50 bg-white border-b border-gray-200">
```

### Common Patterns Used

**Spacing:**
```jsx
<div className="px-4 py-8">  {/* padding: 1rem (horizontal and vertical) */}
<div className="mb-6">       {/* margin-bottom: 1.5rem */}
```

**Colors:**
```jsx
<div className="bg-blue-600">                {/* Blue background */}
<p className="text-gray-700">                {/* Gray text */}
<button className="bg-red-500 hover:bg-red-600"> {/* Hover state */}
```

**Layouts:**
```jsx
<div className="flex justify-between items-center">     {/* Flexbox */}
<div className="grid grid-cols-3 gap-4">               {/* Grid */}
```

**Responsive Design:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"> {/* Responsive columns */}
<div className="hidden md:block">                               {/* Hide on mobile */}
```

**Common Components Used:**

| Component | Classes |
|-----------|---------|
| Button | `btn-primary`, `btn-secondary` |
| Input | `input-field`, `form-label` |
| Card | `card` |
| Container | `container` |

## Customization

### Colors

Edit `tailwind.config.js` to customize colors:

```js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#3b82f6',
        600: '#2563eb',
      }
    }
  }
}
```

### Sizes, Fonts, etc.

All standard Tailwind values are available. See [Tailwind Docs](https://tailwindcss.com/docs) for more.

## Using Custom Components

### Component Layer

Custom reusable components are defined in `src/App.css`:

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
  }
}
```

Use in JSX:
```jsx
<button className="btn-primary">Click me</button>
```

## Build Optimization

Tailwind automatically removes unused CSS in production, keeping the bundle size small.

**Production Build:**
```bash
npm run build
```

The final CSS bundle will only include classes actually used in your code.

## VS Code Intellisense

Install the official extension for autocomplete:

1. Go to Extensions
2. Search for "Tailwind CSS IntelliSense"
3. Install by Tailwind Labs

This provides:
- Autocomplete for class names
- Hover documentation
- Linting

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Components Gallery](https://tailwindui.com)
- [Tailwind Play](https://play.tailwindcss.com) - Online playground

## Migration Notes

### Before (Custom CSS)
```jsx
<div className="navbar">
  <div className="navbar-container">
```

### After (Tailwind)
```jsx
<div className="sticky top-0 z-50 bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4">
```

All previous CSS classes have been converted to their Tailwind equivalents.

## Troubleshooting

### Styles not appearing?

1. Ensure you've run `npm install` in the frontend directory
2. Restart the dev server
3. Check that the Tailwind directives are in `src/App.css`

### Autocomplete not working?

1. Install the Tailwind CSS IntelliSense extension
2. Ensure `tailwind.config.js` is at the root of your frontend folder
3. Reload VS Code

## Next Steps

- Explore [Tailwind UI](https://tailwindui.com) for component inspiration
- Check out [Headless UI](https://headlessui.com) for unstyled, accessible components
- Learn about [Tailwind plugins](https://tailwindcss.com/docs/plugins)
