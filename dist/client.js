window.__ModuleLoader__.load({id:'dsh-hypit-workbench',factory(require){
const module={exports:{}};let exports=module.exports;
var St=Object.create;var Le=Object.defineProperty;var Tt=Object.getOwnPropertyDescriptor;var Et=Object.getOwnPropertyNames;var It=Object.getPrototypeOf,jt=Object.prototype.hasOwnProperty;var At=(o,t)=>{for(var a in t)Le(o,a,{get:t[a],enumerable:!0})},We=(o,t,a,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of Et(t))!jt.call(o,s)&&s!==a&&Le(o,s,{get:()=>t[s],enumerable:!(r=Tt(t,s))||r.enumerable});return o};var Te=(o,t,a)=>(a=o!=null?St(It(o)):{},We(t||!o||!o.__esModule?Le(a,"default",{value:o,enumerable:!0}):a,o)),qt=o=>We(Le({},"__esModule",{value:!0}),o);var Dn={};At(Dn,{VERSION:()=>Tn,apply:()=>qn,default:()=>Ln,inject:()=>Sn});module.exports=qt(Dn);var _=Te(require("react"),1);var Je="dsh-hypit-workbench",$e="hypitWorkbench",Ge={mode:"strict",typeSymbol:"HypitWorkbenchJson",create:()=>({parse(o){if(!o||typeof o!="object"||Array.isArray(o))throw new TypeError("Expected an object");return o}})},Qe=[{id:$e+"/request",service:$e,namespace:$e,method:"request",invocation:{kind:"direct"},parameters:[{name:"input",wire:"input",source:"json",codec:Ge}],cancellation:{parameter:"signal"},result:Ge}];var Re=`/*
 * Hypit 视频工作台 — 浅色 · 媒体架
 * 颜色全部来自宿主 --dsw-alias-*；唯一的品牌色是 Hypit 粉，只用在「播放头」和录制点。
 * 间距 4/8 节奏；字号阶梯 11 · 12 · 13 · 15 · 20 · clamp(28–44)。
 */

.hw-root {
  /* Only real host tokens (dsh-client-ui-theme); fallbacks = light theme. */
  --hw-bg: var(--dsw-alias-bg-base, #ffffff);
  /* Host layers are pure white in light mode, so tint from ink instead. */
  --hw-panel: color-mix(in srgb, var(--hw-ink) 2.5%, var(--hw-bg));
  --hw-sunken: color-mix(in srgb, var(--hw-ink) 5.5%, var(--hw-bg));
  --hw-ink: var(--dsw-alias-label-primary, #0f1115);
  --hw-ink-2: var(--dsw-alias-label-secondary, #565b61);
  --hw-ink-3: var(--dsw-alias-label-tertiary, #82878d);
  --hw-line: var(--dsw-alias-border-l2, rgba(15, 17, 21, 0.1));
  --hw-line-2: var(--dsw-alias-border-l1, rgba(15, 17, 21, 0.06));
  --hw-accent: var(--dsw-alias-state-business-primary, #4176e6);
  --hw-fill: var(--dsw-alias-label-primary, #0f1115);
  --hw-fill-ink: var(--dsw-alias-bg-base, #ffffff);
  --hw-ok: var(--dsw-alias-state-success-primary, #1f9d5a);
  --hw-warn: #d97706;
  --hw-bad: var(--dsw-alias-state-error-primary, #d93f3f);
  --hw-code: var(--dsw-alias-markdown-code-block, #f6f7f8);
  --hw-brand: #e94765;
  --hw-brand-2: #f1738c;
  --hw-mono: 'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace;
  --hw-ease: cubic-bezier(0.22, 0.7, 0.2, 1);
  --hw-spring: cubic-bezier(0.34, 1.4, 0.64, 1);
  --hw-shadow-pop: 0 1px 2px rgba(15, 17, 21, 0.05), 0 18px 44px -18px rgba(15, 17, 21, 0.32);
}

.hw-root {
  --hw-gutter: clamp(20px, 4.2cqw, 56px);
  container-type: inline-size;
  container-name: hw;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--hw-bg);
  color: var(--hw-ink);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 13px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.hw-root *, .hw-root *::before, .hw-root *::after { box-sizing: border-box; }
:where(.hw-root) :where(button, input, select, textarea) { font: inherit; color: inherit; }
.hw-root :focus-visible { outline: 2px solid color-mix(in srgb, var(--hw-accent) 70%, transparent); outline-offset: 2px; border-radius: 6px; }

.hw-icon { display: block; flex: none; }
.hw-logo-on-light { display: block; height: 15px; }
.hw-logo-on-dark { display: none; height: 15px; }
[data-ds-dark-theme] .hw-logo-on-light, [data-theme='dark'] .hw-logo-on-light { display: none; }
[data-ds-dark-theme] .hw-logo-on-dark, [data-theme='dark'] .hw-logo-on-dark { display: block; }

/* Dark: the host flips --dsw-alias-*; only shadows and the brand need care. */
[data-ds-dark-theme] .hw-root {
  --hw-shadow-pop: 0 0 0 0.5px rgba(255, 255, 255, 0.06), 0 18px 44px -14px rgba(0, 0, 0, 0.7);
  --hw-brand: #f1738c;
}
[data-ds-dark-theme] .hw-cta { box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 12px 24px -14px rgba(0, 0, 0, 0.8); }
[data-ds-dark-theme] .hw-next { background: radial-gradient(90% 120% at 100% 0%, color-mix(in srgb, var(--hw-brand) 9%, transparent) 0%, transparent 55%), var(--hw-panel); }
[data-ds-dark-theme] .hw-tab.is-on, [data-ds-dark-theme] .hw-seg button.is-on { background: color-mix(in srgb, var(--hw-ink) 16%, var(--hw-sunken)); box-shadow: none; }
[data-ds-dark-theme] .hw-next-numeral { -webkit-text-stroke-color: color-mix(in srgb, var(--hw-ink) 12%, transparent); }
.hw-mono { font-family: var(--hw-mono); font-size: 11px; font-variant-numeric: tabular-nums; letter-spacing: 0; }

.hw-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--hw-line); flex: none; }
.hw-status-dot.is-ok { background: var(--hw-ok); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hw-ok) 14%, transparent); }
.hw-status-dot.is-warn { background: var(--hw-warn); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hw-warn) 16%, transparent); }

.hw-dot { width: 6px; height: 6px; border-radius: 50%; flex: none; background: var(--hw-ink-3); }
.hw-dot.is-write { background: var(--hw-warn); }
.hw-dot.is-check { background: var(--hw-ink-2); }
.hw-dot.is-render { background: var(--hw-brand); }
.hw-dot.is-review { background: var(--hw-ok); }

.hw-tag {
  font-size: 11px;
  line-height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  white-space: nowrap;
  color: var(--hw-ink-2);
  background: var(--hw-sunken);
}
.hw-tag.is-write { color: color-mix(in srgb, var(--hw-warn) 82%, var(--hw-ink)); background: color-mix(in srgb, var(--hw-warn) 11%, transparent); }
.hw-tag.is-render { color: color-mix(in srgb, var(--hw-brand) 88%, var(--hw-ink)); background: color-mix(in srgb, var(--hw-brand) 9%, transparent); }
.hw-tag.is-review { color: color-mix(in srgb, var(--hw-ok) 85%, var(--hw-ink)); background: color-mix(in srgb, var(--hw-ok) 10%, transparent); }

/* ── buttons ─────────────────────────────────────── */

.hw-icon-btn {
  appearance: none;
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--hw-ink-2);
  cursor: pointer;
  transition: background 0.18s var(--hw-ease), color 0.18s var(--hw-ease), transform 0.18s var(--hw-ease);
}
.hw-icon-btn:hover { background: var(--hw-sunken); color: var(--hw-ink); }
.hw-icon-btn:active { transform: scale(0.94); }
.hw-icon-btn.is-tiny { width: 22px; height: 22px; border-radius: 6px; }
.hw-icon-btn.is-busy .hw-icon { animation: hw-spin 0.9s linear infinite; }

.hw-pill-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 11px;
  border: 1px solid var(--hw-line-2);
  border-radius: 999px;
  background: var(--hw-bg);
  color: var(--hw-ink-2);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s var(--hw-ease), color 0.18s var(--hw-ease), border-color 0.18s var(--hw-ease);
}
.hw-pill-btn:hover, .hw-pill-btn.is-open { color: var(--hw-ink); border-color: var(--hw-line); background: var(--hw-panel); }
.hw-pill-btn.is-quiet { border-color: transparent; background: transparent; }
.hw-pill-btn.is-quiet:hover, .hw-pill-btn.is-quiet.is-open { background: var(--hw-sunken); border-color: transparent; }
.hw-pill-btn .hw-icon:last-child { opacity: 0.6; transition: transform 0.2s var(--hw-ease); }
.hw-pill-btn.is-open .hw-icon:last-child { transform: rotate(180deg); }

.hw-cta {
  appearance: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 18px 0 20px;
  border: 0;
  border-radius: 999px;
  background: var(--hw-fill);
  color: var(--hw-fill-ink) !important;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  isolation: isolate;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 17, 21, 0.18), 0 12px 24px -14px rgba(15, 17, 21, 0.7);
  transition: transform 0.22s var(--hw-ease), box-shadow 0.22s var(--hw-ease), opacity 0.18s var(--hw-ease);
}
.hw-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(100deg, transparent 30%, rgba(255, 255, 255, 0.16) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform 0.7s var(--hw-ease);
}
.hw-cta:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(15, 17, 21, 0.18), 0 18px 32px -16px rgba(15, 17, 21, 0.7); }
.hw-cta:hover::before { transform: translateX(120%); }
.hw-cta:active { transform: translateY(0) scale(0.98); }
.hw-cta .hw-icon { transition: transform 0.22s var(--hw-ease); }
.hw-cta:hover .hw-icon { transform: translateX(3px); }
.hw-cta.is-small { height: 32px; padding: 0 14px; gap: 7px; font-size: 12px; box-shadow: none; }
.hw-cta:disabled { opacity: 0.4; cursor: default; transform: none; }

.hw-text-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--hw-ink-2);
  font-size: 12.5px;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition: color 0.18s var(--hw-ease), text-decoration-color 0.18s var(--hw-ease), gap 0.18s var(--hw-ease);
}
.hw-text-btn:hover { color: var(--hw-ink); text-decoration-color: var(--hw-line); gap: 8px; }
.hw-text-btn.is-strong { color: var(--hw-ink); font-weight: 600; padding: 0; }

/* ── top bar ─────────────────────────────────────── */

.hw-top {
  position: relative;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  flex: none;
  padding: 0 16px 0 var(--hw-gutter);
  border-bottom: 1px solid var(--hw-line-2);
  background: var(--hw-bg);
}
.hw-brand { display: flex; align-items: center; gap: 10px; min-width: 0; flex: none; }
.hw-brand-rule { width: 1px; height: 14px; background: var(--hw-line); }
.hw-brand-name { font-size: 13px; font-weight: 650; letter-spacing: 0.01em; white-space: nowrap; }
.hw-mark { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; background: var(--hw-ink); color: var(--hw-fill-ink); }

.hw-studio { display: flex; flex-direction: column; flex: 1; min-height: 0; position: relative; }
.hw-studios {
  position: relative;
  display: flex;
  gap: 2px;
  margin-left: 6px;
  padding: 3px;
  border-radius: 11px;
  background: var(--hw-sunken);
}
.hw-studio-tab {
  appearance: none;
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 11px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 12.5px;
  color: var(--hw-ink-2);
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.22s var(--hw-ease), color 0.22s var(--hw-ease), box-shadow 0.22s var(--hw-ease);
}
.hw-studio-tab:hover { color: var(--hw-ink); }
.hw-studio-tab.is-on { background: var(--hw-bg); color: var(--hw-ink); font-weight: 600; box-shadow: 0 1px 2px rgba(15, 17, 21, 0.08), 0 2px 8px -4px rgba(15, 17, 21, 0.14); }
.hw-studio-tab .hw-logo-on-light, .hw-studio-tab .hw-logo-on-dark { height: 13px; opacity: 0.72; transition: opacity 0.2s var(--hw-ease); }
.hw-studio-tab.is-on .hw-logo-on-light, .hw-studio-tab.is-on .hw-logo-on-dark { opacity: 1; }

.hw-switch { position: relative; display: flex; align-items: center; gap: 4px; min-width: 0; }
.hw-switch-slash { color: var(--hw-line); font-size: 18px; font-weight: 300; margin: 0 2px 0 4px; }
.hw-switch-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 32px;
  padding: 0 9px 0 10px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  transition: background 0.18s var(--hw-ease);
}
.hw-switch-btn:hover, .hw-switch-btn.is-open { background: var(--hw-sunken); }
.hw-switch-name { font-size: 13px; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }
.hw-switch-count { font-family: var(--hw-mono); font-size: 10.5px; color: var(--hw-ink-3); font-variant-numeric: tabular-nums; }
.hw-switch-btn .hw-icon { color: var(--hw-ink-3); transition: transform 0.2s var(--hw-ease); }
.hw-switch-btn.is-open .hw-icon { transform: rotate(180deg); }

.hw-switch-pop { position: absolute; top: calc(100% + 8px); left: 14px; width: 340px; padding: 8px; animation: hw-pop-in 0.2s var(--hw-ease) both; transform-origin: top left; }
.hw-switch-pop .hw-pop-title { padding: 6px 8px 4px; }
.hw-switch-list { list-style: none; margin: 0; padding: 0; max-height: 360px; overflow: auto; }
.hw-switch-item {
  appearance: none;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 8px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s var(--hw-ease);
}
.hw-switch-item:hover { background: var(--hw-panel); }
.hw-switch-item.is-on { background: var(--hw-sunken); }
.hw-switch-index { font-family: var(--hw-mono); font-size: 10.5px; color: var(--hw-ink-3); }
.hw-switch-item.is-on .hw-switch-index { color: var(--hw-brand); }
.hw-switch-main { display: flex; flex-direction: column; min-width: 0; }
.hw-switch-main b { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hw-switch-main span { font-family: var(--hw-mono); font-size: 10.5px; color: var(--hw-ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hw-switch-empty { padding: 14px 10px; color: var(--hw-ink-3); font-size: 12px; }

.hw-search { display: flex; align-items: center; gap: 8px; margin: 2px 2px 6px; padding: 0 10px; height: 34px; border-radius: 9px; background: var(--hw-sunken); color: var(--hw-ink-3); }
.hw-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: 12.5px; color: var(--hw-ink); }

.hw-top-right { position: relative; margin-left: auto; display: flex; align-items: center; gap: 6px; }

.hw-pop-anchor { position: absolute; top: calc(100% + 10px); right: 0; z-index: 40; animation: hw-pop-in 0.2s var(--hw-ease) both; transform-origin: top right; }

.hw-pop {
  width: 280px;
  padding: 14px;
  background: var(--hw-bg);
  border: 1px solid var(--hw-line);
  border-radius: 14px;
  box-shadow: var(--hw-shadow-pop);
}
.hw-pop-title { margin: 0 0 10px; font-size: 11px; font-weight: 600; color: var(--hw-ink-3); letter-spacing: 0.02em; }
.hw-pop-rule { height: 1px; background: var(--hw-line-2); margin: 8px 0; }
.hw-pop-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; font-size: 11px; color: var(--hw-ink-3); }
.hw-pop-foot-note { margin: 10px 0 0; font-size: 11px; line-height: 1.6; color: var(--hw-ink-3); }
.hw-pop-env { width: 320px; }
.hw-pop-roots { width: 340px; }
.hw-pop-settings { position: absolute; top: calc(100% + 8px); right: 0; z-index: 40; width: 280px; animation: hw-pop-in 0.2s var(--hw-ease) both; transform-origin: top right; }
.hw-assistant-head .hw-pop-settings { top: calc(100% - 4px); right: 10px; width: auto; left: auto; min-width: 248px; max-width: min(300px, calc(100% - 20px)); }

.hw-env-row { display: grid; grid-template-columns: 8px minmax(0, 1fr) auto; align-items: center; gap: 4px 10px; padding: 6px 0; font-size: 12.5px; }
.hw-env-mark { width: 6px; height: 6px; border-radius: 50%; background: var(--hw-ok); }
.hw-env-mark.is-warn { background: var(--hw-warn); }
.hw-env-label { color: var(--hw-ink-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hw-env-row.is-root .hw-env-label { font-family: var(--hw-mono); font-size: 11px; }
.hw-env-row b { font-weight: 550; font-variant-numeric: tabular-nums; }
.hw-env-fix {
  grid-column: 2 / -1;
  appearance: none;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 6px 8px;
  border: 1px dashed var(--hw-line);
  border-radius: 8px;
  background: var(--hw-panel);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.18s var(--hw-ease);
}
.hw-env-fix:hover { border-color: var(--hw-ink-3); }
.hw-env-fix code { flex: 1; min-width: 0; font-family: var(--hw-mono); font-size: 10.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--hw-ink-2); }
.hw-env-fix span { font-size: 11px; color: var(--hw-ink); white-space: nowrap; }

.hw-roots-input {
  width: 100%;
  resize: vertical;
  font-family: var(--hw-mono);
  font-size: 12px;
  line-height: 1.7;
  color: var(--hw-ink);
  background: var(--hw-panel);
  border: 1px solid var(--hw-line);
  border-radius: 10px;
  padding: 9px 11px;
  transition: border-color 0.18s var(--hw-ease), box-shadow 0.18s var(--hw-ease);
}
.hw-roots-input:focus { outline: none; border-color: color-mix(in srgb, var(--hw-ink) 30%, transparent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--hw-ink) 5%, transparent); }

.hw-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; font-size: 11px; color: var(--hw-ink-3); }
.hw-field select, .hw-field input {
  font: inherit;
  font-size: 13px;
  color: var(--hw-ink);
  background: var(--hw-bg);
  border: 1px solid var(--hw-line);
  border-radius: 9px;
  height: 34px;
  padding: 0 10px;
  width: 100%;
}
.hw-field select:focus, .hw-field input:focus { outline: none; border-color: color-mix(in srgb, var(--hw-ink) 30%, transparent); }

.hw-seg { display: grid; grid-template-columns: repeat(4, 1fr); padding: 3px; gap: 2px; border-radius: 10px; background: var(--hw-sunken); }
.hw-seg button {
  appearance: none;
  height: 28px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  font-size: 12px;
  color: var(--hw-ink-2);
  cursor: pointer;
  transition: background 0.18s var(--hw-ease), color 0.18s var(--hw-ease), box-shadow 0.18s var(--hw-ease);
}
.hw-seg button:hover { color: var(--hw-ink); }
.hw-seg button.is-on { background: var(--hw-bg); color: var(--hw-ink); font-weight: 600; box-shadow: 0 1px 2px rgba(15, 17, 21, 0.1); }

/* ── toasts ──────────────────────────────────────── */

.hw-toasts { position: absolute; top: 12px; left: 50%; z-index: 50; display: flex; flex-direction: column; gap: 8px; transform: translateX(-50%); width: min(560px, calc(100% - 32px)); pointer-events: none; }
.hw-toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px 9px 14px;
  border-radius: 12px;
  background: var(--hw-bg);
  border: 1px solid var(--hw-line);
  box-shadow: var(--hw-shadow-pop);
  font-size: 12.5px;
  animation: hw-toast-in 0.36s var(--hw-spring) both;
}
.hw-toast-mark { width: 7px; height: 7px; border-radius: 50%; flex: none; background: var(--hw-bad); }
.hw-toast.is-ok .hw-toast-mark { background: var(--hw-ok); }
.hw-toast-text { flex: 1; min-width: 0; }

/* ── shell ───────────────────────────────────────── */

.hw-shell { display: grid; grid-template-columns: minmax(0, 1fr) clamp(340px, 30cqw, 420px); flex: 1; min-height: 0; }
.hw-shell.is-solo { grid-template-columns: minmax(0, 1fr); }

.hw-stage { position: relative; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.hw-stage-scroll { flex: 1; min-height: 0; overflow: auto; scrollbar-gutter: stable; }
.hw-stage-inner { max-width: 920px; padding: 0 var(--hw-gutter) 64px; }

/* masthead */

.hw-masthead { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding: clamp(28px, 5cqh, 52px) 0 28px; animation: hw-rise 0.6s var(--hw-ease) both; }
.hw-masthead-main { min-width: 0; }
.hw-masthead h1 {
  text-wrap: balance;
  margin: 10px 0 0;
  font-size: clamp(30px, 4.4cqw, 48px);
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.04em;
  overflow-wrap: anywhere;
}
.hw-masthead-side { display: flex; align-items: center; gap: 4px; padding-bottom: 4px; flex: none; }
.hw-updated { font-size: 11.5px; color: var(--hw-ink-3); margin-right: 4px; white-space: nowrap; }

.hw-path {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  min-height: 24px;
  font-family: var(--hw-mono);
  font-size: 11.5px;
  color: var(--hw-ink-3);
  cursor: pointer;
  transition: color 0.18s var(--hw-ease);
}
.hw-path span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hw-path em { font-style: normal; font-family: -apple-system, 'PingFang SC', sans-serif; font-size: 11px; opacity: 0; transform: translateX(-4px); transition: opacity 0.18s var(--hw-ease), transform 0.18s var(--hw-ease); }
.hw-path:hover, .hw-path:focus-visible { color: var(--hw-ink); }
.hw-path:hover em, .hw-path:focus-visible em { opacity: 1; transform: none; }

/* timeline — a scrubber with a playhead */

.hw-timeline { --hw-at: 0.125; position: relative; padding-top: 2px; animation: hw-rise 0.6s 0.06s var(--hw-ease) both; }
.hw-track { position: relative; height: 2px; border-radius: 2px; background: var(--hw-line); }
.hw-track-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: calc(var(--hw-at) * 100%);
  border-radius: inherit;
  background: var(--hw-ink);
  transform-origin: left center;
  animation: hw-grow 0.9s 0.2s var(--hw-ease) both;
}
.hw-playhead {
  position: absolute;
  top: 50%;
  left: calc(var(--hw-at) * 100%);
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: var(--hw-brand);
  box-shadow: 0 0 0 4px var(--hw-bg), 0 0 0 5px color-mix(in srgb, var(--hw-brand) 30%, transparent);
  animation: hw-fade 0.4s 0.9s var(--hw-ease) both;
}
.hw-playhead i {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px solid var(--hw-brand);
  opacity: 0;
  animation: hw-ping 2.4s 1.3s var(--hw-ease) infinite;
}
.hw-steps { list-style: none; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0; padding: 16px 0 0; }
.hw-step { display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; min-width: 0; }
.hw-step-head { display: inline-flex; align-items: center; gap: 7px; }
.hw-step-index {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 18px;
  padding: 0 4px;
  border-radius: 6px;
  font-family: var(--hw-mono);
  font-size: 10px;
  color: var(--hw-ink-3);
  background: var(--hw-sunken);
}
.hw-step-label { font-size: 13px; color: var(--hw-ink-3); white-space: nowrap; }
.hw-step-fact { font-size: 11.5px; color: var(--hw-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.hw-step.is-done .hw-step-index { background: var(--hw-ink); color: var(--hw-fill-ink); }
.hw-step.is-done .hw-step-label { color: var(--hw-ink-2); }
.hw-step.is-now .hw-step-index { background: var(--hw-brand); color: #fff; }
.hw-step.is-now .hw-step-label { color: var(--hw-ink); font-weight: 650; }
.hw-step.is-now .hw-step-fact { color: color-mix(in srgb, var(--hw-brand) 85%, var(--hw-ink)); }

/* next step */

.hw-next {
  position: relative;
  margin-top: 36px;
  padding: clamp(24px, 3.4cqw, 36px);
  border-radius: 20px;
  border: 1px solid var(--hw-line-2);
  background:
    radial-gradient(90% 120% at 100% 0%, color-mix(in srgb, var(--hw-brand) 5%, transparent) 0%, transparent 55%),
    linear-gradient(180deg, var(--hw-panel), var(--hw-bg));
  overflow: hidden;
  animation: hw-rise 0.6s 0.12s var(--hw-ease) both;
}
.hw-next-numeral {
  position: absolute;
  right: clamp(16px, 3cqw, 36px);
  bottom: -0.18em;
  font-size: clamp(120px, 16cqw, 200px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.06em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--hw-ink) 9%, transparent);
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  user-select: none;
  animation: hw-numeral 1s 0.25s var(--hw-ease) both;
}
.hw-next > :not(.hw-next-numeral) { position: relative; }
.hw-next-kicker { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 12px; font-weight: 600; color: var(--hw-ink-2); }
.hw-next-kicker .hw-mono { color: var(--hw-ink-3); font-weight: 400; }
.hw-next-rec { width: 8px; height: 8px; border-radius: 50%; background: var(--hw-brand); animation: hw-rec 2s ease-in-out infinite; }
.hw-next h2 { text-wrap: balance; margin: 14px 0 10px; font-size: clamp(22px, 2.6cqw, 28px); line-height: 1.2; font-weight: 700; letter-spacing: -0.025em; }
.hw-next-body { margin: 0; max-width: 52ch; text-wrap: pretty; color: var(--hw-ink-2); font-size: 14px; line-height: 1.75; }
.hw-next-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 18px; margin-top: 24px; }
.hw-next-hint { margin: 16px 0 0; font-size: 11.5px; color: var(--hw-ink-3); }

/* output */

.hw-output { margin-top: 48px; animation: hw-rise 0.6s 0.18s var(--hw-ease) both; }
.hw-tabs { display: flex; gap: 4px; padding: 3px; width: max-content; max-width: 100%; overflow-x: auto; border-radius: 12px; background: var(--hw-sunken); }
.hw-tab {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--hw-ink-2);
  font-size: 12.5px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s var(--hw-ease), color 0.2s var(--hw-ease), box-shadow 0.2s var(--hw-ease);
}
.hw-tab:hover { color: var(--hw-ink); }
.hw-tab.is-on { background: var(--hw-bg); color: var(--hw-ink); font-weight: 600; box-shadow: 0 1px 2px rgba(15, 17, 21, 0.08), 0 2px 8px -4px rgba(15, 17, 21, 0.12); }
.hw-tab-count { font-family: var(--hw-mono); font-size: 10.5px; color: var(--hw-ink-3); font-weight: 400; font-variant-numeric: tabular-nums; }

.hw-output-body { padding-top: 12px; }
.hw-rows, .hw-docs { list-style: none; margin: 0; padding: 0; }
.hw-rows li, .hw-docs li { animation: hw-rise 0.4s calc(var(--i, 0) * 40ms) var(--hw-ease) both; }
.hw-rows li + li { border-top: 1px solid var(--hw-line-2); }
.hw-row {
  appearance: none;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto 76px;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 56px;
  padding: 10px 10px 10px 4px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s var(--hw-ease);
}
.hw-rows li:hover + li, .hw-rows li:has(+ li:hover) { border-color: transparent; }
.hw-row:hover { background: var(--hw-panel); }
.hw-row-icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: var(--hw-sunken); color: var(--hw-ink-2); transition: background 0.2s var(--hw-ease), color 0.2s var(--hw-ease); }
.hw-row:hover .hw-row-icon { background: var(--hw-ink); color: var(--hw-fill-ink); }
.hw-row-name { font-family: var(--hw-mono); font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hw-row-name i { font-style: normal; color: var(--hw-ink-3); }
.hw-row-meta { display: inline-flex; gap: 6px; font-size: 11.5px; color: var(--hw-ink-3); white-space: nowrap; font-variant-numeric: tabular-nums; }
.hw-row-meta em { font-style: normal; opacity: 0.6; }
.hw-row-go { display: inline-flex; align-items: center; justify-content: flex-end; gap: 5px; font-size: 12px; color: var(--hw-ink); opacity: 0; transform: translateX(-6px); transition: opacity 0.2s var(--hw-ease), transform 0.2s var(--hw-ease); }
.hw-row:hover .hw-row-go, .hw-row:focus-visible .hw-row-go { opacity: 1; transform: none; }

.hw-docs li + li { border-top: 1px solid var(--hw-line-2); }
.hw-doc { appearance: none; display: flex; flex-direction: column; gap: 4px; width: 100%; padding: 16px 12px; border: 0; border-radius: 12px; background: transparent; text-align: left; cursor: pointer; transition: background 0.2s var(--hw-ease); }
.hw-doc:hover { background: var(--hw-panel); }
.hw-doc b { font-size: 14px; font-weight: 650; }
.hw-doc p { margin: 0; color: var(--hw-ink-2); font-size: 12.5px; line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hw-doc span { font-family: var(--hw-mono); font-size: 11px; color: var(--hw-ink-3); }

.hw-empty { display: flex; align-items: center; gap: 24px; padding: 28px 4px; animation: hw-rise 0.45s var(--hw-ease) both; }
.hw-empty-art { color: var(--hw-ink-3); flex: none; }
.hw-empty h3 { margin: 0 0 4px; font-size: 15px; font-weight: 650; letter-spacing: -0.01em; }
.hw-empty p { margin: 0 0 8px; max-width: 42ch; color: var(--hw-ink-2); font-size: 13px; line-height: 1.7; }

/* ── drawer ──────────────────────────────────────── */

.hw-drawer {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  background: var(--hw-bg);
  animation: hw-slide-in 0.34s var(--hw-ease) both;
}
.hw-drawer-head { display: flex; align-items: center; gap: 10px; height: 56px; padding: 0 12px 0 var(--hw-gutter); border-bottom: 1px solid var(--hw-line-2); flex: none; }
.hw-drawer-title { display: flex; align-items: center; gap: 9px; margin-right: auto; color: var(--hw-ink-2); }
.hw-drawer-title b { font-size: 14px; font-weight: 650; color: var(--hw-ink); }
.hw-drawer-title .hw-mono { color: var(--hw-ink-3); }
.hw-drawer-tabs { display: flex; gap: 4px; padding: 8px var(--hw-gutter); overflow-x: auto; border-bottom: 1px solid var(--hw-line-2); flex: none; }
.hw-drawer-tab {
  appearance: none;
  height: 28px;
  padding: 0 11px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-family: var(--hw-mono);
  font-size: 11.5px;
  color: var(--hw-ink-3);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s var(--hw-ease), color 0.18s var(--hw-ease);
}
.hw-drawer-tab:hover { color: var(--hw-ink); }
.hw-drawer-tab.is-on { background: var(--hw-sunken); color: var(--hw-ink); }

.hw-code { flex: 1; overflow: auto; padding: 20px var(--hw-gutter) 40px; background: var(--hw-panel); }
.hw-code-path { margin: 0 0 12px; font-family: var(--hw-mono); font-size: 11px; color: var(--hw-ink-3); }
.hw-code pre { margin: 0; font-family: var(--hw-mono); font-size: 12px; line-height: 1.85; color: var(--hw-ink); white-space: pre; transition: opacity 0.2s var(--hw-ease); }
.hw-code pre.is-dim { opacity: 0.4; }
.hw-code pre b { display: inline-block; width: 40px; padding-right: 18px; text-align: right; color: var(--hw-ink-3); font-weight: 400; user-select: none; opacity: 0.7; }
.hw-code-skeleton { display: flex; flex-direction: column; gap: 12px; padding-top: 30px; }
.hw-code-skeleton i, .hw-skeleton i { display: block; height: 10px; border-radius: 6px; background: linear-gradient(90deg, var(--hw-sunken) 0%, color-mix(in srgb, var(--hw-sunken) 40%, var(--hw-bg)) 50%, var(--hw-sunken) 100%) 0 0 / 200% 100%; animation: hw-shimmer 1.4s linear infinite; }
.hw-muted { color: var(--hw-ink-3); font-size: 12px; }
.hw-muted.is-bad { color: var(--hw-bad); }

/* ── states ──────────────────────────────────────── */

.hw-skeleton { max-width: 920px; padding: 52px var(--hw-gutter); }
.hw-state { min-height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px; color: var(--hw-ink-3); }
.hw-state h2 { margin: 0; font-size: 20px; color: var(--hw-ink); letter-spacing: -0.02em; }
.hw-state p { margin: 0; max-width: 380px; text-align: center; line-height: 1.7; }

.hw-setup { max-width: 680px; padding: clamp(40px, 7cqh, 72px) var(--hw-gutter) 64px; animation: hw-rise 0.6s var(--hw-ease) both; }
.hw-setup h2 { margin: 16px 0 12px; font-size: clamp(30px, 4.2cqw, 44px); line-height: 1.05; font-weight: 700; letter-spacing: -0.04em; }
.hw-setup-lead { margin: 0 0 40px; color: var(--hw-ink-2); font-size: 14px; line-height: 1.7; }
.hw-setup-steps { list-style: none; margin: 0; padding: 0; position: relative; }
.hw-setup-steps::before { content: ''; position: absolute; left: 13px; top: 14px; bottom: 14px; width: 1px; background: var(--hw-line); }
.hw-setup-steps li { position: relative; display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 18px; padding-bottom: 28px; animation: hw-rise 0.5s calc(0.1s + var(--i) * 70ms) var(--hw-ease) both; }
.hw-setup-num { position: relative; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--hw-bg); border: 1px solid var(--hw-line); font-family: var(--hw-mono); font-size: 10.5px; color: var(--hw-ink-2); }
.hw-setup-steps li.is-done .hw-setup-num { background: var(--hw-ink); border-color: var(--hw-ink); color: var(--hw-fill-ink); }
.hw-setup-main { display: flex; flex-direction: column; gap: 4px; padding-top: 4px; min-width: 0; }
.hw-setup-main > b { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 650; }
.hw-setup-main > b em { font-style: normal; font-size: 11px; font-weight: 500; color: var(--hw-ok); }
.hw-setup-main > span { color: var(--hw-ink-2); font-size: 13px; }
.hw-cmd {
  appearance: none;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding: 0 6px 0 14px;
  height: 40px;
  border: 1px solid var(--hw-line-2);
  border-radius: 10px;
  background: var(--hw-code);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.18s var(--hw-ease);
}
.hw-cmd:hover { border-color: var(--hw-line); }
.hw-cmd code { flex: 1; min-width: 0; font-family: var(--hw-mono); font-size: 12px; overflow-x: auto; white-space: nowrap; scrollbar-width: none; }
.hw-cmd > span { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px; border-radius: 7px; background: var(--hw-bg); font-size: 11.5px; color: var(--hw-ink-2); box-shadow: 0 1px 2px rgba(15, 17, 21, 0.08); white-space: nowrap; }
.hw-setup-roots { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 10px; }
.hw-setup-roots > span { display: flex; flex-wrap: wrap; gap: 4px 10px; font-size: 12px; color: var(--hw-ink-3); }
.hw-setup-roots > span.is-bad { color: var(--hw-bad); }
.hw-setup-roots code { font-family: var(--hw-mono); color: var(--hw-ink); }

/* ── assistant ───────────────────────────────────── */

.hw-assistant { position: relative; display: flex; flex-direction: column; min-height: 0; border-left: 1px solid var(--hw-line-2); background: var(--hw-panel); }
.hw-assistant.is-empty { background: linear-gradient(180deg, var(--hw-panel), var(--hw-bg)); }
.hw-assistant-head { position: relative; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 6px; height: 56px; padding: 0 10px 0 18px; border-bottom: 1px solid var(--hw-line-2); flex: none; }
.hw-assistant-title { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1 1 auto; }
.hw-assistant-title b { font-size: 13px; font-weight: 650; white-space: nowrap; flex: none; }
.hw-assistant-bound { min-width: 0; font-size: 12px; color: var(--hw-ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hw-assistant-bound::before { content: '·'; margin-right: 7px; }
.hw-live { width: 7px; height: 7px; border-radius: 50%; background: var(--hw-ok); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hw-ok) 15%, transparent); flex: none; }
.hw-live.is-busy { background: var(--hw-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hw-brand) 18%, transparent); animation: hw-rec 1.2s ease-in-out infinite; }
.hw-assistant-tools { position: static; display: flex; align-items: center; gap: 2px; flex: none; }
.hw-model-name { max-width: 96px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }

/* ── 对话记录：标题即切换器 ─────────────────────────── */
.hw-convo { position: static; min-width: 0; flex: 1 1 auto; display: flex; }
.hw-convo-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  height: 30px;
  margin-left: -6px;
  padding: 0 8px 0 6px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--hw-ink);
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.18s var(--hw-ease);
}
.hw-convo-btn:hover, .hw-convo-btn.is-open { background: var(--hw-sunken); }
.hw-convo-btn .hw-icon { flex: none; opacity: 0.5; transition: transform 0.22s var(--hw-ease), opacity 0.18s var(--hw-ease); }
.hw-convo-btn.is-open .hw-icon { transform: rotate(180deg); opacity: 0.9; }
.hw-convo-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hw-convo-count {
  flex: none;
  min-width: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--hw-sunken);
  color: var(--hw-ink-3);
  font-family: var(--hw-mono);
  font-size: 10px;
  font-weight: 500;
  line-height: 16px;
  text-align: center;
}
.hw-convo-btn:hover .hw-convo-count, .hw-convo-btn.is-open .hw-convo-count { background: var(--hw-bg); }
.hw-pop-convo { position: absolute; top: calc(100% - 4px); left: 10px; right: 10px; z-index: 40; width: auto; max-width: 380px; padding: 10px; animation: hw-pop-in 0.2s var(--hw-ease) both; transform-origin: top left; }
.hw-convo-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 4px 4px 8px 6px; }
.hw-convo-head .hw-pop-title { margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hw-convo-new {
  appearance: none;
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--hw-line);
  border-radius: 999px;
  background: var(--hw-bg);
  color: var(--hw-ink);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s var(--hw-ease), border-color 0.18s var(--hw-ease), transform 0.18s var(--hw-spring);
}
.hw-convo-new:hover { background: var(--hw-fill); border-color: var(--hw-fill); color: var(--hw-fill-ink); }
.hw-convo-new:active { transform: scale(0.96); }
.hw-convo-new:disabled { opacity: 0.45; cursor: not-allowed; }
.hw-convo-list { list-style: none; margin: 0; padding: 0; max-height: min(360px, 52vh); overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column; gap: 1px; }
.hw-convo-row { position: relative; display: flex; align-items: stretch; border-radius: 10px; animation: hw-rise 0.32s calc(var(--i, 0) * 24ms) var(--hw-ease) both; }
.hw-convo-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 2px;
  border-radius: 2px;
  background: var(--hw-brand);
  transform: scaleY(0);
  transition: transform 0.24s var(--hw-ease);
}
.hw-convo-row.is-on { background: var(--hw-panel); }
.hw-convo-row.is-on::before { transform: scaleY(1); }
.hw-convo-row:hover { background: var(--hw-sunken); }
.hw-convo-item {
  appearance: none;
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: baseline;
  gap: 8px;
  padding: 9px 6px 9px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.hw-convo-item:disabled { cursor: not-allowed; opacity: 0.5; }
.hw-convo-item:focus-visible { outline: none; }
.hw-convo-row:has(.hw-convo-item:focus-visible) { background: var(--hw-sunken); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--hw-accent) 55%, transparent); }
.hw-convo-index { font-family: var(--hw-mono); font-size: 10px; color: var(--hw-ink-3); font-variant-numeric: tabular-nums; }
.hw-convo-row.is-on .hw-convo-index { color: var(--hw-brand); }
.hw-convo-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.hw-convo-main b { font-size: 13px; font-weight: 550; line-height: 1.45; color: var(--hw-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hw-convo-row.is-on .hw-convo-main b { font-weight: 650; }
.hw-convo-main > span { font-size: 11px; color: var(--hw-ink-3); font-variant-numeric: tabular-nums; }
.hw-convo-live { display: inline-flex; align-items: center; gap: 5px; font-style: normal; color: color-mix(in srgb, var(--hw-brand) 85%, var(--hw-ink)); }
.hw-convo-live i { width: 6px; height: 6px; border-radius: 50%; background: var(--hw-brand); animation: hw-rec 1.2s ease-in-out infinite; }
.hw-convo-del {
  appearance: none;
  flex: none;
  align-self: center;
  display: grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  margin-right: 4px;
  padding: 0 6px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--hw-ink-3);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s var(--hw-ease), background 0.15s var(--hw-ease), color 0.15s var(--hw-ease);
}
.hw-convo-row:hover .hw-convo-del, .hw-convo-del:focus-visible, .hw-convo-del.is-confirm { opacity: 1; }
.hw-convo-del:hover { background: var(--hw-bg); color: var(--hw-ink); }
.hw-convo-del.is-confirm { background: color-mix(in srgb, var(--hw-bad) 12%, transparent); color: var(--hw-bad); }
.hw-convo-empty { margin: 4px 6px 2px; font-size: 12px; line-height: 1.7; color: var(--hw-ink-3); }
.hw-pop-convo .hw-pop-foot-note { margin: 8px 6px 2px; }
@media (hover: none) { .hw-convo-del { opacity: 1; } }

/* 模型弹层：只保留会话内可选项，管理统一跳设置 */
.hw-model-list { display: flex; flex-direction: column; gap: 2px; margin: 0 -4px 12px; max-height: 220px; overflow-y: auto; }
.hw-model-row {
  appearance: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--hw-ink-2);
  font: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s var(--hw-ease), color 0.15s var(--hw-ease);
}
.hw-model-row:hover { background: var(--hw-sunken); color: var(--hw-ink); }
.hw-model-row.is-on { color: var(--hw-ink); font-weight: 600; }
.hw-model-row .hw-radio { width: 14px; height: 14px; margin: 0; flex: none; }
.hw-model-row.is-on .hw-radio { border: 4.5px solid var(--hw-ink); }
.hw-model-current { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 0 0 12px; font-size: 13px; font-weight: 600; }
.hw-model-current span { font-size: 11px; font-weight: 400; color: var(--hw-ink-3); }
.hw-pop-link {
  appearance: none;
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% + 8px);
  margin: 2px -4px 0;
  padding: 8px;
  border: 0;
  border-top: 1px solid var(--hw-line-2);
  border-radius: 0 0 8px 8px;
  background: transparent;
  color: var(--hw-ink-2);
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: color 0.15s var(--hw-ease), background 0.15s var(--hw-ease);
}
.hw-pop-link .hw-icon:last-child { margin-left: auto; transition: transform 0.2s var(--hw-ease); }
.hw-pop-link:hover { color: var(--hw-ink); background: var(--hw-sunken); }
.hw-pop-link:hover .hw-icon:last-child { transform: translateX(2px); }

/* 读取历史时的骨架，避免先闪空状态 */
.hw-chat-skeleton { display: flex; flex-direction: column; gap: 14px; padding-top: 8px; }
.hw-chat-skeleton i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--hw-sunken) 0%, var(--hw-panel) 50%, var(--hw-sunken) 100%); background-size: 200% 100%; animation: hw-shimmer 1.4s linear infinite; }
.hw-chat-skeleton i:nth-child(1) { width: 52%; align-self: flex-end; height: 30px; border-radius: 12px; }
.hw-chat-skeleton i:nth-child(2) { width: 88%; }
.hw-chat-skeleton i:nth-child(3) { width: 64%; }
@keyframes hw-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

/* 素材弹层里的「生图模型」直达入口 */
.th-assets-model {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-left: auto;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--hw-line-2);
  border-radius: 999px;
  background: var(--hw-bg);
  color: var(--hw-ink-2);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s var(--hw-ease), border-color 0.15s var(--hw-ease), background 0.15s var(--hw-ease);
}
.th-assets-model:hover { color: var(--hw-ink); border-color: var(--hw-line); background: var(--hw-panel); }
.th-assets-model .hw-icon { opacity: 0.55; transition: transform 0.2s var(--hw-ease), opacity 0.15s var(--hw-ease); }
.th-assets-model:hover .hw-icon { opacity: 1; transform: translateX(2px); }

.hw-chat-log { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; outline: none; padding: 24px 20px 16px; display: flex; flex-direction: column; gap: 16px; scrollbar-gutter: stable; }

.hw-intro { display: flex; flex-direction: column; margin-top: auto; animation: hw-rise 0.6s 0.2s var(--hw-ease) both; }
.hw-intro-kicker { margin: 0; font-size: 12px; color: var(--hw-ink-3); }
.hw-intro h3 { margin: 6px 0 8px; font-size: 22px; line-height: 1.25; font-weight: 700; letter-spacing: -0.025em; }
.hw-intro-body { margin: 0 0 20px; color: var(--hw-ink-2); font-size: 13px; line-height: 1.75; }
.hw-prompts { display: flex; flex-direction: column; gap: 6px; }
.hw-prompt {
  appearance: none;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 14px;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--hw-line-2);
  border-radius: 12px;
  background: var(--hw-bg);
  text-align: left;
  cursor: pointer;
  animation: hw-rise 0.45s calc(0.3s + var(--i) * 60ms) var(--hw-ease) both;
  transition: border-color 0.18s var(--hw-ease), transform 0.18s var(--hw-ease), box-shadow 0.18s var(--hw-ease);
}
.hw-prompt-n { font-family: var(--hw-mono); font-size: 10.5px; color: var(--hw-ink-3); }
.hw-prompt-text { font-size: 12.5px; line-height: 1.5; color: var(--hw-ink-2); }
.hw-prompt .hw-icon { color: var(--hw-ink-3); opacity: 0; transform: translateX(-4px); transition: opacity 0.18s var(--hw-ease), transform 0.18s var(--hw-ease); }
.hw-prompt:hover { border-color: var(--hw-line); transform: translateY(-1px); box-shadow: 0 8px 20px -14px rgba(15, 17, 21, 0.35); }
.hw-prompt:hover .hw-prompt-text { color: var(--hw-ink); }
.hw-prompt:hover .hw-prompt-n { color: var(--hw-brand); }
.hw-prompt:hover .hw-icon { opacity: 1; transform: none; color: var(--hw-ink); }

.hw-turn { display: flex; animation: hw-rise 0.35s var(--hw-ease) both; }
.hw-turn-user { justify-content: flex-end; }
.hw-bubble { max-width: 88%; padding: 9px 13px; border-radius: 14px 14px 4px 14px; background: var(--hw-ink); color: var(--hw-fill-ink); font-size: 13px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
.hw-turn-body { min-width: 0; font-size: 13px; line-height: 1.75; word-break: break-word; }

.hw-trail { animation: hw-rise 0.35s var(--hw-ease) both; }
.hw-trail-head {
  appearance: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 3px 6px 3px 4px;
  margin-left: -4px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--hw-ink-3);
  font-size: 11.5px;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s var(--hw-ease), color 0.18s var(--hw-ease);
}
.hw-trail-head:hover { background: var(--hw-sunken); color: var(--hw-ink-2); }
.hw-trail-head > .hw-icon:last-child { opacity: 0.6; transition: transform 0.2s var(--hw-ease); }
.hw-trail-head[aria-expanded='true'] > .hw-icon:last-child { transform: rotate(180deg); }
.hw-trail.is-live .hw-trail-head > .hw-icon:first-child { color: var(--hw-brand); animation: hw-rec 1.2s ease-in-out infinite; }
.hw-trail-lead { margin-right: 2px; }
.hw-trail-chip { display: inline-flex; align-items: center; gap: 3px; height: 20px; padding: 0 7px; border-radius: 6px; background: var(--hw-sunken); font-family: var(--hw-mono); font-size: 10.5px; color: var(--hw-ink-2); }
.hw-trail-chip em { font-style: normal; color: var(--hw-ink-3); }
.hw-trail-now { margin: 4px 0 0; font-family: var(--hw-mono); font-size: 11px; color: var(--hw-ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; animation: hw-fade-in 0.3s var(--hw-ease) both; }
.hw-trail-list { margin: 6px 0 2px; padding: 8px 10px 8px 26px; border-radius: 10px; background: var(--hw-bg); border: 1px solid var(--hw-line-2); font-size: 11.5px; color: var(--hw-ink-2); max-height: 220px; overflow: auto; }
.hw-trail-list li { margin: 3px 0; }
.hw-trail-list li::marker { color: var(--hw-ink-3); font-family: var(--hw-mono); font-size: 10px; }
.hw-trail-list b { font-family: var(--hw-mono); font-weight: 500; font-size: 11px; color: var(--hw-ink); margin-right: 6px; }
.hw-trail-list span { color: var(--hw-ink-3); }
.hw-turn-note { margin: 0; text-align: center; font-size: 11px; color: var(--hw-ink-3); }
.hw-turn-note.is-error { color: color-mix(in srgb, var(--hw-bad) 85%, var(--hw-ink)); }

.hw-stop {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--hw-line);
  border-radius: 999px;
  background: var(--hw-bg);
  font-size: 11.5px;
  color: var(--hw-ink-2);
  cursor: pointer;
  transition: border-color 0.18s var(--hw-ease), color 0.18s var(--hw-ease);
}
.hw-stop span { width: 8px; height: 8px; border-radius: 2px; background: currentColor; }
.hw-stop:hover { color: var(--hw-bad); border-color: color-mix(in srgb, var(--hw-bad) 40%, transparent); }
.hw-send.is-stop { background: var(--hw-ink); }
.hw-send-stop { width: 10px; height: 10px; border-radius: 2px; background: var(--hw-fill-ink); }

.hw-question {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--hw-brand) 30%, var(--hw-line));
  background: var(--hw-bg);
  box-shadow: 0 10px 30px -22px color-mix(in srgb, var(--hw-brand) 60%, transparent);
  animation: hw-rise 0.4s var(--hw-spring) both;
}
.hw-question-kicker { display: flex; align-items: center; gap: 7px; margin: 0 0 10px; font-size: 11.5px; font-weight: 600; color: var(--hw-ink-2); }
.hw-question-item + .hw-question-item { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--hw-line-2); }
.hw-question-header { display: block; margin-bottom: 3px; font-size: 11px; color: var(--hw-ink-3); }
.hw-question-item > b { display: block; font-size: 13.5px; line-height: 1.5; font-weight: 650; }
.hw-question-detail { margin: 4px 0 0; font-size: 12px; line-height: 1.6; color: var(--hw-ink-2); }
.hw-question-options { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.hw-option {
  appearance: none;
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  gap: 10px;
  padding: 9px 11px;
  border: 1px solid var(--hw-line-2);
  border-radius: 11px;
  background: var(--hw-panel);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s var(--hw-ease), background 0.18s var(--hw-ease), transform 0.18s var(--hw-ease);
}
.hw-option:hover { border-color: var(--hw-line); background: var(--hw-bg); }
.hw-option:active { transform: scale(0.99); }
.hw-option.is-on { border-color: var(--hw-ink); background: var(--hw-bg); }
.hw-option > span:last-child { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.hw-option b { font-size: 12.5px; font-weight: 600; }
.hw-option > span:last-child > span { font-size: 11.5px; line-height: 1.55; color: var(--hw-ink-3); }
.hw-option-mark { display: grid; place-items: center; width: 16px; height: 16px; margin-top: 1px; border-radius: 50%; border: 1.5px solid var(--hw-line); color: var(--hw-fill-ink); transition: background 0.18s var(--hw-ease), border-color 0.18s var(--hw-ease); }
.hw-option-mark.is-check { border-radius: 5px; }
.hw-option.is-on .hw-option-mark { background: var(--hw-ink); border-color: var(--hw-ink); }
.hw-question-custom { width: 100%; height: 34px; margin-top: 8px; padding: 0 11px; border: 1px dashed var(--hw-line); border-radius: 10px; background: transparent; font: inherit; font-size: 12.5px; color: var(--hw-ink); }
.hw-question-custom:focus { outline: none; border-style: solid; border-color: color-mix(in srgb, var(--hw-ink) 30%, transparent); }
.hw-question-foot { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 12px; }

.hw-jump {
  position: absolute;
  left: 50%;
  bottom: 150px;
  z-index: 6;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--hw-line);
  border-radius: 999px;
  background: var(--hw-bg);
  color: var(--hw-ink);
  font-size: 12px;
  box-shadow: var(--hw-shadow-pop);
  transform: translateX(-50%);
  cursor: pointer;
  animation: hw-pop-up 0.24s var(--hw-spring) both;
}
.hw-jump:hover { border-color: var(--hw-ink-3); }
.hw-thinking { display: flex; align-items: center; gap: 9px; min-height: 28px; font-size: 12px; color: var(--hw-ink-2); animation: hw-rise 0.3s var(--hw-ease) both; }
.hw-thinking .hw-mono { color: var(--hw-ink-3); }
.hw-dots { display: inline-flex; gap: 3px; }
.hw-dots i { width: 5px; height: 5px; border-radius: 50%; background: var(--hw-brand); animation: hw-bounce 1.1s ease-in-out infinite; }
.hw-dots i:nth-child(2) { animation-delay: 0.15s; }
.hw-dots i:nth-child(3) { animation-delay: 0.3s; }

.hw-error-card { padding: 12px 14px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--hw-bad) 22%, transparent); background: color-mix(in srgb, var(--hw-bad) 5%, var(--hw-bg)); animation: hw-rise 0.35s var(--hw-ease) both; }
.hw-error-card b { font-size: 12.5px; font-weight: 650; }
.hw-error-card p { margin: 4px 0 6px; font-size: 12px; line-height: 1.6; color: var(--hw-ink-2); word-break: break-word; }

.hw-md > :first-child { margin-top: 0; }
.hw-md > :last-child { margin-bottom: 0; }
.hw-md-p { margin: 8px 0; }
.hw-md-h { margin: 16px 0 6px; font-size: 13.5px; font-weight: 700; line-height: 1.45; letter-spacing: -0.01em; }
.hw-md-list { margin: 6px 0; padding-left: 20px; }
.hw-md-list li { margin: 3px 0; }
.hw-md-list li::marker { color: var(--hw-ink-3); }
.hw-md-code { margin: 10px 0; padding: 11px 13px; border-radius: 10px; background: var(--hw-bg); border: 1px solid var(--hw-line-2); font-family: var(--hw-mono); font-size: 11.5px; line-height: 1.7; overflow: auto; white-space: pre-wrap; word-break: break-word; }
.hw-md-table { margin: 10px 0; overflow-x: auto; border: 1px solid var(--hw-line-2); border-radius: 10px; background: var(--hw-bg); }
.hw-md-table table { width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.55; }
.hw-md-table th, .hw-md-table td { padding: 7px 10px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--hw-line-2); }
.hw-md-table tr:last-child td { border-bottom: 0; }
.hw-md-table th { font-weight: 600; color: var(--hw-ink-2); background: var(--hw-panel); white-space: nowrap; }
.hw-md code { padding: 1px 5px; border-radius: 5px; background: var(--hw-sunken); font-family: var(--hw-mono); font-size: 11.5px; }
.hw-md-code code { padding: 0; background: transparent; }
.hw-md-quote { margin: 8px 0; padding: 2px 0 2px 12px; border-left: 2px solid var(--hw-brand); color: var(--hw-ink-2); }
.hw-md a { color: var(--hw-ink); text-decoration-color: color-mix(in srgb, var(--hw-brand) 60%, transparent); text-underline-offset: 3px; }
.hw-md strong { font-weight: 650; }

.hw-compose {
  position: relative;
  flex: none;
  margin: 0 12px 12px;
  padding: 12px 12px 8px 14px;
  border: 1px solid var(--hw-line);
  border-radius: 16px;
  background: var(--hw-bg);
  box-shadow: 0 1px 2px rgba(15, 17, 21, 0.04), 0 10px 30px -22px rgba(15, 17, 21, 0.35);
  transition: border-color 0.2s var(--hw-ease), box-shadow 0.2s var(--hw-ease);
}
.hw-compose:focus-within { border-color: color-mix(in srgb, var(--hw-ink) 26%, transparent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--hw-ink) 4%, transparent), 0 10px 30px -22px rgba(15, 17, 21, 0.35); }
.hw-compose.is-primed { animation: hw-primed 0.9s var(--hw-ease); }
.hw-compose textarea { display: block; width: 100%; min-height: 44px; max-height: 168px; resize: none; border: 0; outline: 0; padding: 0; background: transparent; font: inherit; font-size: 13.5px; line-height: 1.6; color: var(--hw-ink); }
.hw-compose textarea:focus-visible { outline: none; }
.hw-compose textarea::placeholder { color: var(--hw-ink-3); }
.hw-compose-bar { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.hw-compose-hint { margin-left: auto; font-size: 11px; color: var(--hw-ink-3); white-space: nowrap; }

.hw-send {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: var(--hw-fill);
  color: var(--hw-fill-ink) !important;
  cursor: pointer;
  flex: none;
  transition: transform 0.2s var(--hw-spring), opacity 0.18s var(--hw-ease);
}
.hw-send:hover:not(:disabled) { transform: scale(1.06); }
.hw-send:active:not(:disabled) { transform: scale(0.94); }
.hw-send:disabled { opacity: 0.22; cursor: default; }

.hw-access { position: relative; }
.hw-access-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  font-size: 11.5px;
  color: var(--hw-ink-2);
  cursor: pointer;
  transition: background 0.18s var(--hw-ease), color 0.18s var(--hw-ease);
}
.hw-access-btn:hover { background: var(--hw-sunken); color: var(--hw-ink); }
.hw-access-btn.is-full .hw-icon:first-child { color: var(--hw-ok); }
.hw-access-btn .hw-icon:last-child { opacity: 0.55; }
.hw-pop-access { position: absolute; bottom: calc(100% + 10px); left: -6px; z-index: 40; width: 300px; animation: hw-pop-up 0.2s var(--hw-ease) both; transform-origin: bottom left; }
.hw-access-list { display: flex; flex-direction: column; gap: 4px; }
.hw-access-item { appearance: none; display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 10px; padding: 10px; border: 1px solid transparent; border-radius: 10px; background: transparent; text-align: left; cursor: pointer; transition: background 0.18s var(--hw-ease), border-color 0.18s var(--hw-ease); }
.hw-access-item:hover { background: var(--hw-panel); }
.hw-access-item.is-on { border-color: var(--hw-line); background: var(--hw-panel); }
.hw-access-item > span:last-child { display: flex; flex-direction: column; gap: 2px; }
.hw-access-item b { font-size: 13px; font-weight: 600; }
.hw-access-item > span:last-child > span { font-size: 11.5px; line-height: 1.55; color: var(--hw-ink-3); }
.hw-radio { width: 16px; height: 16px; margin-top: 1px; border-radius: 50%; border: 1.5px solid var(--hw-line); transition: border 0.18s var(--hw-ease); }
.hw-access-item.is-on .hw-radio { border: 5px solid var(--hw-ink); }

.hw-spinner { display: inline-block; width: 13px; height: 13px; border-radius: 50%; border: 1.5px solid var(--hw-line); border-top-color: var(--hw-ink-2); animation: hw-spin 0.8s linear infinite; }
.hw-spinner.is-light { border-color: rgba(255, 255, 255, 0.3); border-top-color: #fff; }

/* ── create project ────────────────────────────── */

.hw-switch-new {
  appearance: none;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 6px;
  padding: 9px 8px;
  border: 0;
  border-top: 1px solid var(--hw-line-2);
  border-radius: 0 0 9px 9px;
  background: transparent;
  font-size: 13px;
  font-weight: 550;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s var(--hw-ease);
}
.hw-switch-new:hover { background: var(--hw-panel); }
.hw-switch-new-icon { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 7px; background: var(--hw-ink); color: var(--hw-fill-ink); }
.hw-switch-new kbd, .hw-modal kbd { margin-left: auto; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 5px; border: 1px solid var(--hw-line); font-family: var(--hw-mono); font-size: 10.5px; line-height: 18px; text-align: center; color: var(--hw-ink-3); }

.hw-setup-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 16px; margin-top: 4px; }

.hw-modal-scrim {
  position: absolute;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background: color-mix(in srgb, var(--hw-ink) 18%, transparent);
  backdrop-filter: blur(6px) saturate(120%);
  animation: hw-fade-in 0.2s var(--hw-ease) both;
}
.hw-modal {
  width: min(520px, 100%);
  max-height: 100%;
  overflow: auto;
  padding: 22px 24px 20px;
  border-radius: 20px;
  border: 1px solid var(--hw-line);
  background: var(--hw-bg);
  box-shadow: 0 30px 80px -30px rgba(15, 17, 21, 0.5), 0 2px 6px rgba(15, 17, 21, 0.06);
  animation: hw-modal-in 0.38s var(--hw-spring) both;
}
.hw-modal-head { display: flex; align-items: center; justify-content: space-between; margin: -4px -8px 0 0; }
.hw-modal h2 { margin: 10px 0 22px; font-size: 24px; line-height: 1.2; font-weight: 700; letter-spacing: -0.025em; }
.hw-input-block { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
.hw-input-block > span { font-size: 12px; font-weight: 600; color: var(--hw-ink-2); }
.hw-input-block > span i { font-style: normal; font-weight: 400; color: var(--hw-ink-3); margin-left: 4px; }
.hw-input-block input, .hw-input-block textarea, .hw-input-block select {
  width: 100%;
  border: 1px solid var(--hw-line);
  border-radius: 11px;
  background: var(--hw-bg);
  font: inherit;
  font-size: 14px;
  color: var(--hw-ink);
  transition: border-color 0.18s var(--hw-ease), box-shadow 0.18s var(--hw-ease);
}
.hw-input-block input, .hw-input-block select { height: 42px; padding: 0 13px; }
.hw-input-block input { font-family: var(--hw-mono); font-size: 13.5px; }
.hw-input-block textarea { padding: 11px 13px; line-height: 1.65; resize: vertical; min-height: 76px; }
.hw-input-block input:focus, .hw-input-block textarea:focus, .hw-input-block select:focus { outline: none; border-color: color-mix(in srgb, var(--hw-ink) 32%, transparent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--hw-ink) 5%, transparent); }
.hw-input-block input::placeholder, .hw-input-block textarea::placeholder { color: var(--hw-ink-3); }
.hw-input-block em { font-style: normal; font-size: 11.5px; color: var(--hw-ink-3); min-height: 17px; }
.hw-input-block em.is-bad { color: var(--hw-bad); }
.hw-input-block em code, .hw-modal-foot code { font-family: var(--hw-mono); font-size: 11px; color: var(--hw-ink-2); }
.hw-samples { display: flex; flex-direction: column; gap: 6px; margin: -6px 0 18px; }
.hw-samples button {
  appearance: none;
  padding: 8px 11px;
  border: 1px dashed var(--hw-line);
  border-radius: 10px;
  background: transparent;
  font-size: 12px;
  color: var(--hw-ink-2);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s var(--hw-ease), color 0.18s var(--hw-ease), background 0.18s var(--hw-ease);
}
.hw-samples button:hover { border-style: solid; color: var(--hw-ink); background: var(--hw-panel); }
.hw-modal-error { margin: 0 0 14px; padding: 9px 12px; border-radius: 10px; font-size: 12.5px; color: var(--hw-bad); background: color-mix(in srgb, var(--hw-bad) 7%, var(--hw-bg)); }
.hw-modal-foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 6px; padding-top: 16px; border-top: 1px solid var(--hw-line-2); font-size: 11.5px; line-height: 1.6; color: var(--hw-ink-3); }
.hw-modal-foot .hw-cta { flex: none; }

@keyframes hw-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes hw-modal-in { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: none; } }

/* ── 网感口播 · 文稿剪辑台 ─────────────────────── */

.th-toasts { top: 68px; }
.th-shell {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: clamp(260px, 26cqw, 360px) minmax(0, 1fr) clamp(320px, 28cqw, 400px);
}
.th-left {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  padding: 18px 20px 18px 24px;
  border-right: 1px solid var(--hw-line-2);
  background: var(--hw-panel);
  overflow: auto;
}

/* monitor */
.th-monitor { display: flex; flex-direction: column; gap: 10px; animation: hw-rise 0.5s var(--hw-ease) both; }
.th-monitor-head { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.th-version {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--hw-line-2);
  border-radius: 999px;
  background: var(--hw-bg);
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color 0.18s var(--hw-ease);
}
.th-version:hover, .th-version.is-open { border-color: var(--hw-line); }
.th-version b { font-weight: 600; }
.th-version .hw-mono { color: var(--hw-ink-3); font-size: 10.5px; }
.th-version .hw-icon:last-child { color: var(--hw-ink-3); transition: transform 0.2s var(--hw-ease); }
.th-version.is-open .hw-icon:last-child { transform: rotate(180deg); }
.th-version-dot { width: 7px; height: 7px; border-radius: 50%; border: 1.5px solid var(--hw-ink-3); flex: none; }
.th-version-dot.is-cut { border: 0; background: var(--hw-brand); }
.th-version-pop { position: absolute; top: calc(100% + 8px); left: 0; z-index: 40; width: 300px; padding: 6px; margin: 0; list-style: none; animation: hw-pop-in 0.2s var(--hw-ease) both; transform-origin: top left; max-height: 320px; overflow: auto; }
.th-version-pop button {
  appearance: none;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  align-items: center;
  gap: 2px 10px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}
.th-version-pop button:hover { background: var(--hw-panel); }
.th-version-pop button.is-on { background: var(--hw-sunken); font-weight: 600; }
.th-version-pop .hw-mono { color: var(--hw-ink-3); font-size: 10.5px; }
.th-version-pop em { grid-column: 2 / -1; font-style: normal; font-size: 11px; color: var(--hw-ink-3); font-weight: 400; }
.th-version-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.th-frame {
  --th-ratio: 9 / 16;
  --th-ar: 0.5625;
  position: relative;
  width: min(100%, calc(60vh * var(--th-ar)));
  aspect-ratio: var(--th-ratio);
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  background:
    radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--hw-ink) 6%, transparent), transparent 60%),
    color-mix(in srgb, var(--hw-ink) 92%, var(--hw-bg));
  box-shadow: 0 1px 2px rgba(15, 17, 21, 0.12), 0 24px 48px -28px rgba(15, 17, 21, 0.6);
}
.th-frame video { width: 100%; height: 100%; object-fit: contain; display: block; cursor: pointer; background: #000; }
.th-frame-state { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 20px; text-align: center; color: rgba(255, 255, 255, 0.75); font-size: 12px; }
.th-frame-state .hw-text-btn.is-strong { color: #fff; }
.th-load { --p: 0; width: 46%; height: 2px; border-radius: 2px; background: linear-gradient(90deg, var(--hw-brand) calc(var(--p) * 100%), rgba(255, 255, 255, 0.18) 0); transition: background 0.2s linear; }
.th-bigplay {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  margin: -29px 0 0 -29px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #0f1115;
  cursor: pointer;
  box-shadow: 0 10px 30px -8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  transition: transform 0.25s var(--hw-spring), opacity 0.2s var(--hw-ease);
  animation: hw-fade 0.3s var(--hw-ease) both;
}
.th-bigplay .hw-icon { margin-left: 3px; fill: currentColor; }
.th-bigplay:hover { transform: scale(1.06); }
.th-transport { display: flex; align-items: center; gap: 10px; }
.th-play { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 50%; background: var(--hw-ink); color: var(--hw-fill-ink); cursor: pointer; transition: transform 0.2s var(--hw-spring); }
.th-play:hover:not(:disabled) { transform: scale(1.06); }
.th-play:disabled { opacity: 0.3; cursor: default; }
.th-play .hw-icon { margin-left: 2px; fill: currentColor; }
.th-pause { display: inline-flex; gap: 3px; }
.th-pause i { width: 3px; height: 11px; border-radius: 1px; background: currentColor; }
.th-clock { flex: 1; min-width: 0; font-size: 11.5px; color: var(--hw-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.th-clock i { font-style: normal; color: var(--hw-ink-3); }

/* semantic strip */
.th-strip { animation: hw-rise 0.5s 0.08s var(--hw-ease) both; }
.th-strip-track { position: relative; height: 26px; border-radius: 7px; background: var(--hw-sunken); overflow: hidden; }
.th-strip-seg {
  position: absolute;
  top: 4px;
  bottom: 4px;
  min-width: 2px;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: color-mix(in srgb, var(--hw-ink) 26%, transparent);
  cursor: pointer;
  transition: background 0.18s var(--hw-ease), top 0.18s var(--hw-ease), bottom 0.18s var(--hw-ease);
}
.th-strip-seg:hover { background: color-mix(in srgb, var(--hw-ink) 50%, transparent); }
.th-strip-seg.is-picked { background: var(--hw-ink); top: 2px; bottom: 2px; }
.th-strip-seg.is-cut { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--hw-bad) 45%, transparent) 0 3px, transparent 3px 6px); }
.th-strip-head { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--hw-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hw-brand) 18%, transparent); transition: left 0.12s linear; }
.th-strip-scale { display: flex; justify-content: space-between; margin-top: 5px; font-size: 10px; color: var(--hw-ink-3); }

/* centre */
.th-center { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.th-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 26px clamp(20px, 3cqw, 40px) 16px;
  border-bottom: 1px solid var(--hw-line-2);
  animation: hw-rise 0.5s var(--hw-ease) both;
}
.th-head-main { min-width: 0; }
.th-head-meta { margin: 0; font-size: 11px; color: var(--hw-ink-3); }
.th-head-meta em { font-style: normal; color: color-mix(in srgb, var(--hw-bad) 80%, var(--hw-ink)); }
.th-head h1 {
  margin: 8px 0 0;
  font-size: clamp(22px, 2.4cqw, 32px);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.03em;
  text-wrap: balance;
  overflow-wrap: anywhere;
}
.th-head-actions { display: flex; align-items: center; gap: 6px; flex: none; }
.hw-icon-btn.is-on { color: var(--hw-ink); background: var(--hw-sunken); }
.hw-cta.is-quiet { background: var(--hw-sunken); color: var(--hw-ink) !important; box-shadow: none; }
.hw-cta.is-quiet:hover:not(:disabled) { background: color-mix(in srgb, var(--hw-ink) 10%, var(--hw-sunken)); }

.th-job {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px clamp(20px, 3cqw, 40px) 0;
  padding: 9px 12px;
  border-radius: 11px;
  background: var(--hw-panel);
  border: 1px solid var(--hw-line-2);
  font-size: 12.5px;
  animation: hw-rise 0.3s var(--hw-ease) both;
}
.th-job.is-bad { border-color: color-mix(in srgb, var(--hw-bad) 26%, transparent); background: color-mix(in srgb, var(--hw-bad) 5%, var(--hw-bg)); }
.th-job .hw-text-btn { margin-left: auto; }
.th-job-bar { position: relative; width: 36px; height: 3px; border-radius: 3px; background: var(--hw-sunken); overflow: hidden; flex: none; }
.th-job-bar::after { content: ''; position: absolute; inset: 0; width: 40%; border-radius: inherit; background: var(--hw-brand); animation: th-indeterminate 1.2s var(--hw-ease) infinite; }
.th-job-log { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10.5px; color: var(--hw-ink-3); }

/* paper */
.th-paper { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.th-lines { flex: 1; min-height: 0; overflow: auto; margin: 0; padding: 18px clamp(12px, 2.4cqw, 32px) 96px; max-width: 860px; list-style: none; counter-reset: line; scrollbar-gutter: stable; }
.th-lines li { animation: hw-rise 0.4s calc(min(var(--i, 0), 20) * 20ms) var(--hw-ease) both; }
.th-line {
  appearance: none;
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 14px;
  width: 100%;
  padding: 9px 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.16s var(--hw-ease), color 0.16s var(--hw-ease);
}
.th-line:hover { background: var(--hw-panel); }
.th-line-time { font-size: 10.5px; color: var(--hw-ink-3); min-width: 34px; }
.th-line-text { font-size: 15px; line-height: 1.75; color: var(--hw-ink); text-wrap: pretty; }
.th-line.is-active { background: color-mix(in srgb, var(--hw-brand) 6%, transparent); }
.th-line.is-active::before { content: ''; position: absolute; left: 0; top: 12px; bottom: 12px; width: 2px; border-radius: 2px; background: var(--hw-brand); }
.th-line.is-active .th-line-time { color: var(--hw-brand); }
.th-line.is-picked { background: color-mix(in srgb, var(--hw-ink) 7%, transparent); }
.th-line.is-picked .th-line-text { color: var(--hw-ink); }
.th-line.is-cut .th-line-text { color: var(--hw-ink-3); text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--hw-bad) 55%, transparent); text-decoration-thickness: 1.5px; }
.th-line-tag { font-size: 10.5px; padding: 0 6px; line-height: 18px; border-radius: 999px; color: color-mix(in srgb, var(--hw-bad) 80%, var(--hw-ink)); background: color-mix(in srgb, var(--hw-bad) 9%, transparent); }

.th-selbar {
  position: absolute;
  left: 50%;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: calc(100% - 32px);
  padding: 5px 6px 5px 14px;
  border-radius: 999px;
  background: var(--hw-ink);
  color: var(--hw-fill-ink);
  box-shadow: 0 18px 40px -16px rgba(15, 17, 21, 0.6);
  transform: translate(-50%, 16px) scale(0.96);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.32s var(--hw-spring), opacity 0.2s var(--hw-ease);
}
.th-selbar.is-on { transform: translate(-50%, 0); opacity: 1; pointer-events: auto; }
.th-selbar-count { margin-right: 6px; font-size: 12px; white-space: nowrap; opacity: 0.8; }
.th-selbar-count b { font-family: var(--hw-mono); font-weight: 600; opacity: 1; }
.th-selbar-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 11px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit !important;
  font-size: 12.5px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.16s var(--hw-ease);
}
.th-selbar-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--hw-fill-ink) 14%, transparent); }
.th-selbar-btn.is-danger:hover:not(:disabled) { background: color-mix(in srgb, var(--hw-bad) 70%, transparent); }
.th-selbar-btn:disabled { opacity: 0.4; cursor: default; }
.th-selbar kbd { font-family: var(--hw-mono); font-size: 10px; padding: 0 4px; border-radius: 4px; border: 1px solid color-mix(in srgb, var(--hw-fill-ink) 30%, transparent); opacity: 0.7; }
.th-selbar .hw-icon-btn { color: inherit; }
.th-selbar .hw-icon-btn:hover { background: color-mix(in srgb, var(--hw-fill-ink) 14%, transparent); color: inherit; }

.th-paper.is-empty { align-items: center; justify-content: center; padding: 40px 24px; }
.th-empty { max-width: 360px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; animation: hw-rise 0.5s var(--hw-ease) both; }
.th-empty h3 { margin: 6px 0 0; font-size: 19px; font-weight: 700; letter-spacing: -0.02em; }
.th-empty p { margin: 0 0 10px; color: var(--hw-ink-2); font-size: 13px; line-height: 1.7; }
.th-empty-mark { display: grid; place-items: center; width: 54px; height: 54px; border-radius: 16px; background: var(--hw-sunken); color: var(--hw-ink-2); }
.th-progress { position: relative; width: 140px; height: 3px; border-radius: 3px; background: var(--hw-sunken); overflow: hidden; }
.th-progress::after { content: ''; position: absolute; inset: 0; width: 40%; border-radius: inherit; background: var(--hw-brand); animation: th-indeterminate 1.2s var(--hw-ease) infinite; }

/* assistant inside the editor */
.th-assistant .hw-intro h3 { font-size: 20px; }
.hw-attach { display: flex; align-items: center; gap: 7px; margin: -2px 0 8px; padding: 5px 6px 5px 9px; border-radius: 9px; background: color-mix(in srgb, var(--hw-brand) 7%, var(--hw-panel)); color: color-mix(in srgb, var(--hw-brand) 70%, var(--hw-ink)); font-size: 12px; animation: hw-pop-in 0.22s var(--hw-ease) both; }
.hw-attach-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 550; }
.hw-bubble-quote { display: flex; align-items: center; gap: 5px; margin-bottom: 4px; font-size: 11px; opacity: 0.7; }

/* landing */
.th-landing {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(32px, 6cqw, 96px);
  padding: clamp(40px, 8cqh, 96px) var(--hw-gutter);
}
.th-landing-copy { max-width: 560px; animation: hw-rise 0.6s var(--hw-ease) both; }
.th-landing h2 { margin: 18px 0 16px; font-size: clamp(32px, 4.8cqw, 58px); line-height: 1.04; font-weight: 750; letter-spacing: -0.045em; }
.th-landing-lead { margin: 0 0 32px; max-width: 40ch; color: var(--hw-ink-2); font-size: 15px; line-height: 1.75; }
.th-landing-warn { display: flex; align-items: center; gap: 8px; margin: 20px 0 0; font-size: 12.5px; color: var(--hw-ink-2); }
.th-landing-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.th-landing-steps li {
  position: relative;
  padding: 18px 18px 20px;
  border-radius: 18px;
  border: 1px solid var(--hw-line-2);
  background: linear-gradient(180deg, var(--hw-panel), var(--hw-bg));
  animation: hw-rise 0.6s calc(0.12s + var(--i) * 80ms) var(--hw-ease) both;
}
.th-landing-steps li:nth-child(2n) { transform: translateY(24px); }
.th-landing-steps .hw-mono { font-size: 11px; color: var(--hw-brand); }
.th-landing-steps b { display: block; margin: 22px 0 6px; font-size: 15px; font-weight: 650; }
.th-landing-steps p { margin: 0; font-size: 12.5px; line-height: 1.65; color: var(--hw-ink-2); }

/* dialogs */
.th-import-modal { width: min(540px, 100%); }
.th-drop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  padding: 30px 20px;
  border: 1.5px dashed var(--hw-line);
  border-radius: 16px;
  background: var(--hw-panel);
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s var(--hw-ease), background 0.2s var(--hw-ease), transform 0.2s var(--hw-ease);
}
.th-drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.th-drop:hover, .th-drop.is-drag { border-color: var(--hw-ink-3); background: var(--hw-bg); }
.th-drop.is-drag { transform: scale(1.01); border-color: var(--hw-brand); }
.th-drop.has-file { border-style: solid; }
.th-drop-icon { display: grid; place-items: center; width: 46px; height: 46px; margin-bottom: 6px; border-radius: 14px; background: var(--hw-bg); color: var(--hw-ink-2); box-shadow: 0 1px 2px rgba(15, 17, 21, 0.08); }
.th-drop b { font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.th-drop span:not(.th-drop-icon) { font-size: 12px; color: var(--hw-ink-3); }
.th-drop-bar { --p: 0; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: linear-gradient(90deg, var(--hw-brand) calc(var(--p) * 100%), transparent 0); }
.th-check { display: flex; align-items: flex-start; gap: 10px; margin: 2px 0 14px; font-size: 13px; color: var(--hw-ink-2); cursor: pointer; }
.th-check input { position: absolute; opacity: 0; pointer-events: none; }
.th-check-box { display: grid; place-items: center; width: 18px; height: 18px; margin-top: 1px; border-radius: 5px; border: 1.5px solid var(--hw-line); color: transparent; flex: none; transition: background 0.18s var(--hw-ease), border-color 0.18s var(--hw-ease), color 0.18s var(--hw-ease); }
.th-check input:checked + .th-check-box { background: var(--hw-ink); border-color: var(--hw-ink); color: var(--hw-fill-ink); }
.th-check input:focus-visible + .th-check-box { outline: 2px solid color-mix(in srgb, var(--hw-accent) 70%, transparent); outline-offset: 2px; }

.th-style-modal { width: min(920px, 100%); padding-bottom: 0; display: flex; flex-direction: column; max-height: 100%; }
.th-style-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.th-style-top h2 { margin: 10px 0 0; }
.th-style-search { width: 260px; margin: 0; }
.th-style-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; overflow: auto; padding: 4px 2px 18px; min-height: 0; }
.th-style-card {
  appearance: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 0 10px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  animation: hw-rise 0.45s calc(min(var(--i, 0), 18) * 25ms) var(--hw-ease) both;
}
.th-style-card .th-style-cover {
  position: relative;
  display: block;
  aspect-ratio: 3 / 4;
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--hw-sunken);
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline-color 0.2s var(--hw-ease), transform 0.3s var(--hw-ease);
}
.th-style-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s var(--hw-ease); }
.th-style-card .th-style-cover > i { position: absolute; inset: 0; background: linear-gradient(90deg, var(--hw-sunken) 0%, color-mix(in srgb, var(--hw-sunken) 40%, var(--hw-bg)) 50%, var(--hw-sunken) 100%) 0 0 / 200% 100%; animation: hw-shimmer 1.4s linear infinite; }
.th-style-card:hover img { transform: scale(1.04); }
.th-style-card.is-on .th-style-cover { outline-color: var(--hw-ink); }
.th-style-card b { padding: 0 2px; font-size: 13px; font-weight: 600; }
.th-style-card > span:last-child { padding: 0 2px; font-size: 11.5px; line-height: 1.5; color: var(--hw-ink-3); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.th-style-card.is-ghost { aspect-ratio: 3 / 4.6; border-radius: 12px; background: var(--hw-sunken); }
.th-style-auto { position: absolute; inset: 0; display: grid; place-items: center; color: var(--hw-brand); background: radial-gradient(80% 60% at 50% 40%, color-mix(in srgb, var(--hw-brand) 12%, transparent), transparent), var(--hw-panel); }
.th-style-foot {
  position: sticky;
  bottom: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: end;
  gap: 16px;
  margin: 0 -24px;
  padding: 14px 24px 18px;
  border-top: 1px solid var(--hw-line-2);
  background: var(--hw-bg);
}
.th-style-detail { min-width: 0; }
.th-style-detail b { font-size: 14px; }
.th-style-detail p { margin: 3px 0 0; font-size: 12px; line-height: 1.6; color: var(--hw-ink-2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.th-style-pickers { display: flex; gap: 10px; }
.th-style-pickers .hw-field { margin: 0; width: 150px; }
.th-style-foot .hw-modal-error { grid-column: 1 / -1; margin: 0; }

.th-assets-modal { width: min(760px, 100%); }
.th-assets-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.th-assets-count { margin: 0; font-size: 12.5px; color: var(--hw-ink-3); font-variant-numeric: tabular-nums; }
.th-assets-count b { color: var(--hw-ink); font-size: 15px; font-weight: 650; margin-right: 2px; }
.th-asset-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; max-height: 52vh; overflow: auto; }
.th-asset { display: flex; flex-direction: column; gap: 3px; }
.th-asset-img { display: block; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: var(--hw-sunken); margin-bottom: 6px; outline: 2px solid transparent; outline-offset: 2px; }
.th-asset.is-active .th-asset-img { outline-color: var(--hw-ink); }
.th-asset-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.th-asset-ph { display: block; width: 100%; height: 100%; }
.th-asset-ph.is-failed { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--hw-bad) 12%, transparent) 0 6px, transparent 6px 12px); }
.th-asset b { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.th-asset > span:not(.th-asset-img) { font-size: 11.5px; color: var(--hw-ink-3); }
.th-asset .hw-text-btn { justify-content: flex-start; height: 26px; padding: 0; font-size: 12px; }
.th-assets-empty { padding: 20px 0 8px; }
.th-settings-state { display: flex; align-items: center; gap: 8px; margin: 0 0 16px; font-size: 12.5px; color: var(--hw-ink-2); }
.th-settings-size { max-width: 180px; }
.th-saved { display: flex; align-items: center; gap: 6px; margin: 0 0 12px; font-size: 12.5px; color: var(--hw-ok); }
.th-env-fix { grid-column: 2 / -1; font-family: var(--hw-mono); font-size: 10.5px; padding: 5px 8px; border-radius: 7px; background: var(--hw-panel); color: var(--hw-ink-2); overflow-x: auto; white-space: nowrap; }


/* ── 成片 · screening room ───────────────────────── */

.th-views { display: flex; gap: 2px; padding: 3px; margin-right: 6px; border-radius: 11px; background: var(--hw-sunken); }
.th-view {
  appearance: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 11px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 12.5px;
  color: var(--hw-ink-2);
  white-space: nowrap;
  flex: none;
  cursor: pointer;
  transition: background 0.22s var(--hw-ease), color 0.22s var(--hw-ease), box-shadow 0.22s var(--hw-ease);
}
.th-view:hover { color: var(--hw-ink); }
.th-view.is-on { background: var(--hw-bg); color: var(--hw-ink); font-weight: 600; box-shadow: 0 1px 2px rgba(15, 17, 21, 0.08), 0 2px 8px -4px rgba(15, 17, 21, 0.14); }
.th-view-count { font-size: 10px; color: var(--hw-ink-3); font-weight: 400; }
.th-view-new { position: absolute; top: 4px; right: 4px; width: 6px; height: 6px; border-radius: 50%; background: var(--hw-brand); box-shadow: 0 0 0 2px var(--hw-sunken); animation: hw-rec 1.6s ease-in-out infinite; }

.th-shell.is-films { grid-template-columns: minmax(0, 1fr) clamp(320px, 28cqw, 400px); }
.th-films-main { min-width: 0; min-height: 0; overflow: auto; background: var(--th-room); scrollbar-gutter: stable; }
.th-studio { --th-room: color-mix(in srgb, var(--hw-ink) 94%, var(--hw-bg)); --th-room-ink: #f4f4f2; --th-room-ink-2: rgba(244, 244, 242, 0.66); --th-room-ink-3: rgba(244, 244, 242, 0.42); --th-room-line: rgba(255, 255, 255, 0.1); }
[data-ds-dark-theme] .th-studio { --th-room: #0b0c0e; }

.th-films { display: flex; flex-direction: column; gap: 28px; padding: clamp(20px, 3cqw, 40px) clamp(20px, 3.4cqw, 48px) 48px; color: var(--th-room-ink); }
.th-film {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 300px);
  grid-template-rows: auto auto;
  gap: 16px clamp(24px, 3cqw, 44px);
  align-items: start;
  animation: hw-rise 0.6s var(--hw-ease) both;
}
.th-film-stage { --th-ar: 0.5625; position: relative; grid-column: 1; grid-row: 1; display: grid; place-items: center; padding: 12px 0; isolation: isolate; }
.th-film-glow {
  position: absolute;
  inset: -10% 6%;
  z-index: -1;
  background-size: cover;
  background-position: center;
  filter: blur(64px) saturate(1.5);
  opacity: 0.42;
  transform: scale(0.9);
  animation: th-glow-in 1.2s 0.2s var(--hw-ease) both;
  pointer-events: none;
}
.th-film-frame {
  position: relative;
  width: min(100%, calc(62vh * var(--th-ar)));
  aspect-ratio: var(--th-ar);
  border-radius: 18px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.07), 0 40px 80px -36px rgba(0, 0, 0, 0.9), 0 12px 24px -16px rgba(0, 0, 0, 0.6);
}
.th-film-stage:fullscreen { background: #000; padding: 0; }
.th-film-stage:fullscreen .th-film-frame { width: auto; height: 100vh; border-radius: 0; }
.th-film-frame video { width: 100%; height: 100%; object-fit: contain; display: block; cursor: pointer; }
.th-film-loading { position: absolute; inset: 0; display: grid; place-items: center; background-size: cover; background-position: center; color: rgba(255, 255, 255, 0.8); font-size: 12.5px; text-align: center; padding: 20px; }
.th-film-loading::before { content: ''; position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px); }
.th-film-loading > * { position: relative; }
.th-film-ring {
  --p: 0;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: conic-gradient(var(--hw-brand) calc(var(--p) * 360deg), rgba(255, 255, 255, 0.16) 0);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
}
.th-film-ring .hw-mono { -webkit-mask: none; font-size: 11px; color: #fff; }
.th-film-play {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  margin: -38px 0 0 -38px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  color: #0f1115;
  cursor: pointer;
  box-shadow: 0 18px 48px -10px rgba(0, 0, 0, 0.6), 0 0 0 10px rgba(255, 255, 255, 0.12);
  transition: transform 0.3s var(--hw-spring), box-shadow 0.3s var(--hw-ease);
  animation: hw-fade 0.4s var(--hw-ease) both;
}
.th-film-play .hw-icon { margin-left: 4px; fill: currentColor; }
.th-film-play:hover { transform: scale(1.06); box-shadow: 0 18px 48px -10px rgba(0, 0, 0, 0.6), 0 0 0 16px rgba(255, 255, 255, 0.1); }
.th-film-chapter-flag {
  position: absolute;
  left: 14px;
  top: 14px;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  color: #fff;
  font-size: 11.5px;
  font-weight: 550;
  animation: th-flag 2.6s var(--hw-ease) both;
  pointer-events: none;
}

.th-film-bar { grid-column: 1; grid-row: 2; display: flex; align-items: center; gap: 12px; width: min(100%, 720px); justify-self: center; }
.th-film-bar .th-play { background: var(--th-room-ink); color: var(--th-room); }
.th-film-bar .th-clock { flex: none; color: var(--th-room-ink); }
.th-film-bar .th-clock i { color: var(--th-room-ink-3); }
.th-film-bar .hw-icon-btn { color: var(--th-room-ink-2); }
.th-film-bar .hw-icon-btn:hover { background: rgba(255, 255, 255, 0.08); color: var(--th-room-ink); }

.th-scrub { position: relative; flex: 1; min-width: 0; height: 34px; display: flex; align-items: center; cursor: pointer; touch-action: none; outline: none; }
.th-scrub-track { position: relative; width: 100%; height: 6px; transition: height 0.2s var(--hw-ease); }
.th-scrub:hover .th-scrub-track, .th-scrub:focus-visible .th-scrub-track { height: 10px; }
.th-scrub-seg { position: absolute; top: 0; bottom: 0; padding: 0 1.5px; }
.th-scrub-seg::before { content: ''; position: absolute; inset: 0 1.5px; border-radius: 3px; background: rgba(255, 255, 255, 0.18); }
.th-scrub-seg i { position: absolute; inset: 0 1.5px; border-radius: 3px; background: var(--th-room-ink); transform-origin: left center; transition: transform 0.12s linear; }
.th-scrub-seg.is-now i { background: var(--hw-brand); }
.th-scrub:focus-visible .th-scrub-track { outline: 2px solid color-mix(in srgb, var(--hw-accent) 70%, transparent); outline-offset: 6px; border-radius: 4px; }
.th-scrub-peek {
  position: absolute;
  bottom: calc(100% + 8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transform: translateX(-50%);
  pointer-events: none;
  animation: hw-pop-up 0.16s var(--hw-ease) both;
}
.th-scrub-tile { width: 84px; aspect-ratio: 9 / 16; border-radius: 8px; background-size: 400% 400%; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18), 0 14px 30px -12px rgba(0, 0, 0, 0.8); }
.th-scrub-peek .hw-mono { padding: 2px 6px; border-radius: 5px; background: rgba(0, 0, 0, 0.7); color: #fff; font-size: 10.5px; }
.th-scrub-peek em { max-width: 160px; font-style: normal; font-size: 11px; color: var(--th-room-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.th-film-side { grid-column: 2; grid-row: 1 / span 2; display: flex; flex-direction: column; gap: 22px; min-width: 0; padding-top: 12px; }
.th-film-title .hw-next-kicker { color: var(--th-room-ink-2); }
.th-film-title h2 { margin: 12px 0 14px; font-size: clamp(26px, 2.8cqw, 36px); line-height: 1.05; font-weight: 750; letter-spacing: -0.035em; color: var(--th-room-ink); }
.th-film-facts { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 7px 16px; font-size: 12.5px; }
.th-film-facts > div { display: contents; }
.th-film-facts dt { color: var(--th-room-ink-3); }
.th-film-facts dd { margin: 0; color: var(--th-room-ink); }
.th-film-ok { display: inline-flex; align-items: center; gap: 5px; color: #7ad19b !important; }
.th-film-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 14px; margin-top: 18px; }
.th-film-actions .hw-cta { background: var(--th-room-ink); color: var(--th-room) !important; text-decoration: none; box-shadow: none; }
.th-film-actions .hw-text-btn { color: var(--th-room-ink-2); }
.th-film-actions .hw-text-btn:hover { color: var(--th-room-ink); text-decoration-color: var(--th-room-line); }

.th-chapters { list-style: none; margin: 0; padding: 14px 0 0; border-top: 1px solid var(--th-room-line); display: flex; flex-direction: column; gap: 2px; }
.th-chapters li { animation: hw-rise 0.45s calc(0.15s + var(--i, 0) * 40ms) var(--hw-ease) both; }
.th-chapter {
  appearance: none;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: start;
  gap: 10px;
  width: 100%;
  padding: 9px 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--th-room-ink-2);
  text-align: left;
  cursor: pointer;
  transition: background 0.18s var(--hw-ease), color 0.18s var(--hw-ease);
}
.th-chapter:hover { background: rgba(255, 255, 255, 0.06); color: var(--th-room-ink); }
.th-chapter-n { font-size: 10.5px; padding-top: 2px; color: var(--th-room-ink-3); }
.th-chapter-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.th-chapter-main b { font-size: 13px; font-weight: 600; color: inherit; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.th-chapter-main span { font-size: 11.5px; line-height: 1.5; color: var(--th-room-ink-3); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.th-chapter-t { font-size: 10.5px; padding-top: 2px; color: var(--th-room-ink-3); }
.th-chapter.is-now { background: rgba(255, 255, 255, 0.08); color: var(--th-room-ink); }
.th-chapter.is-now .th-chapter-n { color: var(--hw-brand); }
.th-film-note { margin: 0; padding-top: 14px; border-top: 1px solid var(--th-room-line); font-size: 12.5px; line-height: 1.7; color: var(--th-room-ink-3); }
.th-film-keys { margin: 0; font-size: 10.5px; color: var(--th-room-ink-3); }

.th-shelf { animation: hw-rise 0.6s 0.2s var(--hw-ease) both; }
.th-shelf-title { margin: 0 0 12px; font-size: 12px; font-weight: 600; color: var(--th-room-ink-2); }
.th-shelf-title .hw-mono { font-weight: 400; color: var(--th-room-ink-3); margin-left: 4px; }
.th-shelf-row { display: flex; gap: 14px; overflow-x: auto; padding: 2px 2px 8px; scroll-snap-type: x proximity; scrollbar-width: thin; }
.th-film-card {
  appearance: none;
  flex: 0 0 132px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--th-room-ink-2);
  text-align: left;
  cursor: pointer;
  scroll-snap-align: start;
  animation: hw-rise 0.45s calc(0.25s + var(--i, 0) * 50ms) var(--hw-ease) both;
}
.th-film-thumb { position: relative; display: block; aspect-ratio: 9 / 16; border-radius: 12px; overflow: hidden; background: rgba(255, 255, 255, 0.06); outline: 2px solid transparent; outline-offset: 3px; transition: outline-color 0.2s var(--hw-ease), transform 0.3s var(--hw-ease); }
.th-film-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s var(--hw-ease); }
.th-film-card:hover .th-film-thumb img { transform: scale(1.04); }
.th-film-card.is-on .th-film-thumb { outline-color: var(--th-room-ink); }
.th-film-thumb-ph { position: absolute; inset: 0; display: grid; place-items: center; color: var(--th-room-ink-3); }
.th-film-dur { position: absolute; right: 6px; bottom: 6px; padding: 1px 5px; border-radius: 5px; background: rgba(0, 0, 0, 0.65); color: #fff; font-size: 10px; }
.th-film-meta { display: flex; flex-direction: column; gap: 2px; }
.th-film-meta b { font-size: 12.5px; font-weight: 600; color: var(--th-room-ink); }
.th-film-meta span { font-size: 11px; color: var(--th-room-ink-3); }

.th-films-empty { min-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 48px 24px; text-align: center; color: var(--th-room-ink); }
.th-films-empty .th-empty-mark { background: rgba(255, 255, 255, 0.08); color: var(--th-room-ink-2); }
.th-films-empty h3 { margin: 6px 0 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
.th-films-empty p { margin: 0 0 10px; max-width: 360px; font-size: 13px; line-height: 1.7; color: var(--th-room-ink-2); }
.th-films-empty .hw-cta { background: var(--th-room-ink); color: var(--th-room) !important; }
.th-films-skeleton { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 40px; padding: 40px 48px; }
.th-films-skeleton i { display: block; height: 60vh; border-radius: 18px; background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05)) 0 0 / 200% 100%; animation: hw-shimmer 1.4s linear infinite; }
.th-films-skeleton i + i { height: 40vh; }

.hy-films {
  margin-top: 4px;
  padding: clamp(18px, 2.6cqw, 32px);
  border-radius: 22px;
  background: var(--th-room);
  color: var(--th-room-ink);
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: hidden;
  animation: hw-rise 0.5s var(--hw-ease) both;
}
.hy-films .th-film { grid-template-columns: minmax(0, 1fr) minmax(220px, 260px); }
.hy-films .th-film-frame { width: min(100%, calc(56vh * var(--th-ar))); }
.hy-films.is-loading { min-height: 420px; }
.hy-films.is-loading i { display: block; height: 380px; border-radius: 16px; background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05)) 0 0 / 200% 100%; animation: hw-shimmer 1.4s linear infinite; }

@keyframes th-glow-in { from { opacity: 0; transform: scale(0.7); } to { opacity: 0.42; transform: scale(0.9); } }
@keyframes th-flag { 0% { opacity: 0; transform: translateY(-6px); } 12%, 78% { opacity: 1; transform: none; } 100% { opacity: 0; } }

@keyframes th-indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(260%); } }

/* ── motion ──────────────────────────────────────── */

@keyframes hw-numeral { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
@keyframes hw-spin { to { transform: rotate(360deg); } }
@keyframes hw-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes hw-fade { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: none; } }
@keyframes hw-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes hw-ping { 0% { opacity: 0.7; transform: scale(0.6); } 80%, 100% { opacity: 0; transform: scale(1.6); } }
@keyframes hw-rec { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes hw-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.45; } 40% { transform: translateY(-4px); opacity: 1; } }
@keyframes hw-shimmer { to { background-position: -200% 0; } }
@keyframes hw-pop-in { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: none; } }
@keyframes hw-pop-up { from { opacity: 0; transform: translateY(6px) scale(0.97); } to { opacity: 1; transform: none; } }
@keyframes hw-toast-in { from { opacity: 0; transform: translateY(-12px) scale(0.96); } to { opacity: 1; transform: none; } }
@keyframes hw-slide-in { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
@keyframes hw-primed { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--hw-brand) 40%, transparent); border-color: var(--hw-brand); } 100% { box-shadow: 0 0 0 10px transparent; } }

/* ── responsive (panel width, not window) ───────── */

@container hw (max-width: 1280px) {
  .th-shell { grid-template-columns: 260px minmax(0, 1fr) 320px; }
  .th-landing { grid-template-columns: 1fr; }
  .th-landing-steps { max-width: 620px; }
}

@container hw (max-width: 1080px) {
  .hy-films .th-film { grid-template-columns: minmax(0, 1fr); }
  .th-shell.is-films { display: flex; flex-direction: column; overflow: auto; }
  .th-shell.is-films .th-films-main { flex: none; overflow: visible; }
  .th-shell.is-films .th-assistant { flex: none; height: min(640px, 82vh); border-left: 0; border-top: 1px solid var(--hw-line-2); }
  .th-film { grid-template-columns: minmax(0, 1fr); }
  .th-film-side { grid-column: 1; grid-row: 3; }
  .th-shell { grid-template-columns: minmax(0, 1fr) 320px; grid-template-rows: auto minmax(0, 1fr); }
  .th-left { grid-row: 1; grid-column: 1; flex-direction: row; align-items: flex-start; gap: 16px; padding: 14px var(--hw-gutter); border-right: 0; border-bottom: 1px solid var(--hw-line-2); overflow: visible; }
  .th-left .th-monitor { width: 200px; flex: none; }
  .th-left .th-strip { flex: 1; align-self: flex-end; }
  .th-center { grid-row: 2; grid-column: 1; }
  .th-assistant { grid-row: 1 / span 2; grid-column: 2; }
  .hw-studios .hw-studio-tab { padding: 0 9px; }
  .hw-shell { grid-template-columns: minmax(0, 1fr) 340px; }
  .hw-row { grid-template-columns: 30px minmax(0, 1fr) auto; }
  .hw-row-go { display: none; }
  .hw-updated { display: none; }
}

@container hw (max-width: 860px) {
  .th-shell { display: flex; flex-direction: column; overflow: auto; }
  .th-left { flex: none; }
  .th-center { flex: none; min-height: 60vh; }
  .th-lines { overflow: visible; padding-bottom: 80px; }
  .th-assistant { flex: none; height: min(640px, 82vh); min-height: 420px; border-left: 0; border-top: 1px solid var(--hw-line-2); }
  .th-style-foot { grid-template-columns: 1fr; }
  .th-style-pickers .hw-field { flex: 1; width: auto; }
  .hw-mark { display: none; }
  .hw-shell { display: flex; flex-direction: column; overflow: auto; }
  .hw-stage { flex: none; }
  .hw-stage-scroll { overflow: visible; }
  .hw-stage-inner { padding-bottom: 40px; }
  .hw-drawer { position: fixed; z-index: 60; }
  .hw-assistant { flex: none; height: min(640px, 82vh); min-height: 420px; border-left: 0; border-top: 1px solid var(--hw-line-2); }
  .hw-intro { margin-top: 0; }
  .hw-brand-name { display: none; }
  .hw-brand-rule { display: none; }
}

@container hw (max-width: 560px) {
  .th-films { padding: 16px 14px 32px; }
  .th-film-frame { width: min(100%, calc(64vh * var(--th-ar))); border-radius: 14px; }
  .th-film-play { width: 62px; height: 62px; margin: -31px 0 0 -31px; }
  .th-views .th-view { padding: 0 8px; }
  .th-left { flex-direction: column; align-items: stretch; }
  .th-left .th-monitor { width: 100%; }
  .th-frame { width: min(100%, calc(56vh * var(--th-ar))); }
  .th-left .th-strip { align-self: stretch; flex: none; }
  .hw-top .hw-pill-label { display: none; }
  .hw-top .hw-switch-name { max-width: 96px; }
  .th-head { padding: 18px var(--hw-gutter) 12px; flex-direction: column; align-items: flex-start; }
  .th-lines { padding-left: 6px; padding-right: 6px; }
  .th-line { grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
  .th-line-time { display: none; }
  .th-selbar { left: 12px; right: 12px; transform: translateY(16px); max-width: none; overflow-x: auto; }
  .th-selbar.is-on { transform: none; }
  .th-selbar-count { display: none; }
  .th-landing-steps { grid-template-columns: 1fr; }
  .th-landing-steps li:nth-child(2n) { transform: none; }
  .th-style-top { flex-direction: column; align-items: stretch; }
  .th-style-search { width: auto; }
  .th-style-grid { grid-template-columns: repeat(2, 1fr); }
  .hw-brand-name { display: none; }
  .hw-studios { margin-left: 0; }
  .hw-next-numeral { display: none; }
  .hw-root { --hw-gutter: 18px; }
  .hw-top { padding-right: 10px; gap: 4px; }
  .hw-switch-slash { display: none; }
  .hw-switch-count { display: none; }
  .hw-switch-name { max-width: 120px; }
  .hw-switch-pop { left: -40px; width: min(340px, calc(100cqw - 24px)); }
  .hw-pill-btn { padding: 0 9px; }
  .hw-top-right .hw-pill-btn:last-of-type { font-size: 0; gap: 0; }
  .hw-pop-env, .hw-pop-roots { width: min(320px, calc(100cqw - 24px)); }
  .hw-masthead { flex-direction: column; align-items: flex-start; gap: 8px; padding: 24px 0 20px; }
  .hw-masthead-side { position: absolute; right: var(--hw-gutter); top: 18px; }
  .hw-stage-inner { position: relative; }
  .hw-steps { padding-top: 14px; }
  .hw-step-fact { display: none; }
  .hw-step-label { font-size: 12px; }
  .hw-step-head { flex-direction: column; gap: 4px; }
  .hw-next { margin-top: 28px; border-radius: 16px; }
  .hw-next-actions { flex-direction: column; align-items: stretch; }
  .hw-next-actions .hw-cta { justify-content: center; }
  .hw-next-actions .hw-text-btn { justify-content: center; }
  .hw-output { margin-top: 36px; }
  .hw-tabs { width: 100%; }
  .hw-tab { flex: 1; justify-content: center; padding: 0 6px; }
  .hw-row { gap: 10px; }
  .hw-row-meta .hw-row-bytes, .hw-row-meta em { display: none; }
  .hw-empty { flex-direction: column; align-items: flex-start; gap: 12px; }
  .hw-compose-hint { display: none; }
  .hw-compose-bar .hw-send { margin-left: auto; }
  .hw-modal { padding: 18px 18px 16px; border-radius: 16px; }
  .hw-modal-foot { flex-direction: column; align-items: stretch; }
  .hw-modal-foot .hw-cta { justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .hw-root *, .hw-root *::before, .hw-root *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; animation-delay: 0s !important; transition-duration: 0.001ms !important; }
}
.th-assistant .hw-assistant-bound { display: none; }

/* 生图设置 → 直接跳转「设置 → 接口与密钥」 */
.th-settings-facts { display: grid; gap: 6px; margin: 4px 0 0; padding: 12px 14px; border-radius: 10px; background: color-mix(in srgb, currentColor 4%, transparent); }
.th-settings-facts > div { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 10px; align-items: baseline; font-size: 12.5px; }
.th-settings-facts dt { opacity: .6; }
.th-settings-facts dd { margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.th-settings-facts code { font-size: 11.5px; }
.th-settings-note { margin: 10px 0 0; font-size: 12.5px; line-height: 1.6; opacity: .72; }
`;var n=Te(require("react"),1);function ye(o){if(typeof o!="string"||!o)return"时间未知";let t=Date.parse(o);if(!Number.isFinite(t))return"时间未知";let a=Date.now()-t;if(a<0)return"刚刚";let r=6e4,s=60*r,p=24*s;if(a<r)return"刚刚";if(a<s)return`${Math.floor(a/r)} 分钟前`;if(a<p)return`${Math.floor(a/s)} 小时前`;if(a<7*p)return`${Math.floor(a/p)} 天前`;let i=new Date(t),d=w=>String(w).padStart(2,"0");return`${i.getFullYear()}-${d(i.getMonth()+1)}-${d(i.getDate())} ${d(i.getHours())}:${d(i.getMinutes())}`}function ve(o,t=46){let a=typeof o=="string"?o:"";if(!a)return"";let r=a.replace(/^\/Users\/[^/]+/u,"~");return r.length<=t?r:"…"+r.slice(r.length-t+1)}function et(o){let t=Number(o);return!Number.isFinite(t)||t<0?"—":t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(t<10240?1:0)} KB`:`${(t/1024/1024).toFixed(1)} MB`}function tt(o){return String(o??"").split(/[\n,]+/u).map(t=>t.trim()).filter(Boolean)}function K(o){return o?o.code==="forbidden"?"当前账号不能查看本地视频项目。":o.code==="unknown-project"?o.message||"这个项目不在最近一次扫描结果里，请先刷新。":o.code==="invalid-source"?o.message||"这个源文件无法读取。":o.code==="source-not-found"?"这个源文件已经不存在，请刷新项目。":o.code==="source-too-large"?"源文件太大，请直接在编辑器里查看。":o.code==="aborted"?"这次读取已取消。":o.code==="executor-missing"?o.message||"没找到 hypit 执行器。":o.message||"操作未完成，请稍后再试。":"操作未完成，请稍后再试。"}var nt='data:image/svg+xml,<?xml version="1.0" encoding="UTF-8"?>%0A<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="54.9 186.2 732.1 222.8">%0A  <!-- Generator: Adobe Illustrator 30.0.0, SVG Export Plug-In . SVG Version: 2.1.1 Build 123)  -->%0A  <defs>%0A    <style>%0A      .st0 {%0A        fill: %23010101;%0A      }%0A%0A      .st1 {%0A        fill: url(%23linear-gradient);%0A      }%0A%0A      .st2 {%0A        fill: %23e83f5f;%0A      }%0A    </style>%0A    <linearGradient id="linear-gradient" x1="103.04" y1="194.28" x2="261.09" y2="393.77" gradientTransform="translate(0 .83)" gradientUnits="userSpaceOnUse">%0A      <stop offset="0" stop-color="%23e83f5f"/>%0A      <stop offset=".14" stop-color="%23e94765"/>%0A      <stop offset=".33" stop-color="%23ec5774"/>%0A      <stop offset=".56" stop-color="%23f1738c"/>%0A      <stop offset=".8" stop-color="%23f599af"/>%0A      <stop offset=".88" stop-color="%23f6a9bd"/>%0A    </linearGradient>%0A  </defs>%0A  <g id="Layer_3">%0A    <path class="st1" d="M303.78,277.82c-5.98-8.63-15.83-13.77-26.32-13.77h-93.41c-12.28,0-24.92,7.44-29.6,18.8l-28.26,75.82c-4.6,11.25-4.54,24.05,2.22,34.16,6.79,10.15,19.36,16.15,31.57,16.15h85.98c14.12,0,26.9-8.88,31.84-22.1l29.69-79.57c3.67-9.84,2.29-20.86-3.69-29.48v-.02h-.02ZM252.02,377.25c-.94,2.52-3.39,4.22-6.08,4.22h-83.45c-4.34,0-6.68-2.8-7.49-3.99s-2.5-4.43-.84-8.44l23.85-66.24c2.29-6.35,8.08-10.87,14.82-11.22.33-.02.67-.02,1.02-.02h75.41s12.51,1.42,9.29,14.61l-26.53,71.09h0ZM106.85,361.73s-22.36-11.59-17.66-32.66l29.67-82.23c4.78-13.25,17.36-22.09,31.45-22.09h95.02c6.25,0,12.1,3.03,15.71,8.14l13.89,19.68h-112.97c-8.7,0-16.49,5.41-19.52,13.57l-35.59,95.6h0ZM73.3,323.27s-22.37-11.59-17.66-32.66l29.67-82.23c4.79-13.25,17.37-22.09,31.45-22.09h89.91c6.25,0,12.1,3.03,15.71,8.14l13.89,19.68h-107.84c-8.7,0-16.49,5.41-19.52,13.57l-35.59,95.6h-.02Z"/>%0A    <rect class="st0" x="692.47" y="276.19" width="19.22" height="90.09" rx="4.12" ry="4.12"/>%0A    <path class="st0" d="M462.31,293.32c-4.51-11.11-12.93-15.68-28.26-17.66-15.52-2-31.17,1.58-36.41,2.96v-38.42c0-2.22-1.8-4.02-4.02-4.02h-11.19c-2.22,0-4.02,1.8-4.02,4.02v123.26c0,2.22,1.8,4.02,4.02,4.02h11.19c2.22,0,4.02-1.8,4.02-4.02v-66.25c3.68-1.46,16.84-6.13,30.89-4.57,12.12,1.35,15.81,10.13,16.92,14.75.32,1.33.47,2.68.47,4.03v53.36c0,1.49,1.2,2.68,2.68,2.68h13.65c1.49,0,2.68-1.2,2.68-2.68v-57.38c0-4.82-.82-9.63-2.63-14.09h.01Z"/>%0A    <path class="st0" d="M568.55,346.34v-67.42c0-1.57-1.27-2.85-2.85-2.85h-14.66c-1.57,0-2.85,1.27-2.85,2.85v64.51c0,.58-.19,1.16-.58,1.6-1.62,1.88-7.33,6.23-25.19,5.92-2.22.05-6.37-.58-8.51-1.13-14.03-3.61-12.62-17.41-12.62-33.16v-37.73c0-1.57-1.27-2.85-2.85-2.85h-13.68c-1.57,0-2.85,1.27-2.85,2.85v57.63s-2.72,24.49,25.91,30.92c0,0,3.11.67,7.45,1.01h-.02s.13,0,.38.03c.07,0,.15,0,.23.02.19.02.42.02.69.04.25.02.51.02.77.04,2.94.14,8.59.25,14.08-.44h-.05c6.97-.77,13.42-2.51,17.37-5.02,0,0-1.77,20.45-18.82,23.73-9.86,1.13-24.24-.46-31.62-1.65-2.22-.36-4.33,1.06-4.84,3.24l-2.55,10.92c-.49,2.08.99,4.09,3.1,4.28,7.44.63,23.6,1.84,34.54,1.37,14.62-.61,26.8-6.24,34.06-21.17,7.26-14.93,5.93-37.54,5.93-37.54h.03Z"/>%0A    <path class="st0" d="M674.19,297.63c-8.46-21.2-28.09-21.76-37.64-22.58-7.78-.66-37.08.93-47.69,1.54-2.17.13-3.86,1.92-3.86,4.1v119.88c0,1.74,1.41,3.14,3.14,3.14h14.17c1.74,0,3.14-1.41,3.14-3.14v-34.16c45.01,4.23,52.91-1.5,60.82-8.86,8.8-8.2,15.13-37.91,7.91-59.92h.01ZM656.46,330.82c-.27,4.64-1.91,18-19.5,19.22-17.59,1.23-31.5-2.32-31.5-2.32v-54.21c4.62-.18,16.65-.61,25.09-.61,10.64,0,15.27,1.5,21.82,8.32s4.37,24.96,4.09,29.59h0Z"/>%0A    <circle class="st2" cx="703.1" cy="250.37" r="14.18"/>%0A    <path class="st0" d="M784.34,292.92c1.41,0,2.56-1.15,2.56-2.56v-11.6c0-1.41-1.15-2.56-2.56-2.56h-27.3v-19.11c0-1.32-1.07-2.38-2.38-2.38h-14.87c-1.32,0-2.38,1.07-2.38,2.38v19.11h-10.74c-1.41,0-2.56,1.15-2.56,2.56v11.6c0,1.41,1.15,2.56,2.56,2.56h10.74v48.61c0,14.46,11.72,26.19,26.19,26.19h19.46c2.13,0,3.86-1.73,3.86-3.86v-9.69c0-2.13-1.73-3.86-3.86-3.86h-13.53c-6.9,0-12.48-5.59-12.48-12.48v-44.92h27.3-.01Z"/>%0A  </g>%0A</svg>';var ot='data:image/svg+xml,<?xml version="1.0" encoding="UTF-8"?>%0A<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="54.9 186.2 732.1 222.8">%0A  <!-- Generator: Adobe Illustrator 30.0.0, SVG Export Plug-In . SVG Version: 2.1.1 Build 123)  -->%0A  <defs>%0A    <style>%0A      .st1 {%0A        fill: url(%23linear-gradient);%0A      }%0A%0A      .st2 {%0A        fill: %23e83f5f;%0A      }%0A%0A      .st3 {%0A        fill: %23fff;%0A      }%0A    </style>%0A    <linearGradient id="linear-gradient" x1="103.04" y1="194.28" x2="261.09" y2="393.77" gradientTransform="translate(0 .83)" gradientUnits="userSpaceOnUse">%0A      <stop offset="0" stop-color="%23e83f5f"/>%0A      <stop offset=".14" stop-color="%23e94765"/>%0A      <stop offset=".33" stop-color="%23ec5774"/>%0A      <stop offset=".56" stop-color="%23f1738c"/>%0A      <stop offset=".8" stop-color="%23f599af"/>%0A      <stop offset=".88" stop-color="%23f6a9bd"/>%0A    </linearGradient>%0A  </defs>%0A  <g id="Layer_11" data-name="Layer_1">%0A  </g>%0A  <g id="Layer_2">%0A    <path class="st1" d="M303.78,277.82c-5.98-8.63-15.83-13.77-26.32-13.77h-93.41c-12.28,0-24.92,7.44-29.6,18.8l-28.26,75.82c-4.6,11.25-4.54,24.05,2.22,34.16,6.79,10.15,19.36,16.15,31.57,16.15h85.98c14.12,0,26.9-8.88,31.84-22.1l29.69-79.57c3.67-9.84,2.29-20.86-3.69-29.48v-.02h-.02ZM252.02,377.25c-.94,2.52-3.39,4.22-6.08,4.22h-83.45c-4.34,0-6.68-2.8-7.49-3.99s-2.5-4.43-.84-8.44l23.85-66.24c2.29-6.35,8.08-10.87,14.82-11.22.33-.02.67-.02,1.02-.02h75.41s12.51,1.42,9.29,14.61l-26.53,71.09h0ZM106.85,361.73s-22.36-11.59-17.66-32.66l29.67-82.23c4.78-13.25,17.36-22.09,31.45-22.09h95.02c6.25,0,12.1,3.03,15.71,8.14l13.89,19.68h-112.97c-8.7,0-16.49,5.41-19.52,13.57l-35.59,95.6h0ZM73.3,323.27s-22.37-11.59-17.66-32.66l29.67-82.23c4.79-13.25,17.37-22.09,31.45-22.09h89.91c6.25,0,12.1,3.03,15.71,8.14l13.89,19.68h-107.84c-8.7,0-16.49,5.41-19.52,13.57l-35.59,95.6h-.02Z"/>%0A    <rect class="st3" x="692.47" y="276.19" width="19.22" height="90.09" rx="4.12" ry="4.12"/>%0A    <path class="st3" d="M462.31,293.32c-4.51-11.11-12.93-15.68-28.26-17.66-15.52-2-31.17,1.58-36.41,2.96v-38.42c0-2.22-1.8-4.02-4.02-4.02h-11.19c-2.22,0-4.02,1.8-4.02,4.02v123.26c0,2.22,1.8,4.02,4.02,4.02h11.19c2.22,0,4.02-1.8,4.02-4.02v-66.25c3.68-1.46,16.84-6.13,30.89-4.57,12.12,1.35,15.81,10.13,16.92,14.75.32,1.33.47,2.68.47,4.03v53.36c0,1.49,1.2,2.68,2.68,2.68h13.65c1.49,0,2.68-1.2,2.68-2.68v-57.38c0-4.82-.82-9.63-2.63-14.09h.01Z"/>%0A    <path class="st3" d="M568.55,346.34v-67.42c0-1.57-1.27-2.85-2.85-2.85h-14.66c-1.57,0-2.85,1.27-2.85,2.85v64.51c0,.58-.19,1.16-.58,1.6-1.62,1.88-7.33,6.23-25.19,5.92-2.22.05-6.37-.58-8.51-1.13-14.03-3.61-12.62-17.41-12.62-33.16v-37.73c0-1.57-1.27-2.85-2.85-2.85h-13.68c-1.57,0-2.85,1.27-2.85,2.85v57.63s-2.72,24.49,25.91,30.92c0,0,3.11.67,7.45,1.01h-.02s.13,0,.38.03c.07,0,.15,0,.23.02.19.02.42.02.69.04.25.02.51.02.77.04,2.94.14,8.59.25,14.08-.44h-.05c6.97-.77,13.42-2.51,17.37-5.02,0,0-1.77,20.45-18.82,23.73-9.86,1.13-24.24-.46-31.62-1.65-2.22-.36-4.33,1.06-4.84,3.24l-2.55,10.92c-.49,2.08.99,4.09,3.1,4.28,7.44.63,23.6,1.84,34.54,1.37,14.62-.61,26.8-6.24,34.06-21.17,7.26-14.93,5.93-37.54,5.93-37.54h.03Z"/>%0A    <path class="st3" d="M674.19,297.63c-8.46-21.2-28.09-21.76-37.64-22.58-7.78-.66-37.08.93-47.69,1.54-2.17.13-3.86,1.92-3.86,4.1v119.88c0,1.74,1.41,3.14,3.14,3.14h14.17c1.74,0,3.14-1.41,3.14-3.14v-34.16c45.01,4.23,52.91-1.5,60.82-8.86,8.8-8.2,15.13-37.91,7.91-59.92h.01ZM656.46,330.82c-.27,4.64-1.91,18-19.5,19.22-17.59,1.23-31.5-2.32-31.5-2.32v-54.21c4.62-.18,16.65-.61,25.09-.61,10.64,0,15.27,1.5,21.82,8.32s4.37,24.96,4.09,29.59h0Z"/>%0A    <circle class="st2" cx="703.1" cy="250.37" r="14.18"/>%0A    <path class="st3" d="M784.34,292.92c1.41,0,2.56-1.15,2.56-2.56v-11.6c0-1.41-1.15-2.56-2.56-2.56h-27.3v-19.11c0-1.32-1.07-2.38-2.38-2.38h-14.87c-1.32,0-2.38,1.07-2.38,2.38v19.11h-10.74c-1.41,0-2.56,1.15-2.56,2.56v11.6c0,1.41,1.15,2.56,2.56,2.56h10.74v48.61c0,14.46,11.72,26.19,26.19,26.19h19.46c2.13,0,3.86-1.73,3.86-3.86v-9.69c0-2.13-1.73-3.86-3.86-3.86h-13.53c-6.9,0-12.48-5.59-12.48-12.48v-44.92h27.3-.01Z"/>%0A  </g>%0A</svg>';var q=Te(require("react"),1),rt={refresh:"M12 5a7 7 0 1 0 6.5 4.4M12 5V2.6M12 5l2.2 2.2",copy:"M8 8V6.2A1.2 1.2 0 0 1 9.2 5h7.6A1.2 1.2 0 0 1 18 6.2v7.6a1.2 1.2 0 0 1-1.2 1.2H15M4.8 9h7.4A1.2 1.2 0 0 1 13.4 10.2v7.6A1.2 1.2 0 0 1 12.2 19H4.8a1.2 1.2 0 0 1-1.2-1.2v-7.6A1.2 1.2 0 0 1 4.8 9Z",check:"m4.5 10.5 4.2 4.2 8.3-8.4",arrow:"M5 12h13M12.5 5.5 19 12l-6.5 6.5",chevron:"m9 5 7 7-7 7",plus:"M12 5v14M5 12h14",folder:"M3.5 7.2A1.2 1.2 0 0 1 4.7 6h4l1.6 1.8h8A1.2 1.2 0 0 1 19.5 9v8.8A1.2 1.2 0 0 1 18.3 19H4.7a1.2 1.2 0 0 1-1.2-1.2V7.2Z",code:"m8.5 8.5-4 3.5 4 3.5M15.5 8.5l4 3.5-4 3.5M13 5l-2 14",play:"M8 5.5v13l10.5-6.5L8 5.5Z",scan:"M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M8 12h8",send:"M4.5 12 20 5l-5 15-3.4-6.1L4.5 12Z",gear:"M4 7h9M17 7h3M4 17h3M11 17h9M15 4v6M9 14v6",chevronDown:"m6 9 6 6 6-6",quote:"M6 7.5h4.5v4.5c0 2.6-1.4 4.2-4 4.8M13.5 7.5H18v4.5c0 2.6-1.4 4.2-4 4.8",download:"M12 4.5v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14",sound:"M4.5 9.5h3l4-3.5v12l-4-3.5h-3zM15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11",mute:"M4.5 9.5h3l4-3.5v12l-4-3.5h-3zM15.5 9.5l5 5M20.5 9.5l-5 5",wave:"M3.5 12h1.5M7 8.5v7M10.5 5.5v13M14 9v6M17.5 7v10M21 11v2",scissors:"M6.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.6 7.2 19.5 18M8.6 16.8 19.5 6",undo:"M8 6.5 4.5 10 8 13.5M4.5 10h9a5.5 5.5 0 0 1 0 11H11",spark:"M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",image:"M4.5 5.5h15v13h-15zM4.5 15.5l4.5-4.5 4 4 2.5-2.5 4 4M15 9.5a1.2 1.2 0 1 0 0-.01",upload:"M12 15.5v-11M7.5 9 12 4.5 16.5 9M5 19.5h14",palette:"M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-1 1.6-2.1-.5-1.3.3-2.4 1.7-2.4h1.7a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9ZM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01",clock:"M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 7.5V12l3 2",mic:"M12 3.5a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0v-5a3 3 0 0 0-3-3ZM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3",layers:"m12 4 8.5 4.5L12 13 3.5 8.5 12 4ZM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5",expand:"M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15",shield:"M12 3.5 5 6.2v5.3c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6.2L12 3.5Z",shieldOk:"M12 3.5 5 6.2v5.3c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6.2L12 3.5ZM9 12l2.2 2.2L15.5 10",file:"M7 3.5h6.5L18 8v11.3a1.2 1.2 0 0 1-1.2 1.2H7.2A1.2 1.2 0 0 1 6 19.3V4.7A1.2 1.2 0 0 1 7.2 3.5ZM13.5 3.5V8H18",film:"M4.5 5.5h15v13h-15zM8 5.5v13M16 5.5v13M4.5 9.5H8M4.5 14.5H8M16 9.5h3.5M16 14.5h3.5",doc:"M6 4.5h12v15H6zM9 9h6M9 12h6M9 15h4",run:"M5 6.5h9M5 12h14M5 17.5h7M17 4.5l2.5 2-2.5 2",x:"M6.5 6.5l11 11M17.5 6.5l-11 11",search:"M10.8 17.5a6.7 6.7 0 1 0 0-13.4 6.7 6.7 0 0 0 0 13.4ZM15.6 15.6 20 20",retry:"M4.5 12a7.5 7.5 0 0 1 13-5.1M19.5 12a7.5 7.5 0 0 1-13 5.1M17.8 3.8v3.4h-3.4M6.2 20.2v-3.4h3.4",tool:"M14.5 5.5a4 4 0 0 0-5.2 5.2L4.5 15.5l4 4 4.8-4.8a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.6-.6-2.4 1.6-3.6Z"};function k({name:o,size:t=16,stroke:a=1.6}){return q.default.createElement("svg",{className:"hw-icon",width:t,height:t,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:a,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},q.default.createElement("path",{d:rt[o]??rt.arrow}))}async function Ht(o){try{return await globalThis.navigator?.clipboard?.writeText(o),!0}catch{return!1}}function Ne(o,t){let a=[],r=/(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\s]+\))/g,s=0,p=0;for(let i of o.matchAll(r)){i.index>s&&a.push(o.slice(s,i.index));let d=i[0],w=`${t}-${p++}`;if(d.startsWith("`"))a.push(q.default.createElement("code",{key:w},d.slice(1,-1)));else if(d.startsWith("**"))a.push(q.default.createElement("strong",{key:w},d.slice(2,-2)));else{let c=/^\[([^\]]+)\]\(([^)]+)\)$/.exec(d);a.push(q.default.createElement("a",{key:w,href:c[2],target:"_blank",rel:"noreferrer"},c[1]))}s=i.index+d.length}return s<o.length&&a.push(o.slice(s)),a}function at({text:o}){let t=String(o??"").replace(/\r\n/g,`
`).split(`
`),a=[],r=0,s=0;for(;r<t.length;){let p=t[r];if(/^```/.test(p)){let w=[];for(r+=1;r<t.length&&!/^```/.test(t[r]);)w.push(t[r]),r+=1;r+=1,a.push(q.default.createElement("pre",{className:"hw-md-code",key:`b${s++}`},q.default.createElement("code",null,w.join(`
`))));continue}if(!p.trim()){r+=1;continue}let i=/^(#{1,4})\s+(.*)$/.exec(p);if(i){let w=`h${Math.min(i[1].length+2,6)}`;a.push(q.default.createElement(w,{className:"hw-md-h",key:`b${s++}`},Ne(i[2],`h${s}`))),r+=1;continue}if(/^\s*[-*]\s+/.test(p)){let w=[];for(;r<t.length&&/^\s*[-*]\s+/.test(t[r]);)w.push(t[r].replace(/^\s*[-*]\s+/,"")),r+=1;a.push(q.default.createElement("ul",{className:"hw-md-list",key:`b${s++}`},w.map((c,g)=>q.default.createElement("li",{key:g},Ne(c,`u${s}-${g}`)))));continue}if(/^\s*\d+\.\s+/.test(p)){let w=[];for(;r<t.length&&/^\s*\d+\.\s+/.test(t[r]);)w.push(t[r].replace(/^\s*\d+\.\s+/,"")),r+=1;a.push(q.default.createElement("ol",{className:"hw-md-list",key:`b${s++}`},w.map((c,g)=>q.default.createElement("li",{key:g},Ne(c,`o${s}-${g}`)))));continue}if(/^>\s?/.test(p)){let w=[];for(;r<t.length&&/^>\s?/.test(t[r]);)w.push(t[r].replace(/^>\s?/,"")),r+=1;a.push(q.default.createElement("blockquote",{className:"hw-md-quote",key:`b${s++}`},Ne(w.join(" "),`q${s}`)));continue}if(/^\s*\|.*\|\s*$/.test(p)){let w=[];for(;r<t.length&&/^\s*\|.*\|\s*$/.test(t[r]);)w.push(t[r].trim().slice(1,-1).split("|").map(h=>h.trim())),r+=1;let c=w.filter(h=>!h.every(x=>/^:?-{2,}:?$/.test(x))),[g,...M]=c;a.push(q.default.createElement("div",{className:"hw-md-table",key:`b${s++}`},q.default.createElement("table",null,g?q.default.createElement("thead",null,q.default.createElement("tr",null,g.map((h,x)=>q.default.createElement("th",{key:x},Ne(h,`th${s}-${x}`))))):null,q.default.createElement("tbody",null,M.map((h,x)=>q.default.createElement("tr",{key:x},h.map((b,y)=>q.default.createElement("td",{key:y},Ne(b,`td${s}-${x}-${y}`)))))))));continue}let d=[];for(;r<t.length&&t[r].trim()&&!/^(#{1,4}\s|```|\s*[-*]\s|\s*\d+\.\s|>|\s*\|)/.test(t[r]);)d.push(t[r]),r+=1;a.push(q.default.createElement("p",{className:"hw-md-p",key:`b${s++}`},Ne(d.join(" "),`p${s}`)))}return q.default.createElement("div",{className:"hw-md"},a)}var B=o=>String(o).padStart(2,"0");function R(o,t,a){let r=(0,q.useRef)(a);r.current=a,(0,q.useEffect)(()=>{if(!t)return;let s=globalThis.document;function p(d){o.current&&!o.current.contains(d.target)&&r.current()}function i(d){d.key==="Escape"&&r.current()}return s?.addEventListener("pointerdown",p),s?.addEventListener("keydown",i),()=>{s?.removeEventListener("pointerdown",p),s?.removeEventListener("keydown",i)}},[o,t])}function De(){let[o,t]=(0,q.useState)(""),a=(0,q.useRef)(0);(0,q.useEffect)(()=>()=>clearTimeout(a.current),[]);let r=(0,q.useCallback)(async(s,p=s)=>{await Ht(s)&&(t(p),clearTimeout(a.current),a.current=setTimeout(()=>t(""),1600))},[]);return[o,r]}function Be(o){let t=String(o??""),a=t.lastIndexOf("/");return a<0?["",t]:[t.slice(0,a+1),t.slice(a+1)]}function Ee({text:o,kind:t,onClose:a}){let r=(0,q.useRef)(a);return r.current=a,(0,q.useEffect)(()=>{if(t!=="success")return;let s=setTimeout(()=>r.current?.(),6e3);return()=>clearTimeout(s)},[o,t]),q.default.createElement("div",{className:`hw-toast ${t==="success"?"is-ok":"is-bad"}`,role:t==="success"?"status":"alert"},q.default.createElement("span",{className:"hw-toast-mark","aria-hidden":"true"}),q.default.createElement("span",{className:"hw-toast-text"},o),a?q.default.createElement("button",{type:"button",className:"hw-icon-btn is-tiny",onClick:a,"aria-label":"关闭提示"},q.default.createElement(k,{name:"x",size:12})):null)}var l=Te(require("react"),1);var Ft=["模型","Models"];function it(o){let t=()=>{let s=o();return s?(s.getAttribute("aria-current")!=="true"&&s.click(),!0):!1};if(t())return!0;let a=0,r=()=>{t()||++a<45&&requestAnimationFrame(r)};return requestAnimationFrame(r),!0}function st(o){let t=globalThis.__dshMediaProviders;return t?.open?(t.open(o),!0):!1}function Ve(){let o=globalThis.__dshMediaProviders;if(o?.openModels)return o.openModels();let t=()=>[...document.querySelectorAll('nav button, [role="dialog"] button')].find(a=>Ft.includes(a.textContent?.trim()));if(t())return it(t);try{document.body.dispatchEvent(new KeyboardEvent("keydown",{key:",",code:"Comma",metaKey:!0,bubbles:!0}))}catch{}return it(t)}var pt="dsh.hypit-workbench.model.v1",_e=[{id:"full",label:"完全访问",body:"可读写本机文件、运行命令，不再逐条确认。适合让它直接动手。"},{id:"workspace",label:"仅限项目",body:"只能改这个项目目录；越界的操作会直接被拒，不会卡住等你确认。"}],Ot=[{id:"",label:"默认"},{id:"low",label:"低"},{id:"medium",label:"中"},{id:"high",label:"高"}];function Kt(){try{let o=globalThis.localStorage?.getItem(pt),t=o?JSON.parse(o):null;return t&&typeof t=="object"?t:{}}catch{return{}}}function lt(o){try{globalThis.localStorage?.setItem(pt,JSON.stringify(o))}catch{}}function Bt(o){let t=[];for(let a of o){let r=t[t.length-1];a.role==="tool"?r?.role==="tools"?r.items.push(a):t.push({role:"tools",items:[a]}):t.push(a)}return t}function Vt({items:o,live:t}){let[a,r]=(0,l.useState)(!1),s=[];for(let i of o){let d=s.find(w=>w.name===i.text);d?d.count+=1:s.push({name:i.text,count:1})}let p=o[o.length-1];return l.default.createElement("div",{className:`hw-trail ${t?"is-live":""}`},l.default.createElement("button",{type:"button",className:"hw-trail-head","aria-expanded":a,onClick:()=>r(i=>!i)},l.default.createElement(k,{name:"tool",size:12}),l.default.createElement("span",{className:"hw-trail-lead"},t?"正在用工具":`用了 ${o.length} 次工具`),s.slice(0,4).map(i=>l.default.createElement("span",{key:i.name,className:"hw-trail-chip"},i.name,i.count>1?l.default.createElement("em",null,"×",i.count):null)),s.length>4?l.default.createElement("span",{className:"hw-trail-chip"},"+",s.length-4):null,l.default.createElement(k,{name:"chevronDown",size:11})),t&&p?.detail&&!a?l.default.createElement("p",{className:"hw-trail-now"},p.text," · ",p.detail):null,a?l.default.createElement("ol",{className:"hw-trail-list"},o.map((i,d)=>l.default.createElement("li",{key:d},l.default.createElement("b",null,i.text),i.detail?l.default.createElement("span",null,i.detail):null))):null)}function _t({question:o,onAnswer:t}){let[a,r]=(0,l.useState)({}),[s,p]=(0,l.useState)({}),[i,d]=(0,l.useState)(!1),w=o.questions??[],c=w.every(h=>(a[h.id]?.length??0)>0||(s[h.id]??"").trim());function g(h,x){r(b=>{let y=b[h.id]??[],N=h.multiSelect?y.includes(x)?y.filter(m=>m!==x):[...y,x]:[x];return{...b,[h.id]:N}}),h.multiSelect||p(b=>({...b,[h.id]:""}))}async function M(h=!1){d(!0);let x=w.map(b=>h?{id:b.id,selected:[]}:{id:b.id,selected:a[b.id]??[],...(s[b.id]??"").trim()?{custom:s[b.id].trim()}:{}});try{await t(x)}finally{d(!1)}}return l.default.createElement("div",{className:"hw-question",role:"group","aria-label":"助手在问你"},l.default.createElement("p",{className:"hw-question-kicker"},l.default.createElement("span",{className:"hw-next-rec","aria-hidden":"true"}),"等你决定"),w.map(h=>l.default.createElement("div",{key:h.id,className:"hw-question-item"},h.header?l.default.createElement("span",{className:"hw-question-header"},h.header):null,l.default.createElement("b",null,h.question),h.detail?l.default.createElement("p",{className:"hw-question-detail"},h.detail):null,l.default.createElement("div",{className:"hw-question-options"},(h.options??[]).map(x=>{let b=(a[h.id]??[]).includes(x.label);return l.default.createElement("button",{key:x.label,type:"button",className:`hw-option ${b?"is-on":""}`,"aria-pressed":b,onClick:()=>g(h,x.label)},l.default.createElement("span",{className:`hw-option-mark ${h.multiSelect?"is-check":""}`,"aria-hidden":"true"},b?l.default.createElement(k,{name:"check",size:10,stroke:2.4}):null),l.default.createElement("span",null,l.default.createElement("b",null,x.label),x.description?l.default.createElement("span",null,x.description):null))})),l.default.createElement("input",{className:"hw-question-custom",value:s[h.id]??"",onChange:x=>{let b=x.target.value;p(y=>({...y,[h.id]:b})),b&&!h.multiSelect&&r(y=>({...y,[h.id]:[]}))},placeholder:"或者直接写你的想法"}))),l.default.createElement("div",{className:"hw-question-foot"},l.default.createElement("button",{type:"button",className:"hw-text-btn",disabled:i,onClick:()=>M(!0)},"跳过"),l.default.createElement("button",{type:"button",className:"hw-cta is-small",disabled:!c||i,onClick:()=>M(!1)},i?l.default.createElement("span",{className:"hw-spinner is-light","aria-hidden":"true"}):null,"回答")))}function Zt({access:o,onChange:t}){let[a,r]=(0,l.useState)(!1),s=(0,l.useRef)(null);R(s,a,()=>r(!1));let p=_e.find(i=>i.id===o)??_e[0];return l.default.createElement("div",{className:"hw-access",ref:s},l.default.createElement("button",{type:"button",className:`hw-access-btn is-${p.id}`,"aria-haspopup":"dialog","aria-expanded":a,onClick:()=>r(i=>!i)},l.default.createElement(k,{name:p.id==="full"?"shieldOk":"shield",size:13}),p.label,l.default.createElement(k,{name:"chevronDown",size:11})),a?l.default.createElement("div",{className:"hw-pop hw-pop-access",role:"dialog","aria-label":"助手权限"},l.default.createElement("p",{className:"hw-pop-title"},"助手权限"),l.default.createElement("div",{className:"hw-access-list",role:"radiogroup","aria-label":"助手权限"},_e.map(i=>l.default.createElement("button",{key:i.id,type:"button",role:"radio","aria-checked":i.id===p.id,className:`hw-access-item ${i.id===p.id?"is-on":""}`,onClick:()=>{t(i.id),r(!1)}},l.default.createElement("span",{className:"hw-radio","aria-hidden":"true"}),l.default.createElement("span",null,l.default.createElement("b",null,i.label),l.default.createElement("span",null,i.body))))),l.default.createElement("p",{className:"hw-pop-foot-note"},"不会弹确认框：面板里没有审批入口，所以这里直接决定它能做什么。")):null)}function Ut(o,t=Date.now()){if(!o)return"";let a=Math.round((t-o)/6e4);if(a<1)return"刚刚";if(a<60)return`${a} 分钟前`;let r=new Date(o),s=new Date(t),p=r.toDateString()===s.toDateString(),i=new Date(t-864e5).toDateString()===r.toDateString(),d=`${String(r.getHours()).padStart(2,"0")}:${String(r.getMinutes()).padStart(2,"0")}`;return p?`今天 ${d}`:i?`昨天 ${d}`:`${r.getMonth()+1}月${r.getDate()}日`}function Yt({list:o,current:t,busy:a,onOpen:r,onNew:s,onRemove:p,title:i}){let[d,w]=(0,l.useState)(!1),[c,g]=(0,l.useState)(""),M=(0,l.useRef)(null),h=(0,l.useRef)(null);R(M,d,()=>{w(!1),g("")});let x=o.find(m=>m.sessionId===t),b=x?x.title:"新对话",y=o.length;(0,l.useEffect)(()=>{d&&requestAnimationFrame(()=>h.current?.querySelector('[aria-current="true"], .hw-convo-item')?.focus())},[d]);function N(m){if(m.key==="Escape"){w(!1);return}if(m.key!=="ArrowDown"&&m.key!=="ArrowUp")return;m.preventDefault();let S=[...h.current?.querySelectorAll(".hw-convo-item")??[]],A=S.indexOf(document.activeElement);S[(A+(m.key==="ArrowDown"?1:-1)+S.length)%S.length]?.focus()}return l.default.createElement("div",{className:"hw-convo",ref:M},l.default.createElement("button",{type:"button",className:`hw-convo-btn ${d?"is-open":""}`,"aria-haspopup":"dialog","aria-expanded":d,onClick:()=>w(m=>!m),title:`${i} 的对话记录`},l.default.createElement("span",{className:"hw-convo-label"},b),y>(x?1:0)?l.default.createElement("span",{className:"hw-convo-count",title:`这个项目共 ${y} 段对话`},y):null,l.default.createElement(k,{name:"chevronDown",size:11})),d?l.default.createElement("div",{className:"hw-pop hw-pop-convo",role:"dialog","aria-label":"对话记录",onKeyDown:N},l.default.createElement("div",{className:"hw-convo-head"},l.default.createElement("p",{className:"hw-pop-title"},i," · 对话记录"),l.default.createElement("button",{type:"button",className:"hw-convo-new",disabled:a,onClick:()=>{w(!1),s()}},l.default.createElement(k,{name:"plus",size:12}),"新对话")),y?l.default.createElement("ol",{className:"hw-convo-list",ref:h},o.map((m,S)=>{let A=m.sessionId===t;return l.default.createElement("li",{key:m.sessionId,className:`hw-convo-row ${A?"is-on":""}`,style:{"--i":S}},l.default.createElement("button",{type:"button",className:"hw-convo-item","aria-current":A?"true":void 0,disabled:a&&!A,onClick:()=>{w(!1),A||r(m.sessionId)}},l.default.createElement("span",{className:"hw-convo-index"},B(y-S)),l.default.createElement("span",{className:"hw-convo-main"},l.default.createElement("b",null,m.title),l.default.createElement("span",null,m.running?l.default.createElement("em",{className:"hw-convo-live"},l.default.createElement("i",{"aria-hidden":"true"}),"进行中"):Ut(m.updatedAt),m.turns?` · ${m.turns} 轮`:""))),A?null:l.default.createElement("button",{type:"button",className:`hw-convo-del ${c===m.sessionId?"is-confirm":""}`,onClick:()=>{if(c!==m.sessionId){g(m.sessionId);return}g(""),p(m.sessionId)},onBlur:()=>g(v=>v===m.sessionId?"":v),"aria-label":c===m.sessionId?"再点一次移出列表":"移出列表",title:c===m.sessionId?"再点一次移出列表":"移出列表"},c===m.sessionId?"移出":l.default.createElement(k,{name:"x",size:11})))})):l.default.createElement("p",{className:"hw-convo-empty"},"这里会按时间列出这个项目的每一段对话，重开工作台也能接着聊。"),l.default.createElement("p",{className:"hw-pop-foot-note"},"每个项目各自保存；移出列表不会删除会话文件。")):null)}function Xt(o){return String(o??"").replace(/^【引用原句】[\s\S]*?\n\n/u,"")}function Pe({target:o,chat:t,pendingPrompt:a,onConsume:r,onTurnDone:s,attachment:p,onClearAttachment:i,className:d=""}){let w={id:o.id,title:o.title,root:o.hint},[c,g]=(0,l.useState)([]),[M,h]=(0,l.useState)(""),[x,b]=(0,l.useState)(!1),[y,N]=(0,l.useState)(0),[m,S]=(0,l.useState)(0),[A,v]=(0,l.useState)(null),[C,I]=(0,l.useState)(Kt),[$,f]=(0,l.useState)(null),[P,O]=(0,l.useState)(!1),[re,J]=(0,l.useState)(!1),[X,te]=(0,l.useState)(null),[z,D]=(0,l.useState)(!1),[Z,ne]=(0,l.useState)([]),[he,oe]=(0,l.useState)(""),[ie,de]=(0,l.useState)(!0),W=(0,l.useRef)(0),ee=(0,l.useRef)(""),xe=(0,l.useRef)(null),se=(0,l.useRef)(null),ae=(0,l.useRef)(null);R(ae,P,()=>O(!1)),(0,l.useEffect)(()=>{let u=!0;return t.models().then(E=>{u&&(f(E),I(F=>{let Y={...F};return Y.provider||(Y.provider=E?.selection?.provider??""),Y.model||(Y.model=E?.selection?.model??""),lt(Y),Y}))}).catch(()=>{}),()=>{u=!1}},[t]),(0,l.useEffect)(()=>{if(!a||a.for&&a.for!==w.id)return;let u=a.text??"";u&&h(u),J(!0);let E=se.current;E?.focus();let F=(u||E?.value||"").length;E?.setSelectionRange?.(F,F),r?.();let Y=setTimeout(()=>J(!1),900);return()=>clearTimeout(Y)},[a,r,w.id]);let G=(0,l.useRef)(!0),[Ce,be]=(0,l.useState)(!1),fe=(0,l.useCallback)(u=>{let E=u.currentTarget,F=E.scrollHeight-E.scrollTop-E.clientHeight<48;G.current=F,F&&be(!1)},[]),L=(0,l.useCallback)(()=>{let u=xe.current;u&&(G.current=!0,be(!1),u.scrollTo({top:u.scrollHeight,behavior:"smooth"}))},[]);(0,l.useEffect)(()=>{let u=xe.current;u&&(G.current?u.scrollTo({top:u.scrollHeight,behavior:"smooth"}):be(!0))},[c,x,A,X]);let H=(0,l.useCallback)(async()=>{if(!t.list)return null;try{let u=await t.list();return ne(u?.conversations??[]),u}catch{return null}},[t]),U=(0,l.useCallback)(async(u,{open:E=!1}={})=>{de(!0),v(null),te(null);try{let F=E&&u?await t.open(u):await t.poll(0,u||void 0);if(!F?.exists){g([]),W.current=0,oe(""),b(!1);return}g(F.messages??[]),W.current=F.cursor??0,oe(F.sessionId||u||""),F.running?(b(!0),N(F.startedAt||Date.now()),te(F.question)):b(!1),G.current=!0}catch(F){v({text:K(F),retry:""})}finally{de(!1)}},[t]);(0,l.useEffect)(()=>{let u=!0;return g([]),oe(""),W.current=0,(async()=>{let E=await H();u&&await U(E?.current||"")})(),()=>{u=!1}},[t,w.id,H,U]),(0,l.useEffect)(()=>{if(!x)return;let u=!0,E=0,F=0;async function Y(){try{let me=await t.poll(W.current);if(!u)return;F=0;let qe=(me.messages??[]).filter(ke=>ke.role!=="user"&&!(ke.role==="note"&&ke.tone==="error"));if(qe.length&&g(ke=>[...ke,...qe]),W.current=me.cursor??W.current,te(me.question??null),!me.running){b(!1),D(!1);let ke=qe.some(Ct=>Ct.role==="assistant");me.error?v({text:me.error,retry:ee.current}):!ke&&!me.stopped&&!qe.length&&v({text:"这一轮没有文字返回。可能是模型没配好，或调用被中断。",retry:ee.current}),s?.(),H();return}}catch(me){if(F+=1,F>=6){if(!u)return;b(!1),v({text:K(me),retry:ee.current});return}}u&&(E=setTimeout(Y,900))}return E=setTimeout(Y,600),()=>{u=!1,clearTimeout(E)}},[x,t,w.id,s,H]),(0,l.useEffect)(()=>{let u=se.current;u&&(u.style.height="auto",u.style.height=`${Math.min(u.scrollHeight,168)}px`)},[M]),(0,l.useEffect)(()=>{if(!x)return;let u=setInterval(()=>S(Math.floor((Date.now()-y)/1e3)),500);return()=>clearInterval(u)},[x,y]);function ce(u){I(E=>{let F={...E,...u};return lt(F),F})}let le=$?.providers?.find(u=>u.id===(C.provider||$?.selection?.provider)),Q=le?.models??[],we=C.model||$?.selection?.model||"",Se=Q.find(u=>u.id===we)?.label||we||"模型",Fe=Se.replace(/^(deepseek|claude|gpt|gemini|qwen)[-\s]?/iu,"")||Se,ze=C.access==="workspace"?"workspace":"full",[pe,ge]=(0,l.useState)(!1);async function Me(u){let E=String(u??M).trim();if(!E||x||pe)return;let F=p?.context?`${p.context}

${E}`:E;ge(!0),v(null),u===void 0&&h(""),ee.current=F,G.current=!0,g(Y=>[...Y,{role:"user",text:E,quote:p?.label}]);try{let Y=await t.chat(F,{provider:C.provider||void 0,model:C.model||void 0,reasoningEffort:C.reasoningEffort||void 0,access:ze,...he?{sessionId:he}:{}});W.current=Y?.cursor??W.current,Y?.sessionId&&oe(Y.sessionId),H(),p&&i?.(),N(Date.now()),S(0),b(!0)}catch(Y){v({text:K(Y),retry:F}),u===void 0&&h(E)}finally{ge(!1)}}async function je(){D(!0);try{await t.stop()}catch(u){D(!1),v({text:K(u),retry:ee.current})}}async function Oe(u){try{await t.answer(u),te(null)}catch(E){v({text:K(E),retry:ee.current})}}async function ue(){if(!x){try{await t.reset()}catch(u){v({text:K(u),retry:""});return}g([]),v(null),te(null),oe(""),W.current=0,requestAnimationFrame(()=>se.current?.focus())}}async function Ae(u){x||(await U(u,{open:!0}),H())}async function Ke(u){try{await t.remove(u),await H()}catch(E){v({text:K(E),retry:""})}}let T=o.prompts??[],j=Bt(c);return l.default.createElement("aside",{className:`hw-assistant ${d}`,"aria-label":"助手"},l.default.createElement("div",{className:"hw-assistant-head"},l.default.createElement("div",{className:"hw-assistant-title"},l.default.createElement("span",{className:`hw-live ${x?"is-busy":""}`,"aria-hidden":"true"}),l.default.createElement(Yt,{list:Z,current:he,busy:x||pe,title:w.title,onOpen:Ae,onNew:ue,onRemove:Ke})),l.default.createElement("div",{className:"hw-assistant-tools",ref:ae},l.default.createElement("button",{className:`hw-pill-btn is-quiet ${P?"is-open":""}`,type:"button","aria-expanded":P,onClick:()=>O(u=>!u),title:"对话模型"},l.default.createElement("span",{className:"hw-model-name"},Fe),l.default.createElement(k,{name:"chevronDown",size:11})),c.length&&!x?l.default.createElement("button",{className:"hw-icon-btn",type:"button",onClick:ue,"aria-label":"新对话",title:"新对话（上一段会保存在对话记录里）"},l.default.createElement(k,{name:"plus",size:14})):null,P?l.default.createElement("div",{className:"hw-pop hw-pop-settings",role:"dialog","aria-label":"对话模型"},l.default.createElement("p",{className:"hw-pop-title"},"对话模型"),Q.length>1?l.default.createElement("div",{className:"hw-model-list",role:"radiogroup","aria-label":"模型"},Q.map(u=>l.default.createElement("button",{key:u.id,type:"button",role:"radio","aria-checked":u.id===we,className:`hw-model-row ${u.id===we?"is-on":""}`,onClick:()=>ce({provider:le?.id??C.provider,model:u.id})},l.default.createElement("span",{className:"hw-radio","aria-hidden":"true"}),l.default.createElement("span",null,u.label||u.id)))):l.default.createElement("p",{className:"hw-model-current"},Se,l.default.createElement("span",null,le?.name??"")),l.default.createElement("div",{className:"hw-field"},l.default.createElement("span",null,"思考深度"),l.default.createElement("div",{className:"hw-seg",role:"radiogroup","aria-label":"思考深度"},Ot.map(u=>l.default.createElement("button",{key:u.id||"default",type:"button",role:"radio","aria-checked":(C.reasoningEffort??"")===u.id,className:(C.reasoningEffort??"")===u.id?"is-on":"",onClick:()=>ce({reasoningEffort:u.id})},u.label)))),l.default.createElement("button",{type:"button",className:"hw-pop-link",onClick:()=>{O(!1),Ve()}},l.default.createElement(k,{name:"gear",size:12}),"添加或管理模型（设置 → 模型）",l.default.createElement(k,{name:"arrow",size:12})),l.default.createElement("p",{className:"hw-pop-foot-note"},"换模型后，这段对话照常继续。")):null)),l.default.createElement("div",{className:"hw-chat-log",role:"log","aria-live":"polite",ref:xe,onScroll:fe,tabIndex:0},ie&&c.length===0?l.default.createElement("div",{className:"hw-chat-skeleton","aria-hidden":"true"},l.default.createElement("i",null),l.default.createElement("i",null),l.default.createElement("i",null)):c.length===0?l.default.createElement("div",{className:"hw-intro"},l.default.createElement("p",{className:"hw-intro-kicker"},o.kicker??`只为 ${w.title} 工作`),l.default.createElement("h3",null,o.heading??"说一句，它就动手。"),l.default.createElement("p",{className:"hw-intro-body"},o.body),l.default.createElement("div",{className:"hw-prompts"},T.map((u,E)=>l.default.createElement("button",{key:u,type:"button",className:"hw-prompt",style:{"--i":E},onClick:()=>Me(u)},l.default.createElement("span",{className:"hw-prompt-n"},B(E+1)),l.default.createElement("span",{className:"hw-prompt-text"},u),l.default.createElement(k,{name:"arrow",size:13}))))):j.map((u,E)=>u.role==="tools"?l.default.createElement(Vt,{key:E,items:u.items,live:x&&E===j.length-1}):u.role==="note"?l.default.createElement("p",{key:E,className:`hw-turn-note ${u.tone==="error"?"is-error":""}`},u.text):u.role==="user"?l.default.createElement("div",{key:E,className:"hw-turn hw-turn-user"},l.default.createElement("div",{className:"hw-bubble"},u.quote?l.default.createElement("span",{className:"hw-bubble-quote"},l.default.createElement(k,{name:"quote",size:11}),u.quote):null,Xt(u.text))):l.default.createElement("div",{key:E,className:"hw-turn hw-turn-assistant"},l.default.createElement("div",{className:"hw-turn-body hw-turn-md"},l.default.createElement(at,{text:u.text})))),X?l.default.createElement(_t,{key:JSON.stringify(X.questions?.map(u=>u.id)),question:X,onAnswer:Oe}):null,(x||pe)&&!X?l.default.createElement("div",{className:"hw-thinking",role:"status"},l.default.createElement("span",{className:"hw-dots","aria-hidden":"true"},l.default.createElement("i",null),l.default.createElement("i",null),l.default.createElement("i",null)),l.default.createElement("span",null,z?"正在停止":pe?"正在发送":"正在处理"),x?l.default.createElement("span",{className:"hw-mono"},m,"s"):null,x&&!z?l.default.createElement("button",{type:"button",className:"hw-stop",onClick:je},l.default.createElement("span",{"aria-hidden":"true"}),"停止"):null):null,A&&!x?l.default.createElement("div",{className:"hw-error-card",role:"alert"},l.default.createElement("b",null,"这一轮没跑完"),l.default.createElement("p",null,A.text),A.retry?l.default.createElement("button",{className:"hw-text-btn is-strong",type:"button",onClick:()=>Me(A.retry)},l.default.createElement(k,{name:"retry",size:13}),"重试"):null,/model|模型/iu.test(A.text)?l.default.createElement("button",{className:"hw-text-btn",type:"button",onClick:()=>Ve()},"去「设置 → 模型」",l.default.createElement(k,{name:"arrow",size:12})):null):null),Ce?l.default.createElement("button",{type:"button",className:"hw-jump",onClick:L},l.default.createElement(k,{name:"chevronDown",size:12}),x?"有新进展":"回到最新"):null,l.default.createElement("div",{className:`hw-compose ${re?"is-primed":""}`},p?l.default.createElement("div",{className:"hw-attach"},l.default.createElement(k,{name:"quote",size:13}),l.default.createElement("span",{className:"hw-attach-text"},p.label),l.default.createElement("button",{type:"button",className:"hw-icon-btn is-tiny",onClick:i,"aria-label":"移除引用"},l.default.createElement(k,{name:"x",size:11}))):null,l.default.createElement("textarea",{ref:se,value:M,onChange:u=>h(u.target.value),onKeyDown:u=>{u.key==="Enter"&&!u.shiftKey&&!u.nativeEvent.isComposing&&(u.preventDefault(),Me())},placeholder:X?"先回答上面的问题…":x?"它在干活，可以先写下一句…":"要它做什么？",rows:2,"aria-label":"和助手说话"}),l.default.createElement("div",{className:"hw-compose-bar"},l.default.createElement(Zt,{access:ze,onChange:u=>ce({access:u})}),l.default.createElement("span",{className:"hw-compose-hint"},"↩ 发送 · ⇧↩ 换行"),x?l.default.createElement("button",{className:"hw-send is-stop",type:"button",onClick:je,disabled:z,"aria-label":"停止这一轮",title:"停止"},l.default.createElement("span",{className:"hw-send-stop","aria-hidden":"true"})):l.default.createElement("button",{className:"hw-send",type:"button",disabled:pe||!M.trim(),onClick:()=>Me(),"aria-label":"发送"},pe?l.default.createElement("span",{className:"hw-spinner is-light","aria-hidden":"true"}):l.default.createElement(k,{name:"send",size:15})))))}var e=Te(require("react"),1);var ht="dsh.video-workbench.clip.v1",dt=new Map;function V(o,t=!1){let a=Math.max(0,Number(o)||0),r=Math.floor(a/60),s=a-r*60;return t?`${B(r)}:${s.toFixed(2).padStart(5,"0")}`:`${B(r)}:${B(Math.floor(s))}`}function Wt(o){let{style:t,branch:a,component:r,orchestration:s}=o??{};return"按实际内容设计并制作完整视频，"+(t?`母画风使用已选的「${t.name}」`:"按内容自主选择母画风")+(a?`，分支选「${a.name}」`:"")+(r?`，参照组件「${r.name}」并按文案适配`:"")+(s?`，编排使用「${s.name}」`:"，按当前文案选择编排")+"，保留原声与原意。"}function ct(o,t){return String(o??"").split(`
`).map(r=>r.trim()).filter(r=>r&&!/^\[hyperframes\]/u.test(r)).slice(-t).join(" / ").slice(0,400)}function ut(o){return`${o}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}var wt=o=>Uint8Array.from(atob(o),t=>t.charCodeAt(0));async function mt(o,t,a){let r=await o(0);if(!Number.isSafeInteger(r.size)||r.next<1)throw new Error("视频数据不完整，请刷新后重试");let s=[wt(r.data)],p=r.next,i=r.next,d=r.next;a?.(d/r.size);let w=async()=>{for(;i<r.size;){t?.throwIfAborted();let c=i;i=Math.min(r.size,i+p);let g=await o(c);if(g.size!==r.size)throw new Error("视频在读取时发生了变化，请重试");s[c/p]=wt(g.data),d+=g.next-c,a?.(d/r.size)}};return await Promise.all(Array.from({length:Math.min(4,Math.ceil((r.size-r.next)/p))},w)),new Blob(s,{type:r.mime||"video/mp4"})}function Gt({api:o,clip:t,version:a,onVersion:r,videoRef:s,position:p,onTime:i,playing:d,onPlaying:w}){let[c,g]=(0,e.useState)({url:"",progress:0,error:""}),[M,h]=(0,e.useState)(!1),[x,b]=(0,e.useState)(!1),[y,N]=(0,e.useState)(!1),m=(0,e.useRef)(null);R(m,y,()=>N(!1));let S=[{id:"source",label:"原片",duration:t.duration},...[...t.versions].reverse()],A=S.find(f=>f.id===a)??S[0];(0,e.useEffect)(()=>{let f=new AbortController,P="";return g({url:"",progress:0,error:""}),mt(O=>o.clip("media",{projectId:t.id,version:a,offset:O,compat:M}),f.signal,O=>g(re=>({...re,progress:O}))).then(O=>{f.signal.aborted||(P=URL.createObjectURL(O),g({url:P,progress:1,error:""}))}).catch(O=>{f.signal.aborted||g({url:"",progress:0,error:K(O)})}),()=>{f.abort(),P&&URL.revokeObjectURL(P)}},[o,t.id,a,M]);let v=t.width&&t.height?`${t.width} / ${t.height}`:"9 / 16",C=t.width&&t.height?t.width/t.height:.5625,I=A?.duration??t.duration;function $(){let f=s.current;f&&(f.paused?f.play().catch(()=>{}):f.pause())}return e.default.createElement("section",{className:"th-monitor","aria-label":"监看"},e.default.createElement("div",{className:"th-monitor-head",ref:m},e.default.createElement("button",{type:"button",className:`th-version ${y?"is-open":""}`,"aria-haspopup":"listbox","aria-expanded":y,onClick:()=>N(f=>!f)},e.default.createElement("span",{className:`th-version-dot ${a==="source"?"":"is-cut"}`,"aria-hidden":"true"}),e.default.createElement("b",null,A?.label??"原片"),e.default.createElement("span",{className:"hw-mono"},V(I)),e.default.createElement(k,{name:"chevronDown",size:11})),y?e.default.createElement("ul",{className:"hw-pop th-version-pop",role:"listbox","aria-label":"版本"},S.map(f=>e.default.createElement("li",{key:f.id},e.default.createElement("button",{type:"button",role:"option","aria-selected":f.id===a,className:f.id===a?"is-on":"",onClick:()=>{r(f.id),N(!1)}},e.default.createElement("span",{className:`th-version-dot ${f.id==="source"?"":"is-cut"}`,"aria-hidden":"true"}),e.default.createElement("span",{className:"th-version-name"},f.label),e.default.createElement("span",{className:"hw-mono"},V(f.duration)),f.createdAt?e.default.createElement("em",null,ye(f.createdAt)):null)))):null,c.url?e.default.createElement("a",{className:"hw-icon-btn",href:c.url,download:`${t.name}-${A?.label??"原片"}.${M?"webm":"mp4"}`,title:"下载这个版本","aria-label":"下载这个版本"},e.default.createElement(k,{name:"download",size:15})):null),e.default.createElement("div",{className:"th-frame",style:{"--th-ratio":v,"--th-ar":C}},c.url?e.default.createElement("video",{ref:s,src:c.url,muted:x,playsInline:!0,onClick:$,onTimeUpdate:f=>i(f.currentTarget.currentTime),onPlay:()=>w(!0),onPause:()=>w(!1),onError:()=>{M||h(!0)},"aria-label":`${t.name} · ${A?.label??"原片"}`}):e.default.createElement("div",{className:"th-frame-state"},c.error?e.default.createElement(e.default.Fragment,null,e.default.createElement("p",null,c.error),e.default.createElement("button",{type:"button",className:"hw-text-btn is-strong",onClick:()=>h(f=>!f)},"换一种格式再试")):e.default.createElement(e.default.Fragment,null,e.default.createElement("span",{className:"th-load",style:{"--p":c.progress},"aria-hidden":"true"}),e.default.createElement("p",{className:"hw-mono"},Math.round(c.progress*100),"%"))),c.url&&!d?e.default.createElement("button",{type:"button",className:"th-bigplay",onClick:$,"aria-label":"播放"},e.default.createElement(k,{name:"play",size:22})):null),e.default.createElement("div",{className:"th-transport"},e.default.createElement("button",{type:"button",className:"th-play",onClick:$,"aria-label":d?"暂停":"播放",disabled:!c.url},d?e.default.createElement("span",{className:"th-pause","aria-hidden":"true"},e.default.createElement("i",null),e.default.createElement("i",null)):e.default.createElement(k,{name:"play",size:14})),e.default.createElement("span",{className:"hw-mono th-clock"},V(p,!0),e.default.createElement("i",null," / ",V(I))),e.default.createElement("button",{type:"button",className:"hw-icon-btn",onClick:()=>b(f=>!f),"aria-label":x?"取消静音":"静音",title:x?"取消静音":"静音"},e.default.createElement(k,{name:x?"mute":"sound",size:15}))))}var He=new Map;function Ze(o,t,a,r){let s=`${t}/${a?.id}/${r}`,[p,i]=(0,e.useState)(He.get(s)??""),d=r==="poster"?a?.hasPoster:a?.hasContact;return(0,e.useEffect)(()=>{if(!a||!d||He.has(s)){i(He.get(s)??"");return}let w=!0;return o.clip("film_image",{projectId:t,versionId:a.id,which:r}).then(c=>{He.set(s,c.source),w&&i(c.source)}).catch(()=>{}),()=>{w=!1}},[o,t,a?.id,r,d,s]),p}function Jt(o,t=.5){let[a,r]=(0,e.useState)("");return(0,e.useEffect)(()=>{if(!o)return;let s=!0,p=document.createElement("video");p.muted=!0,p.preload="auto",p.src=o;let i=()=>{try{let d=document.createElement("canvas"),w=360/Math.max(1,p.videoWidth);d.width=Math.round(p.videoWidth*w),d.height=Math.round(p.videoHeight*w),d.getContext("2d").drawImage(p,0,0,d.width,d.height),s&&r(d.toDataURL("image/jpeg",.82))}catch{}};return p.addEventListener("loadeddata",()=>{p.currentTime=Math.min(t,(p.duration||1)*.1)},{once:!0}),p.addEventListener("seeked",i,{once:!0}),()=>{s=!1,p.removeAttribute("src"),p.load()}},[o,t]),a}function Ue({film:o,poster:t,active:a,onOpen:r,index:s}){return e.default.createElement("button",{type:"button",className:`th-film-card ${a?"is-on":""}`,onClick:r,style:{"--i":s},"aria-pressed":a},e.default.createElement("span",{className:"th-film-thumb"},t?e.default.createElement("img",{src:t,alt:""}):e.default.createElement("span",{className:"th-film-thumb-ph","aria-hidden":"true"},e.default.createElement(k,{name:o.kind==="cut"?"scissors":"film",size:18})),e.default.createElement("span",{className:"th-film-dur hw-mono"},V(o.duration))),e.default.createElement("span",{className:"th-film-meta"},e.default.createElement("b",null,o.label),e.default.createElement("span",null,o.kind==="cut"?"剪辑版本":o.kind==="hypit"?o.run||"Hypit 构建":o.style??"创作版本"," · ",ye(o.createdAt))))}function Ye({source:o,film:t,onAsk:a}){let[r,s]=(0,e.useState)({url:"",progress:0,error:""}),[p,i]=(0,e.useState)(!1),[d,w]=(0,e.useState)(0),[c,g]=(0,e.useState)(!1),[M,h]=(0,e.useState)(-1),[x,b]=(0,e.useState)(!1),y=(0,e.useRef)(null),N=(0,e.useRef)(null),m=(0,e.useRef)(null),S=o.poster??"",A=o.contact??"",v=Jt(S?"":r.url);(0,e.useEffect)(()=>{let z=new AbortController,D="";return s({url:"",progress:0,error:""}),i(!1),w(0),mt(Z=>o.loadChunk(Z,x),z.signal,Z=>s(ne=>({...ne,progress:Z}))).then(Z=>{z.signal.aborted||(D=URL.createObjectURL(Z),s({url:D,progress:1,error:""}))}).catch(Z=>{z.signal.aborted||s({url:"",progress:0,error:K(Z)})}),()=>{z.abort(),D&&URL.revokeObjectURL(D)}},[o.key,t.id,x]);let C=t.duration||1,I=t.chapters??[],$=I.findIndex(z=>d>=z.start&&d<z.end);function f(){let z=y.current;z&&(z.paused?z.play().catch(()=>{}):z.pause())}function P(z){let D=y.current;D&&(D.currentTime=Math.max(0,Math.min(C-.05,z)),w(D.currentTime))}function O(z){let D=N.current.getBoundingClientRect();return Math.max(0,Math.min(1,(z.clientX-D.left)/D.width))}function re(){let z=m.current;z&&(document.fullscreenElement?document.exitFullscreen():z.requestFullscreen?.())}(0,e.useEffect)(()=>{function z(D){let Z=D.target;Z&&(Z.tagName==="INPUT"||Z.tagName==="TEXTAREA"||Z.tagName==="SELECT"||Z.isContentEditable)||(D.key===" "?(D.preventDefault(),f()):D.key==="ArrowRight"?(D.preventDefault(),P(d+5)):D.key==="ArrowLeft"?(D.preventDefault(),P(d-5)):(D.key==="l"||D.key==="L")&&I.length?P(I[Math.min(I.length-1,$+1)]?.start??0):(D.key==="j"||D.key==="J")&&I.length?P(I[Math.max(0,$-(d-(I[$]?.start??0)>1.5?0:1))]?.start??0):(D.key==="f"||D.key==="F")&&re())}return globalThis.document?.addEventListener("keydown",z),()=>globalThis.document?.removeEventListener("keydown",z)});let J=o.width&&o.height?o.width/o.height:.5625,X=M>=0?M*C:-1,te=M>=0?Math.min(15,Math.floor(M*16)):0;return e.default.createElement("div",{className:"th-film"},e.default.createElement("div",{className:"th-film-stage",ref:m,style:{"--th-ar":J}},e.default.createElement("div",{className:"th-film-glow","aria-hidden":"true",style:{backgroundImage:S||v?`url(${S||v})`:void 0}}),e.default.createElement("div",{className:"th-film-frame"},r.url?e.default.createElement("video",{ref:y,src:r.url,poster:S||v||void 0,muted:c,playsInline:!0,onClick:f,onTimeUpdate:z=>w(z.currentTarget.currentTime),onPlay:()=>i(!0),onPause:()=>i(!1),onEnded:()=>i(!1),onError:()=>{x||b(!0)},"aria-label":`${o.name} · ${t.label}`}):e.default.createElement("div",{className:"th-film-loading",style:S?{backgroundImage:`url(${S})`}:void 0},r.error?e.default.createElement("p",null,r.error):e.default.createElement("span",{className:"th-film-ring",style:{"--p":r.progress},"aria-label":`载入 ${Math.round(r.progress*100)}%`},e.default.createElement("span",{className:"hw-mono"},Math.round(r.progress*100)))),r.url&&!p?e.default.createElement("button",{type:"button",className:"th-film-play",onClick:f,"aria-label":"播放"},e.default.createElement(k,{name:"play",size:26})):null,$>=0&&p?e.default.createElement("span",{key:$,className:"th-film-chapter-flag"},B($+1)," · ",I[$].title):null)),e.default.createElement("div",{className:"th-film-bar"},e.default.createElement("button",{type:"button",className:"th-play",onClick:f,disabled:!r.url,"aria-label":p?"暂停":"播放"},p?e.default.createElement("span",{className:"th-pause","aria-hidden":"true"},e.default.createElement("i",null),e.default.createElement("i",null)):e.default.createElement(k,{name:"play",size:14})),e.default.createElement("div",{className:"th-scrub",ref:N,role:"slider",tabIndex:0,"aria-label":"播放进度","aria-valuemin":0,"aria-valuemax":Math.round(C),"aria-valuenow":Math.round(d),onPointerMove:z=>h(O(z)),onPointerLeave:()=>h(-1),onPointerDown:z=>{z.currentTarget.setPointerCapture(z.pointerId),P(O(z)*C)},onPointerUp:z=>z.currentTarget.releasePointerCapture(z.pointerId),onKeyDown:z=>{z.key==="ArrowRight"&&P(d+1),z.key==="ArrowLeft"&&P(d-1)}},e.default.createElement("div",{className:"th-scrub-track"},I.length?I.map(z=>e.default.createElement("span",{key:z.index,className:`th-scrub-seg ${z.index===$?"is-now":""}`,style:{left:`${z.start/C*100}%`,width:`${(z.end-z.start)/C*100}%`}},e.default.createElement("i",{style:{transform:`scaleX(${Math.max(0,Math.min(1,(d-z.start)/(z.end-z.start)))})`}}))):e.default.createElement("span",{className:"th-scrub-seg",style:{left:0,width:"100%"}},e.default.createElement("i",{style:{transform:`scaleX(${d/C})`}}))),M>=0?e.default.createElement("span",{className:"th-scrub-peek",style:{left:`${M*100}%`}},A?e.default.createElement("span",{className:"th-scrub-tile",style:{backgroundImage:`url(${A})`,backgroundPosition:`${te%4*33.333}% ${Math.floor(te/4)*33.333}%`}}):null,e.default.createElement("span",{className:"hw-mono"},V(X)),I.length?e.default.createElement("em",null,I.find(z=>X>=z.start&&X<z.end)?.title):null):null),e.default.createElement("span",{className:"hw-mono th-clock"},V(d),e.default.createElement("i",null," / ",V(C))),e.default.createElement("button",{type:"button",className:"hw-icon-btn",onClick:()=>g(z=>!z),"aria-label":c?"取消静音":"静音",title:c?"取消静音":"静音"},e.default.createElement(k,{name:c?"mute":"sound",size:15})),e.default.createElement("button",{type:"button",className:"hw-icon-btn",onClick:re,"aria-label":"全屏",title:"全屏 (F)"},e.default.createElement(k,{name:"expand",size:15}))),e.default.createElement("aside",{className:"th-film-side"},e.default.createElement("div",{className:"th-film-title"},e.default.createElement("p",{className:"hw-next-kicker"},e.default.createElement("span",{className:"hw-next-rec","aria-hidden":"true"}),o.kindLabel??(t.kind==="cut"?"剪辑版本":"创作版本")),e.default.createElement("h2",null,t.label),e.default.createElement("dl",{className:"th-film-facts"},e.default.createElement("div",null,e.default.createElement("dt",null,"时长"),e.default.createElement("dd",{className:"hw-mono"},V(t.duration,!0))),t.style?e.default.createElement("div",null,e.default.createElement("dt",null,"画风"),e.default.createElement("dd",null,t.style)):null,t.run?e.default.createElement("div",null,e.default.createElement("dt",null,"Run"),e.default.createElement("dd",{className:"hw-mono"},t.run)):null,t.source?e.default.createElement("div",null,e.default.createElement("dt",null,"Source"),e.default.createElement("dd",{className:"hw-mono"},t.source)):null,t.orchestration?e.default.createElement("div",null,e.default.createElement("dt",null,"编排"),e.default.createElement("dd",null,t.orchestration)):null,e.default.createElement("div",null,e.default.createElement("dt",null,"完成"),e.default.createElement("dd",null,ye(t.createdAt))),t.verified?e.default.createElement("div",null,e.default.createElement("dt",null,"校验"),e.default.createElement("dd",{className:"th-film-ok"},e.default.createElement(k,{name:"check",size:12,stroke:2.2}),t.verifiedLabel??"原声对齐 · 质检通过")):null),e.default.createElement("div",{className:"th-film-actions"},r.url?e.default.createElement("a",{className:"hw-cta is-small",href:r.url,download:`${o.name}-${t.label}.${x?"webm":"mp4"}`},e.default.createElement(k,{name:"download",size:13}),"下载 MP4"):null,e.default.createElement("button",{type:"button",className:"hw-text-btn",onClick:()=>a(`看一下「${t.label}」这版成片，按优先级说说哪里还能更好。`)},"让助手点评"))),I.length?e.default.createElement("ol",{className:"th-chapters","aria-label":"章节"},I.map(z=>e.default.createElement("li",{key:z.index,style:{"--i":z.index}},e.default.createElement("button",{type:"button",className:`th-chapter ${z.index===$?"is-now":""}`,onClick:()=>{P(z.start+.01),y.current?.play?.().catch(()=>{})}},e.default.createElement("span",{className:"th-chapter-n hw-mono"},B(z.index+1)),e.default.createElement("span",{className:"th-chapter-main"},e.default.createElement("b",null,z.title),e.default.createElement("span",null,z.purpose)),e.default.createElement("span",{className:"th-chapter-t hw-mono"},V(z.start)))))):e.default.createElement("p",{className:"th-film-note"},o.noChapters??"剪辑版本按文稿删改直接剪出，没有分镜章节。点进度条任意位置跳转。"),e.default.createElement("p",{className:"th-film-keys hw-mono"},"空格 播放 · ←/→ 5 秒 · J/L 章节 · F 全屏")))}function Qt({api:o,clip:t,film:a,onAsk:r}){let s=Ze(o,t.id,a,"poster"),p=Ze(o,t.id,a,"contact"),i={key:`${t.id}/${a.id}`,name:t.name,width:t.width,height:t.height,poster:s,contact:p,loadChunk:(d,w)=>o.clip("media",{projectId:t.id,version:a.id,offset:d,compat:w})};return e.default.createElement(Ye,{source:i,film:a,onAsk:r})}function Rt({api:o,clip:t,film:a,...r}){let s=Ze(o,t.id,a,"poster");return e.default.createElement(Ue,{film:a,poster:s,...r})}function en({api:o,clip:t,onAsk:a,initial:r}){let[s,p]=(0,e.useState)(null),[i,d]=(0,e.useState)(r??""),[w,c]=(0,e.useState)(""),g=t.versions.map(h=>h.id).join(",");if((0,e.useEffect)(()=>{let h=!0;return o.clip("films",{projectId:t.id}).then(x=>{h&&(p(x.films),d(b=>x.films.some(y=>y.id===b)?b:x.films[0]?.id??""))}).catch(x=>{h&&c(K(x))}),()=>{h=!1}},[o,t.id,g]),(0,e.useEffect)(()=>{r&&d(r)},[r]),w)return e.default.createElement("div",{className:"hw-state"},e.default.createElement("p",null,w));if(!s)return e.default.createElement("div",{className:"th-films-skeleton","aria-hidden":"true"},e.default.createElement("i",null),e.default.createElement("i",null));if(!s.length)return e.default.createElement("div",{className:"th-films-empty"},e.default.createElement("span",{className:"th-empty-mark","aria-hidden":"true"},e.default.createElement(k,{name:"film",size:22})),e.default.createElement("h3",null,"还没有成片"),e.default.createElement("p",null,"删几句出一个剪辑版本，或者选好画风让助手做一版完整视频，做好就会出现在这里。"),e.default.createElement("button",{type:"button",className:"hw-cta",onClick:()=>a("按已选画风做一版完整视频，保留原声。")},"做一版整片",e.default.createElement(k,{name:"arrow",size:15})));let M=s.find(h=>h.id===i)??s[0];return e.default.createElement("div",{className:"th-films"},e.default.createElement(Qt,{key:M.id,api:o,clip:t,film:M,onAsk:a}),s.length>1?e.default.createElement("div",{className:"th-shelf",role:"list","aria-label":"全部成片"},e.default.createElement("p",{className:"th-shelf-title"},"全部成片 ",e.default.createElement("span",{className:"hw-mono"},B(s.length))),e.default.createElement("div",{className:"th-shelf-row"},s.map((h,x)=>e.default.createElement(Rt,{key:h.id,api:o,clip:t,film:h,index:x,active:h.id===M.id,onOpen:()=>d(h.id)})))):null)}function tn({clip:o,deleted:t,position:a,version:r,onSeek:s,selection:p}){let i=new Set(t),d=new Set(p),w=o.duration||1;return e.default.createElement("div",{className:"th-strip",role:"presentation"},e.default.createElement("div",{className:"th-strip-track"},o.transcript.map((c,g)=>e.default.createElement("button",{key:g,type:"button",tabIndex:-1,className:`th-strip-seg ${i.has(g)?"is-cut":""} ${d.has(g)?"is-picked":""}`,style:{left:`${c.start/w*100}%`,width:`${Math.max(.4,(c.end-c.start)/w*100)}%`},onClick:()=>s(g),title:`${V(c.start)} ${c.text}`})),r==="source"?e.default.createElement("span",{className:"th-strip-head",style:{left:`${Math.min(100,a/w*100)}%`}}):null),e.default.createElement("div",{className:"th-strip-scale hw-mono"},e.default.createElement("span",null,"00:00"),e.default.createElement("span",null,V(w/2)),e.default.createElement("span",null,V(w))))}function nn({clip:o,selection:t,setSelection:a,activeLine:r,onSeek:s,onCut:p,onRestore:i,onQuote:d,busy:w,onTranscribe:c,job:g,showTimes:M}){let h=(0,e.useRef)(null),x=(0,e.useRef)(null),b=new Set(o.deleted),y=new Set(t);(0,e.useEffect)(()=>{if(r<0)return;x.current?.querySelector(`[data-line="${r}"]`)?.scrollIntoView?.({block:"nearest",behavior:"smooth"})},[r]);function N(m,S){let A=S.shiftKey&&h.current!==null,v=S.metaKey||S.ctrlKey,C;if(A){let[I,$]=[Math.min(h.current,m),Math.max(h.current,m)];C=new Set(t);for(let f=I;f<=$;f+=1)C.add(f)}else v?(C=new Set(t),C.has(m)?C.delete(m):C.add(m),h.current=m):(C=new Set([m]),h.current=m);a([...C].sort((I,$)=>I-$)),s(m)}if(!o.transcript.length){let m=g?.status==="running"&&g.kind==="transcribe";return e.default.createElement("div",{className:"th-paper is-empty"},e.default.createElement("div",{className:"th-empty"},e.default.createElement("span",{className:"th-empty-mark","aria-hidden":"true"},e.default.createElement(k,{name:"wave",size:22})),e.default.createElement("h3",null,m?"正在识别文稿…":"先把原声变成文稿"),e.default.createElement("p",null,m?"本地 faster-whisper 在逐句识别，不上传任何内容。":"识别完成后，每一句都能点选、删除、恢复，或者引用给助手改。"),m?e.default.createElement("span",{className:"th-progress","aria-hidden":"true"}):e.default.createElement("button",{type:"button",className:"hw-cta",onClick:c,disabled:w},"识别文稿",e.default.createElement(k,{name:"arrow",size:15}))))}return e.default.createElement("div",{className:"th-paper"},e.default.createElement("ol",{className:"th-lines",ref:x,"aria-label":"文稿"},o.transcript.map((m,S)=>{let A=b.has(S),v=y.has(S);return e.default.createElement("li",{key:S,"data-line":S},e.default.createElement("button",{type:"button",className:`th-line ${A?"is-cut":""} ${v?"is-picked":""} ${S===r?"is-active":""}`,"aria-pressed":v,onClick:C=>N(S,C)},M?e.default.createElement("span",{className:"th-line-time hw-mono"},V(m.start)):null,e.default.createElement("span",{className:"th-line-text"},m.text),A?e.default.createElement("span",{className:"th-line-tag"},"已删"):null))})),e.default.createElement("div",{className:`th-selbar ${t.length?"is-on":""}`,"aria-hidden":!t.length},e.default.createElement("span",{className:"th-selbar-count"},e.default.createElement("b",null,t.length)," 句 · ",V(o.transcript[t[0]]?.start??0),"–",V(o.transcript[t.at(-1)]?.end??0)),e.default.createElement("button",{type:"button",className:"th-selbar-btn",onClick:d,tabIndex:t.length?0:-1},e.default.createElement(k,{name:"quote",size:13}),"引用给助手",e.default.createElement("kbd",null,"Q")),t.some(m=>!b.has(m))?e.default.createElement("button",{type:"button",className:"th-selbar-btn is-danger",onClick:p,disabled:w,tabIndex:t.length?0:-1},e.default.createElement(k,{name:"scissors",size:13}),"删掉",e.default.createElement("kbd",null,"⌫")):null,t.some(m=>b.has(m))?e.default.createElement("button",{type:"button",className:"th-selbar-btn",onClick:i,disabled:w,tabIndex:t.length?0:-1},e.default.createElement(k,{name:"undo",size:13}),"恢复"):null,e.default.createElement("button",{type:"button",className:"hw-icon-btn is-tiny",onClick:()=>a([]),"aria-label":"取消选择",tabIndex:t.length?0:-1},e.default.createElement(k,{name:"x",size:11}))))}function on({api:o,style:t}){let[a,r]=(0,e.useState)(dt.get(t.id)??""),s=(0,e.useRef)(null);return(0,e.useEffect)(()=>{if(a)return;let p=s.current,i=!0,d=new IntersectionObserver(w=>{w.some(c=>c.isIntersecting)&&(d.disconnect(),o.clip("style_preview",{styleId:t.id}).then(c=>{dt.set(t.id,c.source),i&&r(c.source)}).catch(()=>{}))},{rootMargin:"120px"});return p&&d.observe(p),()=>{i=!1,d.disconnect()}},[o,t.id,a]),e.default.createElement("span",{className:"th-style-cover",ref:s},a?e.default.createElement("img",{src:a,alt:"",loading:"lazy"}):e.default.createElement("i",{"aria-hidden":"true"}))}function rn({api:o,clip:t,onClose:a,onSaved:r}){let[s,p]=(0,e.useState)(null),[i,d]=(0,e.useState)(""),w=t.visualPreferences??{},[c,g]=(0,e.useState)(w.style?.id??null),[M,h]=(0,e.useState)(w.branch?.id??""),[x,b]=(0,e.useState)(w.orchestration?.id??""),[y,N]=(0,e.useState)(!1),[m,S]=(0,e.useState)(""),A=(0,e.useRef)(null);R(A,!0,()=>{y||a()}),(0,e.useEffect)(()=>{o.clip("styles").then(p).catch(f=>S(K(f)))},[o]);let v=(0,e.useMemo)(()=>{let f=i.trim().toLowerCase();return(s?.styles??[]).filter(P=>!f||`${P.name} ${P.familyName} ${P.definition}`.toLowerCase().includes(f))},[s,i]),C=(s?.branches??[]).filter(f=>f.familyId===c),I=s?.styles?.find(f=>f.id===c);async function $(){N(!0),S("");try{let f=await o.clip("art_style",{projectId:t.id,revision:t.revision,operationId:ut("style"),styleId:c,branchId:M||null,orchestrationId:x||null});r(f.project)}catch(f){S(K(f)),N(!1)}}return e.default.createElement("div",{className:"hw-modal-scrim"},e.default.createElement("div",{className:"hw-modal th-style-modal",ref:A,role:"dialog","aria-modal":"true","aria-labelledby":"th-style-title"},e.default.createElement("div",{className:"hw-modal-head"},e.default.createElement("p",{className:"hw-next-kicker"},e.default.createElement("span",{className:"hw-next-rec","aria-hidden":"true"}),"母画风"),e.default.createElement("button",{type:"button",className:"hw-icon-btn",onClick:a,"aria-label":"关闭（Esc）"},e.default.createElement(k,{name:"x",size:15}))),e.default.createElement("div",{className:"th-style-top"},e.default.createElement("h2",{id:"th-style-title"},"这条口播长什么样？"),e.default.createElement("label",{className:"hw-search th-style-search"},e.default.createElement(k,{name:"search",size:13}),e.default.createElement("input",{value:i,onChange:f=>d(f.target.value),placeholder:"搜画风，比如 水墨、几何","aria-label":"搜索画风"}))),e.default.createElement("div",{className:"th-style-grid",role:"radiogroup","aria-label":"母画风"},e.default.createElement("button",{type:"button",role:"radio","aria-checked":c===null,className:`th-style-card is-auto ${c===null?"is-on":""}`,onClick:()=>{g(null),h("")}},e.default.createElement("span",{className:"th-style-cover"},e.default.createElement("span",{className:"th-style-auto"},e.default.createElement(k,{name:"spark",size:20}))),e.default.createElement("b",null,"自动推荐"),e.default.createElement("span",null,"按这条口播的内容挑")),s?v.map((f,P)=>e.default.createElement("button",{key:f.id,type:"button",role:"radio","aria-checked":c===f.id,className:`th-style-card ${c===f.id?"is-on":""}`,style:{"--i":P},onClick:()=>{g(f.id),h("")}},e.default.createElement(on,{api:o,style:f}),e.default.createElement("b",null,f.name),e.default.createElement("span",null,f.visualMechanism))):Array.from({length:8},(f,P)=>e.default.createElement("span",{key:P,className:"th-style-card is-ghost","aria-hidden":"true"}))),e.default.createElement("div",{className:"th-style-foot"},e.default.createElement("div",{className:"th-style-detail"},I?e.default.createElement(e.default.Fragment,null,e.default.createElement("b",null,I.name),e.default.createElement("p",null,I.definition)):e.default.createElement("p",null,"自动推荐会在制作前按文稿内容挑一套母画风。")),e.default.createElement("div",{className:"th-style-pickers"},C.length?e.default.createElement("label",{className:"hw-field"},e.default.createElement("span",null,"分支"),e.default.createElement("select",{value:M,onChange:f=>h(f.target.value)},e.default.createElement("option",{value:""},"不指定"),C.map(f=>e.default.createElement("option",{key:f.id,value:f.id},f.name)))):null,e.default.createElement("label",{className:"hw-field"},e.default.createElement("span",null,"编排"),e.default.createElement("select",{value:x,onChange:f=>b(f.target.value)},e.default.createElement("option",{value:""},"跟随内容"),(s?.orchestrations??[]).map(f=>e.default.createElement("option",{key:f.id,value:f.id},f.name))))),m?e.default.createElement("p",{className:"hw-modal-error",role:"alert"},m):null,e.default.createElement("button",{type:"button",className:"hw-cta",onClick:$,disabled:y||!s},y?e.default.createElement("span",{className:"hw-spinner is-light","aria-hidden":"true"}):null,"用这套",y?null:e.default.createElement(k,{name:"arrow",size:15})))))}var an=[{id:"scene",label:"场景"},{id:"object",label:"物件"},{id:"background",label:"背景"},{id:"texture",label:"纹理"},{id:"comparison",label:"对比"},{id:"detail",label:"细节"}];function sn({api:o,clip:t,asset:a}){let[r,s]=(0,e.useState)("");return(0,e.useEffect)(()=>{if(a.status!=="ready")return;let p=!0;return o.clip("image_preview",{projectId:t.id,assetId:a.id}).then(i=>{p&&s(i.source)}).catch(()=>{}),()=>{p=!1}},[o,t.id,a.id,a.status]),r?e.default.createElement("img",{src:r,alt:""}):e.default.createElement("i",{"aria-hidden":"true",className:`th-asset-ph is-${a.status}`})}function ln({api:o,clip:t,onClose:a,onAsk:r}){let[s,p]=(0,e.useState)(null),[i,d]=(0,e.useState)(null),[w,c]=(0,e.useState)(""),g=(0,e.useRef)(null);R(g,!0,()=>a());let M=(0,e.useCallback)(()=>{o.clip("images_list",{projectId:t.id}).then(p).catch(b=>c(K(b))),o.clip("image_settings").then(b=>d(b.settings)).catch(b=>c(K(b)))},[o,t.id]);(0,e.useEffect)(()=>{M()},[M]),(0,e.useEffect)(()=>{let b=()=>o.clip("image_settings").then(m=>d(m.settings)).catch(()=>{}),y=!1,N=new MutationObserver(()=>{let m=!!document.querySelector("[data-media-providers-icon]");y&&!m&&b(),y=m});return N.observe(document.body,{childList:!0}),()=>N.disconnect()},[o]);function h(){st({kind:"image",provider:"seedream"})||c("没有找到「接口与密钥」插件；请先在插件管理里启用它。")}let x=s?.assets??[];return e.default.createElement("div",{className:"hw-modal-scrim"},e.default.createElement("div",{className:"hw-modal th-assets-modal",ref:g,role:"dialog","aria-modal":"true","aria-labelledby":"th-assets-title"},e.default.createElement("div",{className:"hw-modal-head"},e.default.createElement("p",{className:"hw-next-kicker"},e.default.createElement("span",{className:"hw-next-rec","aria-hidden":"true"}),"本片素材"),e.default.createElement("button",{type:"button",className:"hw-icon-btn",onClick:a,"aria-label":"关闭（Esc）"},e.default.createElement(k,{name:"x",size:15}))),e.default.createElement("h2",{id:"th-assets-title"},"画面素材与生图"),e.default.createElement("div",{className:"th-assets-bar"},e.default.createElement("p",{className:"th-assets-count"},e.default.createElement("b",null,s?x.length:"–")," 张素材",x.some(b=>b.active)?e.default.createElement("span",null," · 在用 ",x.filter(b=>b.active).length):null),e.default.createElement("button",{type:"button",className:"th-assets-model",onClick:h,title:"生图模型与密钥（设置 → 接口与密钥）"},e.default.createElement("span",{className:`hw-status-dot ${i?.configured?"is-ok":"is-warn"}`,"aria-hidden":"true"}),i?i.configured?i.product||"Seedream":"连接生图模型":"生图模型",e.default.createElement(k,{name:"arrow",size:12}))),x.length?e.default.createElement("ul",{className:"th-asset-grid"},x.map(b=>e.default.createElement("li",{key:b.id,className:`th-asset ${b.active?"is-active":""}`},e.default.createElement("span",{className:"th-asset-img"},e.default.createElement(sn,{api:o,clip:t,asset:b})),e.default.createElement("b",null,b.title),e.default.createElement("span",null,an.find(y=>y.id===b.purpose)?.label??b.purpose," · ",b.ratio," · ",b.status==="ready"?b.active?"在用":"备选":b.status==="failed"?"失败":"生成中"),e.default.createElement("button",{type:"button",className:"hw-text-btn",onClick:()=>{r(`重做素材「${b.title}」（${b.id}）：`),a()}},"让助手重做")))):e.default.createElement("div",{className:"hw-empty th-assets-empty"},e.default.createElement("span",{className:"th-empty-mark","aria-hidden":"true"},e.default.createElement(k,{name:"image",size:20})),e.default.createElement("div",null,e.default.createElement("h3",null,"还没有生成素材"),e.default.createElement("p",null,"制作整片时助手会按文稿设计需要的画面再生图；也可以直接告诉它要什么。"),i&&!i.configured?e.default.createElement("button",{type:"button",className:"hw-text-btn",onClick:h},"先连接生图模型",e.default.createElement(k,{name:"arrow",size:13})):null,e.default.createElement("button",{type:"button",className:"hw-text-btn is-strong",onClick:()=>{r("按这条口播的内容，设计 3 张最需要的画面素材，先列出来给我确认，再生成。"),a()}},"让助手设计素材",e.default.createElement(k,{name:"arrow",size:13})))),w?e.default.createElement("p",{className:"hw-modal-error",role:"alert"},w):null))}function pn({api:o,onClose:t,onImported:a}){let[r,s]=(0,e.useState)(null),[p,i]=(0,e.useState)(""),[d,w]=(0,e.useState)(!1),[c,g]=(0,e.useState)(-1),[M,h]=(0,e.useState)(""),[x,b]=(0,e.useState)(!1),y=(0,e.useRef)(null),N=(0,e.useRef)(null),m=c>=0;R(N,!0,()=>{m||t()});function S(v){if(v){if(!/^video\//.test(v.type)&&!/\.(mp4|mov|m4v|webm|mkv)$/i.test(v.name)){h("请选一个视频文件");return}s(v),h(""),p||i(v.name.replace(/\.[^.]+$/,""))}}async function A(){if(!r||!d||m)return;h(""),g(0);let v=new AbortController;y.current=v;let C="";try{let I=await o.clip("upload_begin",{size:r.size});C=I.uploadId;for(let f=0;f<r.size;){v.signal.throwIfAborted();let P=new Uint8Array(await r.slice(f,f+I.chunkSize).arrayBuffer()),O="";for(let J=0;J<P.length;J+=32768)O+=String.fromCharCode(...P.subarray(J,J+32768));f=(await o.clip("upload_chunk",{uploadId:C,offset:f,data:btoa(O)})).next,g(f/r.size)}g(1);let $=await o.clip("upload_finish",{uploadId:C,filename:r.name,name:p.trim()||r.name,owned:!0});a($.project)}catch(I){C&&o.clip("upload_cancel",{uploadId:C}).catch(()=>{}),v.signal.aborted||h(K(I)),g(-1)}}return e.default.createElement("div",{className:"hw-modal-scrim"},e.default.createElement("div",{className:"hw-modal th-import-modal",ref:N,role:"dialog","aria-modal":"true","aria-labelledby":"th-import-title"},e.default.createElement("div",{className:"hw-modal-head"},e.default.createElement("p",{className:"hw-next-kicker"},e.default.createElement("span",{className:"hw-next-rec","aria-hidden":"true"}),"导入口播"),e.default.createElement("button",{type:"button",className:"hw-icon-btn",onClick:()=>{y.current?.abort(),t()},"aria-label":"关闭（Esc）"},e.default.createElement(k,{name:"x",size:15}))),e.default.createElement("h2",{id:"th-import-title"},"放一条你自己的口播进来"),e.default.createElement("label",{className:`th-drop ${x?"is-drag":""} ${r?"has-file":""}`,onDragOver:v=>{v.preventDefault(),b(!0)},onDragLeave:()=>b(!1),onDrop:v=>{v.preventDefault(),b(!1),S(v.dataTransfer.files?.[0])}},e.default.createElement("input",{type:"file",accept:"video/*,.mp4,.mov,.m4v,.webm,.mkv",onChange:v=>S(v.target.files?.[0]),disabled:m}),e.default.createElement("span",{className:"th-drop-icon","aria-hidden":"true"},e.default.createElement(k,{name:r?"film":"upload",size:22})),r?e.default.createElement(e.default.Fragment,null,e.default.createElement("b",null,r.name),e.default.createElement("span",{className:"hw-mono"},(r.size/1024/1024).toFixed(1)," MB · 点这里换一个")):e.default.createElement(e.default.Fragment,null,e.default.createElement("b",null,"拖进来，或点这里选文件"),e.default.createElement("span",null,"MP4 / MOV，最长 60 分钟，不超过 2 GB")),m?e.default.createElement("span",{className:"th-drop-bar",style:{"--p":c},"aria-hidden":"true"}):null),e.default.createElement("label",{className:"hw-input-block"},e.default.createElement("span",null,"名字"),e.default.createElement("input",{value:p,onChange:v=>i(v.target.value),placeholder:"比如 普通人的三个财经底线",maxLength:160,disabled:m})),e.default.createElement("label",{className:"th-check"},e.default.createElement("input",{type:"checkbox",checked:d,onChange:v=>w(v.target.checked),disabled:m}),e.default.createElement("span",{className:"th-check-box","aria-hidden":"true"},e.default.createElement(k,{name:"check",size:10,stroke:2.4})),e.default.createElement("span",null,"这是我自己拍的口播，有权剪辑和再创作。")),M?e.default.createElement("p",{className:"hw-modal-error",role:"alert"},M):null,e.default.createElement("div",{className:"hw-modal-foot"},e.default.createElement("span",null,m?`正在传入 ${Math.round(c*100)}%`:"视频复制到本机工作台目录，原文件不动。"),e.default.createElement("button",{type:"button",className:"hw-cta",onClick:A,disabled:!r||!d||m},m?e.default.createElement("span",{className:"hw-spinner is-light","aria-hidden":"true"}):null,m?"导入中":"导入",m?null:e.default.createElement(k,{name:"arrow",size:15})))))}function hn({env:o}){return e.default.createElement("div",{className:"hw-pop hw-pop-env",role:"dialog","aria-label":"口播环境"},e.default.createElement("p",{className:"hw-pop-title"},"口播环境"),[{key:"ffmpeg",label:"剪辑 ffmpeg",fix:"brew install ffmpeg"},{key:"python",label:"Python · faster-whisper",fix:"pip3 install -r requirements-macos.txt"},{key:"asr",label:"识别模型",fix:`python3 -c "from faster_whisper import WhisperModel; WhisperModel('small')"`}].map(a=>{let r=o?.[a.key];return e.default.createElement("div",{className:"hw-env-row",key:a.key},e.default.createElement("span",{className:`hw-env-mark ${r?.ok?"is-ok":"is-warn"}`,"aria-hidden":"true"}),e.default.createElement("span",{className:"hw-env-label"},a.label),e.default.createElement("b",null,o?r?.ok?"就绪":"缺少":"检查中"),o&&!r?.ok?e.default.createElement("code",{className:"th-env-fix"},a.fix):null)}),e.default.createElement("p",{className:"hw-pop-foot-note"},"识别、剪辑都在本机完成；只有生图会调用你配置的服务。"))}function dn({clips:o,selected:t,onSelect:a,onImport:r}){let[s,p]=(0,e.useState)(!1),i=(0,e.useRef)(null);R(i,s,()=>p(!1));let d=Math.max(0,o.findIndex(c=>c.id===t)),w=o[d];return e.default.createElement("div",{className:"hw-switch",ref:i},e.default.createElement("span",{className:"hw-switch-slash","aria-hidden":"true"},"/"),e.default.createElement("button",{type:"button",className:`hw-switch-btn ${s?"is-open":""}`,"aria-haspopup":"listbox","aria-expanded":s,onClick:()=>p(c=>!c)},e.default.createElement("span",{className:`hw-dot ${w?.versions?"is-review":w?.lines?"is-render":"is-write"}`,"aria-hidden":"true"}),e.default.createElement("span",{className:"hw-switch-name"},w?.name??"选择口播"),e.default.createElement("span",{className:"hw-switch-count"},B(d+1),"/",B(o.length)),e.default.createElement(k,{name:"chevronDown",size:12})),s?e.default.createElement("div",{className:"hw-pop hw-switch-pop",role:"dialog","aria-label":"切换口播"},e.default.createElement("p",{className:"hw-pop-title"},"口播 · ",B(o.length)),e.default.createElement("ul",{className:"hw-switch-list",role:"listbox","aria-label":"口播"},o.map((c,g)=>e.default.createElement("li",{key:c.id},e.default.createElement("button",{type:"button",role:"option","aria-selected":c.id===t,className:`hw-switch-item ${c.id===t?"is-on":""}`,onClick:()=>{a(c.id),p(!1)}},e.default.createElement("span",{className:"hw-switch-index"},B(g+1)),e.default.createElement("span",{className:"hw-switch-main"},e.default.createElement("b",null,c.name),e.default.createElement("span",null,V(c.duration)," · ",c.lines?`${c.lines} 句`:"未识别"," · ",c.versions," 个版本")),c.style?e.default.createElement("span",{className:"hw-tag is-render"},c.style.name):null)))),e.default.createElement("button",{type:"button",className:"hw-switch-new",onClick:()=>{p(!1),r()}},e.default.createElement("span",{className:"hw-switch-new-icon"},e.default.createElement(k,{name:"plus",size:13,stroke:2})),"导入口播",e.default.createElement("kbd",null,"I"))):null)}function cn({env:o,onImport:t}){let a=[{n:"01",t:"导入原片",d:"你自己拍的口播，复制进本机工作台。"},{n:"02",t:"识别成文稿",d:"本地 faster-whisper 逐句识别，可点选、删改。"},{n:"03",t:"剪掉废话",d:"删句、恢复，一键出剪辑版本，原声不动。"},{n:"04",t:"做成整片",d:"选一套母画风，助手按文稿设计画面并渲染。"}];return e.default.createElement("div",{className:"th-landing"},e.default.createElement("div",{className:"th-landing-copy"},e.default.createElement("p",{className:"hw-next-kicker"},e.default.createElement("span",{className:"hw-next-rec","aria-hidden":"true"}),"网感口播"),e.default.createElement("h2",null,"用文稿剪口播，",e.default.createElement("br",null),"用一句话做整片。"),e.default.createElement("p",{className:"th-landing-lead"},"原声和真人画面全程保留。删句就是剪辑；想要画面、字幕和节奏，对助手说一句。"),e.default.createElement("button",{type:"button",className:"hw-cta",onClick:t},"导入第一条口播",e.default.createElement(k,{name:"arrow",size:15})),o&&(!o.ffmpeg?.ok||!o.python?.ok)?e.default.createElement("p",{className:"th-landing-warn"},e.default.createElement("span",{className:"hw-status-dot is-warn","aria-hidden":"true"}),"本机还缺 ",[!o.ffmpeg?.ok&&"ffmpeg",!o.python?.ok&&"Python / faster-whisper"].filter(Boolean).join("、"),"，右上角「环境」里有安装命令。"):null),e.default.createElement("ol",{className:"th-landing-steps"},a.map((r,s)=>e.default.createElement("li",{key:r.n,style:{"--i":s}},e.default.createElement("span",{className:"hw-mono"},r.n),e.default.createElement("b",null,r.t),e.default.createElement("p",null,r.d)))))}function xt({api:o,header:t}){let[a,r]=(0,e.useState)(null),[s,p]=(0,e.useState)(()=>{try{return globalThis.localStorage?.getItem(ht)??""}catch{return""}}),[i,d]=(0,e.useState)(null),[w,c]=(0,e.useState)(null),[g,M]=(0,e.useState)("source"),[h,x]=(0,e.useState)([]),[b,y]=(0,e.useState)(0),[N,m]=(0,e.useState)(!1),[S,A]=(0,e.useState)(!1),[v,C]=(0,e.useState)(null),[I,$]=(0,e.useState)(""),[f,P]=(0,e.useState)(null),[O,re]=(0,e.useState)(!1),[J,X]=(0,e.useState)(null),[te,z]=(0,e.useState)(null),[D,Z]=(0,e.useState)(!0),[ne,he]=(0,e.useState)("edit"),[oe,ie]=(0,e.useState)(""),[de,W]=(0,e.useState)(""),ee=(0,e.useRef)(null),xe=(0,e.useRef)(null);R(xe,O,()=>re(!1));let se=(0,e.useRef)(0),ae=(0,e.useCallback)(async()=>{try{let T=await o.clip("list");return r(T.projects),W(""),p(j=>T.projects.some(u=>u.id===j)?j:T.projects[0]?.id??""),T.projects}catch(T){return W(K(T)),r([]),[]}},[o]),G=(0,e.useCallback)(async T=>{if(!T){d(null);return}try{let j=await o.clip("status",{projectId:T});return d(u=>u&&u.id===T&&u.revision===j.project.revision?u:j.project),c(j.job),j}catch(j){C({kind:"error",text:K(j)})}},[o]);(0,e.useEffect)(()=>{ae()},[ae]),(0,e.useEffect)(()=>{o.clip("environment").then(P).catch(()=>P({}))},[o]),(0,e.useEffect)(()=>{if(s){try{globalThis.localStorage?.setItem(ht,s)}catch{}d(null),he("edit"),ie(""),x([]),z(null),y(0),G(s).then(T=>{let j=T?.project;se.current=j?.versions.length??0,M(j?.versions.at(-1)?.id??"source")})}},[s,G]),(0,e.useEffect)(()=>{if(!s)return;let T=w?.status==="running",j=setInterval(()=>{G(s)},T?1500:5e3);return()=>clearInterval(j)},[s,w?.status,G]),(0,e.useEffect)(()=>{i&&(i.versions.length>se.current&&(M(i.versions.at(-1).id),C({kind:"success",text:`「${i.versions.at(-1).label}」好了，去「成片」里看。`}),ie(i.versions.at(-1).id)),se.current=i.versions.length)},[i?.versions.length]),(0,e.useEffect)(()=>{x([])},[i?.revision]);let Ce=(0,e.useMemo)(()=>!i||g!=="source"?-1:i.transcript.findIndex(T=>b>=T.start&&b<T.end),[i,b,g]),be=(0,e.useCallback)(T=>{if(!i)return;let j=i.transcript[T]?.start??0;M("source"),y(j),requestAnimationFrame(()=>{let u=ee.current;u&&(u.pause(),u.currentTime=j)})},[i]);async function fe(T,j,u){if(i){A(!0);try{let E=await o.clip(T,{projectId:i.id,revision:i.revision,operationId:ut(T),...j});E.project&&d(E.project),E.job&&c(E.job),u&&C({kind:"success",text:u}),ae()}catch(E){C({kind:"error",text:K(E)}),G(i.id)}finally{A(!1)}}}let L=()=>fe("edit",{action:"cut",indices:h},`删掉了 ${h.length} 句，出剪辑版本前随时可以恢复。`),H=()=>fe("edit",{action:"restore",indices:h},"恢复了。"),U=()=>fe("transcribe",{},"开始识别文稿，几十秒到几分钟。"),ce=()=>fe("render",{},"开始出剪辑版本。"),le=()=>w&&o.clip("cancel",{projectId:i.id,jobId:w.id}).then(T=>c(T.job)).catch(()=>{}),Q=(0,e.useCallback)(()=>{if(!i||!h.length)return;let T=h.map(u=>i.transcript[u]),j=`${V(T[0].start,!0)}–${V(T.at(-1).end,!0)}`;z({label:`${h.length} 句原文 · ${j}`,context:`【引用原句】${j}
${h.map(u=>`[${u}] ${V(i.transcript[u].start,!0)} ${i.transcript[u].text}`).join(`
`)}`}),X({for:i.id,text:""})},[i,h]);(0,e.useEffect)(()=>{function T(j){let u=j.target;if(!(u&&(u.tagName==="INPUT"||u.tagName==="TEXTAREA"||u.tagName==="SELECT"||u.isContentEditable))&&!I){if(j.key==="i"||j.key==="I"){!j.metaKey&&!j.ctrlKey&&(j.preventDefault(),$("import"));return}if(i){if(j.key==="Escape"&&h.length){x([]);return}if(j.key===" "&&!j.metaKey){j.preventDefault();let E=ee.current;E&&(E.paused?E.play().catch(()=>{}):E.pause());return}h.length&&((j.key==="Backspace"||j.key==="Delete")&&!S&&(j.preventDefault(),j.shiftKey?H():L()),(j.key==="q"||j.key==="Q")&&(j.preventDefault(),Q()))}}}return globalThis.document?.addEventListener("keydown",T),()=>globalThis.document?.removeEventListener("keydown",T)});let we=(0,e.useMemo)(()=>i?o.chatFor({clip:i.id}):null,[o,i?.id]),Se=(0,e.useCallback)(()=>X(null),[]),Fe=(0,e.useCallback)(()=>{s&&G(s)},[s,G]),ze=(0,e.useCallback)(T=>X({text:T}),[]),pe=w?.status==="running",ge=i?.deleted.length??0,Me=i?i.deleted.reduce((T,j)=>T+(i.transcript[j]?i.transcript[j].end-i.transcript[j].start:0),0):0,je=i?.versions.filter(T=>T.label?.startsWith("剪辑版本")).at(-1)?.revision??-1,Oe=i&&ge>0&&i.revision>je+1,ue=i?.visualPreferences?.style,Ae=f&&(!f.ffmpeg?.ok||!f.python?.ok||!f.asr?.ok),Ke=e.default.createElement("div",{className:"hw-top-right",ref:xe},i?e.default.createElement("div",{className:"th-views",role:"tablist","aria-label":"视图"},e.default.createElement("button",{type:"button",role:"tab","aria-selected":ne==="edit",className:`th-view ${ne==="edit"?"is-on":""}`,onClick:()=>he("edit")},e.default.createElement(k,{name:"scissors",size:13}),e.default.createElement("span",{className:"hw-pill-label"},"剪辑")),e.default.createElement("button",{type:"button",role:"tab","aria-selected":ne==="films",className:`th-view ${ne==="films"?"is-on":""}`,onClick:()=>he("films")},e.default.createElement(k,{name:"film",size:13}),e.default.createElement("span",{className:"hw-pill-label"},"成片"),i.versions.length?e.default.createElement("span",{className:"th-view-count hw-mono"},i.versions.length):null,oe&&ne!=="films"?e.default.createElement("span",{className:"th-view-new","aria-label":"有新成片"}):null)):null,i?e.default.createElement(e.default.Fragment,null,e.default.createElement("button",{type:"button",className:"hw-pill-btn",onClick:()=>$("style")},e.default.createElement(k,{name:"palette",size:14}),e.default.createElement("span",{className:"hw-pill-label"},ue?ue.name:"画风：自动")),e.default.createElement("button",{type:"button",className:"hw-pill-btn",onClick:()=>$("assets")},e.default.createElement(k,{name:"image",size:14}),e.default.createElement("span",{className:"hw-pill-label"},"素材"))):null,e.default.createElement("button",{type:"button",className:`hw-pill-btn ${O?"is-open":""}`,"aria-expanded":O,onClick:()=>re(T=>!T)},e.default.createElement("span",{className:`hw-status-dot ${f?Ae?"is-warn":"is-ok":""}`,"aria-hidden":"true"}),e.default.createElement("span",{className:"hw-pill-label"},f?Ae?"环境待补":"环境":"检查环境")),O?e.default.createElement("div",{className:"hw-pop-anchor"},e.default.createElement(hn,{env:f})):null);return e.default.createElement("div",{className:"hw-studio th-studio"},e.default.createElement("header",{className:"hw-top"},t,a?.length?e.default.createElement(dn,{clips:a,selected:s,onSelect:p,onImport:()=>$("import")}):null,Ke),e.default.createElement("div",{className:"hw-toasts th-toasts"},v?e.default.createElement(Ee,{text:v.text,kind:v.kind,onClose:()=>C(null)}):null),a===null?e.default.createElement("div",{className:"hw-skeleton","aria-hidden":"true"},e.default.createElement("i",{style:{width:160,height:10}}),e.default.createElement("i",{style:{width:"40%",height:34,marginTop:14}})):a.length?i?e.default.createElement("div",{className:`th-shell ${ne==="films"?"is-films":""}`},ne==="films"?e.default.createElement("main",{className:"th-films-main"},e.default.createElement(en,{api:o,clip:i,onAsk:ze,initial:oe})):e.default.createElement(e.default.Fragment,null,e.default.createElement("div",{className:"th-left"},e.default.createElement(Gt,{api:o,clip:i,version:g,onVersion:T=>{M(T),y(0),m(!1)},videoRef:ee,position:b,onTime:y,playing:N,onPlaying:m}),i.transcript.length?e.default.createElement(tn,{clip:i,deleted:i.deleted,position:b,version:g,onSeek:be,selection:h}):null),e.default.createElement("main",{className:"th-center"},e.default.createElement("div",{className:"th-head"},e.default.createElement("div",{className:"th-head-main"},e.default.createElement("p",{className:"th-head-meta hw-mono"},V(i.duration)," · ",i.width,"×",i.height," · ",i.transcript.length?`${i.transcript.length} 句`:"未识别",ge?e.default.createElement("em",null," · 已删 ",ge," 句 / ",Me.toFixed(1),"s"):null),e.default.createElement("h1",null,i.name)),e.default.createElement("div",{className:"th-head-actions"},i.transcript.length?e.default.createElement("button",{type:"button",className:`hw-icon-btn ${D?"is-on":""}`,onClick:()=>Z(T=>!T),title:D?"隐藏时间码":"显示时间码","aria-label":"时间码"},e.default.createElement(k,{name:"clock",size:15})):null,i.transcript.length?e.default.createElement("button",{type:"button",className:`hw-cta is-small ${Oe?"":"is-quiet"}`,onClick:ce,disabled:S||pe||!ge,title:ge?"按删改结果出一个剪辑版本":"先删掉一些句子"},e.default.createElement(k,{name:"scissors",size:13}),"出剪辑版本"):null)),pe?e.default.createElement("div",{className:"th-job",role:"status"},e.default.createElement("span",{className:"th-job-bar","aria-hidden":"true"}),e.default.createElement("span",null,{transcribe:"正在识别文稿",render:"正在出剪辑版本",studio:"正在制作整片",generate_images:"正在生成素材"}[w.kind]??"任务进行中"),e.default.createElement("span",{className:"hw-mono th-job-log"},(w.log??"").trim().split(`
`).at(-1)?.slice(0,80)),e.default.createElement("button",{type:"button",className:"hw-text-btn",onClick:le},"取消")):w?.status==="failed"&&Date.now()-Date.parse(w.finishedAt??0)<12e4?e.default.createElement("div",{className:"th-job is-bad",role:"alert"},e.default.createElement("span",null,w.kind==="transcribe"?"识别失败":"任务失败","：",ct(w.error,2)),e.default.createElement("button",{type:"button",className:"hw-text-btn is-strong",onClick:()=>ze(`刚才的任务失败了：${ct(w.error,6)}
帮我看看原因，能修就修。`)},"问助手")):null,e.default.createElement(nn,{clip:i,selection:h,setSelection:x,activeLine:Ce,onSeek:be,onCut:L,onRestore:H,onQuote:Q,busy:S||pe,onTranscribe:U,job:w,showTimes:D}))),we?e.default.createElement(Pe,{key:i.id,className:"th-assistant",target:{id:i.id,title:i.name,hint:i.name,kicker:ue?`画风 · ${ue.name}`:`只为「${i.name}」工作`,heading:i.transcript.length?"想怎么改，直接说。":"先识别文稿，再聊怎么剪。",body:"选中文稿里的句子按 Q 引用过来，说清楚要怎么改；它能删句、出版本、按画风做整片，花钱的生图会先问你。",prompts:i.transcript.length?["通读文稿，指出可以删掉的口误、重复和废话，先列给我确认",`按${ue?`「${ue.name}」`:"内容自选"}画风做一版完整视频，保留原声`,"给这条口播起 3 个标题，并说明各自的钩子"]:["帮我识别文稿，然后告诉我这条口播在讲什么"]},chat:we,pendingPrompt:J,onConsume:Se,onTurnDone:Fe,attachment:te,onClearAttachment:()=>z(null)}):null):e.default.createElement("div",{className:"hw-state"},de?e.default.createElement("p",null,de):e.default.createElement("span",{className:"hw-spinner","aria-hidden":"true"})):e.default.createElement(cn,{env:f,onImport:()=>$("import")}),I==="import"?e.default.createElement(pn,{api:o,onClose:()=>$(""),onImported:async T=>{$(""),await ae(),p(T.id),C({kind:"success",text:`「${T.name}」已导入。先识别文稿吧。`})}}):null,I==="style"&&i?e.default.createElement(rn,{api:o,clip:i,onClose:()=>$(""),onSaved:T=>{d(T),$(""),ae(),X({for:T.id,text:Wt(T.visualPreferences),replace:!0}),C({kind:"success",text:T.visualPreferences?.style?`画风换成「${T.visualPreferences.style.name}」，制作提示已填进对话框，看一眼就能发送。`:"画风改为自动推荐，制作提示已填进对话框。"})}}):null,I==="assets"&&i?e.default.createElement(ln,{api:o,clip:i,onClose:()=>$(""),onAsk:ze}):null)}var gt="dsh.hypit-workbench.roots.v1",Ie=[{key:"write",label:"脚本"},{key:"check",label:"检查"},{key:"render",label:"出片"},{key:"review",label:"成片"}];function bt(o={}){return o.source?o.run?o.result?"review":"render":"check":"write"}function vt(){return n.default.createElement(n.default.Fragment,null,n.default.createElement("img",{className:"hw-logo-on-light",src:nt,alt:"Hypit"}),n.default.createElement("img",{className:"hw-logo-on-dark",src:ot,alt:"Hypit"}))}function wn(){try{let o=globalThis.localStorage?.getItem(gt),t=o?JSON.parse(o):null;if(Array.isArray(t)&&t.length)return t}catch{}return["~/Hypit"]}function un(o){try{globalThis.localStorage?.setItem(gt,JSON.stringify(o))}catch{}}function kt(o){return Math.max(0,Ie.findIndex(t=>t.key===o))}function mn(o){let t=o?.counts??{};return t.source?t.run?t.result?{key:"review",title:"这一版已经出片",body:"去成片里看结果，不满意就在这里说清楚要改哪一段、改成什么。",cta:"看成片",tab:"results",alt:{label:"让助手点评",prompt:"看看这一版成片，告诉我哪里还需要改，按优先级列出来。"}}:{key:"render",title:"可以出片了",body:"按现有 Run 出一版。先问清楚大概花多少、要多久，再决定。",cta:"出一版看看",alt:{label:"先检查一遍",prompt:"先 check 这个项目的 Source，把报错逐条解释清楚，并直接修掉能修的。"},prompt:"按现有 Run 出第一版，先告诉我大概花多少、要多久，我确认后再跑。"}:{key:"check",title:"脚本有了，还没检查",body:"先跑一次 check，把问题一次问清楚，再决定要不要出片。",cta:"检查这份脚本",alt:{label:"补一条 Run",prompt:"给这个项目补一条最小可用的 .svrun，并说明每一行在做什么。"},prompt:"先 check 这个项目的 Source，把报错逐条解释清楚，并直接修掉能修的。"}:{key:"write",title:"这个项目还没有脚本",body:"先写一条最小可跑的 SVML，再去检查。助手知道这个项目的位置和结构。",cta:"帮我写第一版脚本",alt:{label:"先看看项目结构",prompt:"先读一遍这个项目的目录和 package.json，告诉我现在有什么、缺什么。"},prompt:"先看这个项目的 package.json 和已有文件，写一条最小可跑的 SVML Source，写进项目里。"}}function xn({data:o}){let t=o?.executor??{},a=o?.skill??{},r=o?.node??{},[s,p]=De(),i=[{label:"执行器",ok:t.found,value:t.version||(t.found?"已找到":"未安装"),fix:t.found?"":"npm i -g @hypit/hypit --registry=https://registry.npmjs.org"},{label:"Hypit 技能",ok:a.found,value:a.found?"已安装":"未找到",fix:a.found?"":"npx skills add hypit-ai/hypit -g --agent universal -y"},{label:"Node",ok:!!r.version,value:r.version?`v${r.version}`:"—"},{label:"对话工具",ok:(o?.tools??[]).length>0,value:`${(o?.tools??[]).length} 个`}];return n.default.createElement("div",{className:"hw-pop hw-pop-env",role:"dialog","aria-label":"本机环境"},n.default.createElement("p",{className:"hw-pop-title"},"本机环境"),i.map(d=>n.default.createElement("div",{className:"hw-env-row",key:d.label},n.default.createElement("span",{className:`hw-env-mark ${d.ok?"is-ok":"is-warn"}`,"aria-hidden":"true"}),n.default.createElement("span",{className:"hw-env-label"},d.label),n.default.createElement("b",null,d.value),d.fix?n.default.createElement("button",{type:"button",className:"hw-env-fix",onClick:()=>p(d.fix)},n.default.createElement("code",null,d.fix),n.default.createElement("span",null,s===d.fix?"已复制":"复制")):null)),n.default.createElement("div",{className:"hw-pop-rule"}),(o?.roots??[]).map(d=>n.default.createElement("div",{className:"hw-env-row is-root",key:d.path},n.default.createElement("span",{className:`hw-env-mark ${d.ok?"is-ok":"is-warn"}`,"aria-hidden":"true"}),n.default.createElement("span",{className:"hw-env-label",title:d.path},ve(d.path,22)),n.default.createElement("b",null,d.ok?`${(d.projects??[]).length} 个项目`:"不可读"))),n.default.createElement("p",{className:"hw-pop-foot-note"},"Hypit · 只读扫描"))}function bn({projects:o,selected:t,onSelect:a,onCreate:r}){let[s,p]=(0,n.useState)(!1),[i,d]=(0,n.useState)(""),w=(0,n.useRef)(null);R(w,s,()=>p(!1));let c=Math.max(0,o.findIndex(h=>h.id===t)),g=o[c],M=(0,n.useMemo)(()=>{let h=i.trim().toLowerCase();return o.map((x,b)=>({project:x,position:b})).filter(({project:x})=>!h||`${x.title} ${x.root}`.toLowerCase().includes(h))},[o,i]);return n.default.createElement("div",{className:"hw-switch",ref:w},n.default.createElement("span",{className:"hw-switch-slash","aria-hidden":"true"},"/"),n.default.createElement("button",{type:"button",className:`hw-switch-btn ${s?"is-open":""}`,"aria-haspopup":"listbox","aria-expanded":s,onClick:()=>p(h=>!h)},n.default.createElement("span",{className:`hw-dot is-${bt(g?.counts)}`,"aria-hidden":"true"}),n.default.createElement("span",{className:"hw-switch-name"},g?.title??"选择项目"),n.default.createElement("span",{className:"hw-switch-count"},B(c+1),"/",B(o.length)),n.default.createElement(k,{name:"chevronDown",size:12})),s?n.default.createElement("div",{className:"hw-pop hw-switch-pop",role:"dialog","aria-label":"切换项目"},o.length>5?n.default.createElement("label",{className:"hw-search"},n.default.createElement(k,{name:"search",size:13}),n.default.createElement("input",{autoFocus:!0,value:i,onChange:h=>d(h.target.value),placeholder:"搜索项目","aria-label":"搜索项目"})):n.default.createElement("p",{className:"hw-pop-title"},"项目 · ",B(o.length)),n.default.createElement("ul",{className:"hw-switch-list",role:"listbox","aria-label":"项目"},M.map(({project:h,position:x})=>{let b=h.id===t,y=bt(h.counts);return n.default.createElement("li",{key:h.id},n.default.createElement("button",{type:"button",role:"option","aria-selected":b,className:`hw-switch-item ${b?"is-on":""}`,onClick:()=>{a(h.id),p(!1),d("")}},n.default.createElement("span",{className:"hw-switch-index"},B(x+1)),n.default.createElement("span",{className:"hw-switch-main"},n.default.createElement("b",null,h.title),n.default.createElement("span",null,ve(h.root,34))),n.default.createElement("span",{className:`hw-tag is-${y}`},Ie.find(N=>N.key===y)?.label)))}),M.length?null:n.default.createElement("li",{className:"hw-switch-empty"},"没有匹配的项目")),n.default.createElement("button",{type:"button",className:"hw-switch-new",onClick:()=>{p(!1),d(""),r()}},n.default.createElement("span",{className:"hw-switch-new-icon"},n.default.createElement(k,{name:"plus",size:13,stroke:2})),"新建项目",n.default.createElement("kbd",null,"N"))):null)}function fn({header:o,data:t,loading:a,rootsText:r,setRootsText:s,onScan:p,projects:i,selected:d,onSelect:w,rootsOpen:c,setRootsOpen:g,onCreate:M}){let[h,x]=(0,n.useState)(!1),b=(0,n.useRef)(null);R(b,h||c,()=>{x(!1),g(!1)});let y=!!t&&((t.roots??[]).some(N=>!N.ok)||!t.executor?.found||!t.skill?.found);return n.default.createElement("header",{className:"hw-top"},o,i.length?n.default.createElement(bn,{projects:i,selected:d,onSelect:w,onCreate:M}):null,n.default.createElement("div",{className:"hw-top-right",ref:b},n.default.createElement("button",{type:"button",className:`hw-pill-btn ${h?"is-open":""}`,"aria-expanded":h,onClick:()=>{x(N=>!N),g(!1)}},n.default.createElement("span",{className:`hw-status-dot ${t?y?"is-warn":"is-ok":""}`,"aria-hidden":"true"}),t?y?"环境待补":"环境就绪":"检查环境"),n.default.createElement("button",{type:"button",className:`hw-pill-btn ${c?"is-open":""}`,"aria-expanded":c,onClick:()=>{g(!c),x(!1)}},n.default.createElement(k,{name:"folder",size:14}),"目录"),h?n.default.createElement("div",{className:"hw-pop-anchor"},n.default.createElement(xn,{data:t})):null,c?n.default.createElement("div",{className:"hw-pop-anchor"},n.default.createElement("div",{className:"hw-pop hw-pop-roots",role:"dialog","aria-label":"扫描目录"},n.default.createElement("p",{className:"hw-pop-title"},"Hypit 根目录"),n.default.createElement("textarea",{className:"hw-roots-input",value:r,onChange:N=>s(N.target.value),onKeyDown:N=>{N.key==="Enter"&&(N.metaKey||N.ctrlKey)&&(N.preventDefault(),p(),g(!1))},rows:3,spellCheck:!1,autoFocus:!0,"aria-label":"Hypit 根目录，每行一个"}),n.default.createElement("div",{className:"hw-pop-foot"},n.default.createElement("span",null,"每行一个 · 支持 ~ · ⌘↩ 扫描"),n.default.createElement("button",{className:"hw-cta is-small",type:"button",disabled:a,onClick:()=>{p(),g(!1)}},a?"扫描中…":"扫描")))):null))}function gn({stageKey:o,counts:t}){let a=kt(o),r=[t.source?`${t.source} 份 Source`:"还没写",a===1?"轮到这步":a>1?"随时可跑":"等脚本",t.run?`${t.run} 条 Run`:a>=2?"轮到这步":"—",t.result?`${t.result} 个文件`:a===3?"轮到这步":"—"];return n.default.createElement("section",{className:"hw-timeline",style:{"--hw-at":(a+.5)/Ie.length},"aria-label":"制作进度"},n.default.createElement("div",{className:"hw-track","aria-hidden":"true"},n.default.createElement("span",{className:"hw-track-fill"}),n.default.createElement("span",{className:"hw-playhead"},n.default.createElement("i",null))),n.default.createElement("ol",{className:"hw-steps"},Ie.map((s,p)=>{let i=p<a?"done":p===a?"now":"todo";return n.default.createElement("li",{key:s.key,className:`hw-step is-${i}`,"aria-current":i==="now"?"step":void 0},n.default.createElement("span",{className:"hw-step-head"},n.default.createElement("span",{className:"hw-step-index"},i==="done"?n.default.createElement(k,{name:"check",size:11,stroke:2}):B(p+1)),n.default.createElement("span",{className:"hw-step-label"},s.label)),n.default.createElement("span",{className:"hw-step-fact"},r[p]))})))}function vn({stage:o,onAsk:t,onTab:a}){let r=kt(o.key);return n.default.createElement("section",{className:"hw-next","aria-label":"下一步"},n.default.createElement("span",{className:"hw-next-numeral","aria-hidden":"true"},B(r+1)),n.default.createElement("p",{className:"hw-next-kicker"},n.default.createElement("span",{className:"hw-next-rec","aria-hidden":"true"}),"下一步 ",n.default.createElement("span",{className:"hw-mono"},B(r+1)," / ",B(Ie.length))),n.default.createElement("h2",null,o.title),n.default.createElement("p",{className:"hw-next-body"},o.body),n.default.createElement("div",{className:"hw-next-actions"},n.default.createElement("button",{className:"hw-cta",type:"button",onClick:()=>o.tab?a(o.tab):t(o.prompt)},o.cta,n.default.createElement(k,{name:"arrow",size:15})),o.alt?n.default.createElement("button",{className:"hw-text-btn",type:"button",onClick:()=>t(o.alt.prompt)},o.alt.label):null),n.default.createElement("p",{className:"hw-next-hint"},"按钮只把任务填进右侧助手，你看过再发送。"))}function kn({kind:o}){return n.default.createElement("svg",{className:"hw-empty-art",width:"88",height:"60",viewBox:"0 0 88 60",fill:"none","aria-hidden":"true"},n.default.createElement("rect",{x:"8.5",y:"8.5",width:"56",height:"40",rx:"5",stroke:"currentColor",strokeDasharray:"3 3"}),o==="results"?n.default.createElement("path",{d:"M32 21.5v14l11-7-11-7Z",fill:"currentColor",opacity:"0.55"}):o==="runs"?n.default.createElement("path",{d:"M19 21h22M19 28.5h32M19 36h14",stroke:"currentColor",strokeLinecap:"round",opacity:"0.55"}):n.default.createElement("path",{d:"M19 21h18M19 28.5h26M19 36h12",stroke:"currentColor",strokeLinecap:"round",opacity:"0.55"}),n.default.createElement("path",{d:"M70 18v24M76 24v12",stroke:"var(--hw-brand)",strokeLinecap:"round",opacity:"0.8"}))}function yn({api:o,detail:t,onAsk:a}){let[r,s]=(0,n.useState)(null),[p,i]=(0,n.useState)(""),[d,w]=(0,n.useState)(""),[c,g]=(0,n.useState)({}),M=(t.results??[]).filter(N=>/\.(mp4|mov|webm|m4v)$/iu.test(N.rel)),h=M.map(N=>N.rel+N.updatedAt).join("|");if((0,n.useEffect)(()=>{let N=!0;return o.call({op:"builds",path:t.id}).then(m=>{if(!N)return;let S=m.builds.map($=>({id:$.id,kind:"hypit",label:$.targets?.[0]??$.video.name??"成片",duration:$.duration,createdAt:$.finishedAt,run:$.run,source:$.source,chapters:$.chapters,verified:$.outcome==="complete",verifiedLabel:"构建完成",load:{op:"build-media",buildId:$.id},download:$.video.rel.split("/").pop()})),A=new Set(m.builds.map($=>$.video.bytes)),v=new Set,C=M.filter($=>!A.has($.bytes)).map($=>({id:"file:"+$.rel,kind:"cut",label:$.rel.split("/").pop(),duration:0,createdAt:$.updatedAt,chapters:[],load:{op:"result-media",rel:$.rel},bytes:$.bytes})).filter($=>!v.has($.label)&&v.add($.label)),I=[...S,...C];s(I),i($=>I.some(f=>f.id===$)?$:I[0]?.id??"")}).catch(m=>{N&&w(K(m))}),()=>{N=!1}},[o,t.id,h]),(0,n.useEffect)(()=>{if(!r?.length)return;let N=!0;for(let m of r){if(c[m.id])continue;let S=m.load.op==="build-media"?{buildId:m.load.buildId}:{rel:m.load.rel};o.call({op:"film-poster",path:t.id,...S}).then(A=>{N&&g(v=>({...v,[m.id]:A.source}))}).catch(()=>{})}return()=>{N=!1}},[o,t.id,r]),d)return n.default.createElement("p",{className:"hw-muted is-bad"},d);if(!r)return n.default.createElement("div",{className:"hy-films is-loading","aria-hidden":"true"},n.default.createElement("i",null));if(!r.length)return null;let x=r.find(N=>N.id===p)??r[0],b=c[x.id]??"",y={key:`${t.id}/${x.id}`,name:t.title,width:1080,height:1920,poster:b,kindLabel:x.kind==="hypit"?`Hypit 构建 · ${x.id.slice(4,12)}`:"导出文件",noChapters:"这个文件是直接导出的视频，没有构建记录里的分段。点进度条任意位置跳转。",loadChunk:N=>o.call({...x.load,path:t.id,offset:N})};return n.default.createElement("div",{className:"hy-films th-studio"},n.default.createElement(Ye,{key:x.id,source:y,film:x,onAsk:a}),r.length>1?n.default.createElement("div",{className:"th-shelf",role:"list","aria-label":"全部成片"},n.default.createElement("p",{className:"th-shelf-title"},"全部成片 ",n.default.createElement("span",{className:"hw-mono"},B(r.length))),n.default.createElement("div",{className:"th-shelf-row"},r.map((N,m)=>n.default.createElement(Ue,{key:N.id,film:N,poster:c[N.id]??"",index:m,active:N.id===x.id,onOpen:()=>i(N.id)})))):null)}function Nn({api:o,detail:t,tab:a,setTab:r,onOpenSource:s,onAsk:p}){let i=t.counts??{},d=[{id:"results",label:"成片",count:i.result||0,icon:"film"},{id:"runs",label:"运行",count:i.run||0,icon:"run"},{id:"sources",label:"源码",count:i.source||0,icon:"code"},{id:"docs",label:"笔记",count:i.doc||0,icon:"doc"}],w=d.find(h=>h.id===a)??d[0],c=a==="results"?t.results??[]:a==="runs"?t.runs??[]:a==="sources"?t.sources??[]:[],g={results:{title:"还没有成片",body:"检查通过后再出片。出片前助手会先报大致花费和时间。",cta:"问助手要个报价",prompt:"按现有 Run 出第一版，先告诉我大概花多少、要多久。"},runs:{title:"还没有 Run",body:"Run 描述一次出片要用的参数组合。可以让助手按这个项目补一条。",cta:"让助手补一条 Run",prompt:"给这个项目补一条最小可用的 .svrun，并说明每一行在做什么。"},sources:{title:"还没有 Source",body:"SVML 是这条视频的脚本。让助手按项目现状写第一版。",cta:"让助手写第一版",prompt:"先看这个项目的 package.json 和已有文件，写一条最小可跑的 SVML Source，写进项目里。"},docs:{title:"还没有笔记",body:"项目里的 Markdown 会出现在这里，用来记这一版为什么这样改。",cta:"让助手记一笔",prompt:"在 notes/ 下新建一份笔记，记下这个项目现在的状态和下一步。"}}[a]??null;function M(h){if(a==="sources")return s(h.rel);p(a==="results"?`帮我看看 ${h.rel} 这一版结果怎么样，哪里还需要改。`:`解释 ${h.rel} 这份 Run 在做什么，改哪一行会有什么效果。`)}return n.default.createElement("section",{className:"hw-output","aria-label":"项目产出"},n.default.createElement("div",{className:"hw-tabs",role:"tablist","aria-label":"产出类型"},d.map(h=>n.default.createElement("button",{key:h.id,type:"button",role:"tab","aria-selected":a===h.id,className:`hw-tab ${a===h.id?"is-on":""}`,onClick:()=>r(h.id)},h.label,n.default.createElement("span",{className:"hw-tab-count"},h.count)))),n.default.createElement("div",{className:"hw-output-body",role:"tabpanel","aria-label":w.label,key:a},a==="results"&&t.films?n.default.createElement(yn,{api:o,detail:t,onAsk:p}):a==="docs"&&(t.docs??[]).length?n.default.createElement("ul",{className:"hw-docs"},(t.docs??[]).map((h,x)=>n.default.createElement("li",{key:h.rel,style:{"--i":x}},n.default.createElement("button",{type:"button",className:"hw-doc",onClick:()=>p(`读一下 ${h.rel}，基于它继续推进这个项目。`)},n.default.createElement("b",null,h.title),h.excerpt?n.default.createElement("p",null,h.excerpt):null,n.default.createElement("span",null,h.rel))))):c.length?n.default.createElement("ul",{className:"hw-rows"},c.map((h,x)=>{let[b,y]=Be(h.rel);return n.default.createElement("li",{key:h.rel,style:{"--i":x}},n.default.createElement("button",{type:"button",className:"hw-row",onClick:()=>M(h)},n.default.createElement("span",{className:"hw-row-icon"},n.default.createElement(k,{name:w.icon,size:15})),n.default.createElement("span",{className:"hw-row-name"},b?n.default.createElement("i",null,b):null,y),n.default.createElement("span",{className:"hw-row-meta"},n.default.createElement("span",{className:"hw-row-bytes"},et(h.bytes)),n.default.createElement("em",null,"·"),n.default.createElement("span",null,ye(h.updatedAt))),n.default.createElement("span",{className:"hw-row-go"},a==="sources"?"查看":"问助手",n.default.createElement(k,{name:"arrow",size:12}))))})):g?n.default.createElement("div",{className:"hw-empty"},n.default.createElement(kn,{kind:a}),n.default.createElement("div",null,n.default.createElement("h3",null,g.title),n.default.createElement("p",null,g.body),n.default.createElement("button",{className:"hw-text-btn is-strong",type:"button",onClick:()=>p(g.prompt)},g.cta,n.default.createElement(k,{name:"arrow",size:13})))):null))}function zn({detail:o,api:t,initial:a,onClose:r,onAsk:s}){let p=o.sources??[],[i,d]=(0,n.useState)(a||p[0]?.rel||""),[w,c]=(0,n.useState)(null),[g,M]=(0,n.useState)(""),[h,x]=(0,n.useState)(!1),b=(0,n.useRef)(null);return(0,n.useEffect)(()=>{b.current?.focus()},[]),(0,n.useEffect)(()=>{if(!i)return;let y=!0;return x(!0),M(""),t.source(o.id,i).then(N=>{y&&c(N)}).catch(N=>{y&&(c(null),M(K(N)))}).finally(()=>{y&&x(!1)}),()=>{y=!1}},[o.id,i,t]),(0,n.useEffect)(()=>{function y(N){N.key==="Escape"&&r()}return globalThis.document?.addEventListener("keydown",y),()=>globalThis.document?.removeEventListener("keydown",y)},[r]),n.default.createElement("div",{className:"hw-drawer",role:"dialog","aria-modal":"true","aria-label":"源码"},n.default.createElement("div",{className:"hw-drawer-head"},n.default.createElement("div",{className:"hw-drawer-title"},n.default.createElement(k,{name:"code",size:15}),n.default.createElement("b",null,"源码"),n.default.createElement("span",{className:"hw-mono"},w?`${w.lineCount} 行`:"")),n.default.createElement("button",{className:"hw-text-btn",type:"button",onClick:()=>{s(`解释 ${i} 这份 Source 的结构，指出最值得改的地方。`),r()}},"问助手",n.default.createElement(k,{name:"arrow",size:13})),n.default.createElement("button",{ref:b,className:"hw-icon-btn",type:"button",onClick:r,"aria-label":"关闭源码（Esc）"},n.default.createElement(k,{name:"x",size:15}))),p.length>1?n.default.createElement("div",{className:"hw-drawer-tabs",role:"tablist","aria-label":"源文件"},p.slice(0,12).map(y=>n.default.createElement("button",{key:y.rel,type:"button",role:"tab","aria-selected":y.rel===i,className:`hw-drawer-tab ${y.rel===i?"is-on":""}`,onClick:()=>d(y.rel)},Be(y.rel)[1]))):null,n.default.createElement("div",{className:"hw-code"},h&&!w?n.default.createElement("div",{className:"hw-code-skeleton","aria-hidden":"true"},Array.from({length:9},(y,N)=>n.default.createElement("i",{key:N,style:{width:`${30+N*37%55}%`}}))):null,g?n.default.createElement("p",{className:"hw-muted is-bad"},g):null,!g&&w?n.default.createElement(n.default.Fragment,null,n.default.createElement("p",{className:"hw-code-path"},i),n.default.createElement("pre",{className:h?"is-dim":""},w.lines.map((y,N)=>n.default.createElement(n.default.Fragment,{key:N},n.default.createElement("b",null,N+1),y||" ",`
`))),w.truncated?n.default.createElement("p",{className:"hw-muted"},"只显示前 400 行，共 ",w.lineCount," 行。"):null):null,!h&&!g&&!p.length?n.default.createElement("p",{className:"hw-muted"},"这个项目里还没有 .svml 源文件。"):null))}function Mn({data:o,onOpenRoots:t,onCreate:a}){let[r,s]=De(),p=o?.roots??[],i=[{done:!!o?.skill?.found,title:"装 Hypit 技能",body:"让对话里的 agent 懂 SVML 和出片流程。",cmd:"npx skills add hypit-ai/hypit -g --agent universal -y"},{done:!!o?.executor?.found,title:"装执行器",body:"必须用官方源，国内镜像缺包。",cmd:"npm i -g @hypit/hypit --registry=https://registry.npmjs.org"},{done:!1,title:"把项目放进根目录",body:'目录里的 package.json 要有 "hypit": { "project": true }。'}];return n.default.createElement("div",{className:"hw-setup"},n.default.createElement("p",{className:"hw-next-kicker"},n.default.createElement("span",{className:"hw-next-rec","aria-hidden":"true"}),"开始之前"),n.default.createElement("h2",null,"先把 Hypit 接上。"),n.default.createElement("p",{className:"hw-setup-lead"},"工作台只读扫描目录，不会往项目里写东西。三步就能用。"),n.default.createElement("ol",{className:"hw-setup-steps"},i.map((d,w)=>n.default.createElement("li",{key:d.title,className:d.done?"is-done":"",style:{"--i":w}},n.default.createElement("span",{className:"hw-setup-num"},d.done?n.default.createElement(k,{name:"check",size:12,stroke:2}):B(w+1)),n.default.createElement("div",{className:"hw-setup-main"},n.default.createElement("b",null,d.title,d.done?n.default.createElement("em",null,"已就绪"):null),n.default.createElement("span",null,d.body),d.cmd&&!d.done?n.default.createElement("button",{type:"button",className:"hw-cmd",onClick:()=>s(d.cmd)},n.default.createElement("code",null,d.cmd),n.default.createElement("span",null,r===d.cmd?n.default.createElement(n.default.Fragment,null,n.default.createElement(k,{name:"check",size:12}),"已复制"):n.default.createElement(n.default.Fragment,null,n.default.createElement(k,{name:"copy",size:12}),"复制"))):null,w===2?n.default.createElement("div",{className:"hw-setup-roots"},p.map(c=>n.default.createElement("span",{key:c.path,className:c.ok?"":"is-bad"},n.default.createElement("code",null,ve(c.path,36)),c.ok?c.created?"刚创建，放项目进去再扫描":"可读，还没有项目":c.error)),n.default.createElement("div",{className:"hw-setup-actions"},n.default.createElement("button",{className:"hw-cta is-small",type:"button",onClick:a,disabled:!p.some(c=>c.ok)},n.default.createElement(k,{name:"plus",size:13,stroke:2}),"新建第一个项目"),n.default.createElement("button",{className:"hw-text-btn",type:"button",onClick:t},n.default.createElement(k,{name:"folder",size:13}),"改扫描目录"))):null)))))}var $n=["30 秒竖屏口播：讲清楚一个产品卖点，结尾留一句行动号召。","15 秒横屏开箱：三个镜头，节奏快，配大字标题。","1 分钟知识短片：一个问题、三个要点、一个结论。"];function Cn({roots:o,api:t,onClose:a,onCreated:r}){let s=o.filter(v=>v.ok),[p,i]=(0,n.useState)(s[0]?.path??""),[d,w]=(0,n.useState)(""),[c,g]=(0,n.useState)(""),[M,h]=(0,n.useState)(!1),[x,b]=(0,n.useState)(""),y=(0,n.useRef)(null),N=(0,n.useRef)(null);R(y,!0,()=>{M||a()}),(0,n.useEffect)(()=>{N.current?.focus()},[]);let m=d.trim().replace(/\s+/gu,"-").replace(/[^\p{L}\p{N}._-]+/gu,"").replace(/-{2,}/g,"-").replace(/^[.-]+|[.-]+$/g,""),S=s.find(v=>v.path===p)?.projects?.some(v=>v.root.endsWith("/"+m));async function A(v){if(v?.preventDefault(),!(!m||M||S)){h(!0),b("");try{let C=await t.create(p,m,c);r(C,c.trim())}catch(C){b(K(C)),h(!1)}}}return n.default.createElement("div",{className:"hw-modal-scrim"},n.default.createElement("form",{className:"hw-modal",ref:y,role:"dialog","aria-modal":"true","aria-labelledby":"hw-create-title",onSubmit:A},n.default.createElement("div",{className:"hw-modal-head"},n.default.createElement("p",{className:"hw-next-kicker"},n.default.createElement("span",{className:"hw-next-rec","aria-hidden":"true"}),"新项目"),n.default.createElement("button",{type:"button",className:"hw-icon-btn",onClick:a,"aria-label":"关闭（Esc）"},n.default.createElement(k,{name:"x",size:15}))),n.default.createElement("h2",{id:"hw-create-title"},"做一条什么样的视频？"),n.default.createElement("label",{className:"hw-input-block"},n.default.createElement("span",null,"项目名"),n.default.createElement("input",{ref:N,value:d,onChange:v=>{w(v.target.value),b("")},placeholder:"比如 launch-teaser",maxLength:64,spellCheck:!1,autoComplete:"off"}),n.default.createElement("em",{className:S?"is-bad":""},S?"这个名字已经有项目了":m?n.default.createElement(n.default.Fragment,null,"会建在 ",n.default.createElement("code",null,ve(`${p}/${m}`,48))):"字母、数字、中文、横线都可以")),n.default.createElement("label",{className:"hw-input-block"},n.default.createElement("span",null,"一句话描述 ",n.default.createElement("i",null,"可选")),n.default.createElement("textarea",{value:c,onChange:v=>g(v.target.value),onKeyDown:v=>{v.key==="Enter"&&(v.metaKey||v.ctrlKey)&&A(v)},rows:3,placeholder:"时长、横竖屏、讲什么、什么风格……"})),c?null:n.default.createElement("div",{className:"hw-samples","aria-label":"示例描述"},$n.map(v=>n.default.createElement("button",{key:v,type:"button",onClick:()=>g(v)},v))),s.length>1?n.default.createElement("label",{className:"hw-input-block"},n.default.createElement("span",null,"放在"),n.default.createElement("select",{value:p,onChange:v=>i(v.target.value)},s.map(v=>n.default.createElement("option",{key:v.path,value:v.path},ve(v.path,48))))):null,x?n.default.createElement("p",{className:"hw-modal-error",role:"alert"},x):null,n.default.createElement("div",{className:"hw-modal-foot"},n.default.createElement("span",null,"只建 ",n.default.createElement("code",null,"package.json"),c.trim()?n.default.createElement(n.default.Fragment,null," 和 ",n.default.createElement("code",null,"notes/brief.md")):null,"，脚本交给助手写。"),n.default.createElement("button",{className:"hw-cta",type:"submit",disabled:!m||M||S},M?n.default.createElement("span",{className:"hw-spinner is-light","aria-hidden":"true"}):null,M?"正在建":"建好并开写",M?null:n.default.createElement(k,{name:"arrow",size:15})))))}function ft(){return n.default.createElement("div",{className:"hw-skeleton","aria-hidden":"true"},n.default.createElement("i",{style:{width:180,height:10}}),n.default.createElement("i",{style:{width:"46%",height:34,marginTop:14}}),n.default.createElement("i",{style:{width:"100%",height:54,marginTop:34}}),n.default.createElement("i",{style:{width:"100%",height:168,marginTop:22,borderRadius:18}}))}function yt({api:o,header:t}){let a=(0,n.useMemo)(()=>wn(),[]),[r,s]=(0,n.useState)(a),[p,i]=(0,n.useState)(a.join(`
`)),[d,w]=(0,n.useState)(!1),[c,g]=(0,n.useState)(null),[M,h]=(0,n.useState)(!0),[x,b]=(0,n.useState)(""),[y,N]=(0,n.useState)(""),[m,S]=(0,n.useState)(null),[A,v]=(0,n.useState)(""),[C,I]=(0,n.useState)(null),[$,f]=(0,n.useState)("results"),[P,O]=(0,n.useState)(null),[re,J]=(0,n.useState)(null),[X,te]=(0,n.useState)(!1),[z,D]=(0,n.useState)(0),[Z,ne]=De(),[he,oe]=(0,n.useState)(!1),ie=(0,n.useCallback)(async(L,H={})=>{H.quiet||h(!0),b("");try{let U=await o.overview(L);g(U);let ce=U.roots.flatMap(Q=>Q.projects??[]);N(Q=>ce.some(we=>we.id===Q)?Q:ce[0]?.id??"");let le=(U.roots??[]).filter(Q=>Q.created);le.length&&I({kind:"success",text:`已创建 ${le.map(Q=>ve(Q.path,40)).join("、")}，把项目放进去后再扫描。`})}catch(U){b(K(U))}finally{h(!1),te(!1)}},[o]);(0,n.useEffect)(()=>{let L=!0;return Promise.resolve().then(()=>{L&&ie(a)}),()=>{L=!1}},[ie,a]),(0,n.useEffect)(()=>{if(!y){S(null);return}let L=!0;return v(""),o.project(y).then(H=>{L&&S(U=>(U?.id!==H.id&&(O(null),f(H.counts?.result?"results":H.counts?.run?"runs":"sources")),H))}).catch(H=>{L&&(S(null),v(K(H)))}),()=>{L=!1}},[y,o,z]);let de=(0,n.useMemo)(()=>(c?.roots??[]).flatMap(L=>L.projects??[]),[c]),W=m?mn(m):null,ee=(0,n.useCallback)(L=>J({text:L}),[]),xe=(0,n.useCallback)(()=>J(null),[]),se=(0,n.useCallback)(()=>O(null),[]),ae=!!m||de.length>0&&!A,G=(0,n.useCallback)(()=>oe(!0),[]),Ce=(0,n.useCallback)(()=>D(L=>L+1),[]),be=(0,n.useMemo)(()=>m?o.chatFor({path:m.id}):null,[o,m?.id]);(0,n.useEffect)(()=>{function L(H){let U=H.target;U&&(U.tagName==="INPUT"||U.tagName==="TEXTAREA"||U.tagName==="SELECT"||U.isContentEditable)||H.metaKey||H.ctrlKey||H.altKey||(H.key==="n"||H.key==="N")&&c&&(c.roots??[]).some(le=>le.ok)&&(H.preventDefault(),oe(!0))}return globalThis.document?.addEventListener("keydown",L),()=>globalThis.document?.removeEventListener("keydown",L)},[c]);async function fe(L,H){oe(!1),await ie(r,{quiet:!0}),N(L.root),I({kind:"success",text:`已建好「${L.name}」。第一版脚本的任务已经填进助手，看一眼就可以发送。`}),J({for:L.root,text:H?`这是一个新建的 Hypit 项目，需求在 notes/brief.md：「${H}」。按 Hypit 技能的约定，写一条最小可跑的 SVML Source 和对应的 .svrun，写进项目里，然后跑 hypit_check 确认通过。不要提交会花钱的构建。`:"这是一个新建的空 Hypit 项目。先问我想做什么样的视频（时长、横竖屏、内容、风格），问清楚之后再写第一版 SVML Source 和 .svrun。"})}return n.default.createElement("div",{className:"hw-studio"},n.default.createElement(fn,{header:t,data:c,loading:M,rootsText:p,setRootsText:i,rootsOpen:d,setRootsOpen:w,projects:de,selected:y,onSelect:L=>{N(L),I(null)},onCreate:G,onScan:()=>{let L=tt(p);un(L),s(L),I(null),ie(L)}}),n.default.createElement("div",{className:`hw-shell ${ae?"":"is-solo"}`},n.default.createElement("main",{className:"hw-stage"},n.default.createElement("div",{className:"hw-toasts"},C?n.default.createElement(Ee,{text:C.text,kind:C.kind,onClose:()=>I(null)}):null,x?n.default.createElement(Ee,{text:x,onClose:()=>b("")}):null),n.default.createElement("div",{className:"hw-stage-scroll"},M&&!c?n.default.createElement(ft,null):de.length?m?n.default.createElement("div",{className:"hw-stage-inner",key:m.id},n.default.createElement("div",{className:"hw-masthead"},n.default.createElement("div",{className:"hw-masthead-main"},n.default.createElement("button",{className:"hw-path",type:"button",onClick:()=>ne(m.root,"path"),title:`复制 ${m.root}`},n.default.createElement("span",null,ve(m.root,56)),n.default.createElement(k,{name:Z==="path"?"check":"copy",size:12}),n.default.createElement("em",null,Z==="path"?"已复制":"复制路径")),n.default.createElement("h1",null,m.title)),n.default.createElement("div",{className:"hw-masthead-side"},n.default.createElement("span",{className:"hw-updated"},ye(m.updatedAt),"更新"),n.default.createElement("button",{className:`hw-icon-btn ${X?"is-busy":""}`,type:"button","aria-label":"重新扫描这个项目",title:"重新扫描",onClick:()=>{te(!0),D(L=>L+1),ie(r,{quiet:!0})}},n.default.createElement(k,{name:"refresh",size:15})))),n.default.createElement(gn,{stageKey:W.key,counts:m.counts??{}}),n.default.createElement(vn,{stage:W,onAsk:ee,onTab:L=>{f(L),O(null)}}),n.default.createElement(Nn,{api:o,detail:m,tab:$,setTab:f,onOpenSource:L=>O({rel:L}),onAsk:ee})):A?n.default.createElement("div",{className:"hw-state"},n.default.createElement("h2",null,"这个项目读不出来"),n.default.createElement("p",null,A),n.default.createElement("button",{className:"hw-cta is-small",type:"button",onClick:()=>D(L=>L+1)},"重试")):n.default.createElement(ft,null):n.default.createElement(Mn,{data:c,onOpenRoots:()=>w(!0),onCreate:G})),P&&m?n.default.createElement(zn,{detail:m,api:o,initial:P.rel,onClose:se,onAsk:ee}):null),m?n.default.createElement(Pe,{key:m.id,target:{id:m.id,title:m.title,hint:m.root,body:"它能读写这个项目、跑命令和 hypit 检查。要花钱的构建，它会先报价，等你点头。",prompts:[W?.prompt??"先读一遍这个项目，告诉我现在到哪一步。","这个项目现在能跑吗？先 check，有错直接修","把这条 Source 改成竖屏 9:16"]},chat:be,pendingPrompt:re,onConsume:xe,onTurnDone:Ce}):ae?n.default.createElement("aside",{className:"hw-assistant is-empty","aria-hidden":"true"}):null),he?n.default.createElement(Cn,{roots:c?.roots??[],api:o,onClose:()=>oe(!1),onCreated:fe}):null)}var Mt=["slots","remote"],Sn=Mt,Nt="hypit-workbench",Tn="0.14.0",zt="dsh.video-workbench.studio.v1",En=[{id:"talking-head",label:"网感口播",hint:"文稿剪辑 · 整片制作"},{id:"hypit",label:"Hypit",hint:"SVML 视频项目"}];function $t({size:o=18,active:t=!1}){let a=t?1.75:1.5;return _.default.createElement("svg",{width:o,height:o,viewBox:"0 0 20 20",fill:"none","aria-hidden":"true"},_.default.createElement("rect",{x:"2.75",y:"4.25",width:"14.5",height:"11.5",rx:"2.6",stroke:"currentColor",strokeWidth:a}),_.default.createElement("path",{d:"M2.75 8h14.5",stroke:"currentColor",strokeWidth:a,strokeOpacity:.45}),_.default.createElement("path",{d:"m8.6 10 3.4 1.9-3.4 1.9z",fill:"currentColor"}))}function In({studio:o,onChange:t}){return _.default.createElement("div",{className:"hw-brand"},_.default.createElement("span",{className:"hw-mark","aria-hidden":"true"},_.default.createElement($t,{size:16,active:!0})),_.default.createElement("span",{className:"hw-brand-name"},"视频工作台"),_.default.createElement("div",{className:"hw-studios",role:"tablist","aria-label":"工作区"},En.map(a=>_.default.createElement("button",{key:a.id,type:"button",role:"tab","aria-selected":o===a.id,className:`hw-studio-tab ${o===a.id?"is-on":""}`,onClick:()=>t(a.id),title:a.hint},a.id==="hypit"?_.default.createElement(vt,null):a.label))))}function jn({api:o}){let[t,a]=(0,_.useState)(()=>{try{return globalThis.localStorage?.getItem(zt)||"talking-head"}catch{return"talking-head"}});(0,_.useEffect)(()=>{try{globalThis.localStorage?.setItem(zt,t)}catch{}},[t]);let r=_.default.createElement(In,{studio:t,onChange:a});return _.default.createElement("div",{className:"hw-root","data-studio":t},t==="hypit"?_.default.createElement(yt,{api:o,header:r}):_.default.createElement(xt,{api:o,header:r}))}function An(o){async function t(r){let s;try{s=await o.remote[$e].request(r)}catch(i){throw Object.assign(new Error(i?.message||"连接中断，请稍后再试。"),{code:i?.code||"transport"})}let p=s?.ok?s?.value?.error:s?.value?.error??s?.error??{};if(!s?.ok||p){let i=p?.code||"unavailable",d=/timeout|timed out/i.test(String(p?.message??i))?"等待超时了。任务可能还在后台跑，稍等再看。":p?.message||"操作未完成，请稍后再试。";throw Object.assign(new Error(d),{code:i})}return s.value}function a(r){return{models:()=>t({op:"models"}),chat:(s,p)=>t({op:"chat",...r,message:s,...p??{}}),poll:(s,p)=>t({op:"chat-poll",...r,cursor:s,...p?{sessionId:p}:{}}),list:()=>t({op:"chat-list",...r}),open:s=>t({op:"chat-open",...r,sessionId:s}),remove:s=>t({op:"chat-delete",...r,sessionId:s}),answer:s=>t({op:"chat-answer",...r,answers:s}),stop:()=>t({op:"chat-stop",...r}),reset:()=>t({op:"chat-reset",...r})}}return{call:t,chatFor:a,overview:r=>t({op:"overview",roots:r}),project:r=>t({op:"project",path:r}),source:(r,s)=>t({op:"source",path:r,rel:s}),create:(r,s,p)=>t({op:"create",root:r,name:s,brief:p}),clip:(r,s={})=>t({...s,op:"th_"+r})}}async function Xe(o){let t=document.createElement("style");t.dataset.hypitWorkbench="true",t.textContent=Re,document.head.append(t),o.effect(()=>()=>t.remove());let a=await o.remote.$mount({package:Je,descriptors:Qe}),r=o.inject(["remote."+$e],s=>{let p=An(s);s.slots.inject("sidebar.panellist",()=>s.slots.register({name:"sidebar.panellist",id:Nt,label:"视频工作台",order:45},$t)),s.slots.inject("main",()=>s.slots.register({name:"main",key:Nt},i=>_.default.createElement(jn,{api:p,...i})))});try{await r}catch(s){throw console.error("HW_INSTALL_FAILED",s&&(s.stack||s.message||String(s))),await r.dispose?.(),await a?.(),s}return async()=>{await r.dispose?.(),await a?.()}}Xe.inject=Mt;var qn=Xe,Ln=Xe;

return module.exports;}});