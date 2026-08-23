/**
 * dsh-pixel-skin — 红白机像素风皮肤 · client half（宝可梦风味四色版）
 *
 * 实现方式（全部走官方扩展点）：
 *   1. ctx.theme.overrideTokens('dsh-pixel-skin', buildTokens(palette)) ——
 *      四套可切换配色（红/蓝/绿/黄），浅深各一套；切换即重放同 source 层。
 *   2. 自有 <style>（ctx.effect 管理生命周期）：像素字体、直角、硬阴影、
 *      HP 条式状态、GBA 式窗框、像素球加载动画、扫描线（可选）。
 *   3. settings.general.item 注册「像素主题色」卡片（4 个色块按钮）。
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

    // ---- 四套配色（御三家印象：红/蓝/绿/黄）----
    const PALETTES = {
      red: {
        label: "红", en: "Red",
        accent: "#cf1f2e", hover: "#b31827", soft: "#ff6b6b",
        onAccentL: "#fffdf8", onAccentD: "#14100d",
        tintL: "#fdecea", tintD: "#3a1a17",
      },
      blue: {
        label: "蓝", en: "Blue",
        accent: "#3964c8", hover: "#2e50a8", soft: "#7ea6ff",
        onAccentL: "#fffdf8", onAccentD: "#101b33",
        tintL: "#e8effb", tintD: "#1c2b4a",
      },
      green: {
        label: "绿", en: "Green",
        accent: "#3f9d5f", hover: "#2f7d52", soft: "#69c28a",
        onAccentL: "#fffdf8", onAccentD: "#0f2417",
        tintL: "#e6f4e6", tintD: "#16331b",
      },
      yellow: {
        label: "黄", en: "Yellow",
        accent: "#f7c531", hover: "#d9a81f", soft: "#ffd84d",
        onAccentL: "#26221e", onAccentD: "#26221e",
        tintL: "#fdf3d8", tintD: "#332b12",
      },
    };
    const PALETTE_IDS = Object.keys(PALETTES);

    const INK = "#26221e";
    const PAPER = "#f5efe6";
    const P = (light, dark) => ({ light: light, dark: dark });

    // 回合状态短语（"Deep diving..." 硬编码在 ChatView，皮肤用 DOM 观察器替换；
    // 均为通用游戏词汇，与任天堂无关）
    const STATUS_PHRASES = {
      battle: { zh: "战斗中…", en: "In battle..." },
      move: { zh: "正在出招…", en: "Using a move..." },
      charge: { zh: "正在蓄力…", en: "Charging up..." },
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
body[data-pixel-palette="red"]    { --pixel-accent: #cf1f2e; --pixel-accent-hover: #b31827; --pixel-accent-soft: #ff6b6b; }
body[data-pixel-palette="blue"]   { --pixel-accent: #3964c8; --pixel-accent-hover: #2e50a8; --pixel-accent-soft: #7ea6ff; }
body[data-pixel-palette="green"]  { --pixel-accent: #3f9d5f; --pixel-accent-hover: #2f7d52; --pixel-accent-soft: #69c28a; }
body[data-pixel-palette="yellow"] { --pixel-accent: #f7c531; --pixel-accent-hover: #d9a81f; --pixel-accent-soft: #ffd84d; }

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
  animation: pixel-battle-sweep 1.2s steps(12) infinite !important;
}
@keyframes pixel-battle-sweep {
  from { background-position: 0 0; }
  to   { background-position: 24px 0; }
}
[data-status="success"], [data-state="success"], [data-state="ok"] {
  border-left: 3px solid #4f9d69 !important;
}
[data-status="error"], [data-state="error"] {
  border-left: 3px solid #a0141f !important;
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

/* C · GBA 式对话窗边框：双层描边 + 外阴影（弹窗/菜单/面板） */
[role="dialog"], [class*="_menu"], [class*="_popup"], [class*="_panel"]:not([class*="Hint"]) {
  border: none !important;
  box-shadow: 0 0 0 2px #26221e, 0 0 0 5px #fffdf8, 0 0 0 7px #26221e, 4px 4px 0 8px rgba(0, 0, 0, .25) !important;
}
body[data-ds-dark-theme] [role="dialog"],
body[data-ds-dark-theme] [class*="_menu"],
body[data-ds-dark-theme] [class*="_popup"],
body[data-ds-dark-theme] [class*="_panel"]:not([class*="Hint"]) {
  box-shadow: 0 0 0 2px #f5efe6, 0 0 0 5px #1c1915, 0 0 0 7px #f5efe6, 4px 4px 0 8px rgba(0, 0, 0, .5) !important;
}
/* 选中项 = 高亮黄底（列表选择，不动 toggle） */
[aria-selected="true"], [aria-current="true"] {
  background-color: rgba(242, 193, 78, .22) !important;
  color: #26221e !important;
}

