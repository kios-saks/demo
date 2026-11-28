import type {ArticleSummary} from "../../../packages/data/src/contracts";

type Page={data:ArticleSummary[];meta:{total:number;page:number;limit:number}};
// The canonical reader catalog is small. Fetch the first two existing
// authenticated pages concurrently, without altering the API's 50-row cap,
// ordering, credentials, no-store policy or completed-response caching.
export async function readCatalogPages(read:(page:number)=>Promise<Page>):Promise<ArticleSummary[]>{
 const limit=50,max=500;
 const [first,second]=await Promise.all([read(1),read(2)]);
 const total=first.meta?.total;
 if(!Number.isSafeInteger(total)||total<0||total>max)throw Error("Invalid preview catalog total");
 function validate(p:Page,n:number){
  const length=Math.max(0,Math.min(limit,total-(n-1)*limit));
  if(p.meta?.total!==total||p.meta.page!==n||p.meta.limit!==limit||!Array.isArray(p.data)||p.data.length!==length)
   throw Error("Inconsistent preview catalog page");
  return p.data;
 }
 const articles=[...validate(first,1),...validate(second,2)];
 // Bounded continuation if the live catalog grows; preserve page order.
 for(let n=3;n<=Math.ceil(total/limit);n++)articles.push(...validate(await read(n),n));
 if(articles.length!==total||articles.some(a=>!a||typeof a.slug!=="string"||!a.slug)||new Set(articles.map(a=>a.slug)).size!==total)
  throw Error("Inconsistent preview catalog");
 return articles;
}
