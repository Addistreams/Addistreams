import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Addistream',
    short_name: 'Addistream',
    description:
      'Addistream is a creator-first music distribution platform for upload, mastering preview, approval, and monetization.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#fbbf24',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
