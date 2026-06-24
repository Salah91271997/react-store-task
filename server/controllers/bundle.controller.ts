import type { Request, Response } from 'express';
import { z } from 'zod';
import { calculateQuote, getBundle, getProduct } from '../services/pricing.service';

export function health(_req: Request, res: Response): void {
  res.json({ status: 'ok' });
}

export function bundle(_req: Request, res: Response): void {
  res.json(getBundle());
}

export function product(req: Request, res: Response): void {
  const found = getProduct(req.params.id);
  if (!found) {
    res.status(404).json({ error: `Product "${req.params.id}" not found` });
    return;
  }
  res.json(found);
}

const quoteSchema = z.object({
  items: z.array(z.object({ variantId: z.string(), qty: z.number().int().nonnegative() })),
});

export function quote(req: Request, res: Response): void {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid quote request', issues: parsed.error.issues });
    return;
  }
  res.json(calculateQuote(parsed.data.items));
}
