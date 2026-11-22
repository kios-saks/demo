import {readFileSync} from "node:fs";
import {X509Certificate} from "node:crypto";
import assert from "node:assert/strict";
const pem=readFileSync(new URL("../database/certs/prod-ca-2021.crt",import.meta.url),"utf8");
const cert=new X509Certificate(pem);
const fingerprint="807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa";
assert.equal(cert.fingerprint256.replaceAll(":","").toLowerCase(),fingerprint);
assert(cert.subject.includes("Supabase Root 2021 CA"));
console.log("PASS verified public Supabase Root 2021 CA fingerprint");
