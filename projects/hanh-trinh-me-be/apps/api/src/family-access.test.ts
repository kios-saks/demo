import {test} from "node:test";
import assert from "node:assert/strict";
import {canAccessFamily,type FamilyMembership,type FamilyAction,type FamilyRole} from "./family-access.js";
const membership: FamilyMembership = {familyId:"family-a",accountId:"account-a",role:"owner",status:"active"};
const actions: FamilyAction[] = ["read","writeJourney","manageMembers"];
test("family RBAC: owner, member, viewer explicit permissions",()=>{
 for (const [role,allowed] of [["owner",[true,true,true]],["member",[true,true,false]],["viewer",[true,false,false]]] as const) {
  assert.deepEqual(actions.map(action=>canAccessFamily("account-a","family-a",{...membership,role},action)),allowed);
 }
});
test("tenant isolation and principal mismatch deny every action",()=>{
 for(const action of actions){
  assert.equal(canAccessFamily("account-a","family-b",membership,action),false);
  assert.equal(canAccessFamily("account-b","family-a",membership,action),false);
  assert.equal(canAccessFamily(null,"family-a",membership,action),false);
  assert.equal(canAccessFamily("account-a","family-a",null,action),false);
  assert.equal(canAccessFamily("","family-a",membership,action),false);
  assert.equal(canAccessFamily("account-a","",membership,action),false);
 }
});
test("pending/revoked membership and unknown permissions fail closed",()=>{
 for(const action of actions){
  for(const status of ["pending","revoked"] as const) assert.equal(canAccessFamily("account-a","family-a",{...membership,status},action),false);
  assert.equal(canAccessFamily("account-a","family-a",{...membership,role:"admin" as FamilyRole},action),false);
 }
 assert.equal(canAccessFamily("account-a","family-a",membership,"deleteFamily" as FamilyAction),false);
});
