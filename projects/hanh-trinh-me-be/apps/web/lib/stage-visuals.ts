import {stageVisual} from "./editorial-media";
export const stageVisuals:Record<string,string>=Object.fromEntries(["chuan-bi-mang-thai","thai-ky-3-thang-dau","thai-ky-3-thang-giua","thai-ky-3-thang-cuoi","hau-san","so-sinh","nhu-nhi","tap-di","mam-non","tieu-hoc","thieu-nien","truong-thanh"].map(key=>[key,stageVisual(key)]));
