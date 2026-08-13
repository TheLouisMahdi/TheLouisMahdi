const ROOT="assets/windows7/wallpapers"

export const WINDOWS7_WALLPAPERS=[
  {name:"Windows 7",folder:"windows",files:["img0.jpg"]},
  {name:"Architecture",folder:"architecture",files:Array.from({length:6},(_,index)=>`img${index+13}.jpg`)},
  {name:"Characters",folder:"characters",files:Array.from({length:6},(_,index)=>`img${index+19}.jpg`)},
  {name:"Landscapes",folder:"landscapes",files:Array.from({length:6},(_,index)=>`img${index+7}.jpg`)},
  {name:"Nature",folder:"nature",files:Array.from({length:6},(_,index)=>`img${index+1}.jpg`)},
  {name:"Scenes",folder:"scenes",files:Array.from({length:6},(_,index)=>`img${index+25}.jpg`)},
  {name:"United States",folder:"united-states",files:Array.from({length:6},(_,index)=>`US-wp${index+1}.jpg`)}
]

export function wallpaperAsset(category,index=0){
  const group=WINDOWS7_WALLPAPERS.find(item=>item.name===category)||WINDOWS7_WALLPAPERS[0]
  const file=group.files[Math.max(0,index)%group.files.length]
  return `${ROOT}/${group.folder}/${file}`
}

export function wallpaperThumbnail(category,index=0){
  return wallpaperAsset(category,index).replace(`${ROOT}/`,`${ROOT}/thumbnails/`)
}
