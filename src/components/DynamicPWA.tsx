import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { APP_VERSION } from '../lib/constants';

export default function DynamicPWA() {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    const appName = `${settings.instName || 'Vero ID'} v${APP_VERSION}`;
    const shortName = settings.instName || 'Vero ID';

    // 1. Atualizar Título da Página
    document.title = appName;

    // 2. Atualizar Apple Mobile Web App Title
    let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitle) {
      appleTitle = document.createElement('meta');
      appleTitle.setAttribute('name', 'apple-mobile-web-app-title');
      document.head.appendChild(appleTitle);
    }
    appleTitle.setAttribute('content', shortName);

    // 3. Gerar Manifest Dinâmico
    const manifest = {
      name: appName,
      short_name: shortName,
      description: settings.instDescription || "Sistema avançado de verificação de identidades institucionais.",
      start_url: "/",
      display: "standalone",
      background_color: "#0f172a",
      theme_color: settings.instColor || "#0ea5e9",
      icons: [
        {
          src: settings.instLogo || "/icon.svg",
          sizes: "512x512",
          type: settings.instLogo?.startsWith('data:image/svg') ? "image/svg+xml" : "image/png",
          purpose: "any maskable"
        }
      ]
    };

    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    
    const oldURL = manifestLink.href;
    manifestLink.href = manifestURL;

    // Cleanup blob URL when component unmounts or settings change
    return () => {
      if (oldURL.startsWith('blob:')) {
        URL.revokeObjectURL(oldURL);
      }
    };
  }, [settings]);

  return null;
}
