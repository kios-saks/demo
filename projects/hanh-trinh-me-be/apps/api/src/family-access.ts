/** Pure policy only. Principal and membership MUST come from trusted server-side
 * verification/storage, never client input. Future repositories must also scope
 * all queries to familyId and enforce atomic authorization for mutations. */
export type FamilyRole = "owner" | "member" | "viewer";
export type FamilyAction = "read" | "writeJourney" | "manageMembers";
export interface FamilyMembership {
 readonly familyId: string;
 readonly accountId: string;
 readonly role: FamilyRole;
 readonly status: "active" | "pending" | "revoked";
}
export function canAccessFamily(
 accountId: string | null,
 familyId: string,
 membership: FamilyMembership | null,
 action: FamilyAction,
): boolean {
 if (!accountId || !familyId || !membership || membership.status !== "active" ||
     membership.accountId !== accountId || membership.familyId !== familyId) return false;
 switch (membership.role) {
  case "owner": return action === "read" || action === "writeJourney" || action === "manageMembers";
  case "member": return action === "read" || action === "writeJourney";
  case "viewer": return action === "read";
  default: return false;
 }
}
