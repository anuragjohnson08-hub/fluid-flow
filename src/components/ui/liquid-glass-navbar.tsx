"use client";

/**
 * Nimbus UI · Liquid Navbar — "Waterline"
 * Integrated & color-synced with Fluid Flow's Obsidian-Forest + Emerald palette.
 * Supports both standalone pill usage (`LiquidNavbar`) and PC-exclusive
 * horizontal/vertical menu attachment (`LiquidWaterSurface`) with WebGL water shader
 * and CSS liquid-drop fallback.
 */

import * as React from "react";
import { computeLiquidFrameDelta } from "../../utils/liquidSpeed";

export type NimbusFx = "plane" | "drop" | "spin" | "glow" | "wave" | "pop" | "none";

export type LiquidNavItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  /** the little scene the icon plays when tapped */
  fx?: NimbusFx;
};

export type LiquidTone = "light" | "dark" | "emerald" | "mono";
export type LiquidOrientation = "horizontal" | "vertical";

export type LiquidNavbarProps = {
  items?: LiquidNavItem[];
  defaultActive?: number;
  active?: number;
  onChange?: (index: number, item: LiquidNavItem) => void;
  /** "light" water for bright backgrounds, "dark" for dark ones, "emerald" synced to Fluid Flow */
  tone?: LiquidTone;
  /** icons only */
  compact?: boolean;
  /** soft synthesized "plip" on tap (no audio files) */
  sound?: boolean;
  /** restrict WebGL / CSS water effect to desktop viewports (>= 768px) */
  pcExclusive?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/* ---------- icons ---------- */
const I = (d: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
);

export const NimbusIcons = {
  home: I(
    <>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M6 9.6V20h12V9.6" />
      <path className="nv-door" d="M10 20v-5h4v5Z" />
    </>,
  ),
  globe: I(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17" />
    </>,
  ),
  plane: I(<path d="M21 12.2 3.6 5.4l2.7 6.8-2.7 6.4L21 12.2Zm-14.7 0H13" />),
  drop: I(<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z" />),
  user: I(
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20c1.2-3.4 4-5 7.2-5s6 1.6 7.2 5" />
    </>,
  ),
};

const DEFAULT_ITEMS: LiquidNavItem[] = [
  { label: "Home", icon: NimbusIcons.home, fx: "glow" },
  { label: "Explore", icon: NimbusIcons.globe, fx: "spin" },
  { label: "Flights", icon: NimbusIcons.plane, fx: "plane" },
  { label: "Weather", icon: NimbusIcons.drop, fx: "drop" },
  { label: "Profile", icon: NimbusIcons.user, fx: "wave" },
];

const PAD = 14; // canvas bleed around the container, for shadows and ripples

/* ---------- styles ---------- */
const NIMBUS_CSS = `
.nimbus-nav{--n-tint:rgba(255,255,255,.14);--n-fg:#0B132B;--n-fg-soft:rgba(11,19,43,.6);--n-rim:rgba(255,255,255,.7);
  position:relative;display:inline-flex;align-items:center;gap:2px;padding:6px;border-radius:999px;isolation:isolate;
  font-family:ui-sans-serif,-apple-system,"SF Pro Text","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;user-select:none;-webkit-tap-highlight-color:transparent}
.nimbus-nav[data-tone="dark"]{--n-tint:rgba(10,18,40,.26);--n-fg:#F1F7FF;--n-fg-soft:rgba(241,247,255,.66);--n-rim:rgba(255,255,255,.34)}
.nimbus-nav[data-tone="emerald"]{--n-tint:rgba(13,20,16,.78);--n-fg:#f9fafb;--n-fg-soft:#9ca3af;--n-rim:rgba(52,211,153,.36)}
.nimbus-nav[data-tone="mono"]{--n-tint:rgba(14,14,14,.78);--n-fg:#ffffff;--n-fg-soft:#a3a3a3;--n-rim:rgba(255,255,255,.32)}
.nimbus-surface-host{isolation:isolate}
.nimbus-surface-host[data-tone="emerald"]{--n-tint:rgba(13,20,16,.72);--n-rim:rgba(52,211,153,.28)}
.nimbus-surface-host[data-tone="mono"]{--n-tint:rgba(12,12,12,.76);--n-rim:rgba(255,255,255,.26)}
.nimbus-surface-host[data-orientation="vertical"][data-tone="emerald"]{--n-tint:rgba(6,10,8,.55);--n-rim:rgba(52,211,153,.12)}
.nimbus-surface-host[data-orientation="vertical"][data-tone="mono"]{--n-tint:rgba(8,8,8,.7);--n-rim:rgba(255,255,255,.14)}
.nimbus-glass{position:absolute;inset:0;border-radius:inherit;z-index:-2;overflow:hidden;background:var(--n-tint,rgba(12,12,12,.76));pointer-events:none;
  -webkit-backdrop-filter:blur(12px) saturate(1.25) brightness(1.06);backdrop-filter:blur(12px) saturate(1.25) brightness(1.06);
  box-shadow:inset 0 1px 1px var(--n-rim,rgba(255,255,255,.28)),inset 0 0 0 1px rgba(255,255,255,.12),0 12px 32px -14px rgba(0,0,0,.75),0 2px 6px rgba(0,0,0,.45)}
.nimbus-nav[data-tone="emerald"] .nimbus-glass,.nimbus-surface-host[data-tone="emerald"] .nimbus-glass{
  box-shadow:inset 0 1px 1px rgba(167,243,208,.22),inset 0 0 0 1px rgba(52,211,153,.16),0 10px 30px -12px rgba(6,78,59,.4),0 2px 8px rgba(0,0,0,.5)}
.nimbus-nav[data-tone="mono"] .nimbus-glass,.nimbus-surface-host[data-tone="mono"] .nimbus-glass{
  box-shadow:inset 0 1px 1px rgba(255,255,255,.2),inset 0 0 0 1px rgba(255,255,255,.12),0 10px 30px -12px rgba(0,0,0,.75),0 2px 8px rgba(0,0,0,.55)}
.nimbus-surface-host[data-orientation="vertical"][data-tone="emerald"] .nimbus-glass,
.nimbus-surface-host[data-orientation="vertical"][data-tone="mono"] .nimbus-glass{
  box-shadow:none}
.nimbus-nav[data-refract="on"] .nimbus-glass,.nimbus-surface-host[data-refract="on"] .nimbus-glass{
  -webkit-backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.25) brightness(1.06);
  backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.25) brightness(1.06)}
.nimbus-water{position:absolute;left:${-PAD}px;top:${-PAD}px;z-index:-1;pointer-events:none}
[data-gl="off"] .nimbus-water{display:none}
.nimbus-drop{display:none;position:absolute;top:0;left:0;border-radius:999px;z-index:-1;pointer-events:none;will-change:transform,width,height;
  background:radial-gradient(120% 140% at 30% 0%,rgba(255,255,255,.75),rgba(255,255,255,0) 55%),rgba(255,255,255,.38);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.95),inset 0 -2px 6px rgba(0,162,255,.22),inset 0 0 0 1px rgba(255,255,255,.55),0 6px 16px -6px rgba(0,70,140,.45)}
[data-tone="emerald"] .nimbus-drop{
  background:radial-gradient(120% 140% at 30% 0%,rgba(167,243,208,.48),rgba(16,185,129,0) 60%),rgba(16,185,129,.22);
  box-shadow:inset 0 1px 1px rgba(167,243,208,.62),inset 0 -2px 6px rgba(5,150,105,.45),inset 0 0 0 1px rgba(52,211,153,.42),0 6px 18px -6px rgba(16,185,129,.42)}
[data-tone="mono"] .nimbus-drop{
  background:radial-gradient(120% 140% at 30% 0%,rgba(255,255,255,.36),rgba(255,255,255,0) 60%),rgba(255,255,255,.16);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.58),inset 0 -2px 6px rgba(163,163,163,.32),inset 0 0 0 1px rgba(255,255,255,.34),0 6px 18px -6px rgba(255,255,255,.22)}
[data-gl="off"] .nimbus-drop{display:block}
.nimbus-item{position:relative;z-index:1;display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:0;border-radius:999px;background:none;color:var(--n-fg-soft);
  font-family:inherit;font-weight:500;font-size:14px;line-height:1;letter-spacing:-.01em;text-decoration:none;cursor:pointer;transition:color .25s}
.nimbus-item:hover,.nimbus-item[aria-current="page"]{color:var(--n-fg)}
.nimbus-item:focus-visible{outline:2px solid #ffffff;outline-offset:2px}
.nv-ico{position:relative;display:inline-flex;flex:none}
.nv-ico svg{transition:transform .45s cubic-bezier(.3,1.6,.5,1)}
.nimbus-item[aria-current="page"] .nv-ico svg{transform:translateY(-1px) scale(1.08)}
.nv-door{fill:transparent}
.nv-ico[data-fx="pop"] svg{animation:nvPop .5s cubic-bezier(.3,1.6,.5,1) both}
@keyframes nvPop{0%{transform:scale(.72)}60%{transform:scale(1.2)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"] svg{animation:nvPlane 1.15s cubic-bezier(.55,0,.3,1) both}
@keyframes nvPlane{0%{transform:none}12%{transform:translate(-3px,2px) rotate(7deg)}42%{transform:translate(64px,-26px) rotate(-24deg) scale(.9);opacity:0}43%{transform:translate(-60px,16px) rotate(-12deg) scale(.9);opacity:0}58%{opacity:1}80%{transform:translate(3px,-1px) rotate(2deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"]::after{content:"";position:absolute;left:55%;top:48%;height:2px;width:46px;border-radius:2px;transform-origin:0 50%;
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.9));animation:nvTrail 1.15s ease-out both;pointer-events:none}
@keyframes nvTrail{0%,8%{opacity:0;transform:rotate(-22deg) scaleX(0)}30%{opacity:.9;transform:rotate(-22deg) scaleX(1)}55%,100%{opacity:0;transform:rotate(-22deg) translateX(30px) scaleX(.2)}}
.nv-ico[data-fx="drop"] svg{animation:nvDrop .95s cubic-bezier(.4,0,.3,1) both;transform-origin:50% 100%}
@keyframes nvDrop{0%{transform:translateY(-1px)}26%{transform:translateY(-13px) scale(.88,1.12)}46%{transform:translateY(3px) scale(1.3,.68)}62%{transform:translateY(-3px) scale(.92,1.08)}80%{transform:translateY(0) scale(1.04,.97)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="drop"]::before,.nv-ico[data-fx="drop"]::after{content:"";position:absolute;bottom:0;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:currentColor;opacity:0;pointer-events:none}
.nv-ico[data-fx="drop"]::before{animation:nvSplashL .95s ease-out both}
.nv-ico[data-fx="drop"]::after{animation:nvSplashR .95s ease-out both}
@keyframes nvSplashL{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(-5px,-6px)}75%,100%{opacity:0;transform:translate(-11px,1px) scale(.4)}}
@keyframes nvSplashR{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(5px,-7px)}75%,100%{opacity:0;transform:translate(12px,1px) scale(.4)}}
.nv-ico[data-fx="spin"] svg{animation:nvSpin 1s cubic-bezier(.2,.75,.25,1) both}
@keyframes nvSpin{0%{transform:perspective(80px) rotateY(0)}100%{transform:perspective(80px) rotateY(360deg) translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] svg{animation:nvHop .8s cubic-bezier(.3,1.4,.5,1) both;transform-origin:50% 100%}
@keyframes nvHop{0%{transform:none}30%{transform:translateY(-5px) scale(1.04,.96)}55%{transform:translateY(0) scale(1.12,.88)}75%{transform:translateY(-2px) scale(.98,1.04)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] .nv-door{animation:nvDoor 1.3s ease both}
@keyframes nvDoor{0%{fill:transparent}30%{fill:#ffffff}100%{fill:rgba(255,255,255,.55)}}
.nv-ico[data-fx="wave"] svg{animation:nvWave .9s ease-in-out both;transform-origin:50% 92%}
@keyframes nvWave{0%{transform:none}20%{transform:rotate(-15deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(4deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nimbus-nav[data-compact="true"] .nimbus-item{padding:0 13px}
.nimbus-nav[data-compact="true"] .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:520px){.nimbus-nav:not([data-compact="false"]) .nimbus-item{padding:0 13px}.nimbus-nav:not([data-compact="false"]) .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}
@media (prefers-reduced-motion:reduce){.nv-ico svg,.nv-ico::before,.nv-ico::after,.nv-door{animation:none!important;transition:none}}
`;

let styleRefCount = 0;
function useNimbusStyles() {
  React.useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    styleRefCount += 1;
    let styleEl = document.getElementById("nimbus-waterline-css") as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "nimbus-waterline-css";
      styleEl.textContent = NIMBUS_CSS;
      document.head.appendChild(styleEl);
    }
    let filterSvg = document.getElementById("nimbus-refract-svg") as SVGSVGElement | null;
    if (!filterSvg) {
      const svgNS = "http://www.w3.org/2000/svg";
      filterSvg = document.createElementNS(svgNS, "svg");
      filterSvg.id = "nimbus-refract-svg";
      filterSvg.setAttribute("width", "0");
      filterSvg.setAttribute("height", "0");
      filterSvg.setAttribute("aria-hidden", "true");
      filterSvg.style.position = "absolute";
      filterSvg.style.pointerEvents = "none";
      filterSvg.innerHTML = `<filter id="nimbus-refract" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="2" seed="7" result="noise"/><feGaussianBlur in="noise" stdDeviation="2" result="soft"/><feDisplacementMap in="SourceGraphic" in2="soft" scale="60" xChannelSelector="R" yChannelSelector="G"/></filter>`;
      document.body.appendChild(filterSvg);
    }
    return () => {
      styleRefCount = Math.max(0, styleRefCount - 1);
      if (styleRefCount === 0) {
        const el = document.getElementById("nimbus-waterline-css");
        el?.parentNode?.removeChild(el);
        const svgEl = document.getElementById("nimbus-refract-svg");
        svgEl?.parentNode?.removeChild(svgEl);
      }
    };
  }, []);
}

