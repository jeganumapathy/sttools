import{m as T,n as B,p as w,q as b,t as g,u as x,v as I,f as m,w as F,x as U,j as s,y as G,z as K,G as f,M as D,i as L,T as p}from"./index-5nELRKNd.js";import{C as W}from"./ComponentSkeleton-7YH015nb.js";function q(e){return T("MuiCircularProgress",e)}B("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);const A=["className","color","disableShrink","size","style","thickness","value","variant"];let y=e=>e,N,E,R,_;const l=44,V=w(N||(N=y`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`)),X=w(E||(E=y`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`)),Z=e=>{const{classes:r,variant:t,color:c,disableShrink:d}=e,u={root:["root",t,`color${g(c)}`],svg:["svg"],circle:["circle",`circle${g(t)}`,d&&"circleDisableShrink"]};return K(u,q,r)},H=b("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.root,r[t.variant],r[`color${g(t.color)}`]]}})(({ownerState:e,theme:r})=>x({display:"inline-block"},e.variant==="determinate"&&{transition:r.transitions.create("transform")},e.color!=="inherit"&&{color:(r.vars||r).palette[e.color].main}),({ownerState:e})=>e.variant==="indeterminate"&&I(R||(R=y`
      animation: ${0} 1.4s linear infinite;
    `),V)),J=b("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:(e,r)=>r.svg})({display:"block"}),O=b("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.circle,r[`circle${g(t.variant)}`],t.disableShrink&&r.circleDisableShrink]}})(({ownerState:e,theme:r})=>x({stroke:"currentColor"},e.variant==="determinate"&&{transition:r.transitions.create("stroke-dashoffset")},e.variant==="indeterminate"&&{strokeDasharray:"80px, 200px",strokeDashoffset:0}),({ownerState:e})=>e.variant==="indeterminate"&&!e.disableShrink&&I(_||(_=y`
      animation: ${0} 1.4s ease-in-out infinite;
    `),X)),Q=m.forwardRef(function(r,t){const c=F({props:r,name:"MuiCircularProgress"}),{className:d,color:u="primary",disableShrink:h=!1,size:a=40,style:i,thickness:n=3.6,value:o=0,variant:S="indeterminate"}=c,z=U(c,A),k=x({},c,{color:u,disableShrink:h,size:a,thickness:n,value:o,variant:S}),v=Z(k),C={},P={},$={};if(S==="determinate"){const M=2*Math.PI*((l-n)/2);C.strokeDasharray=M.toFixed(3),$["aria-valuenow"]=Math.round(o),C.strokeDashoffset=`${((100-o)/100*M).toFixed(3)}px`,P.transform="rotate(-90deg)"}return s.jsx(H,x({className:G(v.root,d),style:x({width:a,height:a},P,i),ownerState:k,ref:t,role:"progressbar"},$,z,{children:s.jsx(J,{className:v.svg,ownerState:k,viewBox:`${l/2} ${l/2} ${l} ${l}`,children:s.jsx(O,{className:v.circle,style:C,ownerState:k,cx:l,cy:l,r:(l-n)/2,fill:"none",strokeWidth:n})})}))}),j=[{id:"nifty",label:"Nifty 50",api:"/api/market/nse?index=nifty"},{id:"banknifty",label:"Bank Nifty",api:"/api/market/nse?index=banknifty"},{id:"sensex",label:"Sensex",api:"/api/market/bse?index=sensex"}];function re(){const[e,r]=m.useState({}),[t,c]=m.useState(!1),[d,u]=m.useState(null),h=m.useCallback(async()=>{c(!0),u(null);try{const a=await Promise.all(j.map(n=>fetch(n.api).then(o=>{if(!o.ok)throw new Error(`${n.label} fetch failed (${o.status})`);return o.json()}))),i={};a.forEach((n,o)=>{i[j[o].id]=n}),r(i)}catch(a){u(a.message||"Failed to fetch market data")}finally{c(!1)}},[]);return m.useEffect(()=>{h();const a=setInterval(h,30*1e3);return()=>clearInterval(a)},[h]),s.jsx(W,{children:s.jsx(f,{container:!0,spacing:2,children:s.jsx(f,{item:!0,xs:12,children:s.jsx(D,{title:"Market Ticker — Nifty / Bank Nifty / Sensex",children:s.jsxs(f,{container:!0,spacing:2,children:[s.jsxs(f,{item:!0,xs:12,sx:{display:"flex",gap:1,alignItems:"center"},children:[s.jsx(L,{variant:"outlined",onClick:h,disabled:t,children:"Refresh"}),t&&s.jsx(Q,{size:20}),d&&s.jsxs(p,{color:"error",children:["Error: ",d]})]}),j.map(a=>{const i=e[a.id];return s.jsx(f,{item:!0,xs:12,sm:4,children:s.jsx(D,{title:a.label,children:i?s.jsxs(s.Fragment,{children:[s.jsxs(p,{variant:"h5",children:["₹",i.lastPrice]}),s.jsxs(p,{color:i.change>=0?"success.main":"error.main",children:[i.change>=0?"▲":"▼"," ",i.change," (",i.percentChange,"%)"]}),s.jsx(p,{variant:"caption",color:"textSecondary",children:i.timestamp||"—"})]}):s.jsx(p,{color:"textSecondary",children:"No data"})})},a.id)})]})})})})})}export{re as default};
