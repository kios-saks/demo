export const stageGroups=[
 {title:"Chuẩn bị mang thai",description:"Trước khi đón bé",image:"chuan-bi-mang-thai",stages:[["chuan-bi-mang-thai","Chuẩn bị mang thai"]]},
 {title:"Thai kỳ",description:"9 tháng yêu thương",image:"thai-ky-3-thang-giua",stages:[["thai-ky-3-thang-dau","3 tháng đầu"],["thai-ky-3-thang-giua","3 tháng giữa"],["thai-ky-3-thang-cuoi","3 tháng cuối"]]},
 {title:"Sau sinh",description:"Chăm sóc mẹ",image:"hau-san",stages:[["hau-san","Hậu sản"]]},
 {title:"Những tháng đầu đời",description:"0–12 tháng",image:"so-sinh",stages:[["so-sinh","Trẻ sơ sinh"],["nhu-nhi","Trẻ nhũ nhi"]]},
 {title:"Tuổi thơ",description:"1–5 tuổi",image:"mam-non",stages:[["tap-di","Trẻ tập đi"],["mam-non","Trẻ mầm non"]]},
 {title:"Cùng con trưởng thành",description:"6 tuổi trở lên",image:"tieu-hoc",stages:[["tieu-hoc","Tiểu học"],["thieu-nien","Thiếu niên"],["truong-thanh","Trưởng thành"]]}
];
export const stageOptions=stageGroups.flatMap(g=>g.stages);
export const readerTopics=["Giấc ngủ","Ăn dặm","Dinh dưỡng","Tiêm chủng","Phát triển","Tâm lý","Chăm sóc mẹ"];
export const normalizeSearch=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[đĐ]/g,"d").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
