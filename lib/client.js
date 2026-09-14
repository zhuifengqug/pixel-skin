/**
 * dsh-pixel-skin — 红白机像素风皮肤 · client half（宝可梦风味四色版）
 *
 * 实现方式（全部走官方扩展点）：
 *   1. ctx.theme.overrideTokens('dsh-pixel-skin', buildTokens(palette)) ——
 *      四套可切换配色（红/蓝/绿/黄），浅深各一套；切换即重放同 source 层。
 *   2. 自有 <style>（ctx.effect 管理生命周期）：像素字体、直角、硬阴影、
 *      HP 条式状态、GBA 式窗框、像素球加载动画、扫描线（可选）。
 *   3. settings.section 注册「像素皮肤」设置分区（独立于通用设置）：
 *      主题色 / 回合状态句 / 能力滑块配色（预设渐变 + 自定义取色）。
 *   4. localStorage：pixel-skin:enabled / pixel-skin:scanlines / pixel-skin:palette。
 *      控制台 API：__PIXELSKIN__.palette('red|blue|green|yellow') / scanlines / off / on
 *
 * 版权说明：像素球、HP 条、窗框均为原创 8-bit 图形，灵感来自 90 年代掌机
 * 游戏界面；未使用任天堂 / Pokémon 官方素材或商标名称。
 * 已知边界：侧栏/工具栏图标是 @iconify 矢量图标，本皮肤只改颜色不改图标形状。
 */
