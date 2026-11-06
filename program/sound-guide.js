'use strict';
(function(root){
 let ctx=null,nodes=[],key=null,enabled=true;
 function cancel(){nodes.forEach(n=>{try{n.stop();}catch{}});nodes=[];key=null;}
 async function unlock(on=true){enabled=on;if(!on){cancel();try{if(root.navigator?.audioSession)root.navigator.audioSession.type='auto';}catch{}return false;}try{if(root.navigator?.audioSession)root.navigator.audioSession.type='playback';}catch{}const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return false;try{ctx=ctx||new Audio();await ctx.resume();return ctx.state==='running';}catch{return false;}}
 function tone(at,frequency,duration=.22){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=frequency;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.22,at+.015);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g);g.connect(ctx.destination);o.start(at);o.stop(at+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();nodes=nodes.filter(n=>n!==o);};nodes.push(o);}
 function chime(at){[0,.3,.6].forEach((delta,i)=>tone(at+delta,i===2?1046:784,.26));}
 function play(){if(!enabled||ctx?.state!=='running')return false;chime(ctx.currentTime+.02);return true;}
 function schedule(id,remaining){if(!enabled||ctx?.state!=='running'||remaining<=0)return false;if(key===id)return true;cancel();key=id;chime(ctx.currentTime+remaining/1000);return true;}
 function scheduled(id){return key===id;}
 root.FitableSound={unlock,cancel,play,schedule,scheduled,status:()=>({state:ctx?.state||'unavailable',enabled,scheduled:!!key})};
})(globalThis);
