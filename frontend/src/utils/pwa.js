// PWA Registration and Install Prompt
// Registra service worker e gestisce install prompt

export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/service-worker.js')
                .then((registration) => {
                    console.log('✓ Service Worker registered:', registration.scope);

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60000); // Every minute
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
}

// Install prompt
let deferredPrompt;

export function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default install prompt
        e.preventDefault();

        // Store event for later
        deferredPrompt = e;

        // Show custom install button
        showInstallButton();
    });

    // Track installation
    window.addEventListener('appinstalled', () => {
        console.log('✓ PWA installed');
        deferredPrompt = null;
        hideInstallButton();

        // Analytics
        if (window.gtag) {
            window.gtag('event', 'pwa_install');
        }
    });
}

function showInstallButton() {
    // Create install banner
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 25px;
      border-radius: 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 15px;
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
    ">
      <span style="font-weight: 600;">📱 Installa l'app Tempocasa</span>
      <button id="pwa-install-btn" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 8px 20px;
        border-radius: 20px;
        font-weight: 600;
        cursor: pointer;
      ">
        Installa
      </button>
      <button id="pwa-dismiss-btn" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 15px;
        border-radius: 20px;
        font-weight: 600;
        cursor: pointer;
      ">
        ✕
      </button>
    </div>
  `;

    document.body.appendChild(banner);

    // Install button click
    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
        if (!deferredPrompt) return;

        // Show install prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User ${outcome} the install prompt`);

        deferredPrompt = null;
        hideInstallButton();
    });

    // Dismiss button click
    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
        hideInstallButton();

        // Don't show again for 7 days
        localStorage.setItem('pwa-install-dismissed', Date.now());
    });

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
        const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
            hideInstallButton();
        }
    }
}

function hideInstallButton() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
        banner.remove();
    }
}

// Check if running as PWA
export function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

// Online/Offline status
export function setupOnlineStatus() {
    function updateOnlineStatus() {
        const isOnline = navigator.onLine;

        if (!isOnline) {
            showOfflineBanner();
        } else {
            hideOfflineBanner();
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial check
    updateOnlineStatus();
}

function showOfflineBanner() {
    if (document.getElementById('offline-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f59e0b;
      color: white;
      padding: 10px;
      text-align: center;
      font-weight: 600;
      z-index: 10000;
      animation: slideDown 0.3s ease-out;
    ">
      📡 Sei offline - Alcune funzionalità potrebbero non essere disponibili
    </div>
  `;

    document.body.appendChild(banner);
}

function hideOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) {
        banner.remove();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
