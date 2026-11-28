// Shared navigation model for the designated Combined DEV reader only.
export const shellDestinations=[
 {id:"home",label:"Trang chủ",href:"/",icon:"M3 10 12 3l9 7v11h-6v-7H9v7H3z"},
 {id:"explore",label:"Khám phá",href:"/kham-pha",icon:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M16 8l-3 5-5 3 3-5z"},
 {id:"journey",label:"Hành trình",href:"/hanh-trinh",icon:"M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"},
 {id:"personal",label:"Cá nhân",href:"/da-luu",icon:"M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 21v-2a8 8 0 0 1 16 0v2"}
] as const;
export type ShellSection=typeof shellDestinations[number]["id"];
export function shellSectionForPath(path:string):ShellSection{
 if(path==="/"||path==="/dev-review/nhom/home")return "home";
 if(path==="/hanh-trinh"||path==="/dev-review/nhom/journey")return "journey";
 if(path==="/da-luu"||path==="/dev-review/nhom/saved")return "personal";
 return "explore";
}
export function shellBreadcrumb(section:ShellSection,title:string):{label:string;href?:string}[]{
 if(section==="home")return [];
 const dest=shellDestinations.find(x=>x.id===section)!;
 return [{label:"Trang chủ",href:"/"},...(title===dest.label?[{label:title}]:[{label:dest.label,href:dest.href},{label:title}])];
}
