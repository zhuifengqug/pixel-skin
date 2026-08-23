/**
 * dsh-pixel-skin — 红白机（Famicom）像素风皮肤 · client half
 *
 * 实现方式（全部走官方扩展点，不碰布局/组件）：
 *   1. ctx.theme.overrideTokens('dsh-pixel-skin', TOKENS)  —— 覆盖 --dsw-alias-* / --dsw-specific-*
 *      语义 token，浅/深各一套；disposer 交给 ctx.effect，卸载即还原。
 *   2. 一个自有 <style>（ctx.effect 管理生命周期）—— 注入像素字体、直角、硬阴影、
 *      像素边框、网格底、方形滚动条、step 阶跃动画、扫描线（可选）等 CSS。
 *   3. localStorage 开关：pixel-skin:enabled='0' 时整体停用；pixel-skin:scanlines='1' 开扫描线。
 *      控制台 API：__PIXELSKIN__.scanlines(bool) / off() / on()
 *
 * 字体：Fusion Pixel 12px Proportional SC / Monospaced SC（OFL-1.1），再以系统字体兜底。
 * 已知边界：侧栏/工具栏图标是 @iconify 矢量图标，本皮肤只改颜色不改图标形状。
 */
window.__ModuleLoader__.load({
  id: "dsh-pixel-skin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    // ---- 调色板（红白机）----
    // 常量：米白机壳 / 卡带红 / 炭黑 + 复古绿黄点缀
    const INK = "#26221e";       // 浅色主文字（炭黑）
    const PAPER = "#f5efe6";     // 深色主文字（米白）
    const RED = "#cf1f2e";       // 浅色主色（卡带红）
    const RED_DK = "#ff6b6b";    // 深色主色（亮红）
    const RED_DEEP = "#b31827";  // 浅色主色 hover（深红）
    const RED_SOFT = "#ff8f8f";  // 深色主色 hover（浅红）

    const P = (light, dark) => ({ light: light, dark: dark });

    const TOKENS = {
      // 背景层级
      "--dsw-alias-bg-base": P("#faf6f0", "#1c1915"),
      "--dsw-alias-bg-layer-1": P("#f0eae0", "#26211b"),
      "--dsw-alias-bg-layer-2": P("#e4dbca", "#2f291f"),
      "--dsw-alias-bg-layer-3": P("#d9ceb8", "#38312a"),
      "--dsw-alias-bg-mask-1": P("#0000003d", "#00000080"),
      "--dsw-alias-bg-mask-2": P("#0000001f", "#00000033"),
      "--dsw-alias-bg-mask-3": P("#0000007a", "#0000007a"),
      "--dsw-alias-bg-mask-photo": P("#000000e0", "#000000e0"),
      "--dsw-alias-bg-mask-drop": P("#ffffffb3", "#26211bb3"),
      "--dsw-alias-bg-module-platform": P("#f5f1e8", "#211d18"),
      "--dsw-alias-bg-multi-select": P("#f5f1e8", "#2c261f"),
      "--dsw-alias-bg-overlay": P("#fffdf8", "#2f291f"),
      "--dsw-alias-bg-skeleton": P("#0000000a", "#ffffff14"),
      // 边框
      "--dsw-alias-border-inverted": P("#0000", "#ffffff0f"),
      "--dsw-alias-border-inverted2": P("#0000", "#ffffff14"),
      "--dsw-alias-border-l1": P("#00000012", "#ffffff17"),
      "--dsw-alias-border-l2-darkmode-thin": P("#0000001a", "#ffffff0f"),
      "--dsw-alias-border-l2": P("#0000002b", "#ffffff2b"),
      "--dsw-alias-border-l3": P("#00000038", "#ffffff3d"),
      "--dsw-alias-border-l4": P("#00000052", "#ffffff52"),
      "--dsw-alias-border-secondary": P("#c9bda6", "#4a4238"),
      // 品牌
      "--dsw-alias-brand-primary": P(RED, RED_DK),
      "--dsw-alias-brand-primary-invert": P("#fffdf8", "#14100d"),
      "--dsw-alias-brand-primary-new-colorprimary-new-color": P(RED, RED_DK),
      "--dsw-alias-brand-text": P(INK, PAPER),
      // 按钮
      "--dsw-alias-button-contrast-fill": P(INK, PAPER),
      "--dsw-alias-button-elevated-fill": P("#fffdf8", "#38312a"),
      "--dsw-alias-button-floating-fill": P("#fffdf8", "#2c261f"),
      "--dsw-alias-button-floating-hover": P("#f0eae0", "#38312a"),
      "--dsw-alias-button-ghost-active-border": P("#6f6558", "#b8ac9c"),
      "--dsw-alias-button-ghost-active-fill": P("#f0eae0", "#38312a"),
      "--dsw-alias-button-ghost-active-hover": P("#e4dbca", "#2f291f"),
      "--dsw-alias-button-info-fill": P("#2d3548", "#667aa8"),
      "--dsw-alias-button-info-hover": P("#44516d", "#8498c8"),
      "--dsw-alias-button-primary-dimmed": P("#f0eae0", "#38312a"),
      "--dsw-alias-button-primary-fill": P("var(--dsw-alias-brand-primary)", "var(--dsw-alias-brand-primary)"),
      "--dsw-alias-button-primary-hover": P(RED_DEEP, RED_SOFT),
      "--dsw-alias-button-tool-bar-fill-invisible": P("#1f1f1f5c", "#1f1f1f5c"),
      "--dsw-alias-button-tool-bar-fill": P("#54555780", "#54555780"),
      "--dsw-alias-button-tool-bar-hover": P("#f2c14e99", "#f2c14e66"),
      // 交互
      "--dsw-alias-interactive-bg-active": P("#cf1f2e1f", "#ffffff2e"),
      "--dsw-alias-interactive-bg-hover": P("#26221e0f", "#ffffff14"),
      "--dsw-alias-interactive-bg-hover-accent": P("#f2c14e38", "#f2c14e52"),
      "--dsw-alias-interactive-bg-hover-danger": P("#a0141f12", "#ff40402e"),
      "--dsw-alias-interactive-bg-hover-solid": P("#f0eae0", "#38312a"),
      // 文字
      "--dsw-alias-label-caption": P("#9a8d7c", "#81776a"),
      "--dsw-alias-label-dimmed": P("#d9ceb8", "#4a4238"),
      "--dsw-alias-label-error": P("#a0141f", "#ff4040"),
      "--dsw-alias-label-inverse": P("#fffdf8", "#26221e"),
      "--dsw-alias-label-primary": P(INK, PAPER),
      "--dsw-alias-label-primary-bluish": P(INK, PAPER),
      "--dsw-alias-label-primary-dimmed": P("#3a332c", "#e4dbca"),
      "--dsw-alias-label-primary-foreground": P("#fffdf8", "#1c1915"),
      "--dsw-alias-label-primary-inverted": P("#fffdf8", "#38312a"),
      "--dsw-alias-label-quaternary": P("#b3a68f", "#6b5d4e"),
      "--dsw-alias-label-secondary": P("#6f6558", "#b8ac9c"),
      "--dsw-alias-label-tertiary": P("#9a8d7c", "#81776a"),
      // 线 / 填充
      "--dsw-alias-line-secondary": P("#e2d8c6", "#3a332c"),
      "--dsw-alias-separator-primary": P("#e2d8c6", "#3a332c"),
      "--dsw-alias-fill-l2": P("#f0eae0", "#2c261f"),
      "--dsw-alias-fill-tsp-secondary": P("#26221e14", "#ffffff14"),
      // markdown
      "--dsw-alias-markdown-citation": P("#f0eae0", "#38312a"),
      "--dsw-alias-markdown-code-block": P("#252b45", "#151b2d"),
      "--dsw-alias-markdown-code-block-banner": P("#2d3548", "#10182c"),
      "--dsw-alias-markdown-code-segment-selected": P("#f2c14e", "#5c4b22"),
      "--dsw-alias-markdown-code-segment-unselected": P("#2d3548", "#10182c"),
      "--dsw-alias-markdown-inline-code": P("#e8ebf2", "#293149"),
      "--dsw-alias-markdown-placeholder": P("#f5f1e8", "#2c261f"),
      "--dsw-alias-markdown-tag": P("#efe6d5", "#2c261f"),
      // 滚动条
      "--dsw-alias-scrollbar-bg-l1": P("#c9bda6", "#4a4238"),
      "--dsw-alias-scrollbar-bg-l2": P("#b3a68f", "#4a4238"),
      "--dsw-alias-scrollbar-hover-l1": P("#a89b84", "#6b5d4e"),
      "--dsw-alias-scrollbar-hover-l2": P("#a89b84", "#6b5d4e"),
      // 状态色
      "--dsw-alias-state-business-primary": P("#2d3548", "#667aa8"),
      "--dsw-alias-state-business-tertiary": P("#e8ebf2", "#293149"),
      "--dsw-alias-state-error-primary": P("#a0141f", "#ff4040"),
      "--dsw-alias-state-error-secondary": P("#c2272f", "#ff4040"),
      "--dsw-alias-state-success-primary": P("#2f7d52", "#69c28a"),
      "--dsw-alias-state-success-secondary": P("#4f9d69", "#8bd6a4"),
      "--dsw-alias-state-success-tertiary": P("#e6f4e6", "#16331b"),
      "--dsw-alias-state-warn-label": P("#9b7416", "#f2c14e"),
      "--dsw-alias-state-warn-primary": P("#c99700", "#f2c14e"),
      "--dsw-alias-state-warn-secondary": P("#e0ac00", "#f5d77b"),
      "--dsw-alias-state-warn-tertiary": P("#fdf3d8", "#493914"),
      // toast / tooltip
      "--dsw-alias-toast-bg": P("#26221e", "#38312a"),
      "--dsw-alias-tooltip-bg": P("#3a332c", "#2c261f"),
      // 特定表面
      "--dsw-specific-bubble": P("#f1e9db", "#2c261f"),
      "--dsw-specific-bubble-highlight": P("#fbe4e1", "#38312a"),
      "--dsw-specific-input-major": P("#fffdf8", "#26211b"),
      "--dsw-specific-login-input": P("#f5f1e8", "#14100d"),
      "--dsw-specific-menu": P("#d9ceb8", "#38312a"),
      "--dsw-specific-selector": P("#f5f1e8", "#38312a"),
      "--dsw-specific-sidebar-fill": P("#efe6d5", "#241f19"),
      "--dsw-specific-sidebar-nav-item-active": P("#f0eae0", "#38312a"),
      "--dsw-specific-sidebar-nav-item-active-accent": P("#fbe4e1", "#4a1c18"),
      "--dsw-specific-sidebar-nav-item-hover": P("#f0eae0", "#2c261f"),
      "--dsw-specific-tip": P("#f5f1e8", "#38312a"),
    };

    // ---- 像素质感 CSS ----
    const CSS = String.raw`
/* ===== dsh-pixel-skin · 红白机 ===== */
@font-face {
  font-family: 'Fusion Pixel UI';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://raw.githubusercontent.com/ADAning/dsh-pixel-skin/cd34110195a94ca785f32e9b45d2f6e4bc685b1a/assets/fonts/fusion-pixel-12px-proportional-sc.woff2') format('woff2');
}
@font-face {
  font-family: 'Fusion Pixel Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://raw.githubusercontent.com/ADAning/dsh-pixel-skin/cd34110195a94ca785f32e9b45d2f6e4bc685b1a/assets/fonts/fusion-pixel-12px-monospaced-sc.woff2') format('woff2');
}
@font-face {
  font-family: 'Fusion Pixel Latin';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://raw.githubusercontent.com/ADAning/dsh-pixel-skin/cd34110195a94ca785f32e9b45d2f6e4bc685b1a/assets/fonts/fusion-pixel-latin.woff2') format('woff2');
}

:root {
  --dsw-font-family: 'Fusion Pixel UI', 'Fusion Pixel Latin', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  --ds-font-family-code: 'Fusion Pixel Mono', 'Fusion Pixel Latin', 'SF Mono', 'Cascadia Mono', Consolas, 'Liberation Mono', Menlo, 'PingFang SC', monospace;
  --ds-ease-in-out: steps(3, end);
  --ds-transition-duration: .12s;
  --ds-transition-duration-fast: .06s;
  --ds-transition-duration-slow: .2s;
}

/* 直角 + 硬阴影 + 网格底 + 光标 + 滚动条宽度 */
body {
  --dsw-shadow-lv1: 2px 2px 0 0 rgba(38, 34, 30, .30);
  --dsw-shadow-lv2: 3px 3px 0 0 rgba(38, 34, 30, .42);
  --dsw-shadow-lv3: 5px 5px 0 0 rgba(38, 34, 30, .50);
  --dsw-mask-blur: blur(0px);
  --dsh-scrollbar-width: 12px;
  --dsw-font-markdown-h1: 400 26px/40px 'Fusion Pixel UI', 'Fusion Pixel Latin', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --dsw-font-markdown-h2: 400 23px/36px 'Fusion Pixel UI', 'Fusion Pixel Latin', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --dsw-font-markdown-h3: 400 20px/32px 'Fusion Pixel UI', 'Fusion Pixel Latin', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --dsw-font-markdown-h4: 400 18px/30px 'Fusion Pixel UI', 'Fusion Pixel Latin', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --dsw-font-markdown-base: 16px/30px var(--dsw-font-family);
  --dsw-font-markdown-base-strong: 600 16px/30px var(--dsw-font-family);
  --dsw-font-markdown-base-italic: italic 16px/30px var(--dsw-font-family);
  --dsw-font-markdown-table: 16px/28px var(--dsw-font-family);
  --dsw-font-markdown-table-head: 500 16px/28px var(--dsw-font-family);
  --dsw-font-markdown-small: 15px/26px var(--dsw-font-family);
  --dsw-font-markdown-code: 17px/26px var(--ds-font-family-code);
  --dsw-font-markdown-code-block: 17px/27px var(--ds-font-family-code);
  --dsw-font-markdown-code-block-small: 15px/23px var(--ds-font-family-code);
  caret-color: #cf1f2e;
  background-image: repeating-conic-gradient(rgba(38, 34, 30, .035) 0% 25%, rgba(38, 34, 30, 0) 0% 50%);
  background-size: 8px 8px;
}
body[data-ds-dark-theme] {
  --dsw-shadow-lv1: 2px 2px 0 0 rgba(0, 0, 0, .55);
  --dsw-shadow-lv2: 3px 3px 0 0 rgba(0, 0, 0, .70);
  --dsw-shadow-lv3: 5px 5px 0 0 rgba(0, 0, 0, .82);
  --dsw-mask-blur: blur(0px);
  caret-color: #ff6b6b;
  background-image: repeating-conic-gradient(rgba(255, 255, 255, .028) 0% 25%, rgba(255, 255, 255, 0) 0% 50%);
}

/* 全局直角 */
body *, body *::before, body *::after { border-radius: 0 !important; }

/* 统一放大可读文字；保留图标、徽章和布局尺寸不变 */
body, button, input, textarea, select {
  font-family: var(--dsw-font-family);
  font-size: 16px;
  line-height: 1.6;
}
code, pre, kbd, samp, textarea[data-code], [data-language] {
  font-family: var(--ds-font-family-code);
  font-size: 17px;
  line-height: 1.6;
}

/* 街机控制台的区域角色：墨蓝代码 / 黄色交互 / 绿色成功 */
pre, [data-code-block], [data-tool-output], [data-terminal] {
  border-left: 3px solid #2d3548 !important;
  box-shadow: 3px 3px 0 rgba(37, 43, 69, .26);
  color: #f5efe6 !important;
  text-shadow: 1px 0 0 rgba(245, 239, 230, .18);
}
pre code, [data-code-block] code, [data-tool-output] code, [data-terminal] code {
  color: #f5efe6 !important;
}
body[data-ds-dark-theme] pre,
body[data-ds-dark-theme] [data-code-block],
body[data-ds-dark-theme] [data-tool-output],
body[data-ds-dark-theme] [data-terminal] {
  color: #f5efe6 !important;
}
button:hover:not(:disabled), [role="button"]:hover {
  box-shadow: 2px 2px 0 rgba(242, 193, 78, .55);
}
[aria-busy="true"], [data-status="running"], [data-state="running"] {
  border-left: 3px solid #f2c14e !important;
}
[aria-label*="成功"], [aria-label*="success" i], [data-status="success"], [data-state="success"] {
  border-left: 3px solid #4f9d69 !important;
}
blockquote, table, hr {
  border-color: #c9bda6 !important;
}
blockquote {
  border-left-width: 3px !important;
  border-left-color: #f2c14e !important;
  background: rgba(242, 193, 78, .08);
}

/* TerminalBlock 使用 CSS Modules 内部 class，变量和文本节点一起覆盖，避免深色底上出现炭黑字 */
[class*="_terminalBody"],
[class*="_terminal"] {
  --dsl-terminal-font: 17px/27px var(--ds-font-family-code) !important;
  --dsl-terminal-line-height: 27px !important;
  --dsl-terminal-output-max-height: 260px;
  color: #f5efe6 !important;
}
[class*="_terminalBody"] [class*="_command"],
[class*="_terminal"] [class*="_command"],
[class*="_terminalBody"] [class*="_output"],
[class*="_terminal"] [class*="_output"],
[class*="_terminalBody"] [class*="_line"],
[class*="_terminal"] [class*="_line"] {
  color: #f5efe6 !important;
  font: 17px/27px var(--ds-font-family-code) !important;
}
[class*="_terminalBody"] [class*="_cwd"],
[class*="_terminal"] [class*="_cwd"],
[class*="_terminalBody"] [class*="_copyButton"],
[class*="_terminal"] [class*="_copyButton"],
[class*="_terminalBody"] [class*="_expand"],
[class*="_terminal"] [class*="_expand"] {
  color: #c7d0e8 !important;
}
[class*="_ioCard"] [class*="_ioText"] {
  color: #f5efe6 !important;
  font: 17px/27px var(--ds-font-family-code) !important;
}
[class*="_ioCard"] [class*="_ioLabel"] {
  color: #f2c14e !important;
}

/* 像素按下位移 */
button:active:not(:disabled) { transform: translate(2px, 2px); transition: none; }

/* 方形滚动条 */
::-webkit-scrollbar { width: 12px; height: 12px; }
::-webkit-scrollbar-thumb { border-radius: 0 !important; }

/* 选区 + 焦点环 */
::selection { background: #cf1f2e; color: #fffdf8; }
body[data-ds-dark-theme] ::selection { background: #ff6b6b; color: #1c1915; }
:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 0; }

/* 浅色模式的炭黑代码块 —— 需反向高亮 token（红白机说明书观感） */
body:not([data-ds-dark-theme]) {
  --shiki-foreground: #f5efe6;
  --shiki-token-constant: #ff8f8f;
  --shiki-token-string: #b8f28c;
  --shiki-token-comment: #a29787;
  --shiki-token-keyword: #ff6b6b;
  --shiki-token-parameter: #ffcc66;
  --shiki-token-function: #ffd166;
  --shiki-token-string-expression: #b8f28c;
  --shiki-token-punctuation: #d9ceb8;
  --shiki-token-link: #ffb3b3;
}

/* CRT 扫描线（默认关；__PIXELSKIN__.scanlines(true) 或 localStorage pixel-skin:scanlines=1） */
body[data-pixel-scanlines="on"]::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483000;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, .14) 0px, rgba(0, 0, 0, .14) 1px, transparent 1px, transparent 3px);
}
`;

    // ---- 本地开关 ----
    function storageGet(key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* 隐私模式等场景忽略 */ }
    }

    function installConsoleApi() {
      if (typeof window === "undefined") return;
      window.__PIXELSKIN__ = {
        scanlines(on) {
          document.body.setAttribute("data-pixel-scanlines", on ? "on" : "");
          storageSet("pixel-skin:scanlines", on ? "1" : "0");
        },
        off() {
          storageSet("pixel-skin:enabled", "0");
          console.log("[dsh-pixel-skin] 已停用 —— 刷新页面后恢复官方外观");
        },
        on() {
          storageSet("pixel-skin:enabled", "1");
          console.log("[dsh-pixel-skin] 已启用 —— 刷新页面生效");
        },
      };
    }

    // ---- 插件体 ----
    const inject = ["theme"];

    function apply(ctx) {
      if (storageGet("pixel-skin:enabled") === "0") return; // 用户已停用

      installConsoleApi();

      // 扫描线状态恢复
      if (storageGet("pixel-skin:scanlines") === "1") {
        document.body.setAttribute("data-pixel-scanlines", "on");
      }

      // token 覆盖层：disposer 交给 fiber，卸载/停用即还原
      ctx.effect(() => ctx.theme.overrideTokens("dsh-pixel-skin", TOKENS), "pixel-skin: token layer");

      // 自有样式：createElement + effect 清理（与官方 ui-theme 同款模式）
      ctx.effect(() => {
        if (typeof document === "undefined") return undefined;
        const tag = document.createElement("style");
        tag.dataset.plugin = "dsh-pixel-skin";
        tag.dataset.pluginCss = "dsh-pixel-skin/pixel.css";
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => { tag.remove(); };
      }, "pixel-skin: stylesheet");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
