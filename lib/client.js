/**
 * dsh-pixel-skin — 红白机像素风皮肤 · client half（宝可梦风味四色版）
 *
 * 实现方式（全部走官方扩展点）：
 *   1. ctx.theme.overrideTokens('dsh-pixel-skin', buildTokens(palette)) ——
 *      四套可切换配色（红/蓝/绿/黄），浅深各一套；切换即重放同 source 层。
 *   2. 自有 <style>（ctx.effect 管理生命周期）：像素字体、直角、硬阴影、
 *      HP 条式状态、GBA 式窗框、像素球加载动画、扫描线（可选）。
 *   3. settings.section 注册「像素皮肤」设置分区（独立于通用设置）：
 *      主题色 / 回合状态句。
 *   4. localStorage：pixel-skin:enabled / pixel-skin:scanlines / pixel-skin:palette。
 *      控制台 API：__PIXELSKIN__.palette('red|blue|green|yellow') / scanlines / off / on
 *   5. 桌面端（Electron）适配：Windows 自绘标题栏（html[data-windows-titlebar]）拖拽带
 *      铺侧栏纸色 + 2px 墨线、内容区圆角归零；
 *      字体 @font-face 多级候选链；0.1.7 未提供的 token 引用全部带真实兜底。
 *   6. 2.1.1 桌面端过宽匹配修复：GBA 窗框只匹配 WAI-ARIA 浮层角色与
 *      _popup/_popover/_dropdown 后缀（不再命中含 _panel/_menu 的主面板与顶栏菜单）；
 *      侧栏行不强制 padding（避免第三方/官方行图标文字重叠）；_primary 限定按钮。
 *   7. 2.1.2：状态句匹配放宽——「深度求索中，用时…」等带后缀的变体也能替换，
 *      且保留用时后缀（裸短语替换时去掉短语自身省略号）；像素球重绘为
 *      直角分层球（上红下白 + 墨带 + 白纽 + 墨线描边），替代 conic 噪点球。
 *   8. 2.1.5：移除能力等级面板（自绘滑块）、滑块配色设置与 /pixel-declare 补全
 *      命令——受控滑块拖动时高频异步写入与远端回写相互竞争，切换卡顿且需多次
 *      点击；推理等级切换回归官方模型菜单（模型档位仍由 cordis.patch.yml 静态声明）。
 *   9. 2.2.0：适配 DSH 0.1.7-rc.2 并扩充能力，且不删减任何既有功能——
 *      a) 配色扩充到 8 套（红/蓝/绿/黄/紫/橙/青/粉）+ 自定义强调色（新键
 *         pixel-skin:accent，由单色推导 hover/soft/tint 整套）；
 *      b) 新增像素缩放档位 1x/1.5x/2x（新键 pixel-skin:scale，CSS zoom 实现）；
 *      c) 设置项完整化：自定义强调色 / CRT 扫描线 / 像素缩放全部进「像素皮肤」分区，
 *         console API __PIXELSKIN__ 保留并新增 accent() / scale() / scales()；
 *      d) 修复字体候选链远程兜底指向第三方仓库（ADAning/dsh-pixel-skin）的问题，
 *         改指本仓库 origin 固定 commit；
 *      e) 修复桌面端标题栏适配静默失效——0.1.7-rc.2 布局类名哈希已由 ZTP-Xa
 *         变为 pI_x6G，现同时匹配两代哈希并标注该依赖的脆弱性。
 *  10. 2.3.0：三件事。
 *      a) 修复回合状态句替换静默失效（根因不是措辞，是替换对象）——
 *         0.1.7-rc.2 的可见状态文案在 button[data-turn-process] 的 label span 里，
 *         而 [role="status"] 只命中 visuallyHidden 的 aria-live 播报节点（1x1px
 *         clip 隐藏）；_turnStatus/_activity/_busy 三族类名在当前客户端包内根本
 *         不存在。替换一直成功执行，只是写进了看不见的节点。现主锚点改为稳定的
 *         data 属性 button[data-turn-process]，旧类名分支保留兼容；CSS 同源修复。
 *      b) 恢复能力等级像素面板（2.1.5 删除项，按新规格重做）：GBA 双描边窗框、
 *         Fusion Pixel 字体、EXP 经验条 + HP 段格子、像素箭头、单色由浅到深
 *         能力色谱（最深档仍可辨识）、当前格白色顶边；0-100 拖动。
 *         写入策略改为松手/失焦才写一次并吸附最近档位 —— 2.1.5 删除它的原因正是
 *         高频写入与远端回写互相竞争，这次把写入频次降到每次拖拽一次。
 *         面板用原生 DOM 构建：ModuleLoader 只注册了 react，没有 react-dom/client，
 *         无法独立挂载 React 树，纯 DOM 零新依赖零加载风险。
 *         新增键 pixel-skin:effort-palette / pixel-skin:effort-custom（均为新增，
 *         不改动既有键），console API 新增 effortPalette() / effortCustom() /
 *         effortPalettes()。
 *      c) DSH STORE 上架整改（issue #1199）：补 repository / homepage / bugs /
 *         LICENSE / engines / dsh.compatibility.dshReleases；权限与失败边界改在
 *         README 如实声明。详见 CHANGES-2.3.0.md。
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

    // ---- 内置配色（御三家印象：红/蓝/绿/黄 + 2.2.0 扩充四色）----
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
      // ---- 2.2.0 扩充 ----
      purple: {
        label: "紫", en: "Purple",
        accent: "#8b5cd6", hover: "#6f43b8", soft: "#bda2f0",
        onAccentL: "#fffdf8", onAccentD: "#1b1130",
        tintL: "#f0eafb", tintD: "#241a3d",
      },
      orange: {
        label: "橙", en: "Orange",
        accent: "#e8722c", hover: "#c55a1c", soft: "#ffab6b",
        onAccentL: "#fffdf8", onAccentD: "#2a1405",
        tintL: "#fdeee1", tintD: "#3a2210",
      },
      teal: {
        label: "青", en: "Teal",
        accent: "#1f9e9e", hover: "#167c7c", soft: "#63d0d0",
        onAccentL: "#fffdf8", onAccentD: "#062626",
        tintL: "#e2f5f5", tintD: "#123232",
      },
      pink: {
        label: "粉", en: "Pink",
        accent: "#d94f8c", hover: "#b73a72", soft: "#ff92bd",
        onAccentL: "#fffdf8", onAccentD: "#2c0c1c",
        tintL: "#fceaf2", tintD: "#391426",
      },
    };
    const PALETTE_IDS = Object.keys(PALETTES);

    // 自定义强调色（2.2.0 新增 localStorage 键 pixel-skin:accent，纯附加，不改动既有三键）
    const CUSTOM_ID = "custom";
    const ACCENT_KEY = "pixel-skin:accent";
    function parseHex(value) {
      const s = String(value == null ? "" : value).trim().toLowerCase();
      const m = /^#?([0-9a-f]{6})$/.exec(s);
      return m ? "#" + m[1] : null;
    }
    function mix(hex, target, amount) {
      const n = parseInt(hex.slice(1), 16);
      const t = parseInt(target.slice(1), 16);
      const ch = (shift) => {
        const a = (n >> shift) & 0xff;
        const b = (t >> shift) & 0xff;
        return Math.round(a + (b - a) * amount);
      };
      const to2 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v).toString(16).padStart(2, "0");
      return "#" + to2(ch(16)) + to2(ch(8)) + to2(ch(0));
    }
    // 由单一强调色推导整套 8-bit 配色（hover=加深、soft=提亮、tint=极浅/极深底）
    function derivePalette(accent) {
      return {
        label: "自定义", en: "Custom",
        accent: accent,
        hover: mix(accent, "#000000", 0.22),
        soft: mix(accent, "#ffffff", 0.45),
        onAccentL: "#fffdf8",
        onAccentD: mix(accent, "#000000", 0.78),
        tintL: mix(accent, "#ffffff", 0.86),
        tintD: mix(accent, "#000000", 0.72),
      };
    }
    function readCustomAccent() {
      return parseHex(storageGet(ACCENT_KEY));
    }

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
  /* 候选链：/plugins 插件资源位（未来 DSH 若开放 assets 服务即同源免网）→ 文档相对路径 → 本仓库固定 commit 远程兜底。
     2.2.0 起远程兜底只指向本仓库 origin（zhuifengqug/pixel-skin），不再引用任何第三方仓库。
     ⚠️ 发布前必须先推送该 commit（或把 FONT_REMOTE_COMMIT 更新为已推送的发布 commit），否则远程候选会 404，
        此时按 font-display: swap 降级为系统中文字体，不影响 DSH 功能。 */
  src: url('/plugins/dsh-pixel-skin/assets/fonts/fusion-pixel-12px-proportional-sc.woff2') format('woff2'),
       url('./assets/fonts/fusion-pixel-12px-proportional-sc.woff2') format('woff2'),
       url('https://raw.githubusercontent.com/zhuifengqug/pixel-skin/ed2d807ed56c1f3ba9bd1792653426711cf0d7c1/assets/fonts/fusion-pixel-12px-proportional-sc.woff2') format('woff2');
}
@font-face {
  font-family: 'Fusion Pixel Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/plugins/dsh-pixel-skin/assets/fonts/fusion-pixel-12px-monospaced-sc.woff2') format('woff2'),
       url('./assets/fonts/fusion-pixel-12px-monospaced-sc.woff2') format('woff2'),
       url('https://raw.githubusercontent.com/zhuifengqug/pixel-skin/ed2d807ed56c1f3ba9bd1792653426711cf0d7c1/assets/fonts/fusion-pixel-12px-monospaced-sc.woff2') format('woff2');
}
@font-face {
  font-family: 'Fusion Pixel Latin';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/plugins/dsh-pixel-skin/assets/fonts/fusion-pixel-latin.woff2') format('woff2'),
       url('./assets/fonts/fusion-pixel-latin.woff2') format('woff2'),
       url('https://raw.githubusercontent.com/zhuifengqug/pixel-skin/ed2d807ed56c1f3ba9bd1792653426711cf0d7c1/assets/fonts/fusion-pixel-latin.woff2') format('woff2');
}

