# dsh-pixel-skin 2.3.0 变更说明

本文件记录 2.3.0 的三处改动、各自的根因与验证边界。开发期文档，发布时保留。

## 1. 回合状态句替换不生效 —— 根因与修复

**症状**：设置 → 像素皮肤 → 回合状态句 选择任意短语，聊天区的「深度求索中」不变化。2.1.2（改匹配文案）
和 2.1.3（改文本节点替换）两次修复均无效。

**根因**：替换对象错了，不是替换方式错了。DSH 0.1.7-rc.2 的 DOM 结构为：

```html
<span class="TTCZqG_visuallyHidden" role="status" aria-live="polite">深度求索中</span>
<button class="l_V-RG_root" data-turn-process="…">
  <span class="l_V-RG_label">深度求索中，用时1小时07分21秒</span>
  <svg class="l_V-RG_chevron"/>
</button>
```

`TTCZqG_visuallyHidden` 的样式是 `clip:rect(0 0 0 0);width:1px;height:1px;position:absolute;overflow:hidden`
—— 屏幕阅读器专用，肉眼不可见。旧选择器

```
[role="status"], [class*="_turnStatus"], [class*="_activity"], [class*="_busy"]
```

- `[role="status"]` 只命中上面那个隐藏 span（另命中 retry / turnError 行，但不含目标文案）；
- `_turnStatus` / `_activity` / `_busy` 三族类名在整个 `@deepseek-ai/dsh` checkout 中 0 命中
  （`dsh-client-ui-chat` 的 CSS module 类名形如 `l_V-RG_*`、`xzv4MW_*`、`TTCZqG_*`）。

于是替换每次都成功执行，只是写进了 1×1px 的隐藏节点。可见的 `l_V-RG_label` 从未被选中。

**Patch-Shape Triage**

```
PatchShape:        sample-text exception（NEEDLE 硬编码渲染后文案）
                    + presentation-layer patch（DOM 文本改写）
CanonicalOwner:    上游 i18n key chat.deepDiving / message.turnProcess.deepDivingFor
                    （@deepseek-ai/dsh-client-ui-chat），皮肤无权拥有
UpwardDrillSignal: 选择器锚在类名哈希 + 字面文案，两者都不是契约
Decision:          rebind → 锚到稳定结构属性 button[data-turn-process]
```

**修复边界**（两处同源）：

- `lib/client.js` 的 `CANDIDATES` 主锚点改为 `[data-turn-process]`，旧类名分支保留兼容老版本；
- CSS 的 `[class*="_turnStatus"]` 改为 `button[data-turn-process] > span`，旧锚点并存（与标题栏
  `pI_x6G` / `ZTP-Xa` 双代锚点同款做法）。

**遗留脆弱点**（本次不是成因，但会是下一次）：`NEEDLE` 仍是渲染后字面量。上游文案：

| key | zh | en |
|---|---|---|
| `chat.deepDiving` | `深度求索中`（**无省略号**） | `Deep diving...` |
| `message.turnProcess.deepDivingFor` | `深度求索中，用时{duration}` | `Deep diving for {duration}` |

四条目前都能匹配；上游一改措辞即静默失效。根治需上游暴露 i18n key，皮肤层无法独自完成。

## 2. issue #1199（DSH STORE catalog 阻塞）整改

原阻塞 6 项，本次修可修的 4 项：

| # | 阻塞项 | 处置 |
|---|---|---|
| 1 | manifest `repository` 与 canonical 仓库不符 | 字段原本**缺失**，补 `git+https://github.com/zhuifengqug/pixel-skin.git`；同时补 `homepage` / `bugs` |
| 2 | 许可证 manifest / GitHub / 分发产物三方不一致 | 仓库原本**没有 LICENSE 文件**（manifest 写 MIT，GitHub 识别不到）。补 `LICENSE`（MIT，纯文本不含附加条款以免干扰 GitHub 识别），并把 `LICENSE` 加入 `files` |
| 3 | DSH 兼容范围未显式声明 | 补 `dsh.compatibility.dshReleases`，取值严格用 `compatible` / `incompatible` / `unknown` |
| 4 | Node.js 兼容未声明 | 补 `engines.node: ">=18"` |
| 5 | 运行时源码含 files 权限信号 | **固有**，不可消除（`localStorage` 持久化 6 个偏好键）。改为在 README 如实声明 |
| 6 | 运行时源码含 network 权限信号 | **固有**，不可消除（`@font-face` 取字体）。改为在 README 如实声明 |

第 3 项的取值依据（**只声明实际适配过的，不猜测**）：

- `0.1.7-rc.2: "compatible"` —— 2.2.x/2.3.x 就是对它做的适配，已装入 `web` profile 并通过 `--dump-config` 核对；
- `0.1.7-rc.1` / `0.1.7-alpha.2: "unknown"` —— 未做运行验证。

npm `dist-tags` 实测：`latest = 0.1.7-rc.2`，`alpha = 0.1.7-alpha.2`，`next = 0.2.0-rc.1`。
商店滚动窗口取 `latest` 及其前两个未弃用发行版，即上述三者。规则要求三者中**至少一个** `compatible`。

