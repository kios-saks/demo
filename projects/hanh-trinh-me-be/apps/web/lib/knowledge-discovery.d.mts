export type DiscoveryEntry={stage:string;pillar:string;kind:string;key:string};
export type DiscoveryState={group:string;stages:string[];topics:string[];kinds:string[];page:number};
export type DiscoveryAtlas={stages:{id:string}[];pillars:{id:string}[]};
export const discoveryPageSize:number;
export function parseDiscoveryParams(params:URLSearchParams,atlas:DiscoveryAtlas):DiscoveryState;
export function discoveryHref(state:DiscoveryState,page?:number):string;
export function filterDiscovery<T extends DiscoveryEntry>(entries:T[],state:DiscoveryState,omit?:string):T[];
export function discoveryFacets<T extends DiscoveryEntry>(entries:T[],state:DiscoveryState,atlas:DiscoveryAtlas):{stage:Record<string,number>;topic:Record<string,number>;kind:Record<string,number>};
export function paginateDiscovery<T extends DiscoveryEntry>(entries:T[],state:DiscoveryState,atlas:DiscoveryAtlas):{total:number;pages:number;page:number;items:T[]};
