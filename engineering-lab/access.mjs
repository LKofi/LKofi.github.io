/**
 * Demonstration-only resource authorization, not the original SecureGate product.
 * An authenticated principal is provided by a trusted identity layer. Never accept
 * actor or resource organization IDs straight from untrusted client claims.
 */
export class AccessDenied extends Error {
  constructor(status, reason) {
    super(reason);
    this.name = "AccessDenied";
    this.status = status;
  }
}
export function authorize({ actor, resource, operation }) {
  if (!actor || !actor.id || !actor.organizationId || actor.active !== true) {
    throw new AccessDenied(401, "Authentication required");
  }
  if (!["read", "update"].includes(operation)) {
    throw new AccessDenied(403, "Operation not permitted");
  }
  if (!resource || !resource.id || resource.organizationId !== actor.organizationId) {
    // Intentionally indistinguishable from a non-existent resource.
    throw new AccessDenied(404, "Resource not found");
  }
  const roles = new Set(Array.isArray(actor.roles) ? actor.roles : []);
  const owner = resource.ownerId === actor.id;
  const canRead = roles.has("admin") || roles.has("auditor") || (roles.has("member") && owner);
  const canUpdate = roles.has("admin") || (roles.has("member") && owner);
  if (!(operation === "read" ? canRead : canUpdate)) {
    throw new AccessDenied(403, "Operation not permitted");
  }
  return Object.freeze({ resourceId: resource.id, organizationId: actor.organizationId, operation });
}
