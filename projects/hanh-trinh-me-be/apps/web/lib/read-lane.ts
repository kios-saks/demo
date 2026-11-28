// Bounded FIFO, with the queue wait counted inside the caller's deadline.
// No request bodies, URLs or credentials are retained by the scheduler.
export class ReadLaneError extends Error{
 constructor(readonly reason:"QUEUE_FULL"|"QUEUE_TIMEOUT"){super(reason);}
}
export function createReadLane(maxActive:number,maxQueued:number){
 if(!Number.isSafeInteger(maxActive)||maxActive<1||!Number.isSafeInteger(maxQueued)||maxQueued<0)throw Error("Invalid read lane");
 let active=0;
 type Entry={start:()=>void;timer:ReturnType<typeof setTimeout>};
 const queue:Entry[]=[];
 const drain=()=>{while(active<maxActive&&queue.length){const next=queue.shift()!;clearTimeout(next.timer);next.start();}};
 function run<T>(task:()=>Promise<T>,budgetMs:number):Promise<T>{
  if(budgetMs<=0)return Promise.reject(new ReadLaneError("QUEUE_TIMEOUT"));
  return new Promise<T>((resolve,reject)=>{
   const start=()=>{active++;void Promise.resolve().then(task).then(resolve,reject).finally(()=>{active--;drain();});};
   if(active<maxActive){start();return;}
   if(queue.length>=maxQueued){reject(new ReadLaneError("QUEUE_FULL"));return;}
   const entry:Entry={start,timer:setTimeout(()=>{
    const i=queue.indexOf(entry);if(i>=0){queue.splice(i,1);reject(new ReadLaneError("QUEUE_TIMEOUT"));}
   },budgetMs)};
   queue.push(entry);
  });
 }
 return {run,stats:()=>({active,queued:queue.length})};
}
