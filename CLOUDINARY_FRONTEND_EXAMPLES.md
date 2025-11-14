# 🎨 Cloudinary Frontend - Esempi Pratici

Questa guida mostra come utilizzare le immagini ottimizzate nel frontend React.

---

## 📸 Esempio 1: Lista Proprietà (Thumbnails)

Usa thumbnail per liste rapide e performanti:

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function PropertyList() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const response = await axios.get('/api/properties');
    setProperties(response.data);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function PropertyCard({ property }) {
  // Se l'immagine è già un oggetto con variants
  const thumbnailUrl = property.images[0]?.urls?.thumbnail || property.images[0];

  return (
    <div className="border rounded-lg overflow-hidden">
      <img
        src={thumbnailUrl}
        alt={property.title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="font-bold">{property.title}</h3>
        <p className="text-gray-600">€{property.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
```

---

## 🖼️ Esempio 2: Dettaglio Proprietà (Large + Lazy Loading)

```jsx
import { useState } from 'react';

function PropertyDetail({ property }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Usa placeholder per blur effect
  const placeholderUrl = property.images[0]?.urls?.placeholder;
  const largeUrl = property.images[0]?.urls?.large;

  return (
    <div className="relative">
      {/* Blur placeholder */}
      {!imageLoaded && placeholderUrl && (
        <img
          src={placeholderUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
        />
      )}

      {/* Immagine principale */}
      <img
        src={largeUrl}
        alt={property.title}
        className={`w-full h-96 object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
      />

      {/* Loading spinner */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}
```

---

## 📱 Esempio 3: Responsive Images con srcset

Per le massime performance su tutti i dispositivi:

```jsx
function ResponsivePropertyImage({ property }) {
  const image = property.images[0];

  // Puoi chiamare l'API per ottenere tutti gli URL responsive
  // oppure costruirli manualmente se hai il public_id

  return (
    <picture>
      {/* WebP per browser moderni */}
      <source
        type="image/webp"
        srcSet={`
          ${image.urls.thumbnail} 400w,
          ${image.urls.medium} 800w,
          ${image.urls.large} 1200w
        `}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Fallback JPEG */}
      <img
        src={image.urls.medium}
        srcSet={`
          ${image.urls.thumbnail} 400w,
          ${image.urls.medium} 800w,
          ${image.urls.large} 1200w
        `}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={property.title}
        className="w-full h-auto"
        loading="lazy"
      />
    </picture>
  );
}
```

---

## 🎠 Esempio 4: Galleria Immagini con Lightbox

```jsx
import { useState } from 'react';

function PropertyGallery({ property }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      {/* Grid di thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {property.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <img
              src={image.urls.thumbnail}
              alt={`${property.title} - Foto ${index + 1}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox modale */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.urls.large}
            alt={property.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-4xl"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
```

---

## 🎯 Esempio 5: Custom Hook per Cloudinary

Crea un hook riutilizzabile:

```jsx
// hooks/useCloudinaryImage.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useCloudinaryImage(publicId, variant = 'medium') {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!publicId) return;

    const fetchVariants = async () => {
      try {
        const response = await axios.get(`/api/cloudinary/variants/${publicId}`);
        setImageUrl(response.data.variants[variant]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [publicId, variant]);

  return { imageUrl, loading, error };
}

// Uso:
function PropertyImage({ publicId }) {
  const { imageUrl, loading } = useCloudinaryImage(publicId, 'large');

  if (loading) return <div>Caricamento...</div>;

  return <img src={imageUrl} alt="Property" />;
}
```

---

## 🚀 Esempio 6: Upload con Preview Ottimizzata

```jsx
import { useState } from 'react';
import axios from 'axios';

function PropertyImageUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview locale
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload-property-image', formData);

      // Ricevi tutte le varianti ottimizzate
      onUploadComplete({
        url: response.data.url,
        urls: response.data.urls,  // thumbnail, medium, large
        publicId: response.data.public_id,
        metadata: response.data.metadata
      });

      console.log('Immagine caricata:', response.data);
      console.log('Colori dominanti:', response.data.metadata.colors);
    } catch (error) {
      console.error('Errore upload:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />

      {preview && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Anteprima:</p>
          <img
            src={preview}
            alt="Preview"
            className="w-64 h-auto rounded-lg"
          />
          {uploading && <p className="text-sm text-blue-600 mt-2">Caricamento in corso...</p>}
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Esempio 7: Hero Section con Immagine Ottimizzata

```jsx
function HeroSection({ property }) {
  const heroImage = property.images[0];

  return (
    <div className="relative h-screen">
      {/* Placeholder blur */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-lg scale-110"
        style={{
          backgroundImage: `url(${heroImage.urls.placeholder})`
        }}
      />

      {/* Immagine hero con gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)),
            url(${heroImage.urls.hero || heroImage.urls.large})
          `
        }}
      />

      {/* Contenuto */}
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">{property.title}</h1>
          <p className="text-2xl">€{property.price.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Esempio 8: Performance Monitoring

Monitora le performance delle immagini:

```jsx
import { useEffect } from 'react';

function PropertyImageWithMetrics({ src, alt }) {
  useEffect(() => {
    // Performance API per monitorare caricamento
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === src) {
          console.log('Image load time:', entry.duration, 'ms');
          console.log('Image size:', entry.transferSize, 'bytes');
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      src={src}
      alt={alt}
      onLoad={(e) => {
        console.log('Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
      }}
      loading="lazy"
    />
  );
}
```

---

## 🎯 Best Practices

### 1. **Usa Variante Appropriata**
- Liste: `thumbnail`
- Card: `medium`
- Dettaglio: `large`
- Hero: `hero`

### 2. **Lazy Loading**
Sempre usa `loading="lazy"` tranne per immagini above-the-fold

### 3. **Alt Text**
Descrivi sempre le immagini per SEO e accessibilità

### 4. **Blur Placeholder**
Migliora perceived performance con placeholder

### 5. **Error Handling**
Gestisci errori di caricamento con fallback

### 6. **Responsive**
Usa `srcset` e `sizes` per device appropriati

---

## 🔧 Utility Component

```jsx
// components/OptimizedImage.jsx
export function OptimizedImage({
  src,
  alt,
  variant = 'medium',
  className = '',
  loading = 'lazy',
  withPlaceholder = true
}) {
  const [loaded, setLoaded] = useState(false);

  // Se src è un oggetto con urls, usa la variante
  const imageUrl = typeof src === 'object' ? src.urls?.[variant] : src;
  const placeholderUrl = typeof src === 'object' ? src.urls?.placeholder : null;

  return (
    <div className={`relative ${className}`}>
      {withPlaceholder && !loaded && placeholderUrl && (
        <img
          src={placeholderUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
          aria-hidden="true"
        />
      )}

      <img
        src={imageUrl}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

// Uso:
<OptimizedImage
  src={property.images[0]}
  alt={property.title}
  variant="large"
  withPlaceholder
/>
```

---

## 📱 Progressive Web App

Per PWA, aggiungi preload dei critical images:

```jsx
// In <head> tramite Helmet o next/head
<link
  rel="preload"
  as="image"
  href={property.images[0].urls.large}
  imageSrcSet={`
    ${property.images[0].urls.thumbnail} 400w,
    ${property.images[0].urls.medium} 800w,
    ${property.images[0].urls.large} 1200w
  `}
  imageSizes="100vw"
/>
```

---

## 🎉 Risultati Attesi

Implementando questi pattern:
- ⚡ **LCP** (Largest Contentful Paint): < 2.5s
- ⚡ **FID** (First Input Delay): < 100ms
- ⚡ **CLS** (Cumulative Layout Shift): < 0.1
- 📊 **Lighthouse Score**: 90+
- 💰 **Banda risparmiata**: 60-70%
