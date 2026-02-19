/**
 * Auth contracts — placeholder.
 * Define token claims, identity shapes here.
 */

export interface IdentityClaims {
  oid: string;   // Entra object ID
  tid: string;   // Tenant ID
  upn: string;   // User principal name
  name: string;
}
