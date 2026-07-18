/**
 * VAPID public key for web push. Public by design — every subscribing browser
 * receives it — so it's committed here and safe to import into client code.
 * Its matching private key lives only in the VAPID_PRIVATE_KEY server env var.
 */
export const VAPID_PUBLIC_KEY =
  "BDM2AL0rZF8bSflWw0tlQla4f5AYRlfBNhHDa9BZBl3_ic4EimIQENogxQ_8ClO64gm7_oM_l4sdWClXMhiheKs";
