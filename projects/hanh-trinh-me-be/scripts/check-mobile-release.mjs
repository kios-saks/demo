import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
const folder=new URL("../apps/mobile/",import.meta.url);
const sources=["App.tsx",...readdirSync(new URL("src/",folder)).filter(f=>f.endsWith(".ts")).map(f=>"src/"+f)];
for(const file of sources){
 const content=readFileSync(new URL(file,folder),"utf8");
 assert(!/from\s+["'][^"']*packages\/content|require\s*\([^)]*packages\/content/.test(content),
   "Mobile must not bundle draft medical seed: "+file);
}
console.log("PASS Mobile release surface has no draft JSON content import");
