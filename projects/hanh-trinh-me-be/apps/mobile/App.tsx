import React,{useEffect,useMemo,useState} from "react";
import {SafeAreaView,ScrollView,View,Text,TextInput,Pressable,StyleSheet,Linking} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import seed from "../../packages/content/articles.json";
import type {Stage,Article,ArticleSummary} from "../../packages/data/src/contracts";
import {MobileContentSync} from "./src/content-sync";

const bundled=seed as unknown as {stages:Stage[];articles:Article[];disclaimer:string};
const apiUrl=process.env.EXPO_PUBLIC_CONTENT_API_URL?.trim()||"";
const localDemo=__DEV__&&!apiUrl;
const publicRelease=!__DEV__;

export default function App(){
 const sync=useMemo(()=>{
   if(!apiUrl)return null;
   try{return new MobileContentSync(apiUrl,AsyncStorage,publicRelease)}
   catch{return null}
 },[]);
 const[stage,setStage]=useState<string|null>(null);
 const[article,setArticle]=useState<Article|null>(null);
 const[q,setQ]=useState("");
 const[stages,setStages]=useState<Stage[]>(localDemo?bundled.stages:[]);
 const[articles,setArticles]=useState<ArticleSummary[]>(localDemo?bundled.articles:[]);
 const[busy,setBusy]=useState(false);
 const[message,setMessage]=useState(apiUrl?"Đang tải dữ liệu từ Backend...":
   localDemo?"Đang xem dữ liệu demo offline (chưa thẩm định).":"Chưa cấu hình URL HTTPS của Backend.");
 const[error,setError]=useState("");

 useEffect(()=>{
   if(!sync)return;
   let active=true;
   (async()=>{
     let hadCache=false;
     try{
       const saved=await sync.cachedIndex();
       if(saved&&active){
         setStages(saved.stages);setArticles(saved.articles);
         hadCache=true;
         setMessage("Dữ liệu lưu offline, có thể chưa cập nhật.");
       }
       const fresh=await sync.refreshIndex();
       if(active){
         setStages(fresh.stages);setArticles(fresh.articles);
         setMessage("Đã đồng bộ nội dung từ Backend.");
       }
     }catch{
       if(active)setMessage(hadCache?
         "Đang xem nội dung offline; hãy kết nối mạng để cập nhật.":
         "Chưa kết nối được Backend. Chưa có nội dung được lưu offline.");
     }
   })();
   return ()=>{active=false};
 },[sync]);

 async function refresh(){
   if(!sync)return;
   setBusy(true);setError("");setMessage("Đang cập nhật...");
   try{
     const next=await sync.refreshIndex();
     setStages(next.stages);setArticles(next.articles);
     setMessage("Đã cập nhật từ Backend.");
   }catch{setMessage("Không thể cập nhật. Dữ liệu offline vẫn được giữ lại.");}
   finally{setBusy(false)}
 }
 async function openArticle(slug:string){
   setError("");
   if(localDemo){
     setArticle(bundled.articles.find(a=>a.slug===slug)||null);
     return;
   }
   if(!sync){
     setError("Cần cấu hình Backend HTTPS trước khi xem nội dung.");
     return;
   }
   setBusy(true);
   try{
     const next=await sync.loadArticle(slug);
     if(!next){setError("Bài viết chưa được xuất bản hoặc đã bị thu hồi.");return;}
     setArticle(next);
   }catch{setError("Không thể tải bài viết. Hãy kết nối mạng và thử lại.");}
   finally{setBusy(false)}
 }
 const normalized=q.toLocaleLowerCase("vi-VN").trim();
 const list=articles.filter(a=>(!stage||a.stage===stage)&&
   (!normalized||[a.title,a.summary].join(" ").toLocaleLowerCase("vi-VN").includes(normalized)));
 return <SafeAreaView style={s.root}><ScrollView contentContainerStyle={s.body}>
   <Text style={s.brand}>♡  Hành Trình Mẹ & Bé</Text>
   <Text style={s.notice}>{message}</Text>
   {error?<Text style={s.error}>{error}</Text>:null}
   {article?<View>
     <Pressable onPress={()=>{setArticle(null);setError("")}}><Text style={s.link}>← Quay lại danh sách</Text></Pressable>
     <Text style={s.warning}>{article.status==="published"?"ĐÃ XUẤT BẢN":"BẢN NHÁP · CHƯA THẨM ĐỊNH"}</Text>
     <Text style={s.title}>{article.title}</Text><Text style={s.p}>{article.summary}</Text>
     <Text style={s.disclaimer}>{bundled.disclaimer}</Text>
     {article.sections.map((x,i)=><View key={i}><Text style={s.heading}>{x.heading}</Text>
       {x.paragraphs.map((p,j)=><Text style={s.p} key={j}>{p}</Text>)}</View>)}
     <Text style={s.heading}>Nguồn tham khảo</Text>
     {article.sources.map(x=><Pressable key={x.url} onPress={()=>{void Linking.openURL(x.url)}}>
       <Text style={s.link}>{x.name} ↗</Text></Pressable>)}
   </View>:<View>
     {stage?<Pressable onPress={()=>{setStage(null);setQ("")}}><Text style={s.link}>← Tất cả giai đoạn</Text></Pressable>:null}
     <Text style={s.title}>{stages.find(x=>x.slug===stage)?.title||"Cùng con lớn lên, từng ngày"}</Text>
     <Text style={s.p}>Từ chuẩn bị mang thai đến khi con trưởng thành.</Text>
     {sync?<Pressable onPress={()=>{void refresh()}} disabled={busy} style={s.refresh}>
       <Text style={s.link}>{busy?"Đang đồng bộ...":"↻ Làm mới nội dung"}</Text></Pressable>:null}
     <TextInput style={s.input} placeholder="Tìm bài viết..." value={q} onChangeText={setQ}/>
     {!stage?stages.map(x=><Pressable style={s.card} key={x.slug} onPress={()=>setStage(x.slug)}>
       <Text style={s.heading}>{x.icon} {x.title}</Text>
       <Text style={s.p}>{x.range} · {x.description}</Text></Pressable>):null}
     <Text style={s.heading}>Bài viết</Text>
     {!list.length?<Text style={s.p}>{publicRelease?
       "Chưa có bài viết đã được thẩm định và xuất bản.":"Chưa có bài viết phù hợp."}</Text>:null}
     {list.map(x=><Pressable style={s.card} key={x.slug} disabled={busy}
       onPress={()=>{void openArticle(x.slug)}}>
       <Text style={s.warning}>{x.status==="published"?"NỘI DUNG ĐÃ XUẤT BẢN":"NỘI DUNG MẪU"}</Text>
       <Text style={s.heading}>{x.title}</Text><Text style={s.p}>{x.summary}</Text>
       <Text style={s.link}>Đọc bài →</Text></Pressable>)}
   </View>}
 </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:"#fffaf7"},body:{padding:22,paddingBottom:65},
 brand:{color:"#9c496e",fontSize:20,fontWeight:"800",marginTop:25,marginBottom:20},
 title:{fontSize:28,fontWeight:"800",color:"#352b35",marginBottom:15},
 heading:{fontSize:18,fontWeight:"700",color:"#352b35",marginTop:14,marginBottom:8},
 p:{color:"#776975",fontSize:14,lineHeight:24,marginBottom:12},
 link:{color:"#9c496e",fontSize:13,fontWeight:"700",marginVertical:12},
 warning:{backgroundColor:"#fff0f1",color:"#9c496e",padding:10,marginVertical:9,fontSize:12},
 disclaimer:{padding:12,backgroundColor:"#fff0f1",color:"#9c496e",marginBottom:12,fontSize:12,lineHeight:20},
 notice:{fontSize:12,color:"#776975",marginBottom:15},error:{color:"#9c2626",fontSize:13,marginBottom:15},
 refresh:{padding:9,borderWidth:1,borderColor:"#f0e3e6",borderRadius:9,alignSelf:"flex-start",marginBottom:16},
 input:{padding:15,borderWidth:1,borderColor:"#f0e3e6",backgroundColor:"white",borderRadius:12,marginBottom:20},
 card:{padding:18,backgroundColor:"white",borderWidth:1,borderColor:"#f0e3e6",borderRadius:14,marginBottom:12}
});
