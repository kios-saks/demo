import {buildApp} from "./app.js";
const app=buildApp();app.listen({port:Number(process.env.PORT||4000),host:"0.0.0.0"}).catch(e=>{app.log.error(e);process.exit(1)});