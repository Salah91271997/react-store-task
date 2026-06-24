import rawBundle from '@/data/bundle.json';
import { parseBundle, type Bundle } from './schema';

export const localBundle: Bundle = parseBundle(rawBundle);

export async function fetchBundle(signal?: AbortSignal): Promise<Bundle> {
  try {
    const res = await fetch('/api/bundle', { signal });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    return parseBundle(await res.json());
  } catch {
    return localBundle;
  }
}