/* D · 像素球加载动画（原创 8-bit 红白像素球，替换圆形 spinner） */
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

/* Markdown、终端、Diff、Read 等复制按钮统一高对比，避免深色代码底上出现黑字 */
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
      return STATUS_PHRASES[saved] !== undefined ? saved : "battle";
    }
    function currentStatusText() {
      const lang = (typeof navigator !== "undefined" && String(navigator.language).toLowerCase().startsWith("zh")) ? "zh" : "en";
      return STATUS_PHRASES[readStatusPhrase()][lang];
    }

    // 替换回合状态句："Deep diving..." → 当前短语（保留后面的时长后缀）
    function installStatusSwapper() {
      if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => {};
      const NEEDLE = /Deep diving\.\.\./;

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

    // ---- 设置卡片：像素主题色（settings.general.item）----
    function settingsCopy() {
      const lang = (typeof navigator !== "undefined" && navigator.language) || "zh";
      const zh = String(lang).toLowerCase().startsWith("zh");
      return {
        title: zh ? "像素主题色" : "Pixel palette",
        hint: zh ? "切换强调色，立即生效并保存。" : "Switch accent color; applies instantly and persists.",
        statusTitle: zh ? "回合状态句" : "Turn status",
        statusHint: zh ? "思考中的状态文案。" : "The status line shown while thinking.",
      };
    }

    const STATUS_LABELS = {
      battle: { zh: "战斗中", en: "Battle" },
      move: { zh: "出招中", en: "Move" },
      charge: { zh: "蓄力中", en: "Charge" },
    };

    function PaletteCard() {
      const [current, setCurrent] = React.useState(readPalette());
      const [statusId, setStatusId] = React.useState(readStatusPhrase());
      const copy = settingsCopy();
      const zh = (typeof navigator !== "undefined" && String(navigator.language).toLowerCase().startsWith("zh"));
      const rowStyle = {
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px",
        padding: "10px 0", color: "#26221e",
      };
      const titleStyle = { fontSize: "14px", lineHeight: "22px", fontWeight: 500, marginRight: "6px" };
      const swatch = (id) => {
        const p = PALETTES[id];
        const selected = current === id;
        return {
          boxSizing: "border-box",
          width: "34px", height: "34px",
          background: p.accent,
          border: "2px solid " + (selected ? "#26221e" : "transparent"),
          boxShadow: selected ? "2px 2px 0 rgba(38,34,30,.5)" : "none",
          color: "#26221e",
          cursor: "pointer",
          fontSize: "15px", lineHeight: "30px", fontFamily: "inherit",
          padding: 0,
        };
      };
      const statusButton = (id) => {
        const selected = statusId === id;
        return {
          boxSizing: "border-box",
          minHeight: "28px",
          padding: "2px 10px",
          background: selected ? "#26221e" : "#f0eae0",
          border: "2px solid #26221e",
          boxShadow: "2px 2px 0 rgba(38,34,30,.45)",
          color: selected ? "#f5efe6" : "#26221e",
          cursor: "pointer",
          fontSize: "13px", lineHeight: "20px", fontFamily: "inherit",
        };
      };
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { style: rowStyle },
          React.createElement("div", { style: titleStyle }, copy.title),
          PALETTE_IDS.map((id) => React.createElement(
            "button",
            {
              key: id,
              type: "button",
              "aria-pressed": current === id,
              "aria-label": PALETTES[id].en,
              title: PALETTES[id].label,
              onClick: () => {
                if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.palette(id);
                setCurrent(id);
              },
              style: swatch(id),
            },
            PALETTES[id].label,
          )),
          React.createElement("span", { style: { fontSize: "12px", lineHeight: "20px", color: "#6f6558" } }, copy.hint),
        ),
        React.createElement(
          "div",
          { style: rowStyle },
          React.createElement("div", { style: titleStyle }, copy.statusTitle),
          STATUS_IDS.map((id) => React.createElement(
            "button",
            {
              key: id,
              type: "button",
              "aria-pressed": statusId === id,
              onClick: () => {
                if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.status(id);
                setStatusId(id);
              },
              style: statusButton(id),
            },
            STATUS_LABELS[id][zh ? "zh" : "en"],
          )),
          React.createElement("span", { style: { fontSize: "12px", lineHeight: "20px", color: "#6f6558" } }, copy.statusHint),
        ),
      );
    }

    // ---- 插件体 ----
    const inject = ["slots", "theme"];

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

      // 设置卡片：像素主题色
      ctx.effect(
        () => ctx.slots.inject("settings.general.item", () => ctx.slots.register(
          { name: "settings.general.item", id: "pixel-skin-palette", order: 11 },
          PaletteCard,
        )),
        "pixel-skin: settings row",
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
