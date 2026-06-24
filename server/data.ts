import rawBundle from '../src/data/bundle.json';
import { parseBundle, type Bundle } from '../src/lib/schema';

export const bundle: Bundle = parseBundle(rawBundle);