/* ---------- the water shader (supports horizontal, vertical, and Fluid Flow emerald sync) ---------- */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;uniform float uPillRad;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;uniform float uEmerald;uniform float uMono;uniform float uShowRim;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;float rad=min(uPillRad,min(h.x,h.y));return sdRB(p-uPill.xy-h,h,rad);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,min(uPill.z,uPill.w)*.36)*2.4*uShowRim+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 oceanIrid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 vec3 emIrid=mix(vec3(0.04,0.48,0.34),vec3(0.20,0.83,0.60),.5+.5*cos(6.2831*(fres*.75+p.x*.0026+p.y*.002+uTime*.035)));
 vec3 monoIrid=vec3(0.45)+0.35*cos(6.2831*(fres*.75+p.x*.0026+p.y*.002+uTime*.035));
 vec3 irid=mix(mix(oceanIrid,emIrid,uEmerald),monoIrid,uMono);
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 shCol=mix(mix(vec3(0.,.14,.36),vec3(.02,.20,.13),uEmerald),vec3(.02),uMono);
 vec3 c=shCol*sh;float a=sh;
 float pa=clamp(pm*(fres*.42+spec*.7+spec2*.6)*uShowRim,0.,1.);
 vec3 borderWhite=mix(mix(vec3(1.),vec3(.35,.92,.72),uEmerald),vec3(.88),uMono);
 c=mix(borderWhite,irid,.55*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 oceanTint=mix(vec3(.80,.95,1.),vec3(.55,.82,1.),uDark);
 vec3 emTint=mix(vec3(.06,.68,.48),vec3(.04,.46,.32),uDark);
 vec3 monoTint=mix(vec3(.65),vec3(.36),uDark);
 vec3 tint=mix(mix(oceanTint,emTint,uEmerald),monoTint,uMono);
 float rim=dm*(1.-smoothstep(0.,7.,-dd));
 float cres=dm*smoothstep(.18,.62,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float toneMix=max(uEmerald,uMono);
 float da=dm*mix(.26+.18*body, .24+.14*body, toneMix)*(1.-.18*uDark);
 vec3 bodyHi=mix(mix(vec3(1.),vec3(.24,.85,.62),uEmerald),vec3(.92),uMono);
 vec3 dc=mix(tint,bodyHi,body*.42);
 float la=rim*mix(.22,.52,toneMix);
 vec3 oceanRim=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);
 vec3 emRim=vec3(.20,.83,.60);
 vec3 monoRim=vec3(.78);
 vec3 lc=mix(mix(oceanRim,emRim,uEmerald),monoRim,uMono);
 dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 vec3 glintCol=mix(mix(vec3(1.),vec3(.78,1.,.91),uEmerald),vec3(.96),uMono);
 la=clamp(cres*mix(.7,.42,toneMix)+smoothstep(.62,1.,cs)*mix(.28,.22,toneMix)*th*dm,0.,1.);dc=glintCol*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*mix(1.2,.85,toneMix)+spec2*mix(.5,.32,toneMix)),0.,1.);dc=glintCol*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*mix(.4,.55,toneMix);dc=mix(glintCol,irid,.45)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`;

type Body = { x: number; y: number; vx: number; vy: number };
type Sat = { x: number; y: number; vx: number; vy: number; r: number; k: number };
type Rip = { x: number; y: number; age: number; amp: number };

function makeState() {
  return {
    a: { x: 0, y: 0, vx: 0, vy: 0 } as Body,
    b: { x: 0, y: 0, vx: 0, vy: 0 } as Body,
    sy: { s: 1, v: 0 },
    lead: 0 as 0 | 1,
    lagRemaining: 0,
    sats: [] as Sat[],
    rips: [] as Rip[],
    t: { x: 0, y: 0, q: 0, r: 21 },
    q: 0,
    mouse: { x: 0, y: 0, s: 0, on: false },
    moving: false,
    split: false,
    ready: false,
    w: 0,
    h: 0,
    visible: true,
    reduce: false,
    raf: 0,
    last: 0,
    time: 0,
    glc: null as null | { gl: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> },
  };
}

function initGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    alpha: true,
    antialias: false,
  }) as WebGLRenderingContext | null;
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  gl.useProgram(p);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(p, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u: Record<string, WebGLUniformLocation | null> = {};
  for (const n of [
    "uRes",
    "uDpr",
    "uTime",
    "uPill",
    "uPillRad",
    "uBlob",
    "uSy",
    "uRip",
    "uMouse",
    "uDark",
    "uAmb",
    "uEmerald",
    "uMono",
    "uShowRim",
  ]) {
    u[n] = gl.getUniformLocation(p, n);
  }
  return { gl, u };
}

function supportsRefraction() {
  if (typeof window === "undefined" || typeof CSS === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /Chrome\/|Chromium\/|Edg\//.test(ua) &&
    !/Firefox\//.test(ua) &&
    !!(CSS as unknown as { supports?: (a: string, b: string) => boolean }).supports?.(
      "backdrop-filter",
      "url(#a)",
    )
  );
}

/* ---------- Shared Waterline Engine for arbitrary PC-exclusive menus ---------- */
export interface LiquidWaterSurfaceProps {
  hostRef: React.RefObject<HTMLElement | null>;
  itemRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  activeIndex: number;
  orientation?: LiquidOrientation;
  tone?: LiquidTone;
  borderRadius?: number;
  enabled?: boolean;
  rippleSignal?: { index: number; seq: number } | null;
  speed?: number;
}

export function LiquidWaterSurface({
  hostRef,
  itemRefs,
  activeIndex,
  orientation = "horizontal",
  tone = "emerald",
  borderRadius = 999,
  enabled = true,
  rippleSignal = null,
  speed = 1,
}: LiquidWaterSurfaceProps) {
  useNimbusStyles();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const dropRef = React.useRef<HTMLSpanElement>(null);
  const st = React.useRef(makeState());
  const [glState, setGlState] = React.useState<"on" | "off">("on");
  const [refract, setRefract] = React.useState(false);

  const dark = tone === "light" ? 0 : 1;
  const emerald = tone === "emerald" ? 1 : 0;
  const mono = tone === "mono" ? 1 : 0;
  const darkRef = React.useRef(dark);
  const emeraldRef = React.useRef(emerald);
  const monoRef = React.useRef(mono);
  const radiusRef = React.useRef(borderRadius);
  const orientRef = React.useRef(orientation);
  const speedRef = React.useRef(speed);
  darkRef.current = dark;
  emeraldRef.current = emerald;
  monoRef.current = mono;
  radiusRef.current = borderRadius;
  orientRef.current = orientation;
  speedRef.current = speed;

  const draw = React.useCallback(() => {
    const s = st.current;
    const T = s.t;
    const sep = Math.hypot(s.a.x - s.b.x, s.a.y - s.b.y);
    const span = orientRef.current === "vertical" ? Math.max(2 * T.r, 1) : Math.max(2 * (s.q + T.r), 1);
    const thin = Math.min(sep / span, 1);

    if (s.glc) {
      const { gl: g, u } = s.glc;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
      g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2);
      g.uniform1f(u.uDpr, dpr);
      g.uniform1f(u.uTime, s.time);
      g.uniform4f(u.uPill, PAD, PAD, s.w, s.h);
      g.uniform1f(u.uPillRad, radiusRef.current);

      const blobs = new Float32Array(24);
      const sy = new Float32Array(6).fill(1);
      const head = s.lead === 0 ? s.a : s.b;
      const tail = s.lead === 0 ? s.b : s.a;
      const isVert = orientRef.current === "vertical";

      blobs.set(
        [
          head.x,
          head.y,
          s.q * (1 - (isVert ? 0.14 : 0.25) * thin),
          T.r * (1 - (isVert ? 0.08 : 0.12) * thin),
          tail.x,
          tail.y,
          s.q * (1 - (isVert ? 0.55 : 0.8) * thin),
          T.r * (1 - (isVert ? 0.35 : 0.5) * thin),
        ],
        0,
      );
      sy[0] = sy[1] = s.sy.s;
      s.sats.slice(0, 4).forEach((d, i) => blobs.set([d.x, d.y, 0, d.r], 8 + i * 4));
      g.uniform4fv(u.uBlob, blobs);
      g.uniform1fv(u.uSy, sy);

      const rips = new Float32Array(24);
      s.rips.slice(-6).forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4));
      g.uniform4fv(u.uRip, rips);
      g.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s);
      g.uniform1f(u.uDark, darkRef.current);
      g.uniform1f(u.uAmb, s.reduce ? 0 : 1);
      g.uniform1f(u.uEmerald, emeraldRef.current);
      g.uniform1f(u.uMono, monoRef.current);
      g.uniform1f(u.uShowRim, orientRef.current === "vertical" ? 0 : 1);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.TRIANGLES, 0, 3);
    } else if (dropRef.current) {
      if (orientRef.current === "vertical") {
        const r = T.r * (1 - 0.18 * thin);
        const top = Math.min(s.a.y, s.b.y) - r - PAD;
        const left = T.x - s.q - T.r - PAD;
        const height = Math.abs(s.a.y - s.b.y) + 2 * r;
        const width = 2 * (s.q + T.r);
        dropRef.current.style.left = "0px";
        dropRef.current.style.top = "0px";
        dropRef.current.style.width = `${width}px`;
        dropRef.current.style.height = `${height}px`;
        dropRef.current.style.borderRadius = "10px";
        dropRef.current.style.transform = `translate3d(${left}px, ${top}px, 0) scaleY(${s.sy.s})`;
      } else {
        const r = T.r * (1 - 0.3 * thin);
        const left = Math.min(s.a.x, s.b.x) - s.q - r - PAD;
        const top = T.y - r - PAD;
        const width = Math.abs(s.a.x - s.b.x) + 2 * (s.q + r);
        const height = 2 * r;
        dropRef.current.style.left = "0px";
        dropRef.current.style.top = "0px";
        dropRef.current.style.width = `${width}px`;
        dropRef.current.style.height = `${height}px`;
        dropRef.current.style.borderRadius = "999px";
        dropRef.current.style.transform = `translate3d(${left}px, ${top}px, 0) scaleY(${s.sy.s})`;
      }
    }
  }, []);

  const step = React.useCallback((dt: number) => {
    const s = st.current;
    const T = s.t;
    s.time += dt;
    s.q += (T.q - s.q) * Math.min(1, dt * 12);
    const bodies = [s.a, s.b];
    let still = true;

    if (s.reduce) {
      s.a.x = s.b.x = T.x;
      s.a.y = s.b.y = T.y;
      s.a.vx = s.b.vx = s.a.vy = s.b.vy = 0;
      s.sy.s = 1;
      s.sats = [];
    } else {
      const loX = PAD + 6 + s.q + T.r - 3;
      const hiX = Math.max(loX, PAD + s.w - 6 - s.q - T.r + 3);
      const loY = PAD + 6 + T.r - 3;
      const hiY = Math.max(loY, PAD + s.h - 6 - T.r + 3);

      bodies.forEach((B, i) => {
        const lead = i === s.lead;
        const k = lead ? 210 : 72;
        const c = lead ? 25 : 13;
        const f = !lead && s.lagRemaining > 0 ? 0.08 : 1;

        B.vx += (k * (T.x - B.x) - c * B.vx) * dt * f;
        B.x += B.vx * dt;
        if (B.x < loX || B.x > hiX) {
          s.sy.v -= Math.min(Math.abs(B.vx), 900) * 0.0016;
          B.x = Math.max(loX, Math.min(hiX, B.x));
          B.vx *= -0.25;
        }

        B.vy += (k * (T.y - B.y) - c * B.vy) * dt * f;
        B.y += B.vy * dt;
        if (B.y < loY || B.y > hiY) {
          s.sy.v -= Math.min(Math.abs(B.vy), 900) * 0.0016;
          B.y = Math.max(loY, Math.min(hiY, B.y));
          B.vy *= -0.25;
        }

        if (
          Math.abs(T.x - B.x) > 0.3 ||
          Math.abs(B.vx) > 3 ||
          Math.abs(T.y - B.y) > 0.3 ||
          Math.abs(B.vy) > 3
        ) {
          still = false;
        }
      });
      s.lagRemaining = Math.max(0, s.lagRemaining - dt);

      const L = bodies[s.lead];
      const speed = Math.hypot(L.vx, L.vy);
      const syT = 1 - 0.2 * Math.min(speed / 1500, 1);
      s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt;
      s.sy.s += s.sy.v * dt;
      if (Math.abs(s.sy.s - 1) > 0.002 || Math.abs(s.sy.v) > 0.02) still = false;

      const sep = Math.hypot(s.a.x - s.b.x, s.a.y - s.b.y);
      const isVert = orientRef.current === "vertical";
      const threshold = isVert ? T.r * 2 - 4 : 2 * T.q + 2 * T.r - 6;

      if (!s.split && s.moving && sep > threshold) {
        s.split = true;
        const lo = bodies[1 - s.lead];
        const hi = bodies[s.lead];
        [0.3, 0.5, 0.72].forEach((t, j) => {
          s.sats.push({
            x: lo.x + (hi.x - lo.x) * t + (Math.random() - 0.5) * 6,
            y: lo.y + (hi.y - lo.y) * t + (Math.random() - 0.5) * 6,
            vx: (lo.vx + hi.vx) * 0.45 + (isVert ? (Math.random() - 0.5) * 40 : 0),
            vy: (lo.vy + hi.vy) * 0.45 + (isVert ? 0 : (Math.random() - 0.5) * 60),
            r: 5 + Math.random() * 3 - j * 0.5,
            k: 70 + Math.random() * 90,
          });
        });
      }

      s.sats = s.sats.filter((d) => {
        d.vx += (d.k * (T.x - d.x) - 9 * d.vx) * dt;
        d.vy += (d.k * (T.y - d.y) - 8 * d.vy) * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.x = Math.max(PAD + 8 + d.r, Math.min(PAD + s.w - 8 - d.r, d.x));
        d.y = Math.max(PAD + 8 + d.r, Math.min(PAD + s.h - 8 - d.r, d.y));
        const dx = Math.abs(T.x - d.x);
        const dy = Math.abs(T.y - d.y);
        if (dx < T.q + T.r * 0.5 && dy < T.r * 0.75) {
          d.r -= dt * 26;
        }
        return d.r > 0.6;
      });
      if (s.sats.length) still = false;
    }

    if (s.moving && still) {
      s.moving = false;
      if (s.split || !s.reduce) {
        s.rips.push({ x: T.x, y: T.y, age: 0, amp: s.split ? 1.2 : 0.75 });
      }
    }
    s.rips.forEach((p) => (p.age += dt));
    s.rips = s.rips.filter((p) => p.age < 2.4);
    const target = s.mouse.on ? 1 : 0;
    s.mouse.s += (target - s.mouse.s) * Math.min(1, dt * 7);
  }, []);

  const loop = React.useCallback(() => {
    const s = st.current;
    if (s.raf || !s.ready) return;
    s.last = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.max(0.001, Math.min((now - s.last) / 1000, 0.35));
      s.last = now;
      const simElapsed = computeLiquidFrameDelta(elapsed, speedRef.current);
      const substeps = Math.max(1, Math.min(16, Math.ceil(simElapsed / 0.016)));
      const subDt = simElapsed / substeps;
      for (let stepIdx = 0; stepIdx < substeps; stepIdx++) {
        step(subDt);
      }
      draw();
      const busy = s.moving || s.rips.length > 0 || s.sats.length > 0 || s.mouse.s > 0.01;
      if (s.visible && (!s.reduce || busy)) {
        s.raf = requestAnimationFrame(tick);
      } else {
        s.raf = 0;
      }
    };
    s.raf = requestAnimationFrame(tick);
  }, [draw, step]);

  const measure = React.useCallback(() => {
    const host = hostRef.current;
    const el = itemRefs.current[activeIndex];
    if (!host || !el || host.offsetWidth === 0 || el.offsetWidth === 0) return;

    const s = st.current;
    const hostRect = host.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    s.w = host.offsetWidth;
    s.h = host.offsetHeight;

    const T = s.t;
    T.r = elRect.height / 2;
    T.q = Math.max(0, elRect.width / 2 - T.r);
    const nx = PAD + (elRect.left - hostRect.left) + elRect.width / 2;
    const ny = PAD + (elRect.top - hostRect.top) + elRect.height / 2;

    if (!s.ready) {
      s.a.x = s.b.x = nx;
      s.a.y = s.b.y = ny;
      s.q = T.q;
      s.ready = true;
    } else if (Math.abs(nx - T.x) > 0.5 || Math.abs(ny - T.y) > 0.5) {
      const da = Math.hypot(nx - s.a.x, ny - s.a.y);
      const db = Math.hypot(nx - s.b.x, ny - s.b.y);
      s.lead = da <= db ? 0 : 1;
      s.lagRemaining = 0.07;
      s.moving = true;
      s.split = false;
    }

    T.x = nx;
    T.y = ny;

    const cv = canvasRef.current;
    if (cv) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = s.w + PAD * 2;
      const Hh = s.h + PAD * 2;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(Hh * dpr);
        cv.style.width = `${W}px`;
        cv.style.height = `${Hh}px`;
      }
    }
    loop();
  }, [activeIndex, hostRef, itemRefs, loop]);

  React.useEffect(() => {
    if (!enabled) return;
    setRefract(supportsRefraction());
    const s = st.current;
    s.ready = false;
    s.reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const cv = canvasRef.current;
    s.glc = cv ? initGL(cv) : null;
    if (!s.glc) setGlState("off");

    const lost = (e: Event) => {
      e.preventDefault();
      s.glc = null;
      setGlState("off");
    };
    cv?.addEventListener("webglcontextlost", lost);

    const host = hostRef.current;
    if (!host) return;
    host.setAttribute("data-tone", tone);
    host.setAttribute("data-orientation", orientation);
    host.setAttribute("data-gl", s.glc ? "on" : "off");
    host.setAttribute("data-refract", supportsRefraction() ? "on" : "off");

    const io = new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
      if (s.visible) loop();
    });
    io.observe(host);

    const vis = () => {
      s.visible = document.visibilityState === "visible";
      if (s.visible) loop();
    };
    document.addEventListener("visibilitychange", vis);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = host.getBoundingClientRect();
      s.mouse.x = e.clientX - r.left + PAD;
      s.mouse.y = e.clientY - r.top + PAD;
      s.mouse.on = true;
      loop();
    };
    const onLeave = () => {
      s.mouse.on = false;
      loop();
    };
    const onDown = (e: PointerEvent) => {
      if (s.reduce) return;
      const r = host.getBoundingClientRect();
      s.rips.push({
        x: e.clientX - r.left + PAD,
        y: e.clientY - r.top + PAD,
        age: 0,
        amp: 0.85,
      });
      loop();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    measureRef.current();

    return () => {
      cv?.removeEventListener("webglcontextlost", lost);
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [enabled, hostRef, loop, tone]);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;
    host.setAttribute("data-tone", tone);
    host.setAttribute("data-orientation", orientation);
    host.setAttribute("data-gl", glState);
    host.setAttribute("data-refract", refract ? "on" : "off");
  }, [enabled, glState, hostRef, orientation, refract, tone]);

  React.useLayoutEffect(() => {
    if (enabled) measure();
  }, [enabled, measure, orientation]);

  React.useEffect(() => {
    if (enabled) measure();
  }, [enabled, measure, orientation]);

  React.useEffect(() => {
    if (!enabled || !rippleSignal) return;
    const s = st.current;
    const el = itemRefs.current[rippleSignal.index];
    const host = hostRef.current;
    if (!el || !host || s.reduce) return;
    const hr = host.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    s.rips.push({
      x: PAD + (er.left - hr.left) + er.width / 2,
      y: PAD + (er.top - hr.top) + er.height / 2,
      age: 0,
      amp: 0.9,
    });
    loop();
  }, [enabled, hostRef, itemRefs, loop, rippleSignal]);

  const measureRef = React.useRef(measure);
  measureRef.current = measure;
  React.useEffect(() => {
    if (!enabled || !hostRef.current) return;
    let lastW = -1;
    let lastH = -1;
    const ro = new ResizeObserver(() => {
      const host = hostRef.current;
      const w = host?.offsetWidth ?? 0;
      const h = host?.offsetHeight ?? 0;
      if (w !== lastW || h !== lastH) {
        lastW = w;
        lastH = h;
        st.current.ready = false;
        measureRef.current();
      }
    });
    ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, [enabled, hostRef]);

  if (!enabled) return null;

  return (
    <>
      <span className="nimbus-glass" aria-hidden="true" />
      <canvas className="nimbus-water" ref={canvasRef} aria-hidden="true" />
      <span className="nimbus-drop" ref={dropRef} aria-hidden="true" />
    </>
  );
}

/* ---------- Standalone LiquidNavbar Component ---------- */
export function LiquidNavbar({
  items = DEFAULT_ITEMS,
  defaultActive = 0,
  active,
  onChange,
  tone = "emerald",
  compact,
  sound = false,
  pcExclusive = false,
  className,
  style,
}: LiquidNavbarProps) {
  useNimbusStyles();
  const [inner, setInner] = React.useState(defaultActive);
  const current = active ?? inner;
  const navRef = React.useRef<HTMLElement>(null);
  const itemRefs = React.useRef<(HTMLElement | null)[]>([]);
  const iconRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const audio = React.useRef<AudioContext | null>(null);
  const [fx, setFx] = React.useState({ i: -1, n: 0 });
  const [rippleSignal, setRippleSignal] = React.useState<{ index: number; seq: number } | null>(null);
  const [isDesktop, setIsDesktop] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true,
  );

  React.useEffect(() => {
    if (!pcExclusive) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [pcExclusive]);

  const waterEnabled = !pcExclusive || isDesktop;

  const plip = () => {
    if (!sound) return;
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = (audio.current ||= new AC());
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(420 + Math.random() * 80, t);
      o.frequency.exponentialRampToValueAtTime(1500, t + 0.07);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.18);
    } catch {}
  };

  const select = (i: number) => {
    const kind = items[i]?.fx ?? (items[i]?.icon ? "pop" : "none");
    setFx((f) => ({ i, n: f.n + 1 }));
    plip();
    if (kind === "drop") {
      window.setTimeout(() => setRippleSignal((s) => ({ index: i, seq: (s?.seq ?? 0) + 1 })), 430);
    } else if (kind === "plane") {
      setRippleSignal((s) => ({ index: i, seq: (s?.seq ?? 0) + 1 }));
    }
    if (i !== current) {
      if (active === undefined) setInner(i);
      onChange?.(i, items[i]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (current + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    select(n);
    itemRefs.current[n]?.focus();
  };

  return (
    <nav
      ref={navRef as React.RefObject<HTMLElement>}
      className={["nimbus-nav", className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-compact={compact === undefined ? undefined : String(compact)}
      aria-label="Main"
      onKeyDown={onKeyDown}
      style={style}
    >
      {items.map((it, i) => {
        const kind = it.fx ?? "pop";
        const playing = fx.i === i && kind !== "none";
        const commonProps = {
          ref: (el: HTMLElement | null) => {
            itemRefs.current[i] = el;
          },
          className: "nimbus-item",
          "aria-current": i === current ? ("page" as const) : undefined,
          onClick: () => select(i),
        };
        const content = (
          <>
            {it.icon && (
              <span
                className="nv-ico"
                key={playing ? fx.n : 0}
                data-fx={playing ? kind : undefined}
                ref={(el) => {
                  iconRefs.current[i] = el;
                }}
              >
                {it.icon}
              </span>
            )}
            <span className="nimbus-label">{it.label}</span>
          </>
        );
        return it.href ? (
          <a
            key={it.label + i}
            {...(commonProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
            href={it.href}
            aria-label={it.label}
          >
            {content}
          </a>
        ) : (
          <button
            key={it.label + i}
            {...(commonProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            type="button"
            aria-label={it.label}
          >
            {content}
          </button>
        );
      })}
      <LiquidWaterSurface
        hostRef={navRef}
        itemRefs={itemRefs}
        activeIndex={current}
        orientation="horizontal"
        tone={tone}
        borderRadius={999}
        enabled={waterEnabled}
        rippleSignal={rippleSignal}
      />
    </nav>
  );
}

/** alias for registries that import { Component } */
export { LiquidNavbar as Component };

export default LiquidNavbar;