`author` 由占位符 `"dsh user"` 改为 `"zhuifengqug"`（与 repository 身份一致）。

> 商店原文：「高权限项目可能仍需保持 `user-reviewed`/`blocked`，声明本身不保证自动批准」。
> 5、6 两项属于皮肤固有能力，预期不会拿到自动 `source-verified`，属正常结果，不是整改失败。

## 3. 推理等级像素面板（滑块）—— **本轮搁置，未随 2.3.0 发布**

> 用户决定：**「滑块不做了，之后再做」。** 因此开发期的实现（面板 CSS、色谱、菜单拦截、
> 设置卡片、console API、`modelDirectories` 接线）在**发版前**整体摘除 577 行，
> 2.3.0 只保留第 1、2 两节的修复。
> 代码完整留在 git 历史：`1e59a14..d2170f8`。

摘除的直接理由是：这个面板在 2.3.0 里**开不起来**，而设置页却写着「在模型菜单里点
『推理等级』打开 GBA 窗框面板」——那是**假说明**。发一个 UI 声称存在、实际点不进去的功能，
比不发更糟。另外菜单侧的拦截器当时是「取不到 sessionId 就什么都不拦」的安全写法，
所以官方子菜单照常可用，摘除动作不会让任何东西比现在更坏。

### 3.1 已确认的技术事实（下次接着做时直接可用，别再重走）

这两条是这一轮真正换来的东西，均已**实测**，不是推测：

**① `SessionListState` 没有 `current` / `sessionId` 字段。**

```ts
// @deepseek-ai/dsh-api-session-controller/lib/types/client/sessions/service.d.ts
export interface SessionListState {
  ids: SessionId[];
  byId: Record<SessionId, SessionSummary>;
  phase: SessionListPhase;
  projectionsBySession: ...;
}
```

因此 `sessions.list.getSnapshot().current` **恒为 `undefined`** —— 这就是「点了没反应」的
直接成因（我先 `preventDefault()` 再判断，把官方子菜单吃掉了）。`ISessions` 的契约注释也写明
`navigation belongs to view owners`：**sessions 服务不负责「当前会话是哪个」**。

正确的三个来源，按可靠性排序：

1. **slot 的 `sessionId` 入参** —— 官方 `conversation.input.model` 注册处就是
   `inject: (sessionId) => { const directory = models.directoryFor(sessionId); ... }`；
2. **DOM 上的 `data-conversation-session` 属性** —— 官方自己也这么用：
   `const occurrence = target.closest("[data-conversation-session]");`
   `const sessionId = occurrence.dataset.conversationSession;`
3. `ctx.sessions.list.getSnapshot().ids` 只有目录列表，**不能用来判断当前会话**。

**② 官方模型菜单是 `createPortal` 挂出去的，`element.closest()` 从菜单项上爬不回会话容器。**

`ModelSelect` 用 `react_dom.createPortal(<MenuSurface role="menu" id={useId()}-menu .../>)`，
且该 `id` 来自 `react.useId()`，**与 sessionId 无关**，不能反推。
所以拦截菜单项时不能指望 `closest("[data-conversation-session]")` —— 必须在**打开菜单的那次
点击（落在会话树内的 trigger 上）**就先把 sessionId 记下来。

### 3.2 已验证可用的实现资产（重做时可直接复用）

| 资产 | 状态 |
|---|---|
| `directory.select({provider, model, reasoningEffort})` → 解析 `{ok, error}`（**不是 reject**） | 已确认，官方调用方是 `if (!r.ok) throw r.error` |
| `model.reasoning = { defaultEffort?, efforts: [{id, name}] }`，**离散命名档位**非 0–100 | 已确认，DeepSeek 线路为 `off\|low\|high\|max` |
| `ctx.modelDirectories.directoryFor(sessionId)` + `.store.subscribe()` + `.load()` | 服务仍在 `dsh-client-ui-model-selection` |
| ModuleLoader **只注册 `react`，没有 `react-dom/client`** → 面板须用原生 DOM 构建 | 已确认 |
| GBA 双描边 `box-shadow: 0 0 0 2px <inner>, 0 0 0 4px <outer>`、HP 段格、像素箭头、`steps(2)` 弹跳 | CSS 已写过并 `node --check` 通过，见 `1e59a14` |
| 蓝 / 绿 / 红橙三套单色由浅到深 stop + `customStops(hex)` 由取色器生成色带 | 同上 |
| 「松手/失焦才写一次」写入策略（相对 2.1.5 每 16ms 一次） | 已设计，未实测 |
| 行匹配正则 `/^(推理等级\|Reasoning effort\|Effort(?![A-Za-z]))/` | 已跑过 7 条命中/拒绝用例 |

### 3.3 这一轮的方法教训

面板连续三次返工（重复入口 → 点不动 → 完全没反应），**每一次都是在零浏览器验证的情况下
直接提交的**。`node --check` 只证明语法，对 DOM 时序和宿主契约毫无说服力。

下次重做时的硬性前置：先写一个**最小探针**——点击时只 `console.log` 命中的行、解析到的
`sessionId`、以及 `directoryFor()` 是否成功——**确认三条契约都对了，再往上盖 UI**。