:root {
  --dsw-font-family: 'Fusion Pixel UI', 'Fusion Pixel Latin', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  --ds-font-family-code: 'Fusion Pixel Mono', 'Fusion Pixel Latin', 'SF Mono', 'Cascadia Mono', Consolas, 'Liberation Mono', Menlo, 'PingFang SC', monospace;
  --ds-ease-in-out: steps(3, end);
  --ds-transition-duration: .12s;
  --ds-transition-duration-fast: .06s;
  --ds-transition-duration-slow: .2s;
}

/* 四套主题强调色（原创 8-bit 图形，与任天堂无关）
   --pixel-tint 为选中态底色兜底（深浅各一套），供 0.1.7 下未定义的 token 引用 */
body[data-pixel-palette="red"]    { --pixel-accent: #d9363e; --pixel-accent-hover: #b92532; --pixel-accent-soft: #ff7474; --pixel-tint: #fdecea; }
body[data-pixel-palette="blue"]   { --pixel-accent: #3678d4; --pixel-accent-hover: #285cad; --pixel-accent-soft: #72b9ff; --pixel-tint: #e8effb; }
body[data-pixel-palette="green"]  { --pixel-accent: #45a85a; --pixel-accent-hover: #328344; --pixel-accent-soft: #7bd477; --pixel-tint: #e6f4e6; }
body[data-pixel-palette="yellow"] { --pixel-accent: #f2c94c; --pixel-accent-hover: #d7a92f; --pixel-accent-soft: #ffe27a; --pixel-tint: #fdf3d8; }
body[data-ds-dark-theme][data-pixel-palette="red"]    { --pixel-tint: #3a1a17; }
body[data-ds-dark-theme][data-pixel-palette="blue"]   { --pixel-tint: #1c2b4a; }
body[data-ds-dark-theme][data-pixel-palette="green"]  { --pixel-tint: #16331b; }
body[data-ds-dark-theme][data-pixel-palette="yellow"] { --pixel-tint: #332b12; }

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
  background: var(--ds-specific-input-major, var(--dsw-specific-input-major, var(--dsw-alias-bg-overlay, #fffdf8))) !important;
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
  background: #26211b !important;
  box-shadow: 0 0 0 2px #1c1915, 0 0 0 4px #f5efe6, 5px 5px 0 rgba(0, 0, 0, .62) !important;
}
[data-composer-card] [class*="_input"] {
  color: var(--dsw-alias-label-primary) !important;
  caret-color: var(--pixel-accent) !important;
}
[data-composer-card] [class*="_placeholder"] {
  color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary, #9a8d7c)) !important;
  letter-spacing: .02em;
}
[data-composer-card] [class*="_row"] {
  border-top: 2px solid var(--dsw-alias-border-l2, #e2d8c6);
  padding: 6px 10px 2px;
}
[data-composer-card] [class*="_add"],
[data-composer-card] [class*="_select"] {
  border: 1px solid var(--dsw-alias-border-l2, #c9bda6) !important;
  background: var(--dsw-alias-button-floating-fill, var(--dsw-alias-bg-overlay, #fffdf8)) !important;
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
  border-bottom: 2px solid var(--dsw-alias-border-l2, #c9bda6);
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
  /* 2.1.1：不再强制 padding——官方/第三方行自带图标偏移布局，覆盖后图标与文字重叠 */
  border: 2px solid transparent;
  border-radius: 0 !important;
  background: transparent !important;
  color: var(--dsw-alias-label-primary) !important;
  font-weight: 600;
}
[class*="_projectRow"]:hover,
[class*="_projectRow"]:focus-within {
  border-color: var(--dsw-alias-border-l2, #c9bda6);
  background: var(--dsw-specific-sidebar-nav-item-hover, var(--dsw-alias-bg-layer-1, #f0eae0)) !important;
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
  /* 2.1.1：不再强制 padding（同 _projectRow，避免覆盖原生图标偏移） */
  border: 2px solid transparent;
  border-radius: 0 !important;
  background: transparent !important;
  color: var(--dsw-alias-label-primary) !important;
  transition: background-color .12s steps(2), border-color .12s steps(2), transform .12s steps(2);
}
[class*="_sessionRow"]:hover {
  border-color: var(--dsw-alias-border-l2, #c9bda6);
  background: var(--dsw-specific-sidebar-nav-item-hover, var(--dsw-alias-bg-layer-1, #f0eae0)) !important;
  transform: translateX(2px);
}
[class*="_sessionRow"][class*="_selected"] {
  border-color: var(--pixel-accent) !important;
  background: var(--dsw-specific-sidebar-nav-item-active-accent, var(--pixel-tint, #fdecea)) !important;
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
  color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary, #9a8d7c)) !important;
  font-family: 'Fusion Pixel Mono', 'Fusion Pixel Latin', monospace;
  font-size: 11px;
  line-height: 18px;
}
[class*="_sessionRow"][class*="_selected"] [class*="_time"] {
  color: var(--pixel-accent) !important;
}
button[class*="_newSession"] {
  min-height: 38px;
  border: 2px solid var(--dsw-alias-border-l2, #c9bda6) !important;
  border-radius: 0 !important;
  background: var(--dsw-specific-input-major, var(--dsw-alias-bg-overlay, #fffdf8)) !important;
  color: var(--dsw-alias-label-primary) !important;
  box-shadow: 2px 2px 0 rgba(38, 34, 30, .18);
  letter-spacing: .03em;
}
button[class*="_newSession"]:hover:not(:disabled) {
  border-color: var(--pixel-accent) !important;
  background: var(--dsw-specific-sidebar-nav-item-active-accent, var(--pixel-tint, #fdecea)) !important;
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

/* ===== G · 对话流点缀：状态条 / 指令气泡 / 折叠行 / 悬停操作 ===== */
/* A · 回合状态条：去掉官方渐变闪光文字，改为主题色描边小胶囊 + 像素光标
   2.2.1：DSH 0.1.7-rc.2 起 _turnStatus 这一族类名在 dsh-client-ui-chat 里已不存在，
   可见状态文案实际渲染在 TurnProcessNodeView 的 label span —— button[data-turn-process]
   的唯一直接 span 子节点（chevron 是 svg）。旧选择器整段落空，所以胶囊从未出现。
   两代锚点并存：新锚点命中 0.1.7-rc.2，旧锚点留给更早的版本，不回归。 */
button[data-turn-process] > span,
[class*="_turnStatus"]:not([class*="_turnStatusClock"]) {
  box-sizing: border-box;
  height: auto !important;
  min-height: 26px;
  padding: 2px 10px;
  border: 2px solid var(--pixel-accent);
  background: var(--dsw-specific-bubble, var(--dsw-alias-bg-layer-1, #f1e9db)) !important;
  color: var(--pixel-accent) !important;
  -webkit-text-fill-color: var(--pixel-accent) !important;
  animation: none !important;
}
button[data-turn-process] > span::before,
[class*="_turnStatus"]:not([class*="_turnStatusClock"])::before {
  content: "▶";
  margin-right: 6px;
  color: var(--pixel-accent);
  font-family: 'Fusion Pixel Latin', monospace;
  font-size: 10px;
  line-height: 1;
  animation: pixel-cursor-blink .9s infinite;
}
[class*="_turnStatusClock"] {
  font-family: 'Fusion Pixel Mono', 'Fusion Pixel Latin', monospace !important;
}
@keyframes pixel-cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  button[data-turn-process] > span::before,
  [class*="_turnStatus"]:not([class*="_turnStatusClock"])::before { animation: none; }
}

/* B · 用户指令气泡：墨色描边 + 硬阴影，右缘主题色条做"出招方"指示
   （▶ 符号会探出滚动容器引发横向滚动条，改用右缘色条，视觉等价） */
[data-chat-flow-kind="user"] [class*="_bubble"],
[data-chat-flow-kind="steering"] [class*="_bubble"] {
  border: 2px solid #26221e !important;
  border-right-width: 4px !important;
  border-right-color: var(--pixel-accent) !important;
  box-shadow: 3px 3px 0 rgba(38, 34, 30, .22);
}
body[data-ds-dark-theme] [data-chat-flow-kind="user"] [class*="_bubble"],
body[data-ds-dark-theme] [data-chat-flow-kind="steering"] [class*="_bubble"] {
  border-color: #f5efe6 !important;
  border-right-color: var(--pixel-accent) !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, .6);
}

/* C · 回合过程折叠行（已思考 · N 次工具调用）：虚线菜单框 + 主题色折叠箭头 */
[data-turn-process] {
  box-sizing: border-box;
  border: 1px dashed var(--dsw-alias-border-l2, #c9bda6) !important;
  border-radius: 0 !important;
  padding: 2px 8px;
  transition: border-color .12s steps(2), background-color .12s steps(2);
}
[data-turn-process]:hover {
  border-color: var(--pixel-accent);
  background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-1, #f0eae0));
}
[data-turn-process] [class*="_chevron"] {
  color: var(--pixel-accent) !important;
}

/* D · 消息悬停操作区（复制/分支/时间戳）：像素小按钮 + 等宽时钟 */
button[class*="_action"] {
  border: 1px solid var(--dsw-alias-border-l2, #c9bda6) !important;
  background: var(--dsw-alias-button-floating-fill, var(--dsw-alias-bg-overlay, #fffdf8)) !important;
  box-shadow: 2px 2px 0 rgba(38, 34, 30, .18);
}
button[class*="_action"]:hover:not(:disabled) {
  border-color: var(--pixel-accent) !important;
  color: var(--pixel-accent) !important;
}
body[data-ds-dark-theme] button[class*="_action"] {
  box-shadow: 2px 2px 0 rgba(0, 0, 0, .55);
}
[class*="_timeStart"], [class*="_timeEnd"] {
  font-family: 'Fusion Pixel Mono', 'Fusion Pixel Latin', monospace !important;
}

/* 上下文环 = 方形 HP 槽；三段分解条 = 血量段（系统绿 / 工具蓝 / 消息随主题） */
svg[class*="_track"] { stroke: var(--dsw-alias-border-l3, var(--dsw-alias-border-l2, rgba(38, 34, 30, .22))) !important; }
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

/* C · GBA 式对话窗边框：两圈细描边 + 小投影（仅浮动层：弹窗/菜单/下拉）
   2.1.1 收窄：不再子串匹配 _menu/_panel——桌面端主内容面板类名含 _panel、
   顶栏菜单条含 _menu，会把整页主面板框出 L 形黑线（裁切 + 横向滚动条）；
   改按 WAI-ARIA 浮层角色与显式 _popup/_popover/_dropdown 后缀匹配 */
[role="dialog"], [role="menu"], [role="listbox"], [role="alertdialog"], [role="tooltip"],
[class*="_popup"], [class*="_popover"], [class*="_dropdown"] {
  border: none !important;
  box-shadow: 0 0 0 2px #26221e, 0 0 0 4px #fffdf8, 3px 3px 0 0 rgba(0, 0, 0, .22) !important;
}
body[data-ds-dark-theme] [role="dialog"],
body[data-ds-dark-theme] [role="menu"],
body[data-ds-dark-theme] [role="listbox"],
body[data-ds-dark-theme] [role="alertdialog"],
body[data-ds-dark-theme] [role="tooltip"],
body[data-ds-dark-theme] [class*="_popup"],
body[data-ds-dark-theme] [class*="_popover"],
body[data-ds-dark-theme] [class*="_dropdown"] {
  box-shadow: 0 0 0 2px #f5efe6, 0 0 0 4px #1c1915, 3px 3px 0 0 rgba(0, 0, 0, .5) !important;
}
/* 选中项 = 高亮黄底（列表选择，不动 toggle） */
[aria-selected="true"], [aria-current="true"] {
  background-color: rgba(242, 193, 78, .22) !important;
  color: #26221e !important;
}

/* D · 像素球加载动画（原创 8-bit 红白像素球，替换圆形 spinner）
   2.1.2 重绘：直角分层球（上红下白 + 墨带 + 白纽 + 墨线描边）——原来的
   conic 四分渐变在 16px 小尺寸下渲染成一团红白噪点，观感差；
   注：_spinner 类名在 DSH ≥0.1.2 中已移除，规则保留以兼容旧版 */
[class*="_spinner"] {
  width: 12px !important;
  height: 12px !important;
  border: none !important;
  border-radius: 0 !important;
  background:
    linear-gradient(#fffdf8 0 0) center/5px 5px no-repeat,
    linear-gradient(#26221e 0 0) center/100% 3px no-repeat,
    linear-gradient(180deg, var(--pixel-accent) 0 50%, #fffdf8 50% 100%) 0 0/100% 100% no-repeat;
  box-shadow: 0 0 0 2px #26221e, 3px 3px 0 0 rgba(38, 34, 30, .28) !important;
  animation: pixel-ball-bounce .6s steps(4) infinite !important;
}
@keyframes pixel-ball-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
/* 发送/判定进行中的 pending 圆点（空 div）也换成小号像素球；带文字的徽章不受影响 */
[class*="_pending"]:empty {
  width: 10px !important;
  height: 10px !important;
  border-radius: 0 !important;
  background:
    linear-gradient(#fffdf8 0 0) center/4px 4px no-repeat,
    linear-gradient(#26221e 0 0) center/100% 3px no-repeat,
    linear-gradient(180deg, var(--pixel-accent) 0 50%, #fffdf8 50% 100%) 0 0/100% 100% no-repeat;
  box-shadow: 0 0 0 2px #26221e, 2px 2px 0 0 rgba(38, 34, 30, .28) !important;
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

/* 发送按钮：只改 composer 的 primary send，不影响其它 info 按钮
   2.1.1：限定 button/[role=button]，不再裸匹配任意 _primary 子串元素 */
button[class*="_primary"],
[role="button"][class*="_primary"] {
  background: var(--pixel-accent) !important;
  color: #fffdf8 !important;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, .35);
}
button[class*="_primary"]:hover:not(:disabled),
[role="button"][class*="_primary"]:hover:not(:disabled) {
  background: var(--pixel-accent-hover) !important;
}
body[data-pixel-palette="yellow"] button[class*="_primary"],
body[data-pixel-palette="yellow"] [role="button"][class*="_primary"] { color: #26221e !important; }

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

/* ===== 桌面端（Electron）匹配 · Windows 自绘标题栏 ===== */
/* html[data-windows-titlebar] 仅桌面壳注入（titleBarStyle:"hidden" + HTML 拖拽带）：
   官方给拖拽带铺 --dsw-specific-sidebar-fill、内容区 16px 圆角。像素风统一为：
   内容区圆角归零 + 拖拽带底部 2px 墨线，底色仍走已主题化的侧栏 token。
   桌面 preload 注入的顶栏（菜单/窗口按钮行）以 --dsw-font-family 排版，
   定义于上方 :root，自动获得像素字体，无需额外规则。 */
html[data-windows-titlebar] {
  --dsh-windows-content-radius: 0px;
}
/* ⚠️ 选择器稳定性：官方布局骨架类名是压缩产物哈希，DSH 0.1.7-rc.2 实测为 pI_x6G，
   2.1.5 及之前写死的 ZTP-Xa 已失效（桌面端标题栏适配因此静默失效）。
   此处同时列出两代哈希，官方再次改名时本段会失效——届时只需在下面补一个哈希前缀。
   纯装饰无法走官方 Slot 注册，这是当前唯一可行手段；已知边界见 README.zh.md。 */
html[data-windows-titlebar] .pI_x6G_frame:before,
html[data-windows-titlebar] .ZTP-Xa_frame:before {
  background: var(--dsw-specific-sidebar-fill, #efe6d5) !important;
  box-shadow: 0 2px 0 0 rgba(38, 34, 30, .28);
}
html[data-windows-titlebar] .pI_x6G_centerCol,
html[data-windows-titlebar] .ZTP-Xa_centerCol {
  border-radius: 0 0 0 0 !important;
  background: var(--dsw-alias-bg-base, #faf6f0) !important;
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
.pixel-skin-color { box-sizing: border-box; width: 46px; height: 30px; padding: 0; border: 2px solid #172a4a; background: #fffdf2; cursor: pointer; }

/* 像素缩放档位（2.2.0）：用 CSS zoom 而非 transform——zoom 会正确重排、
   同步滚动条尺寸与命中测试；transform 只做视觉缩放会留下错位的交互区。
   1x / 2x 为整数倍，点阵最锐利；1.5x 为半整数倍，可能略发虚（已在设置页注明）。 */
body[data-pixel-scale="1.5"] { zoom: 1.5; }
body[data-pixel-scale="2"] { zoom: 2; }
body[data-ds-dark-theme] .pixel-skin-card { color: #fffdf2; background: #172a4a; border-color: #fffdf2; box-shadow: 0 0 0 2px #f8d96a, 4px 4px 0 rgba(5,14,30,.72); }
body[data-ds-dark-theme] .pixel-skin-hint { color: #9fb4d0; }
body[data-ds-dark-theme] .pixel-skin-swatch { color: #fffdf2; }
body[data-ds-dark-theme] .pixel-skin-swatch.is-selected { border-color: #f8d96a; }
body[data-ds-dark-theme] .pixel-skin-status { border-color: #fffdf2; background: #172a4a; color: #fffdf2; }
body[data-ds-dark-theme] .pixel-skin-status.is-selected { background: #f8d96a; color: #172a4a; }

/* ===== H · 推理等级像素面板（2.3.0 回归）=====
   GBA 双描边窗框：内圈一色、外圈一色，两层 box-shadow 叠出硬边窗框。
   拖动期间纯本地视觉，松手/失焦才写一次 effort —— 2.1.5 正是因为高频写入
   与远端写回互相抢才删掉整个面板，这里把写入频次降到每次拖拽一次。 */
.pixel-effort-host { position: fixed; z-index: 10000; pointer-events: none; }
.pixel-effort-panel {
  width: min(300px, calc(100vw - 20px));
  pointer-events: auto;
  box-sizing: border-box;
  padding: 12px;
  color: #172a4a;
  background: #fffdf2;
  border: 2px solid #172a4a;
  box-shadow: 0 0 0 2px #f8d96a, 0 0 0 4px #172a4a, 4px 4px 0 rgba(18,34,60,.36);
  font-family: 'Fusion Pixel UI', 'Fusion Pixel Latin', sans-serif;
  image-rendering: pixelated;
}
.pixel-effort-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.pixel-effort-title { font-size: 15px; line-height: 22px; font-weight: 600; }
.pixel-effort-value { color: var(--pixel-effort-color, #2a4678); font-size: 13px; line-height: 20px; white-space: nowrap; }
.pixel-effort-description { min-height: 18px; margin: -2px 0 7px; color: #52627a; font-size: 11px; line-height: 17px; }

/* EXP 经验条 + HP 段格子：格子数等于档位数，逐格取色带由浅到深 */
.pixel-effort-track { position: relative; height: 28px; padding: 5px; border: 2px solid #172a4a; background: #172a4a; box-sizing: border-box; }
.pixel-effort-cells { display: flex; gap: 2px; width: 100%; height: 100%; pointer-events: none; }
.pixel-effort-cell { flex: 1 1 0; min-width: 4px; border: 1px solid #52627a; background: #0d1a30; box-sizing: border-box; }
.pixel-effort-cell.is-filled { background: var(--pixel-cell-color, #2a4678); border-color: #fffdf8; }
.pixel-effort-cell.is-current { border-top: 2px solid #fffdf8; }
.pixel-effort-range { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; opacity: 0; cursor: ew-resize; }

/* 像素箭头：steps(2) 弹跳，停在当前格上方 */
.pixel-effort-arrow {
  position: absolute; z-index: 3; top: -13px;
  left: calc(var(--pixel-effort-position, 50%) - 5px);
  color: #fffdf8; font-family: monospace; font-size: 12px; line-height: 12px;
  animation: pixel-effort-bounce .55s steps(2) infinite; pointer-events: none;
  text-shadow: 1px 1px 0 #172a4a;
}
@keyframes pixel-effort-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@media (prefers-reduced-motion: reduce) { .pixel-effort-arrow { animation: none; } }

.pixel-effort-labels { display: flex; justify-content: space-between; gap: 4px; margin-top: 5px; color: #52627a; font-size: 10px; line-height: 15px; }
.pixel-effort-label { overflow: hidden; flex: 1 1 0; text-overflow: ellipsis; white-space: nowrap; }
.pixel-effort-label:last-child { text-align: right; }
.pixel-effort-status { padding-top: 7px; color: #52627a; font-size: 11px; line-height: 17px; }
.pixel-effort-error { color: #a0141f; }

.pixel-effort-menu-entry {
  display: flex; width: 100%; min-height: 30px; box-sizing: border-box; margin-top: 4px;
  padding: 6px 8px; color: #172a4a; background: #fffdf2; border: 0;
  font-family: inherit; font-size: 12px; line-height: 17px; text-align: left; cursor: pointer;
}
.pixel-effort-menu-entry:hover { background: #e5f2ff; }

/* 设置页里的能力色谱条 */
.pixel-skin-effort { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 3px; border: 2px solid #172a4a; background: #fffdf2; cursor: pointer; }
.pixel-skin-effort.is-selected { outline: 2px solid #e23246; outline-offset: 1px; }
.pixel-skin-effort-strip { width: 56px; height: 16px; border: 1px solid #172a4a; image-rendering: pixelated; }
.pixel-skin-effort-label { font-size: 11px; line-height: 15px; color: #52627a; }

body[data-ds-dark-theme] .pixel-effort-panel { color: #fffdf2; background: #172a4a; border-color: #fffdf2; box-shadow: 0 0 0 2px #f8d96a, 0 0 0 4px #fffdf2, 4px 4px 0 rgba(5,14,30,.72); }
body[data-ds-dark-theme] .pixel-effort-description,
body[data-ds-dark-theme] .pixel-effort-labels,
body[data-ds-dark-theme] .pixel-effort-status { color: #b8ac9c; }
body[data-ds-dark-theme] .pixel-effort-menu-entry { color: #fffdf2; background: #172a4a; }
body[data-ds-dark-theme] .pixel-effort-menu-entry:hover { background: #24456f; }
body[data-ds-dark-theme] .pixel-skin-hint,
body[data-ds-dark-theme] .pixel-skin-effort-label { color: #9fb4d0; }
body[data-ds-dark-theme] .pixel-skin-effort,
body[data-ds-dark-theme] .pixel-skin-color { border-color: #fffdf2; background: #172a4a; }
body[data-ds-dark-theme] .pixel-skin-effort.is-selected { outline-color: #f8d96a; }
body[data-ds-dark-theme] .pixel-skin-effort-strip { border-color: #fffdf2; }
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
      if (saved === CUSTOM_ID && readCustomAccent() !== null) return CUSTOM_ID;
      return PALETTES[saved] !== undefined ? saved : "red";
    }
    // 把 palette id 解析成完整配色对象（内置 or 由自定义强调色推导）
    function resolvePalette(id) {
      if (id === CUSTOM_ID) {
        const accent = readCustomAccent();
        return accent !== null ? derivePalette(accent) : PALETTES.red;
      }
      return PALETTES[id] !== undefined ? PALETTES[id] : PALETTES.red;
    }

    // ---- 像素缩放档位（2.2.0 新增 localStorage 键 pixel-skin:scale，纯附加）----
    const SCALE_KEY = "pixel-skin:scale";
    const SCALES = { "1": { label: "1x", value: 1 }, "1.5": { label: "1.5x", value: 1.5 }, "2": { label: "2x", value: 2 } };
    const SCALE_IDS = Object.keys(SCALES);
    function readScale() {
      const saved = storageGet(SCALE_KEY);
      return SCALES[saved] !== undefined ? saved : "1";
    }
    // 整数倍优先；1.5x 属半整数倍，点阵可能发虚，README 已注明
    function applyScale(id) {
      const key = SCALES[id] !== undefined ? id : "1";
      if (typeof document !== "undefined" && document.body) {
        document.body.setAttribute("data-pixel-scale", key);
      }
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
    // 2.1.2：桌面端实际渲染为「深度求索中，用时1小时07分21秒」——不再要求尾随省略号；
    // 裸短语（后接用时等后缀）替换时去掉短语自身的省略号，避免「正在出招…，用时」
    // 2.1.3：改为按文本节点替换 + 扩大候选（role=status 之外补 _turnStatus/_activity/
    // _busy）——整元素 textContent 改写会清空 React 管理的子节点（用时是独立节点），
    // 被 React 立即重建回来，表现为"替换不生效"；节点级替换不破坏结构。
    // 2.2.1：定位到真正的失效点——不是替换方式，而是替换对象。
    //   DSH 0.1.7-rc.2 的 DOM 是：
    //     <span class="TTCZqG_visuallyHidden" role="status">深度求索中</span>
    //     <button data-turn-process="…"><span class="l_V-RG_label">深度求索中，用时…</span><svg …/></button>
    //   [role="status"] 只命中那个 visuallyHidden 节点（clip:rect(0 0 0 0)、1x1px，
    //   肉眼不可见），而 _turnStatus/_activity/_busy 这三族类名在整个客户端包里
    //   一个都不存在。于是替换每次都在成功执行，只是写进了隐藏节点。
    //   主锚点改为稳定的结构属性 button[data-turn-process]，旧类名保留兼容老版本。
    function installStatusSwapper() {
      if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => {};
      const NEEDLE = /Deep diving(?:\.\.\.)?|深度求索中(?:\.\.\.)?/;
      const CANDIDATES = '[data-turn-process], [role="status"], [class*="_turnStatus"], [class*="_activity"], [class*="_busy"]';

      function phraseFor(match) {
        const phrase = currentStatusText();
        if (/\.\.\.$/.test(match)) return phrase;
        return phrase.replace(/…+$/, "").replace(/\.+$/, "");
      }

      function swapIn(el) {
        if (!(el instanceof Element) || !el.textContent || !NEEDLE.test(el.textContent)) return;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const value = node.nodeValue || "";
          if (!NEEDLE.test(value)) continue;
          const match = value.match(NEEDLE)[0];
          const phrase = phraseFor(match);
          node.nodeValue = value.replace(NEEDLE, () => phrase);
          el.setAttribute("data-pixel-status", "swapped");
          el.dataset.pixelStatusPhrase = phrase;
        }
      }
      function swapAll() {
        const nodes = document.querySelectorAll(CANDIDATES);
        for (const el of nodes) swapIn(el);
      }
      const mo = new MutationObserver(() => { swapAll(); });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
      swapAll();
      return () => { mo.disconnect(); };
    }

    // ---- 推理等级像素面板（2.3.0 回归）----
    // 2.1.5 删除了这个面板，原因是自绘滑块高频写 effort 与远端写回互相抢。
    // 本轮写入策略（已确认）：拖动期间零写入，松手/失焦才写一次并吸附档位。
    //
    // 0.1.7-rc.2 契约实测（@deepseek-ai/dsh-client-ui-model-selection）：
    //   ctx.modelDirectories.directoryFor(sessionId) -> directory
    //   directory.store.subscribe(fn) / directory.load() -> snapshot
    //   snapshot = { status, current: {provider, model, reasoningEffort?}, groups, pending }
    //   directory.select({ provider, model, reasoningEffort }) -> Promise
    // 档位是离散命名数组，不是 0-100 数值：
    //   model.reasoning = { defaultEffort?: string, efforts: [{ id, name }] }
    const EFFORT_PALETTES = {
      blue: {
        label: { zh: "蓝系", en: "Blue" },
        // 单色由浅到深；最深档 #2a4678 仍是可辨识的蓝，不会退成黑
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
    const EFFORT_CHOICE_KEY = "pixel-skin:effort-palette";
    const EFFORT_CUSTOM_KEY = "pixel-skin:effort-custom";
    const EFFORT_WHITE = [255, 255, 255];

    function effortHexRgb(hex) {
      const raw = String(hex == null ? "" : hex).replace("#", "");
      const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
      if (full.length !== 6) return [240, 160, 48];
      const n = parseInt(full, 16);
      if (!Number.isFinite(n)) return [240, 160, 48];
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function effortMix(from, to, amount) {
      return from.map((v, i) => Math.round(v + (to[i] - v) * amount));
    }
    // 自定义取色器：以选中色为中段，向白提亮、向暗下沉，同样保持单色由浅到深
    function effortCustomStops(hex) {
      const base = effortHexRgb(hex);
      const dark = base.map((v) => Math.round(v * 0.42));
      return [
        [0, effortMix(base, EFFORT_WHITE, 0.5)],
        [1 / 6, effortMix(base, EFFORT_WHITE, 0.32)],
        [2 / 6, effortMix(base, EFFORT_WHITE, 0.14)],
        [3 / 6, base],
        [4 / 6, effortMix(base, dark, 0.25)],
        [5 / 6, effortMix(base, dark, 0.4)],
        [1, effortMix(base, dark, 0.55)],
      ];
    }
    function readEffortChoice() {
      const saved = storageGet(EFFORT_CHOICE_KEY);
      if (saved === "custom") {
        return { mode: "custom", color: storageGet(EFFORT_CUSTOM_KEY) || "#f0a030" };
      }
      return { mode: EFFORT_PALETTES[saved] !== undefined ? saved : "blue" };
    }
    function effortStops(choice) {
      return choice.mode === "custom" ? effortCustomStops(choice.color) : EFFORT_PALETTES[choice.mode].stops;
    }
    function effortGradientCss(stops) {
      return "linear-gradient(90deg, " + stops
        .map(([at, rgb]) => "rgb(" + rgb.join(",") + ") " + Math.round(at * 100) + "%")
        .join(", ") + ")";
    }
    function effortRgbCss(rgb) { return "rgb(" + rgb.join(",") + ")"; }
    // 第 index 格（共 count 格）取色带上对应位置的颜色
    function effortCellColor(stops, index, count) {
      const at = count <= 1 ? 1 : index / (count - 1);
      for (let i = 1; i < stops.length; i++) {
        if (at <= stops[i][0]) {
          const [a0, c0] = stops[i - 1];
          const [a1, c1] = stops[i];
          const span = a1 - a0;
          return effortMix(c0, c1, span <= 0 ? 0 : (at - a0) / span);
        }
      }
      return stops[stops.length - 1][1];
    }

    function effortModelOf(directory) {
      if (!directory || directory.current == null) return null;
      const current = directory.current;
      // 先按 provider 精确匹配；不中再退回全组找同名 model。
      // 否则 provider 分组 id 与 current.provider 不同源时面板会是空的（没有滑块）。
      for (const group of directory.groups || []) {
        if (group.id !== current.provider) continue;
        const model = (group.models || []).find((m) => m.id === current.model);
        if (model !== undefined) return { group, model, current };
      }
      for (const group of directory.groups || []) {
        const model = (group.models || []).find((m) => m.id === current.model);
        if (model !== undefined) return { group, model, current };
      }
      return null;
    }
    function effortLevelsOf(selection) {
      const list = selection && selection.model && selection.model.reasoning
        ? selection.model.reasoning.efforts || []
        : [];
      return list.map((level) => ({ id: level.id, name: level.name || level.id }));
    }

    function effortPanelCopy() {
      const zh = String((typeof navigator !== "undefined" && navigator.language) || "").toLowerCase().startsWith("zh");
      return {
        title: zh ? "推理等级" : "Reasoning effort",
        hint: zh
          ? "拖动选择，松手或失焦才写入并吸附到最近档位。"
          : "Drag to choose; the value is written and snapped to the nearest level on release or blur.",
        ready: zh ? "拖动中（未写入）" : "Dragging (not written yet)",
        saved: zh ? "已写入" : "Written",
        none: zh ? "当前模型未提供推理等级。" : "This model provides no reasoning effort levels.",
        loading: zh ? "读取模型目录…" : "Loading model directory…",
        failed: zh ? "写入失败" : "Write failed",
      };
    }

    // 纯 DOM 实现：ModuleLoader 只注册了 react，没有 react-dom/client，
    // 无法独立挂载一棵 React 树。这个面板是自绘像素窗，用原生 DOM 构建，
    // 零新依赖、零加载风险（比引入 react-dom 稳）。
    function mountEffortPanel(resolver, sessionId) {
      if (typeof document === "undefined") return () => {};
      const copy = effortPanelCopy();
      const stops = effortStops(readEffortChoice());

      let dir = null;
      try { dir = resolver.directoryFor(sessionId); } catch (e) { dir = null; }

      const host = document.createElement("div");
      host.className = "pixel-effort-host";
      host.dataset.plugin = "dsh-pixel-skin";
      host.dataset.pluginPanel = "pixel-effort";

      const panel = document.createElement("div");
      panel.className = "pixel-effort-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", copy.title);
      host.appendChild(panel);

      const heading = document.createElement("div");
      heading.className = "pixel-effort-heading";
      const title = document.createElement("span");
      title.className = "pixel-effort-title";
      title.textContent = copy.title;
      const value = document.createElement("span");
      value.className = "pixel-effort-value";
      heading.appendChild(title);
      heading.appendChild(value);
      panel.appendChild(heading);

      const hint = document.createElement("div");
      hint.className = "pixel-effort-description";
      hint.textContent = copy.hint;
      panel.appendChild(hint);

      const track = document.createElement("div");
      track.className = "pixel-effort-track";
      const cells = document.createElement("div");
      cells.className = "pixel-effort-cells";
      const arrow = document.createElement("span");
      arrow.className = "pixel-effort-arrow";
      arrow.textContent = "\u25BC";
      const range = document.createElement("input");
      range.className = "pixel-effort-range";
      range.type = "range";
      range.min = "0";
      range.max = "100";
      range.step = "1";
      range.setAttribute("aria-label", copy.title);
      track.appendChild(cells);
      track.appendChild(arrow);
      track.appendChild(range);
      panel.appendChild(track);

      const labels = document.createElement("div");
      labels.className = "pixel-effort-labels";
      panel.appendChild(labels);

      const status = document.createElement("div");
      status.className = "pixel-effort-status";
      panel.appendChild(status);

      const footer = document.createElement("div");
      footer.style.marginTop = "9px";
      footer.style.textAlign = "right";
      const ok = document.createElement("button");
      ok.type = "button";
      ok.className = "pixel-effort-menu-entry";
      ok.style.width = "auto";
      ok.style.marginTop = "0";
      ok.textContent = "OK";
      footer.appendChild(ok);
      panel.appendChild(footer);

      // ---- 状态（面板是自绘的，所以自己持有状态）----
      let selection = null;
      let levels = [];
      let step = 100;
      let rawValue = 0;
      let dirty = false;
      let writeError = null;
      let unsubscribe = null;

      const shownIndex = () => (levels.length === 0
        ? 0
        : Math.max(0, Math.min(levels.length - 1, Math.round(rawValue / step))));

      function syncFromDirectory(snapshot) {
        selection = effortModelOf(snapshot);
        levels = effortLevelsOf(selection);
        step = levels.length > 1 ? 100 / (levels.length - 1) : 100;
        if (!dirty) {
          const reasoning = selection && selection.model ? selection.model.reasoning : undefined;
          const activeId = selection && selection.current
            ? (selection.current.reasoningEffort !== undefined
                ? selection.current.reasoningEffort
                : reasoning && reasoning.defaultEffort)
            : undefined;
          const index = levels.findIndex((level) => level.id === activeId);
          rawValue = index > 0 ? index * step : 0;
        }
        render();
      }

      function render() {
        while (cells.firstChild) cells.removeChild(cells.firstChild);
        const count = Math.max(levels.length, 1);
        const current = shownIndex();
        for (let i = 0; i < levels.length; i++) {
          const cell = document.createElement("div");
          cell.className = "pixel-effort-cell"
            + (i <= current ? " is-filled" : "")
            + (i === current ? " is-current" : "");
          cell.style.setProperty("--pixel-cell-color", effortRgbCss(effortCellColor(stops, i, count)));
          cells.appendChild(cell);
        }
        value.textContent = levels.length > 0 ? levels[current].name : "";
        arrow.style.setProperty("--pixel-effort-position", (count <= 1 ? 50 : (current / (count - 1)) * 100) + "%");
        range.value = String(Math.round(rawValue));
        range.disabled = levels.length === 0;

        while (labels.firstChild) labels.removeChild(labels.firstChild);
        for (const level of levels) {
          const span = document.createElement("span");
          span.className = "pixel-effort-label";
          span.textContent = level.name;
          labels.appendChild(span);
        }

        status.className = "pixel-effort-status" + (writeError ? " pixel-effort-error" : "");
        status.textContent = writeError
          ? copy.failed + ": " + writeError
          : (levels.length === 0 ? (dir === null ? copy.loading : copy.none) : (dirty ? copy.ready : copy.saved));
      }

      // 全面板唯一的写入点：吸附到最近档位，然后 select() 一次。
      // 拖动期间零写入 —— 这是 2.3.0 相对 2.1.5 的关键改动。
      function commit(raw) {
        if (dir === null || levels.length === 0 || selection === null || selection.current === null) return;
        const index = Math.max(0, Math.min(levels.length - 1, Math.round(Number(raw) / step)));
        const level = levels[index];
        rawValue = index * step;
        dirty = false;
        writeError = null;
        render();
        // directory.select() 解析出 { ok, error }，不是 reject —— 官方调用方是
        // `const result = await directory.select(...); if (!result.ok) throw result.error`。
        // 只挂 .catch() 会把写入失败当成成功，界面误显示「已写入」。
        Promise.resolve(dir.select({
          provider: selection.current.provider,
          model: selection.current.model,
          reasoningEffort: level.id,
        })).then((result) => {
          if (result && result.ok === false) {
            writeError = String((result.error && result.error.message) || result.error || "unknown");
            render();
          }
        }).catch((e) => {
          writeError = String((e && e.message) || e);
          render();
        });
      }

      range.addEventListener("input", (event) => {
        dirty = true;
        rawValue = Number(event.target.value);
        render();
      });
      range.addEventListener("change", (event) => { commit(Number(event.target.value)); });
      range.addEventListener("blur", (event) => { if (dirty) commit(Number(event.target.value)); });
      ok.addEventListener("click", () => { if (dirty) commit(rawValue); close(); });

      // 打开面板的那次点击仍在事件派发途中，不能被当成"点外面"立刻关掉
      const mountedAt = Date.now();
      function onOutsideClick(event) {
        if (Date.now() - mountedAt < 250) return;
        if (event.target instanceof Node && !panel.contains(event.target)) close();
      }
      document.addEventListener("click", onOutsideClick, true);

      function close() {
        document.removeEventListener("click", onOutsideClick, true);
        if (typeof unsubscribe === "function") { try { unsubscribe(); } catch (e) {} }
        unsubscribe = null;
        if (host.parentNode) host.parentNode.removeChild(host);
      }

      if (dir !== null) {
        try {
          unsubscribe = dir.store.subscribe(() => syncFromDirectory(dir.store.getSnapshot()));
        } catch (e) { /* store 形状变化时降级为一次性读取 */ }
        Promise.resolve(dir.load())
          .then((snapshot) => { if (snapshot) syncFromDirectory(snapshot); })
          .catch(() => { render(); });
      }
      render();

      document.body.appendChild(host);
      try { range.focus(); } catch (e) {}
      return close;
    }

    // 模型菜单里的「推理等级」入口：点开 GBA 窗框面板。
    // 菜单识别是启发式的（监听 aria-haspopup=menu 的触发器），依赖官方 DOM 形状。
    // 官方模型菜单本来就有「推理等级 high >」这一行。2.3.0 初版往同一个菜单里
    // 再注入一个同名入口，一次引入三个 bug：
    //   (1) 与原生行并列重复；
    //   (2) 点不动 —— 注入的裸 button 落在 React 托管的菜单 DOM 里，重渲染即失效；
    //   (3) 凭空出现在别的菜单 —— 选择器写成 [class*="_menu"]，命中全应用各种菜单。
    // 正确做法：不注入任何 DOM，拦截原生那一行的点击，改为打开 GBA 面板。
    // 原生行是 React 渲染的稳定契约，比"往别人的树里塞节点"稳得多。
    // 匹配官方那一行的开头。英文 Effort 用负向断言，避免劫持 Effortless… 之类无关项。
    const EFFORT_ROW_PATTERN = /^(推理等级|Reasoning effort|Effort(?![A-Za-z]))/;

    function findEffortRow(target) {
      if (!(target instanceof Element)) return null;
      let node = target;
      for (let depth = 0; depth < 6 && node instanceof Element; depth++, node = node.parentElement) {
        const text = (node.textContent || "").trim();
        if (text === "" || text.length > 40) continue;
        if (EFFORT_ROW_PATTERN.test(text)) return node;
      }
      return null;
    }

    function installEffortPicker(ctx, resolver, sessions) {
      if (typeof document === "undefined") return () => {};
      let closePanel = null;
      let warned = false;

      // sessions 必须来自 ctx.inject 的 scope（官方就是 scope.sessions）。
      // 外层 ctx 上不一定挂着 sessions 服务 —— 2.3.0 二版就是错用 ctx.sessions，
      // 取不到 sessionId，又在 preventDefault 之后才判断，于是点击被吃掉且无任何反应。
      function currentSessionId() {
        try {
          if (sessions && typeof sessions.list?.getSnapshot === "function") {
            const snapshot = sessions.list.getSnapshot();
            if (snapshot && snapshot.current !== undefined) return snapshot.current;
            if (snapshot && snapshot.sessionId !== undefined) return snapshot.sessionId;
          }
        } catch (e) {}
        return undefined;
      }

      const onClickCapture = (event) => {
        if (!(event.target instanceof Element)) return;
        // 面板自己的标题就叫「推理等级」，不拦面板内部的点击，否则会自我匹配反复重挂
        if (event.target.closest(".pixel-effort-host")) return;
        const row = findEffortRow(event.target);
        if (row === null) return;

        // 关键顺序：先确定真的挂得起面板，再拦官方子菜单。
        // 挂不起来就什么也别做 —— 官方子菜单照常打开，绝不能把点击吃掉。
        const sessionId = currentSessionId();
        if (sessionId === undefined) {
          if (!warned) {
            warned = true;
            console.warn(
              "[dsh-pixel-skin] 解析不到当前 sessionId，推理等级面板未接管，保持官方子菜单。"
              + " sessions 可用字段：" + (sessions ? Object.keys(sessions).join(",") : "(无 sessions 服务)")
            );
          }
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        if (typeof closePanel === "function") { closePanel(); closePanel = null; }
        closePanel = mountEffortPanel(resolver, sessionId);
      };
      document.addEventListener("click", onClickCapture, true);

      return () => {
        document.removeEventListener("click", onClickCapture, true);
        if (typeof closePanel === "function") { closePanel(); closePanel = null; }
      };
    }

    function installConsoleApi(ctx) {
      if (typeof window === "undefined") return;
      window.__PIXELSKIN__ = {
        palette(id) {
          if (PALETTES[id] === undefined && id !== CUSTOM_ID) {
            console.log("[dsh-pixel-skin] 未知主题：" + id + "，可用：" + PALETTE_IDS.concat([CUSTOM_ID]).join("/"));
            return;
          }
          if (id === CUSTOM_ID && readCustomAccent() === null) {
            console.log("[dsh-pixel-skin] 自定义主题需先设置强调色：__PIXELSKIN__.accent('#d94f8c')");
            return;
          }
          storageSet("pixel-skin:palette", id);
          document.body.setAttribute("data-pixel-palette", id);
          ctx.theme.overrideTokens("dsh-pixel-skin", buildTokens(resolvePalette(id)));
        },
        palettes() { return PALETTE_IDS.concat([CUSTOM_ID]).slice(); },
        // 2.2.0 新增：自定义强调色（写入 pixel-skin:accent，并切到 custom 主题）
        accent(hex) {
          const value = parseHex(hex);
          if (value === null) {
            console.log("[dsh-pixel-skin] 强调色需为 6 位十六进制，例如 #d94f8c");
            return;
          }
          storageSet(ACCENT_KEY, value);
          window.__PIXELSKIN__.palette(CUSTOM_ID);
          console.log("[dsh-pixel-skin] 自定义强调色已设为 " + value);
        },
        // 2.2.0 新增：像素缩放档位
        scale(id) {
          if (SCALES[id] === undefined) {
            console.log("[dsh-pixel-skin] 未知缩放档位：" + id + "，可用：" + SCALE_IDS.join("/"));
            return;
          }
          storageSet(SCALE_KEY, id);
          applyScale(id);
        },
        scales() { return SCALE_IDS.slice(); },
        version: "2.3.0",
        effortPalette(id) {
          if (EFFORT_PALETTES[id] === undefined) {
            console.log("[dsh-pixel-skin] 未知能力色谱：" + id + "，可用：" + EFFORT_PALETTE_IDS.join("/") + "/custom");
            return;
          }
          storageSet(EFFORT_CHOICE_KEY, id);
          console.log("[dsh-pixel-skin] 能力色谱 → " + id + "（面板下次打开时生效）");
        },
        effortCustom(hex) {
          const raw = String(hex == null ? "" : hex).replace("#", "");
          if (!(raw.length === 3 || raw.length === 6) || !Number.isFinite(parseInt(raw, 16))) {
            console.log("[dsh-pixel-skin] 自定义取色需要 3/6 位十六进制颜色，例如 #4a74d2");
            return;
          }
          storageSet(EFFORT_CUSTOM_KEY, "#" + raw);
          storageSet(EFFORT_CHOICE_KEY, "custom");
          console.log("[dsh-pixel-skin] 能力色谱 → custom #" + raw + "（面板下次打开时生效）");
        },
        effortPalettes() { return EFFORT_PALETTE_IDS.concat(["custom"]).slice(); },
        status(id) {
          if (STATUS_PHRASES[id] === undefined) {
            console.log("[dsh-pixel-skin] 未知状态短语：" + id + "，可用：" + STATUS_IDS.join("/"));
            return;
          }
          storageSet("pixel-skin:status", id);
          // 2.1.3：节点级热切换——把已替换的短语换成新短语（保留用时后缀），
          // 不再整元素 textContent 改写（会清空 React 子节点）
          const phrase = currentStatusText();
          const nodes = document.querySelectorAll('[data-pixel-status="swapped"]');
          for (const el of nodes) {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let node;
            const prev = el.dataset.pixelStatusPhrase;
            while ((node = walker.nextNode())) {
              const value = node.nodeValue || "";
              if (prev && value.includes(prev)) node.nodeValue = value.replace(prev, phrase);
            }
            el.dataset.pixelStatusPhrase = phrase;
          }
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

    // ---- 设置分区：像素皮肤（settings.section）----
    function settingsCopy() {
      const zh = String((typeof navigator !== "undefined" && navigator.language) || "").toLowerCase().startsWith("zh");
      return {
        paletteTitle: zh ? "像素主题色" : "Pixel palette",
        paletteHint: zh ? "切换强调色，立即生效并保存。" : "Switch accent color; applies instantly and persists.",
        accentTitle: zh ? "自定义强调色" : "Custom accent",
        accentHint: zh ? "取色后自动切到「自定义」主题；留空则保持内置配色。" : "Picking a color switches to the Custom palette; leave empty to stay on a preset.",
        scanlinesTitle: zh ? "CRT 扫描线" : "CRT scanlines",
        scanlinesHint: zh ? "叠加复古扫描线，默认关闭。" : "Overlay retro scanlines; off by default.",
        scaleTitle: zh ? "像素缩放档位" : "Pixel scale",
        scaleHint: zh ? "1x / 2x 为整数倍，点阵最锐利；1.5x 为半整数倍，可能略发虚。" : "1x / 2x are integer steps and stay sharp; 1.5x is a half step and may look slightly soft.",
        statusTitle: zh ? "回合状态句" : "Turn status",
        statusHint: zh ? "思考中的状态文案。" : "The status line shown while thinking.",
        spectrumTitle: zh ? "能力色谱" : "Effort spectrum",
        spectrumHint: zh
          ? "推理等级滑块的单色渐变，由浅到深；最深档仍保持可辨识的颜色。"
          : "Single-hue gradient for the effort slider, light to dark; the deepest step stays visible.",
        spectrumCustomHint: zh
          ? "取色后自动生成专属色带，并切到「自定义」。"
          : "Picking a color derives your own gradient and switches to Custom.",
        panelTitle: zh ? "能力等级面板" : "Effort panel",
        panelHint: zh
          ? "在模型菜单里点「推理等级」打开 GBA 窗框面板。拖动 0-100，松手或失焦才写入并吸附到最近档位。"
          : "Open the GBA-framed panel from the model menu via Reasoning effort. Drag 0-100; the value is written and snapped to the nearest level on release or blur.",
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
      const [accent, setAccent] = React.useState(readCustomAccent() || "");
      const [scanlines, setScanlines] = React.useState(storageGet("pixel-skin:scanlines") === "1");
      const [scale, setScale] = React.useState(readScale());
      const [effortChoice, setEffortChoice] = React.useState(readEffortChoice());
      const copy = settingsCopy();
      const zh = String((typeof navigator !== "undefined" && navigator.language) || "").toLowerCase().startsWith("zh");
      const card = (title, body) => React.createElement(
        "section",
        { className: "pixel-skin-card" },
        React.createElement("h3", { className: "pixel-skin-card-title" }, title),
        body,
      );
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
          // 2.2.0：自定义色块（有设置时显示为所选色）
          React.createElement(
            "button",
            {
              key: CUSTOM_ID,
              type: "button",
              className: "pixel-skin-swatch" + (current === CUSTOM_ID ? " is-selected" : ""),
              style: { background: accent || "#c9bda6" },
              "aria-pressed": current === CUSTOM_ID,
              "aria-label": "Custom",
              title: "自定义 / Custom",
              onClick: () => {
                if (accent && window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.palette(CUSTOM_ID);
                if (accent) setCurrent(CUSTOM_ID);
              },
            },
            "自",
          ),
          React.createElement("span", { className: "pixel-skin-hint" }, copy.paletteHint),
        )),
        // ---- 2.2.0 新增：自定义强调色 ----
        card(copy.accentTitle, React.createElement("div", { className: "pixel-skin-row" },
          React.createElement("input", {
            type: "color",
            className: "pixel-skin-color",
            value: accent || "#d9363e",
            "aria-label": copy.accentTitle,
            onChange: (e) => {
              const value = e.target.value;
              setAccent(value);
              if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.accent(value);
              setCurrent(CUSTOM_ID);
            },
          }),
          React.createElement("span", { className: "pixel-skin-hint" }, copy.accentHint),
        )),
        // ---- 2.2.0 新增：CRT 扫描线开关 ----
        card(copy.scanlinesTitle, React.createElement("div", { className: "pixel-skin-row" },
          React.createElement(
            "button",
            {
              type: "button",
              className: "pixel-skin-status" + (scanlines ? " is-selected" : ""),
              "aria-pressed": scanlines,
              onClick: () => {
                const next = !scanlines;
                if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.scanlines(next);
                setScanlines(next);
              },
            },
            scanlines ? (zh ? "已开启" : "On") : (zh ? "已关闭" : "Off"),
          ),
          React.createElement("span", { className: "pixel-skin-hint" }, copy.scanlinesHint),
        )),
        // ---- 2.2.0 新增：像素缩放档位 ----
        card(copy.scaleTitle, React.createElement("div", { className: "pixel-skin-row" },
          SCALE_IDS.map((id) => React.createElement(
            "button",
            {
              key: id,
              type: "button",
              className: "pixel-skin-status" + (scale === id ? " is-selected" : ""),
              "aria-pressed": scale === id,
              onClick: () => {
                if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.scale(id);
                setScale(id);
              },
            },
            SCALES[id].label,
          )),
          React.createElement("span", { className: "pixel-skin-hint" }, copy.scaleHint),
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
        card(copy.spectrumTitle, React.createElement("div", null,
          React.createElement("div", { className: "pixel-skin-row" },
            EFFORT_PALETTE_IDS.map((id) => React.createElement(
              "button",
              {
                key: id,
                type: "button",
                className: "pixel-skin-effort" + (effortChoice.mode === id ? " is-selected" : ""),
                "aria-pressed": effortChoice.mode === id,
                onClick: () => {
                  if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.effortPalette(id);
                  setEffortChoice({ mode: id });
                },
              },
              React.createElement("span", {
                className: "pixel-skin-effort-strip",
                style: { background: effortGradientCss(EFFORT_PALETTES[id].stops) },
              }),
              React.createElement("span", { className: "pixel-skin-effort-label" }, EFFORT_PALETTES[id].label[zh ? "zh" : "en"]),
            )),
          ),
          React.createElement("div", { className: "pixel-skin-row" },
            React.createElement("input", {
              className: "pixel-skin-color",
              type: "color",
              value: effortChoice.mode === "custom" ? effortChoice.color : "#4a74d2",
              onChange: (event) => {
                const color = event.target.value;
                if (window.__PIXELSKIN__ !== undefined) window.__PIXELSKIN__.effortCustom(color);
                setEffortChoice({ mode: "custom", color });
              },
            }),
            React.createElement("span", {
              className: "pixel-skin-effort-strip",
              style: { background: effortGradientCss(effortStops(effortChoice)) },
            }),
          ),
          React.createElement("span", { className: "pixel-skin-hint" },
            effortChoice.mode === "custom" ? copy.spectrumCustomHint : copy.spectrumHint),
        )),
        card(copy.panelTitle, React.createElement("div", null,
          React.createElement("span", { className: "pixel-skin-hint" }, copy.panelHint),
        )),
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
      applyScale(readScale());
      let disposeTokens = ctx.theme.overrideTokens("dsh-pixel-skin", buildTokens(resolvePalette(palette)));
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

      // 推理等级像素面板：模型菜单 →「推理等级」→ GBA 双描边窗框
      // modelDirectories 是可选依赖，拿不到就整段跳过，不能让皮肤失效
      try {
        const startEffort = (resolver, sessions) => {
          if (!resolver || typeof resolver.directoryFor !== "function") return;
          ctx.effect(() => installEffortPicker(ctx, resolver, sessions), "pixel-skin: effort picker");
        };
        if (typeof ctx.inject === "function") {
          ctx.inject(["modelDirectories"], (scope) => startEffort(scope.modelDirectories, scope.sessions));
        } else {
          startEffort(ctx.modelDirectories, ctx.sessions);
        }
      } catch (e) {
        // 官方未提供 modelDirectories 时静默降级：设置页里的色谱仍可用
      }

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
