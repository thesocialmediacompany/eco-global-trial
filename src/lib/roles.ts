/**
 * Roles that get full owner-level access: owner-only admin pages + the complete
 * sidebar. "admin" is treated the same as "owner" (a legacy seed value used the
 * "admin" role for the primary account). Everything else (e.g. "staff") is
 * limited. Client-safe (no server-only imports) so both the guard and the nav
 * can share it.
 */
export function isOwnerRole(role?: string | null): boolean {
  return role === "owner" || role === "admin";
}