window.__ModuleLoader__.load({
  id: "dsh-pixel-skin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    const React = require("react");
     const { createRoot } = require("react-dom/client");

    // ---- 四套配色（御三家印象：红/蓝/绿/黄）----
    const PALETTES = {
      red: {
        label: "红", en: "Red",
        accent: "#d9363e", hover: "#b92532", soft: "#ff7474",
        onAccentL: "#fffdf8", onAccentD: "#14100d",
        tintL: "#fdecea", tintD: "#3a1a17",
      },
      blue: {
        label: "蓝", en: "Blue",
        accent: "#3678d4", hover: "#285cad", soft: "#72b9ff",
        onAccentL: "#fffdf8", onAccentD: "#101b33",
        tintL: "#e8effb", tintD: "#1c2b4a",
      },
      green: {
        label: "绿", en: "Green",
        accent: "#45a85a", hover: "#328344", soft: "#7bd477",
        onAccentL: "#fffdf8", onAccentD: "#0f2417",
        tintL: "#e6f4e6", tintD: "#16331b",
      },
      yellow: {
        label: "黄", en: "Yellow",
        accent: "#f2c94c", hover: "#d7a92f", soft: "#ffe27a",
        onAccentL: "#26221e", onAccentD: "#26221e",
        tintL: "#fdf3d8", tintD: "#332b12",
      },
    };
    const PALETTE_IDS = Object.keys(PALETTES);

    const INK = "#26221e";
    const PAPER = "#f5efe6";
    const P = (light, dark) => ({ light: light, dark: dark });

    // 回合状态短语（"Deep diving..." / "深度求索中..." 通过 t("chat.deepDiving") 渲染，皮肤用 DOM 观察器替换；
    // 均为通用游戏词汇，与任天堂无关）
    const STATUS_PHRASES = {
      idle: { zh: "待机…", en: "Idle..." },
      charge: { zh: "正在蓄力…", en: "Charging up..." },
      move: { zh: "正在出招…", en: "Using a move..." },
      evolve: { zh: "正在进化…", en: "Evolving..." },
    };
    const STATUS_IDS = Object.keys(STATUS_PHRASES);

    function buildTokens(p) {
      return {
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
        // 品牌（随 palette 切换）
        "--dsw-alias-brand-primary": P(p.accent, p.soft),
        "--dsw-alias-brand-primary-invert": P(p.onAccentL, p.onAccentD),
        "--dsw-alias-brand-primary-new-colorprimary-new-color": P(p.accent, p.soft),
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
        "--dsw-alias-button-primary-hover": P(p.hover, p.soft),
        "--dsw-alias-button-tool-bar-fill-invisible": P("#1f1f1f5c", "#1f1f1f5c"),
        "--dsw-alias-button-tool-bar-fill": P("#54555780", "#54555780"),
        "--dsw-alias-button-tool-bar-hover": P("#f2c14e99", "#f2c14e66"),
        // 交互
        "--dsw-alias-interactive-bg-active": P(p.accent + "1f", "#ffffff2e"),
        "--dsw-alias-interactive-bg-hover": P("#26221e0f", "#ffffff14"),
        "--dsw-alias-interactive-bg-hover-accent": P(p.accent + "38", p.soft + "52"),
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
        "--dsw-alias-label-primary-foreground": P(p.onAccentL, p.onAccentD),
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
        // 状态色（business 随 palette）
        "--dsw-alias-state-business-primary": P(p.accent, p.soft),
        "--dsw-alias-state-business-tertiary": P(p.tintL, p.tintD),
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
        "--dsw-specific-sidebar-nav-item-active-accent": P(p.tintL, p.tintD),
        "--dsw-specific-sidebar-nav-item-hover": P("#f0eae0", "#2c261f"),
        "--dsw-specific-tip": P("#f5f1e8", "#38312a"),
      };
    }

    // ---- 像素质感 CSS ----
    const CSS = String.raw`
/* ===== dsh-pixel-skin · 像素主题 ===== */
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

/* 四套主题强调色（原创 8-bit 图形，与任天堂无关） */
body[data-pixel-palette="red"]    { --pixel-accent: #d9363e; --pixel-accent-hover: #b92532; --pixel-accent-soft: #ff7474; }
body[data-pixel-palette="blue"]   { --pixel-accent: #3678d4; --pixel-accent-hover: #285cad; --pixel-accent-soft: #72b9ff; }
body[data-pixel-palette="green"]  { --pixel-accent: #45a85a; --pixel-accent-hover: #328344; --pixel-accent-soft: #7bd477; }
body[data-pixel-palette="yellow"] { --pixel-accent: #f2c94c; --pixel-accent-hover: #d7a92f; --pixel-accent-soft: #ffe27a; }

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
  caret-color: var(--pixel-accent);
  background-image: repeating-conic-gradient(rgba(38, 34, 30, .035) 0% 25%, rgba(38, 34, 30, 0) 0% 50%);
  background-size: 8px 8px;
}
body[data-ds-dark-theme] {
  --dsw-shadow-lv1: 2px 2px 0 0 rgba(0, 0, 0, .55);
  --dsw-shadow-lv2: 3px 3px 0 0 rgba(0, 0, 0, .70);
  --dsw-shadow-lv3: 5px 5px 0 0 rgba(0, 0, 0, .82);
  --dsw-mask-blur: blur(0px);
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

/* A · HP 条式状态：运行中的工具卡片 = 战斗中（黄条 + 斜纹扫动） */
[data-status="running"], [data-state="running"] {
  border-left: 3px solid #f2c14e !important;
  background-image: repeating-linear-gradient(45deg, rgba(242, 193, 78, .22) 0 6px, rgba(242, 193, 78, 0) 6px 12px) !important;
  animation: pixel-charge-sweep 1.2s steps(12) infinite !important;
}
@keyframes pixel-charge-sweep {
  from { background-position: 0 0; }
  to   { background-position: 24px 0; }
}
[data-status="success"], [data-state="success"], [data-state="ok"] {
  border-left: 3px solid #4f9d69 !important;
}
[data-status="error"], [data-state="error"] {
  border-left: 3px solid #a0141f !important;
}
/* 对话框本体：输入卡采用 GBA 双描边，四角保留像素化定位标记 */
[data-composer-card] {
  border: 2px solid #26221e !important;
  background: var(--ds-specific-input-major, var(--dsw-specific-input-major)) !important;
  box-shadow: 0 0 0 2px #fffdf8, 0 0 0 4px #26221e, 5px 5px 0 rgba(38, 34, 30, .30) !important;
  padding-top: 10px !important;
}
[data-composer-card]:before,
[data-composer-card]:after {
  content: "";
  position: absolute;
  z-index: 2;
  width: 12px;
  height: 12px;
  pointer-events: none;
  border-color: var(--pixel-accent);
  border-style: solid;
}
[data-composer-card]:before {
  top: -2px;
  left: -2px;
  border-width: 3px 0 0 3px;
}
[data-composer-card]:after {
  right: -2px;
  bottom: -2px;
  border-width: 0 3px 3px 0;
}
body[data-ds-dark-theme] [data-composer-card] {
  border-color: #f5efe6 !important;
  box-shadow: 0 0 0 2px #1c1915, 0 0 0 4px #f5efe6, 5px 5px 0 rgba(0, 0, 0, .62) !important;
}
[data-composer-card] [class*="_input"] {
  color: var(--dsw-alias-label-primary) !important;
  caret-color: var(--pixel-accent) !important;
}
[data-composer-card] [class*="_placeholder"] {
  color: var(--dsw-alias-label-tertiary) !important;
  letter-spacing: .02em;
}
[data-composer-card] [class*="_row"] {
  border-top: 2px solid var(--dsw-alias-line-secondary);
  padding: 6px 10px 2px;
}
[data-composer-card] [class*="_add"],
[data-composer-card] [class*="_select"] {
  border: 1px solid var(--dsw-alias-border-secondary) !important;
  background: var(--dsw-alias-button-floating-fill) !important;
}
[data-composer-card] [class*="_primary"] {
  min-width: 34px;
  min-height: 32px;
  border: 2px solid #26221e !important;
  background: var(--pixel-accent) !important;
  color: #fffdf8 !important;
  box-shadow: 2px 2px 0 rgba(38, 34, 30, .42);
}
[data-composer-card] [class*="_primary"]:hover:not(:disabled) {
  background: var(--pixel-accent-hover) !important;
}
body[data-ds-dark-theme] [data-composer-card] [class*="_primary"] {
  border-color: #f5efe6 !important;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, .65);
}
body[data-pixel-palette="yellow"] [data-composer-card] [class*="_primary"] { color: #26221e !important; }

/* ===== F · 左侧工作区会话：像素化存档列表 ===== */
/* 工作区标题是分组栏，不使用大面积底色，给会话列表留出扫描空间 */
[class*="_sectionHeader"] {
  min-height: 36px;
  border-bottom: 2px solid var(--dsw-alias-border-secondary);
  border-radius: 0 !important;
  color: var(--dsw-alias-label-secondary) !important;
}
[class*="_sectionLabel"] {
  color: var(--dsw-alias-label-secondary) !important;
  font-family: 'Fusion Pixel UI', 'Fusion Pixel Latin', sans-serif;
  letter-spacing: .04em;
}
[class*="_projectRow"] {
  min-height: 34px;
  margin: 4px 0 2px;
  padding: 0 8px !important;
  border: 2px solid transparent;
  border-radius: 0 !important;
  background: transparent !important;
  color: var(--dsw-alias-label-primary) !important;
  font-weight: 600;
}
[class*="_projectRow"]:hover,
[class*="_projectRow"]:focus-within {
  border-color: var(--dsw-alias-border-secondary);
  background: var(--dsw-specific-sidebar-nav-item-hover) !important;
}
[class*="_projectRow"] [class*="_folderActive"] {
  color: var(--pixel-accent) !important;
}
[class*="_projectRow"] [class*="_title"] {
  letter-spacing: .03em;
}
[class*="_sessionRow"] {
  position: relative;
  min-height: 34px;
  height: auto !important;
  margin: 2px 0;
  padding: 4px 8px !important;
  border: 2px solid transparent;
  border-radius: 0 !important;
  background: transparent !important;
  color: var(--dsw-alias-label-primary) !important;
  transition: background-color .12s steps(2), border-color .12s steps(2), transform .12s steps(2);
}
[class*="_sessionRow"]:hover {
  border-color: var(--dsw-alias-border-secondary);
  background: var(--dsw-specific-sidebar-nav-item-hover) !important;
  transform: translateX(2px);
}
[class*="_sessionRow"][class*="_selected"] {
  border-color: var(--pixel-accent) !important;
  background: var(--dsw-specific-sidebar-nav-item-active-accent) !important;
  box-shadow: 3px 3px 0 rgba(38, 34, 30, .22);
  color: var(--dsw-alias-label-primary) !important;
  transform: translateX(2px);
}
[class*="_sessionRow"][class*="_selected"]:before {
  content: "▶";
  position: absolute;
  left: -10px;
  top: 9px;
  color: var(--pixel-accent);
  font-family: 'Fusion Pixel Latin', monospace;
  font-size: 10px;
  line-height: 1;
}
[class*="_sessionRow"] [class*="_dot"] {
  width: 8px !important;
  height: 8px !important;
  border-radius: 0 !important;
  border: 1px solid currentColor;
}
[class*="_sessionRow"] [class*="_title"] {
  min-width: 0;
  color: inherit !important;
  font-size: 14px;
  line-height: 20px;
}
[class*="_sessionRow"] [class*="_time"] {
  color: var(--dsw-alias-label-tertiary) !important;
  font-family: 'Fusion Pixel Mono', 'Fusion Pixel Latin', monospace;
  font-size: 11px;
  line-height: 18px;
}
[class*="_sessionRow"][class*="_selected"] [class*="_time"] {
  color: var(--pixel-accent) !important;
}
button[class*="_newSession"] {
  min-height: 38px;
  border: 2px solid var(--dsw-alias-border-secondary) !important;
  border-radius: 0 !important;
  background: var(--dsw-specific-input-major) !important;
  color: var(--dsw-alias-label-primary) !important;
  box-shadow: 2px 2px 0 rgba(38, 34, 30, .18);
  letter-spacing: .03em;
}
button[class*="_newSession"]:hover:not(:disabled) {
  border-color: var(--pixel-accent) !important;
  background: var(--dsw-specific-sidebar-nav-item-active-accent) !important;
}
button[class*="_newSession"]:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: none;
}
body[data-ds-dark-theme] [class*="_sessionRow"][class*="_selected"] {
  box-shadow: 3px 3px 0 rgba(0, 0, 0, .58);
}
body[data-ds-dark-theme] button[class*="_newSession"] {
  box-shadow: 2px 2px 0 rgba(0, 0, 0, .55);
}

/* 上下文环 = 方形 HP 槽；三段分解条 = 血量段（系统绿 / 工具蓝 / 消息随主题） */
svg[class*="_track"] { stroke: var(--dsw-alias-border-l3) !important; }
svg[class*="_fill"] { stroke: var(--pixel-accent) !important; stroke-linecap: butt !important; }
[class*="_bar"] {
  height: 10px !important;
  border-radius: 0 !important;
  border: 2px solid #26221e;
  background: #26221e !important;
}
body[data-ds-dark-theme] [class*="_bar"] { border-color: #f5efe6; background: #f5efe6 !important; }
[class*="_segment"] { border-radius: 0 !important; }
[class*="_colorSystem"]   { --meter-tint: #4f9d69 !important; }
[class*="_colorTools"]    { --meter-tint: #3964c8 !important; }
[class*="_colorMessages"] { --meter-tint: var(--pixel-accent) !important; }

/* C · GBA 式对话窗边框：两圈细描边 + 小投影（弹窗/菜单/面板） */
[role="dialog"], [class*="_menu"], [class*="_popup"], [class*="_panel"]:not([class*="Hint"]) {
  border: none !important;
  box-shadow: 0 0 0 2px #26221e, 0 0 0 4px #fffdf8, 3px 3px 0 0 rgba(0, 0, 0, .22) !important;
}
body[data-ds-dark-theme] [role="dialog"],
body[data-ds-dark-theme] [class*="_menu"],
body[data-ds-dark-theme] [class*="_popup"],
body[data-ds-dark-theme] [class*="_panel"]:not([class*="Hint"]) {
  box-shadow: 0 0 0 2px #f5efe6, 0 0 0 4px #1c1915, 3px 3px 0 0 rgba(0, 0, 0, .5) !important;
}
/* 选中项 = 高亮黄底（列表选择，不动 toggle） */
[aria-selected="true"], [aria-current="true"] {
  background-color: rgba(242, 193, 78, .22) !important;
  color: #26221e !important;
}

/* D · 像素球加载动画（原创 8-bit 红白像素球，替换圆形 spinner）
   注：_spinner 类名在 DSH ≥0.1.2 中已移除，规则保留以兼容旧版 */
[class*="_spinner"] {
  width: 16px !important;
  height: 16px !important;
  border: none !important;
  border-radius: 0 !important;
  background:
    linear-gradient(#fffdf8 0 0) center/6px 6px no-repeat,
    linear-gradient(#26221e 0 0) center/100% 4px no-repeat,
    conic-gradient(var(--pixel-accent) 0 25%, #fffdf8 0 50%, var(--pixel-accent) 0 75%, #fffdf8 0) 0 0/100% 100% no-repeat;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, .3);
  animation: pixel-ball-bounce .6s steps(4) infinite !important;
}
@keyframes pixel-ball-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
/* 发送/判定进行中的 pending 圆点（空 div）也换成像素球；带文字的徽章不受影响 */
[class*="_pending"]:empty {
  width: 12px !important;
  height: 12px !important;
  border-radius: 0 !important;
  background:
    linear-gradient(#fffdf8 0 0) center/5px 5px no-repeat,
    linear-gradient(#26221e 0 0) center/100% 3px no-repeat,
    conic-gradient(var(--pixel-accent) 0 25%, #fffdf8 0 50%, var(--pixel-accent) 0 75%, #fffdf8 0) 0 0/100% 100% no-repeat;
  animation: pixel-ball-bounce .6s steps(4) infinite !important;
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

/* Markdown、终端、Diff、Read 等复制按钮统一高对比，避免深色代码底上出现黑字
   注：_copyButton 类名在 DSH ≥0.1.2 中已移除，规则保留以兼容旧版 */
[class*="_copyButton"] {
  box-sizing: border-box;
  min-height: 24px;
  padding: 2px 8px !important;
  color: #f5efe6 !important;
  background: #2d3548 !important;
  border: 1px solid #f2c14e !important;
  font: 15px/20px var(--ds-font-family-code) !important;
  text-shadow: none !important;
  box-shadow: 2px 2px 0 rgba(37, 43, 69, .45);
}
[class*="_copyButton"]:hover:not(:disabled) {
  color: #26221e !important;
  background: #f2c14e !important;
  border-color: var(--pixel-accent) !important;
}

/* 发送按钮：只改 composer 的 primary send，不影响其它 info 按钮 */
[class*="_primary"] {
  background: var(--pixel-accent) !important;
  color: #fffdf8 !important;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, .35);
}
[class*="_primary"]:hover:not(:disabled) {
  background: var(--pixel-accent-hover) !important;
}
body[data-pixel-palette="yellow"] [class*="_primary"] { color: #26221e !important; }

/* 像素按下位移 */
button:active:not(:disabled) { transform: translate(2px, 2px); transition: none; }

/* 方形滚动条 */
::-webkit-scrollbar { width: 12px; height: 12px; }
::-webkit-scrollbar-thumb { border-radius: 0 !important; }

/* 选区 + 焦点环 */
::selection { background: var(--pixel-accent); color: #fffdf8; }
body[data-pixel-palette="yellow"] ::selection { color: #26221e; }
body[data-ds-dark-theme] ::selection { background: var(--pixel-accent-soft); color: #1c1915; }
body[data-pixel-palette="yellow"][data-ds-dark-theme] ::selection { color: #26221e; }
:focus-visible { outline: 2px solid var(--pixel-accent); outline-offset: 0; }

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

/* 能力等级面板：GBA 双描边、EXP 经验条和 HP 段 */
.pixel-effort-host { position: fixed; z-index: 10000; pointer-events: none; }
.pixel-effort-panel { width: min(286px, calc(100vw - 20px)); pointer-events: auto; box-sizing: border-box; padding: 12px; color: #172a4a; background: #fffdf2; border: 2px solid #172a4a; box-shadow: 0 0 0 2px #f8d96a, 0 0 0 4px #172a4a, 4px 4px 0 rgba(18,34,60,.36); font-family: 'Fusion Pixel UI', 'Fusion Pixel Latin', sans-serif; image-rendering: pixelated; }
.pixel-effort-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
.pixel-effort-title { font-size: 15px; line-height: 22px; font-weight: 600; }
.pixel-effort-value { color: var(--pixel-effort-color); font-size: 13px; line-height: 20px; white-space: nowrap; }
.pixel-effort-description { min-height: 18px; margin: -2px 0 7px; color: #52627a; font-size: 11px; line-height: 17px; }
.pixel-effort-track { position: relative; height: 28px; padding: 5px; border: 2px solid #172a4a; background: #172a4a; box-sizing: border-box; }
.pixel-effort-cells { display: flex; gap: 2px; width: 100%; height: 100%; pointer-events: none; }
.pixel-effort-cell { flex: 1 1 0; min-width: 4px; border: 1px solid #52627a; background: #0d1a30; box-sizing: border-box; }
.pixel-effort-cell.is-filled { background: var(--pixel-effort-color); border-color: #fffdf8; }
.pixel-effort-cell.is-current { border-top: 2px solid #fffdf8; }
.pixel-effort-range { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; opacity: 0; cursor: ew-resize; }
.pixel-effort-arrow { position: absolute; z-index: 3; top: -12px; left: calc(var(--pixel-effort-position) - 5px); color: #fffdf8; font-family: monospace; font-size: 12px; line-height: 12px; animation: pixel-effort-bounce .55s steps(2) infinite; pointer-events: none; }
@keyframes pixel-effort-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.pixel-effort-labels { display: flex; justify-content: space-between; gap: 4px; margin-top: 5px; color: #52627a; font-size: 10px; line-height: 15px; }
.pixel-effort-label { overflow: hidden; flex: 1 1 0; text-overflow: ellipsis; white-space: nowrap; }
.pixel-effort-label:last-child { text-align: right; }
.pixel-effort-status { padding-top: 7px; color: #52627a; font-size: 11px; line-height: 17px; }
.pixel-effort-error { color: #a0141f; }
.pixel-effort-declare { margin-top: 9px; padding-top: 8px; border-top: 2px solid #b9c7d8; }
.pixel-effort-declare-hint { display: block; margin-bottom: 7px; color: #52627a; font-size: 10px; line-height: 15px; }
.pixel-effort-declare-button { padding: 5px 9px; color: #172a4a; background: #f8d96a; border: 2px solid #172a4a; box-shadow: 2px 2px 0 rgba(18,34,60,.36); font: inherit; font-size: 11px; cursor: pointer; }
.pixel-effort-declare-button:hover:not(:disabled) { background: #ffe78e; }
.pixel-effort-declare-button:disabled { opacity: .6; cursor: progress; }
.pixel-effort-menu-entry { display: flex; width: 100%; min-height: 30px; box-sizing: border-box; margin-top: 4px; padding: 6px 8px; color: #172a4a; background: #fffdf2; border: 0; font-family: inherit; font-size: 12px; line-height: 17px; text-align: left; cursor: pointer; }
.pixel-effort-menu-entry:hover { background: #e5f2ff; }
body[data-ds-dark-theme] .pixel-effort-panel { color: #fffdf2; background: #172a4a; border-color: #fffdf2; box-shadow: 0 0 0 2px #f8d96a, 0 0 0 4px #fffdf2, 4px 4px 0 rgba(5,14,30,.72); }
body[data-ds-dark-theme] .pixel-effort-description, body[data-ds-dark-theme] .pixel-effort-labels, body[data-ds-dark-theme] .pixel-effort-status, body[data-ds-dark-theme] .pixel-effort-declare-hint { color: #b8ac9c; }
body[data-ds-dark-theme] .pixel-effort-declare { border-top-color: #52627a; }
body[data-ds-dark-theme] .pixel-effort-menu-entry { color: #fffdf2; background: #172a4a; }
body[data-ds-dark-theme] .pixel-effort-menu-entry:hover { background: #24456f; }

/* 像素皮肤设置分区（settings.section） */
.pixel-skin-section { display: flex; flex-direction: column; gap: 14px; padding: 2px 2px 14px; }
.pixel-skin-card { box-sizing: border-box; padding: 12px 14px; color: #172a4a; background: #fffdf2; border: 2px solid #172a4a; box-shadow: 0 0 0 2px #f8d96a, 4px 4px 0 rgba(18,34,60,.28); }
.pixel-skin-card-title { margin: 0 0 10px; font-size: 14px; line-height: 22px; font-weight: 600; }
.pixel-skin-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.pixel-skin-hint { flex-basis: 100%; color: #52627a; font-size: 11px; line-height: 17px; }
.pixel-skin-swatch { box-sizing: border-box; width: 34px; height: 34px; padding: 0; border: 2px solid transparent; color: #172a4a; font-family: inherit; font-size: 15px; line-height: 30px; cursor: pointer; }
.pixel-skin-swatch.is-selected { border-color: #172a4a; box-shadow: 2px 2px 0 rgba(18,34,60,.45); }
.pixel-skin-status { box-sizing: border-box; min-height: 28px; padding: 2px 10px; border: 2px solid #172a4a; background: #fffdf2; color: #172a4a; font-family: inherit; font-size: 13px; line-height: 20px; cursor: pointer; }
.pixel-skin-status.is-selected { background: #172a4a; color: #fffdf2; box-shadow: 2px 2px 0 rgba(18,34,60,.45); }
.pixel-skin-effort { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 3px; border: 2px solid #172a4a; background: #fffdf2; cursor: pointer; }
.pixel-skin-effort.is-selected { outline: 2px solid #e23246; outline-offset: 1px; }
.pixel-skin-effort-strip { width: 56px; height: 16px; border: 1px solid #172a4a; image-rendering: pixelated; }
.pixel-skin-effort-label { font-size: 11px; line-height: 15px; color: #52627a; }
.pixel-skin-custom { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 3px; border: 2px solid #172a4a; background: #fffdf2; cursor: pointer; }
.pixel-skin-color-input { box-sizing: border-box; width: 56px; height: 16px; padding: 0; border: 1px solid #172a4a; background: none; cursor: pointer; }
body[data-ds-dark-theme] .pixel-skin-card { color: #fffdf2; background: #172a4a; border-color: #fffdf2; box-shadow: 0 0 0 2px #f8d96a, 4px 4px 0 rgba(5,14,30,.72); }
body[data-ds-dark-theme] .pixel-skin-hint, body[data-ds-dark-theme] .pixel-skin-effort-label { color: #9fb4d0; }
body[data-ds-dark-theme] .pixel-skin-swatch { color: #fffdf2; }
body[data-ds-dark-theme] .pixel-skin-swatch.is-selected { border-color: #f8d96a; }
body[data-ds-dark-theme] .pixel-skin-status { border-color: #fffdf2; background: #172a4a; color: #fffdf2; }
body[data-ds-dark-theme] .pixel-skin-status.is-selected { background: #f8d96a; color: #172a4a; }
body[data-ds-dark-theme] .pixel-skin-effort, body[data-ds-dark-theme] .pixel-skin-custom { border-color: #fffdf2; background: #172a4a; }
body[data-ds-dark-theme] .pixel-skin-effort.is-selected { outline-color: #f8d96a; }
body[data-ds-dark-theme] .pixel-skin-effort-strip, body[data-ds-dark-theme] .pixel-skin-color-input { border-color: #fffdf2; }
`;

    // ---- 本地开关 ----
    function storageGet(key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* 隐私模式等场景忽略 */ }
    }
    function readPalette() {
      const saved = storageGet("pixel-skin:palette");
      return PALETTES[saved] !== undefined ? saved : "red";
    }
    function readStatusPhrase() {
      const saved = storageGet("pixel-skin:status");
      return STATUS_PHRASES[saved] !== undefined ? saved : "idle";
    }
    function currentStatusText() {
      const lang = (typeof navigator !== "undefined" && String(navigator.language).toLowerCase().startsWith("zh")) ? "zh" : "en";
      return STATUS_PHRASES[readStatusPhrase()][lang];
    }

    // 替换回合状态句："Deep diving..." / "深度求索中..." → 当前短语（保留后面的时长后缀）
    // DSH ≥0.1.2 将文本国际化为 t("chat.deepDiving")，中文环境变为"深度求索中..."
    function installStatusSwapper() {
      if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => {};
      const NEEDLE = /Deep diving\.\.\.|深度求索中\.\.\./;

      function swapOne(el) {
        const text = el.textContent || "";
        if (!NEEDLE.test(text)) return;
        el.setAttribute("data-pixel-status", "swapped");
        el.textContent = text.replace(NEEDLE, currentStatusText());
      }
      function swapAll() {
        const nodes = document.querySelectorAll('[role="status"]');
        for (const el of nodes) {
          if (el.getAttribute("data-pixel-status") === "swapped") {
            // 时长在跳动时 React 会重写文本，持续观察并还原短语
            const text = el.textContent || "";
            if (NEEDLE.test(text)) el.textContent = text.replace(NEEDLE, currentStatusText());
          } else {
            swapOne(el);
          }
        }
      }
      const mo = new MutationObserver(() => { swapAll(); });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
      swapAll();
      return () => { mo.disconnect(); };
    }

    function installConsoleApi(ctx) {
      if (typeof window === "undefined") return;
      window.__PIXELSKIN__ = {
        palette(id) {
          if (PALETTES[id] === undefined) {
            console.log("[dsh-pixel-skin] 未知主题：" + id + "，可用：" + PALETTE_IDS.join("/"));
            return;
          }
          storageSet("pixel-skin:palette", id);
          document.body.setAttribute("data-pixel-palette", id);
          ctx.theme.overrideTokens("dsh-pixel-skin", buildTokens(PALETTES[id]));
        },
        palettes() { return PALETTE_IDS.slice(); },
        status(id) {
          if (STATUS_PHRASES[id] === undefined) {
            console.log("[dsh-pixel-skin] 未知状态短语：" + id + "，可用：" + STATUS_IDS.join("/"));
            return;
          }
          storageSet("pixel-skin:status", id);
          const nodes = document.querySelectorAll('[role="status"][data-pixel-status="swapped"]');
          const text = currentStatusText();
          for (const el of nodes) el.textContent = text;
        },
        statuses() { return STATUS_IDS.slice(); },
        effortPalette(id) {
          if (EFFORT_PALETTES[id] === undefined) {
            console.log("[dsh-pixel-skin] 未知滑块配色：" + id + "，可用：" + EFFORT_PALETTE_IDS.join("/"));
            return;
          }
          storageSet("pixel-skin:effort-palette", id);
        },
        effortCustom(color) {
          storageSet("pixel-skin:effort-palette", "custom");
          storageSet("pixel-skin:effort-custom", String(color));
        },
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

    // ---- 能力滑块配色：预设色带 + 自定义取色（localStorage 持久化）----
    const EFFORT_PALETTES = {
      blue: {
        label: { zh: "蓝系", en: "Blue" },
        stops: [
          [0, [214, 230, 251]], [1 / 6, [184, 210, 247]], [2 / 6, [147, 181, 239]],
          [3 / 6, [107, 148, 228]], [4 / 6, [74, 116, 210]], [5 / 6, [51, 90, 168]], [1, [42, 70, 120]],
        ],
      },
      green: {
        label: { zh: "绿系", en: "Green" },
        stops: [
          [0, [223, 242, 214]], [1 / 6, [191, 229, 178]], [2 / 6, [155, 211, 140]],
          [3 / 6, [116, 186, 102]], [4 / 6, [84, 158, 74]], [5 / 6, [58, 124, 52]], [1, [40, 92, 40]],
        ],
      },
      ember: {
        label: { zh: "红橙", en: "Ember" },
        stops: [
          [0, [250, 220, 204]], [1 / 6, [248, 196, 168]], [2 / 6, [243, 164, 124]],
          [3 / 6, [234, 128, 86]], [4 / 6, [216, 92, 56]], [5 / 6, [186, 66, 40]], [1, [148, 48, 32]],
        ],
      },
    };
    const EFFORT_PALETTE_IDS = Object.keys(EFFORT_PALETTES);
    const EFFORT_LIGHT = [255, 255, 255];

    function hexRgb(hex) {
      const raw = String(hex).replace("#", "");
      const full = raw.length === 3 ? raw.split("").map(c => c + c).join("") : raw;
      const n = parseInt(full, 16);
      if (!Number.isFinite(n) || full.length !== 6) return [240, 160, 48];
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function mixRgb(from, to, amount) {
      return from.map((v, i) => Math.round(v + (to[i] - v) * amount));
    }
    function customStops(hex) {
      const base = hexRgb(hex);
      const darkTarget = base.map(v => Math.round(v * 0.42));
      return [
        [0, mixRgb(base, EFFORT_LIGHT, 0.5)],
        [1 / 6, mixRgb(base, EFFORT_LIGHT, 0.32)],
        [2 / 6, mixRgb(base, EFFORT_LIGHT, 0.14)],
        [3 / 6, base],
        [4 / 6, mixRgb(base, darkTarget, 0.25)],
        [5 / 6, mixRgb(base, darkTarget, 0.4)],
        [1, mixRgb(base, darkTarget, 0.55)],
      ];
    }
    function readEffortChoice() {
      const saved = storageGet("pixel-skin:effort-palette");
      if (saved === "custom") return { mode: "custom", color: storageGet("pixel-skin:effort-custom") || "#f0a030" };
      return { mode: EFFORT_PALETTES[saved] !== undefined ? saved : "blue" };
    }
    function effortStops(choice) {
      return choice.mode === "custom" ? customStops(choice.color) : EFFORT_PALETTES[choice.mode].stops;
    }
    function gradientCss(stops) {
      return "linear-gradient(90deg, " + stops
        .map(([at, rgb]) => `rgb(${rgb.join(",")}) ${Math.round(at * 100)}%`)
        .join(", ") + ")";
    }

    // ---- 设置分区：像素皮肤（settings.section）----
    function settingsCopy() {
      const zh = String((typeof navigator !== "undefined" && navigator.language) || "").toLowerCase().startsWith("zh");
      return {
        paletteTitle: zh ? "像素主题色" : "Pixel palette",
        paletteHint: zh ? "切换强调色，立即生效并保存。" : "Switch accent color; applies instantly and persists.",
        statusTitle: zh ? "回合状态句" : "Turn status",
        statusHint: zh ? "思考中的状态文案。" : "The status line shown while thinking.",
        effortTitle: zh ? "能力滑块配色" : "Slider palette",
        effortHint: zh ? "推理等级滑块按所选单色色带由浅到深渐深，最深仍保持可见颜色。" : "The effort slider deepens from light to dark along the selected single-hue ramp.",
        customLabel: zh ? "自定义" : "Custom",
        customHint: zh ? "取色后自动生成由浅到深的七档单色渐变。" : "Picking a color builds a light-to-dark seven-step ramp of that hue.",
      };
    }

    const STATUS_LABELS = {
      idle: { zh: "待机", en: "Idle" },
      charge: { zh: "蓄力中", en: "Charge" },
      move: { zh: "出招中", en: "Move" },
      evolve: { zh: "进化中", en: "Evolve" },
    };

    function PixelSkinSection() {
      const [current, setCurrent] = React.useState(readPalette());
      const [statusId, setStatusId] = React.useState(readStatusPhrase());
      const [effortChoice, setEffortChoice] = React.useState(readEffortChoice());
      const copy = settingsCopy();
      const zh = String((typeof navigator !== "undefined" && navigator.language) || "").toLowerCase().startsWith("zh");
      const card = (title, body) => React.createElement(
        "section",
        { className: "pixel-skin-card" },
        React.createElement("h3", { className: "pixel-skin-card-title" }, title),
        body,
      );
      const customHex = effortChoice.mode === "custom" ? effortChoice.color : "#f0a030";
      return React.createElement(
        "div",
        { className: "pixel-skin-section" },
        card(copy.paletteTitle, React.createElement("div", { className: "pixel-skin-row" },
          PALETTE_IDS.map((id) => React.createElement(
            "button",
            {
              key: id,
              type: "button",
              className: "pixel-skin-swatch" + (current === id ? " is-selected" : ""),
              style: { background: PALETTES[id].accent },
              "aria-pressed": current === id,
              "aria-label": PALETTES[id].en,
              title: PALETTES[id].label,
              onClick: () => {
                if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.palette(id);
                setCurrent(id);
              },
            },
            PALETTES[id].label,
          )),
          React.createElement("span", { className: "pixel-skin-hint" }, copy.paletteHint),
        )),
        card(copy.statusTitle, React.createElement("div", { className: "pixel-skin-row" },
          STATUS_IDS.map((id) => React.createElement(
            "button",
            {
              key: id,
              type: "button",
              className: "pixel-skin-status" + (statusId === id ? " is-selected" : ""),
              "aria-pressed": statusId === id,
              onClick: () => {
                if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.status(id);
                setStatusId(id);
              },
            },
            STATUS_LABELS[id][zh ? "zh" : "en"],
          )),
          React.createElement("span", { className: "pixel-skin-hint" }, copy.statusHint),
        )),
        card(copy.effortTitle, React.createElement("div", null,
          React.createElement("div", { className: "pixel-skin-row" },
            EFFORT_PALETTE_IDS.map((id) => {
              const selected = effortChoice.mode === id;
              return React.createElement(
                "button",
                {
                  key: id,
                  type: "button",
                  className: "pixel-skin-effort" + (selected ? " is-selected" : ""),
                  "aria-pressed": selected,
                  onClick: () => {
                    if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.effortPalette(id);
                    setEffortChoice({ mode: id });
                  },
                },
                React.createElement("span", { className: "pixel-skin-effort-strip", style: { background: gradientCss(EFFORT_PALETTES[id].stops) } }),
                React.createElement("span", { className: "pixel-skin-effort-label" }, EFFORT_PALETTES[id].label[zh ? "zh" : "en"]),
              );
            }),
            React.createElement(
              "label",
              { className: "pixel-skin-custom" },
              React.createElement("input", {
                type: "color",
                className: "pixel-skin-color-input",
                value: customHex,
                "aria-label": copy.customLabel,
                onChange: (event) => {
                  const color = event.target.value;
                  if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.effortCustom(color);
                  setEffortChoice({ mode: "custom", color });
                },
              }),
              React.createElement("span", { className: "pixel-skin-effort-label" }, copy.customLabel),
            ),
          ),
          React.createElement("span", { className: "pixel-skin-hint" }, effortChoice.mode === "custom" ? copy.customHint : copy.effortHint),
        )),
      );
    }

    const EFFORT_LABELS = new Set(["推理等级", "Effort", "Reasoning effort"]);

    function panelCopy() {
      const zh = String(document.documentElement.lang || navigator.language || "").toLowerCase().startsWith("zh");
      return zh ? {
        title: "能力等级", loading: "正在读取模型能力…", empty: "当前模型未提供可调节的能力等级。", error: "无法更新能力等级。",
        autoHint: "此模型没有声明推理档位，可按模型家族补全配置。", autoButton: "补全图鉴", autoEntry: "补全图鉴", autoWorking: "正在补全并写入配置…", bridgeFail: "当前环境无法触发补全。",
      } : {
        title: "Ability level", loading: "Loading model capabilities…", empty: "This model provides no adjustable ability level.", error: "Unable to update ability level.",
        autoHint: "This model declares no reasoning efforts. Fill its provider entry by model family.", autoButton: "Fill Pokédex", autoEntry: "Fill Pokédex", autoWorking: "Filling and writing configuration…", bridgeFail: "Cannot trigger completion in this environment.",
      };
    }

    function currentModel(directory) {
      if (directory === null || directory?.current === null) return null;
      for (const group of directory.groups || []) {
        const model = (group.models || []).find(candidate => candidate.id === directory.current.model);
        if (group.id === directory.current.provider && model !== undefined) return { group, model, current: directory.current };
      }
      return null;
    }

    function effortColor(index, count) {
      const t = count <= 1 ? 0 : index / (count - 1);
      const stops = effortStops(readEffortChoice());
      for (let i = 1; i < stops.length; i += 1) {
        if (t <= stops[i][0]) {
          const [fromAt, from] = stops[i - 1]; const [toAt, to] = stops[i];
          const ratio = (t - fromAt) / (toAt - fromAt);
          return `rgb(${from.map((v, j) => Math.round(v + (to[j] - v) * ratio)).join(", ")})`;
        }
      }
      const last = stops[stops.length - 1][1];
      return `rgb(${last.join(", ")})`;
    }

    function EffortPanel({ resolver, remote, sessionId }) {
      const [directory, setDirectory] = React.useState(null);
      const [error, setError] = React.useState(null);
      const [rawValue, setRawValue] = React.useState(0);
      const [dragging, setDragging] = React.useState(false);
      const [declaring, setDeclaring] = React.useState(false);
      const lastWrite = React.useRef(0);
      const modelDirRef = React.useRef(null);
      const copy = panelCopy();
      // 官方 modelDirectories 服务：directory.store 订阅 + load()。
      // DSH ≥0.1.2 移除了 connection.api，当前选择/目录只能经
      // ctx.modelDirectories.directoryFor(sessionId) 获取（与官方档位行同源）。
      React.useEffect(() => {
        let alive = true;
        let unsubscribe = null;
        try {
          const dir = resolver.directoryFor(sessionId);
          unsubscribe = dir.store.subscribe(() => { if (alive) setDirectory(dir.store.getSnapshot()); });
          modelDirRef.current = dir;
          dir.load().then(() => {
            if (alive) setDirectory(dir.store.getSnapshot());
          }).catch(cause => { if (alive) setError(cause instanceof Error ? cause.message : String(cause)); });
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
        return () => { alive = false; if (unsubscribe) unsubscribe(); modelDirRef.current = null; };
      }, [resolver, sessionId]);
      const selection = currentModel(directory);
      const efforts = selection?.model.reasoning?.efforts || [];
      const effective = selection?.current.reasoningEffort ?? selection?.model.reasoning?.defaultEffort;
      const selected = Math.max(0, efforts.findIndex(effort => effort.id === effective));
      const step = efforts.length > 1 ? 100 / (efforts.length - 1) : 100;
      const usable = selection !== null && efforts.length > 1;
      React.useLayoutEffect(() => { setRawValue(usable ? selected * step : 0); setDragging(false); }, [selected, step, usable]);
      const writeEffort = React.useCallback(value => {
        const dir = modelDirRef.current;
        if (!usable || selection === null || dir === null) return;
        const index = Math.min(efforts.length - 1, Math.max(0, Math.round(value / step)));
        const effort = efforts[index];
        if (effort === undefined) return;
        dir.select({ provider: selection.current.provider, model: selection.current.model, reasoningEffort: effort.id }).then(() => {
          setError(null);
        }).catch(cause => setError(cause instanceof Error ? cause.message : String(cause)));
      }, [efforts, selection, step, usable]);
      const onInput = event => {
        const value = Number(event.target.value); setRawValue(value);
        const now = performance.now();
        if (now - lastWrite.current >= 16) { lastWrite.current = now; writeEffort(value); }
      };
      const commit = event => { const index = Math.round(Number(event.target.value) / step); const value = index * step; setRawValue(value); setDragging(false); writeEffort(value); };
      const runDeclare = async () => {
        if (selection === null) return;
        setDeclaring(true); setError(null);
        try {
          const commands = remote?.commands;
          if (!commands) throw new Error(copy.bridgeFail);
          const result = await commands.execute(sessionId, `/pixel-declare ${selection.group.id}`, []);
          if (!result?.result || result.result.kind !== "success") throw new Error(result?.result?.text || copy.error);
          const dir = modelDirRef.current;
          if (dir) {
            const snapshot = await dir.load();
            setDirectory(snapshot);
          }
        } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
        finally { setDeclaring(false); }
      };
      const ready = directory !== null && (directory.status === "ready" || directory.status === "selecting");
      if (!ready && error === null) return React.createElement("div", { className: "pixel-effort-status" }, copy.loading);
      if (!ready && error !== null) return React.createElement("div", { className: "pixel-effort-status pixel-effort-error", role: "alert" }, `${copy.error} ${error}`);
      if (selection === null) return React.createElement("div", { className: "pixel-effort-status" }, copy.empty);
      if (efforts.length === 0) return React.createElement("div", { className: "pixel-effort-panel", role: "dialog", "aria-label": copy.title },
        React.createElement("div", { className: "pixel-effort-heading" }, React.createElement("span", { className: "pixel-effort-title" }, copy.title), React.createElement("span", { className: "pixel-effort-value" }, "—")),
        React.createElement("div", { className: "pixel-effort-status" }, copy.empty),
        React.createElement("div", { className: "pixel-effort-declare" }, React.createElement("span", { className: "pixel-effort-declare-hint" }, declaring ? copy.autoWorking : copy.autoHint), React.createElement("button", { type: "button", className: "pixel-effort-declare-button", disabled: declaring, onClick: () => void runDeclare() }, copy.autoButton)),
        error ? React.createElement("div", { className: "pixel-effort-status pixel-effort-error", role: "alert" }, `${copy.error} ${error}`) : null);
      if (efforts.length === 1) return React.createElement("div", { className: "pixel-effort-status" }, `${copy.title}: ${efforts[0].name || efforts[0].id}`);
      const index = Math.min(efforts.length - 1, Math.max(0, Math.round(rawValue / step)));
      const level = efforts[index]; const color = effortColor(index, efforts.length); const position = `${rawValue}%`;
      return React.createElement("div", { className: "pixel-effort-panel", role: "dialog", "aria-label": copy.title, style: { "--pixel-effort-color": color, "--pixel-effort-position": position } },
        React.createElement("div", { className: "pixel-effort-heading" }, React.createElement("span", { className: "pixel-effort-title" }, copy.title), React.createElement("span", { className: "pixel-effort-value", "aria-live": "polite" }, level.name || level.id)),
        level.description ? React.createElement("div", { className: "pixel-effort-description" }, level.description) : null,
        React.createElement("div", { className: "pixel-effort-track" }, React.createElement("div", { className: "pixel-effort-cells", "aria-hidden": true }, efforts.map((effort, cellIndex) => React.createElement("span", { className: `pixel-effort-cell${cellIndex <= index ? " is-filled" : ""}${cellIndex === index ? " is-current" : ""}`, key: effort.id }))), React.createElement("span", { className: "pixel-effort-arrow", "aria-hidden": true }, "▼"), React.createElement("input", { className: "pixel-effort-range", type: "range", min: 0, max: 100, step: 1, value: rawValue, "aria-label": copy.title, "aria-valuetext": level.name || level.id, onInput, onPointerDown: () => setDragging(true), onPointerUp: commit, onPointerLeave: () => setDragging(false), onBlur: commit, onKeyUp: event => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) commit(event); } })),
        React.createElement("div", { className: "pixel-effort-labels", "aria-hidden": true }, efforts.map(effort => React.createElement("span", { className: "pixel-effort-label", key: effort.id }, effort.name || effort.id))),
        error ? React.createElement("div", { className: "pixel-effort-status pixel-effort-error", role: "alert" }, `${copy.error} ${error}`) : null);
    }

    function installEffortPicker(ctx) {
      const resolver = ctx.get("modelDirectories"); const sessions = ctx.get("sessions");
      if (!resolver || !sessions || typeof document === "undefined") return () => {};
      const host = document.createElement("div"); host.className = "pixel-effort-host"; document.body.appendChild(host);
      let root = null; let hiddenMenu = null;
      const hide = () => { if (hiddenMenu) hiddenMenu.style.display = ""; hiddenMenu = null; root?.unmount(); root = null; host.replaceChildren(); };
      const show = (sessionId, anchor, menu) => {
        const rect = (menu || anchor).getBoundingClientRect(); const width = Math.min(286, window.innerWidth - 20);
        const left = Math.max(10, Math.min(rect.left, window.innerWidth - width - 10)); const top = Math.max(10, Math.min(rect.top, window.innerHeight - 210));
        if (menu) { menu.style.display = "none"; hiddenMenu = menu; }
        host.style.left = `${left}px`; host.style.top = `${top}px`; if (!root) root = createRoot(host);
        root.render(React.createElement(EffortPanel, { resolver, remote: ctx.get("remote") || undefined, sessionId }));
      };
      const addAutoEntry = sessionId => {
        let directory;
        try { directory = resolver.directoryFor(sessionId); } catch { return Promise.resolve(); }
        return directory.load().then(snapshot => {
          const selection = currentModel(snapshot);
          if (!selection || (selection.model.reasoning?.efforts || []).length) return;
          const menu = Array.from(document.querySelectorAll('[role="menu"]')).find(element => element.offsetParent !== null && Array.from(element.querySelectorAll('button[role="menuitem"]')).some(button => /^(模型|Model)$/.test((button.textContent || "").trim())));
          if (!menu || menu.querySelector("[data-pixel-effort-entry]") !== null) return;
          const entry = document.createElement("button"); entry.type = "button"; entry.setAttribute("role", "menuitem"); entry.dataset.pixelEffortEntry = ""; entry.className = "pixel-effort-menu-entry"; entry.textContent = panelCopy().autoEntry; menu.appendChild(entry);
        }).catch(() => {});
      };;
      const onClick = event => {
        const target = event.target instanceof Element ? event.target : null; if (!target || host.contains(target)) return;
        const sessionId = sessions.list.getSnapshot().current; if (sessionId === undefined) return;
        const auto = target.closest("[data-pixel-effort-entry]"); if (auto) { event.preventDefault(); event.stopPropagation(); show(sessionId, auto, auto.closest('[role="menu"]')); return; }
        const trigger = target.closest('button[aria-haspopup="menu"]'); if (trigger) setTimeout(() => addAutoEntry(sessionId), 0);
        const row = target.closest('button[role="menuitem"]'); if (!row) { hide(); return; }
        const menu = row.closest('[role="menu"]'); const text = (row.textContent || "").trim();
        if (![...EFFORT_LABELS].some(value => text.startsWith(value))) return;
        event.preventDefault(); event.stopPropagation(); show(sessionId, row, menu);
      };
      document.addEventListener("click", onClick, true);
      return () => { document.removeEventListener("click", onClick, true); hide(); host.remove(); };
    }

    // ---- 插件体 ----
    const inject = ["slots", "theme", "sessions", "modelDirectories"];

    function apply(ctx) {
      if (storageGet("pixel-skin:enabled") === "0") return; // 用户已停用

      installConsoleApi(ctx);

      // 扫描线状态恢复
      if (storageGet("pixel-skin:scanlines") === "1") {
        document.body.setAttribute("data-pixel-scanlines", "on");
      }

      // 主题恢复 + token 层（切换时重放同 source 层即替换）
      const palette = readPalette();
      document.body.setAttribute("data-pixel-palette", palette);
      let disposeTokens = ctx.theme.overrideTokens("dsh-pixel-skin", buildTokens(PALETTES[palette]));
      ctx.effect(() => () => { disposeTokens(); }, "pixel-skin: token layer");

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

      // 回合状态句替换（战斗中…/出招中…/蓄力中…）
      ctx.effect(() => installStatusSwapper(), "pixel-skin: status swapper");

      // 模型选择器的能力等级面板与自动补全入口
      ctx.effect(() => installEffortPicker(ctx), "pixel-skin: effort picker");

      // 设置分区：像素皮肤（独立于通用设置）
      ctx.effect(
        () => ctx.slots.inject("settings.section", () => ctx.slots.register(
          {
            name: "settings.section",
            id: "pixel-skin",
            order: 5,
            label: () => (String((typeof navigator !== "undefined" && navigator.language) || "").toLowerCase().startsWith("zh") ? "像素皮肤" : "Pixel skin"),
          },
          PixelSkinSection,
        )),
        "pixel-skin: settings section",
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
