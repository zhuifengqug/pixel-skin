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

## 3. 推理等级像素面板（2.1.4 能力回归 + 新规格）

2.1.5（`ed2d807`）删除了 593 行 effort panel。本次按新规格恢复。

### 3.1 契约实测（0.1.7-rc.2）

`ctx.modelDirectories`（`ModelDirectoryResolver`）**仍然存在**，位于
`@deepseek-ai/dsh-client-ui-model-selection`：

- `directoryFor(sessionId)` → directory（未知 session 抛错）；
- `directory.store.subscribe(fn)` / `directory.load()` → snapshot；
- snapshot：`{ status, current: {provider, model, reasoningEffort?}, groups: [{id, models: [...]}], pending }`；
- `directory.select({ provider, model, reasoningEffort })` → Promise（`async select` 仍在）。

**关键差异**：推理档位不是 0–100 数值，而是**离散命名档位**：

```ts
model.reasoning = {
  defaultEffort?: string,
  efforts: Array<{ id: string, name: string }>,
}
```

DeepSeek 线路实测为 `off | low | high | max`（`dsh-llm-deepseek` 的 `ReasoningEffortId`）。

### 3.2 与新规格的映射

| 规格 | 实现 |
|---|---|
| 0–100 拖动 | `<input type=range min=0 max=100>`，纯本地视觉 |
| 吸附最近模型档位 | `step = 100/(N-1)`，`index = Math.round(value/step)` → `efforts[index].id` |
| 松手/失焦才写一次 | `pointerup` / `change` / `blur` 触发唯一一次 `select()`；拖动期间零写入 |
| GBA 双描边窗框 | `box-shadow: 0 0 0 2px <inner>, 0 0 0 4px <outer>` |
| EXP 经验条 / HP 段格子 | `.pixel-effort-cells` + `.pixel-effort-cell.is-filled` |
| 像素箭头 | `.pixel-effort-arrow` + `steps(2)` 弹跳 |
| 能力色谱 单色由浅到深 | 每格取色带对应 stop；最深档 `#2a4678` 级，仍可辨识非黑 |
| 当前格白色顶边 | `.pixel-effort-cell.is-current { border-top: 2px solid #fffdf8 }` |
| 蓝/绿/红橙三套 + 自定义 | `EFFORT_PALETTES` 三套固定 stop + `customStops(hex)` 生成 |

### 3.3 为什么这次不会再卡

2.1.5 删除它的原因是自绘滑块**高频异步写入 `effort` 与远端写回互相抢**，拖动卡顿。
新规格的「松手/失焦才写一次」把写入频次从每 16ms 一次降到每次拖拽一次，
竞态窗口从「持续存在」变为「仅提交瞬间」。这是本轮唯一的写入策略（经确认）。

**未验证项**：面板的实际视觉效果、拖动手感、以及写入后远端回填是否与本地一致，
均需浏览器实测。`node --check` 通过不代表运行时正确。

### 3.4 首版回归（用户截图发现）与修复

首版把「推理等级」入口**注入**进模型菜单，一次引入三个 bug：

| 症状 | 成因 |
|---|---|
| 与原来的「推理等级 high >」并列重复 | 官方模型菜单**本来就有**这一行；首版又 append 了一个同名入口 |
| 点击没反应 | 注入的裸 `<button>` 落在 **React 托管**的菜单 DOM 里，React 重渲染即失效；`stopPropagation` 也拦不住 React 合成事件 |
| 莫名其妙出现在别的菜单 | 选择器 `[role="menu"], [data-radix-menu-content], [class*="_menu"]` 命中**全应用**各种菜单（右键菜单、侧栏、下拉） |
| 没有滑块 | 面板压根没打开（上一条），自然没有滑块 |

**修法：不注入任何 DOM**，改为在捕获阶段拦截官方那一行的点击，`preventDefault` +
`stopPropagation` + `stopImmediatePropagation` 后打开自己的 GBA 面板。

理由是 owner 判断：官方那一行是 React 渲染的**稳定契约**，比「往别人的树里塞节点」
可靠得多。2.1.4 的 `EFFORT_LABELS` 检查本来就是为了识别这一行，首版把它弄丢了。

行匹配用一条正则，英文 `Effort` 带负向断言防止劫持 `Effortless…` 之类无关项：

```js
/^(推理等级|Reasoning effort|Effort(?![A-Za-z]))/
```

实测命中：`推理等级high >` ✓ `Reasoning effort high` ✓ `Effort` ✓；
正确拒绝：`Effortless mode` ✗ `模型 Space Bunny Alpha (CC) >` ✗ `已思考 · 3 次工具调用` ✗。

顺带两处加固：

1. `effortModelOf` 先按 provider 精确匹配，不中再退回全组找同名 model —— 否则
   provider 分组 id 与 `current.provider` 不同源时面板会是空的（又一个「没有滑块」来源）；
2. 面板挂载后 250ms 内忽略「点外面」判定 —— 打开面板的那次点击仍在事件派发途中，
   否则会被当成点外面立刻关掉。
