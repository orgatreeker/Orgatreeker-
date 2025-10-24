import 'server-only';
import DodoPayments from 'dodopayments';

let dodoSingleton: DodoPayments | null = null;

/**
 * Initialize and return a singleton DodoPayments client using env credentials.
 * Requires:
 * - DODO_BEARER_TOKEN
 */
export function getDodoClient(): DodoPayments {
  if (dodoSingleton) return dodoSingleton;

  const bearerToken = process.env.DODO_BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error('DODO_BEARER_TOKEN is not set. Add it to your .env.local (or hosting env).');
  }

  dodoSingleton = new DodoPayments({
    bearerToken,
  });

  return dodoSingleton;
}