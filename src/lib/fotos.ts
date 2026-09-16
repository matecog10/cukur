import type { ImageMetadata } from 'astro';

// Every image in src/assets/fotos, looked up by file name without extension (menu.json "foto" field).
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/fotos/*.{jpg,jpeg,png,webp}', { eager: true });

export function foto(slug?: string): ImageMetadata | undefined {
  if (!slug) return undefined;
  const hit = Object.entries(files).find(([path]) => path.split('/').pop()!.replace(/\.\w+$/, '') === slug);
  return hit?.[1].default;
}
