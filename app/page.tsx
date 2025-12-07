import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'PixMix.fun | Gradient-aware image reorder',
  description: 'Remix images by reordering blocks with gradient-aware matching and fast previews. Built for square inputs around 512×512.',
  openGraph: {
    title: 'PixMix.fun | Gradient-aware image reorder',
    description: 'Remix images by reordering blocks with gradient-aware matching and fast previews. Built for square inputs around 512×512.',
    url: 'https://pixmix.fun',
    siteName: 'PixMix.fun',
    images: [
      {
        url: '/favicon.svg',
        width: 200,
        height: 200,
        alt: 'PixMix.fun',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'PixMix.fun | Gradient-aware image reorder',
    description: 'Remix images by reordering blocks with gradient-aware matching and fast previews. Built for square inputs around 512×512.',
    images: ['/favicon.svg'],
  },
};

export default function Page() {
  return <HomeClient />;
}
