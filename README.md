# dsh-pixel-skin · Red-White Pixel Skin

[中文文档](README.zh.md)

A Famicom-inspired pixel skin for the DeepSeek Harness GUI (Web browser + Electron desktop): warm white surfaces, cartridge red, charcoal text, square geometry, hard shadows, pixel fonts, grid texture, and stepped motion.

> 中文用户请阅读：[README.zh.md](README.zh.md)

给 DeepSeek Harness（Web 与 Electron 桌面端）换上 Famicom（红白机）配色的像素风皮肤：米白机壳 + 卡带红 + 炭黑，直角、硬阴影、像素字体、网格底、阶跃动画。

## 特性

- 只覆盖官方语义 token（`--dsw-alias-*` / `--dsw-specific-*`），不碰布局与组件
- 浅色 / 深色两套完整配色
- 中文与英文 UI：Fusion Pixel 12px Proportional SC（OFL-1.1）；代码/终端：Fusion Pixel 12px Monospaced SC
- 正文基准约 16px，代码与数字约 17px，避免像素字体显得过小
- 固定版本字体资源失败时回退到系统中文字体，不影响界面功能
- 直角、硬阴影、像素按下位移、方形滚动条、棋盘网格底
- 可选 CRT 扫描线（默认关）
- 与官方 Appearance（浅/深/跟随系统）兼容；与其他主题插件共存时**后加载层胜**（本插件默认最后加载 → 优先）
- **八套可切换强调色 + 自定义色**：红 / 蓝 / 绿 / 黄 / 紫 / 橙 / 青 / 粉，在 Settings → Pixel skin 分区一键切换，或用取色器设自定义强调色，localStorage 持久化
- **像素缩放档位**：1x / 1.5x / 2x，在设置分区切换，整数倍点阵最锐利
- **HP 条式状态**：上下文分解条改为方形血量段（系统绿 / 工具蓝 / 消息随主题色），运行中的工具卡片显示「战斗中」斜纹扫动
- **GBA 式对话窗**：弹窗 / 菜单 / 面板使用双层像素描边，选中项黄色高亮
- **像素球加载动画**：圆形 spinner 替换为原创 8-bit 红白像素球（弹跳阶跃动画）
- **回合状态句**：思考中的「Deep diving...」可独立替换为 待机… / 正在蓄力… / 正在出招… / 正在进化…（Pixel skin 设置分区或控制台切换）
- **桌面端适配（2.1.0 新增，2.1.1 修订）**：Windows 自绘标题栏拖拽带铺米色侧栏底 + 2px 墨线、内容区圆角归零；全部旧 token 引用带真实 token / 字面量兜底（对齐 DSH 0.1.7 仅 14 个主题 token 的现实）；字体三级候选链。2.1.1 修复三处桌面端过宽匹配：GBA 窗框改按 WAI-ARIA 浮层角色匹配（不再命中主内容面板 / 顶栏菜单，消除对话页 L 形黑线）；侧栏行不再强制 padding（消除「插件」行图标文字重叠）；`_primary` 仅作用于按钮。2.1.2：状态句匹配放宽（「深度求索中，用时…」等带后缀变体可替换且保留用时）；像素球重绘为直角分层球，替代 conic 渐变噪点。2.1.3：状态句替换改为文本节点级 + 候选扩展 `_turnStatus`/`_activity`/`_busy`；`__PIXELSKIN__` 新增 `version` 字段。2.1.5：移除能力等级面板（自绘滑块）、滑块配色设置与 `/pixel-declare` 补全命令——拖动时的高频异步写入与远端回写相互竞争，导致切换卡顿、需多次点击；推理等级切换回归官方模型菜单（档位由 cordis.patch.yml 静态声明）。**2.2.0：适配 DSH 0.1.7-rc.2 并新增 4 项能力，且不删减任何既有功能（无 BREAKING）**：配色扩充到 8 套（红/蓝/绿/黄/紫/橙/青/粉）+ 自定义强调色（由单色推导 hover/soft/tint 整套）；像素缩放档位 1x/1.5x/2x（CSS `zoom`，会正确重排并同步命中测试）；设置项完整化（自定义强调色 / CRT 扫描线 / 像素缩放全部进入「像素皮肤」分区，控制台 API 保留并新增 `accent()` / `scale()` / `scales()`）；修复字体候选链远程兜底指向第三方仓库（`ADAning/dsh-pixel-skin`，与本仓库 origin 不是同一仓库、内容也不一致）的问题，改指本仓库 origin 固定 commit；修复桌面端标题栏适配静默失效（0.1.7-rc.2 布局类名哈希已由 `ZTP-Xa` 变为 `pI_x6G`，现同时匹配两代哈希）。新增 localStorage 键为纯附加，既有三键值域未改动。

> 像素球、HP 条与窗框均为原创 8-bit 图形，灵感来自 90 年代掌机游戏界面；未使用任天堂 / Pokémon 官方素材或商标名称。

## Screenshots

### DSH Web home

![dsh-pixel-skin home](assets/screenshots/home.png)

### Settings

![dsh-pixel-skin settings](assets/screenshots/settings.png)

## 安装

### DSH 安装（推荐）

只需执行下面一条命令。`dsh plugin` 会在对应 profile 中安装、登记并激活这个插件：

```sh
dsh plugin --profile web add dsh-pixel-skin
# 桌面端：
dsh plugin --profile desktop add dsh-pixel-skin
```

桌面端安装后重启 DeepSeek Harness 桌面应用；Web 安装后重启 `dsh web` 并硬刷新浏览器。

### 作为普通 npm 依赖使用（可选）

如果你要在其他 Node.js 项目中引用这个包，可以使用：

```sh
npm install dsh-pixel-skin
# 或
pnpm add dsh-pixel-skin
```

这一步不会自动把插件加入 DSH Web profile；DSH 用户不需要先执行它。

查看当前 npm 版本：

```sh
npm view dsh-pixel-skin version
```

### GitHub 安装（当前可用）

```sh
dsh plugin --profile web add github:zhuifengqug/pixel-skin
```

### 本地安装

```sh
dsh plugin --profile web add D:/dsh/pixel-skin
```

重启 `dsh web` 并硬刷新浏览器。之后改 `lib/client.js` 需要重新构建客户端 bundle；若 DSH checkout 正在运行 `pnpm run dev:web`，客户端 HMR 可在重载后生效。

## 开关 / 控制台 API

浏览器控制台：

```js
__PIXELSKIN__.palette('red')      // 切换主题色：red / blue / green / yellow / purple / orange / teal / pink / custom
__PIXELSKIN__.palettes()          // ['red','blue','green','yellow','purple','orange','teal','pink','custom']
__PIXELSKIN__.accent('#8b5cd6')   // 2.2.0 新增：设自定义强调色（6 位十六进制），自动切到 custom
__PIXELSKIN__.scale('2')          // 2.2.0 新增：像素缩放档位 '1' / '1.5' / '2'
__PIXELSKIN__.scales()            // ['1','1.5','2']
__PIXELSKIN__.status('idle')      // 状态句：idle / charge / move / evolve
__PIXELSKIN__.statuses()            // ['idle','charge','move','evolve']
__PIXELSKIN__.scanlines(true)     // 开启扫描线（false 关闭）
__PIXELSKIN__.off()               // 停用皮肤（刷新后恢复官方外观）
__PIXELSKIN__.on()                // 重新启用
```

localStorage：

- `pixel-skin:enabled` = `0` → 整体停用
- `pixel-skin:scanlines` = `1` → 扫描线
- `pixel-skin:accent` = `#8b5cd6` → 2.2.0 新增：自定义强调色
- `pixel-skin:scale` = `2` → 2.2.0 新增：像素缩放档位（`1` / `1.5` / `2`）

## 打包下载

不发布 npm 时，也可以生成本地 tarball：

```sh
npm pack
# 生成 dsh-pixel-skin-2.1.2.tgz

dsh plugin --profile web add ./dsh-pixel-skin-2.1.2.tgz
```

GitHub 仓库地址：<https://github.com/zhuifengqug/pixel-skin>

## 卸载

```sh
dsh plugin --profile web remove dsh-pixel-skin
```

## 已知边界

- 侧栏/工具栏图标是 @iconify 矢量图标，本皮肤只改颜色、不改图标形状
- Fusion Pixel 字体来自固定版本的字体资源；插件同时保留 `assets/fonts` 与 OFL-1.1 声明
- 字体三级候选链（`/plugins/dsh-pixel-skin/assets/fonts/*` → `./assets/fonts/*` → 本仓库固定 commit 远程 URL）；当前 `/plugins` 路由不服务插件 assets，本地候选多为 404，由远程兜底。**2.2.0 起远程兜底只指向本仓库 origin（`zhuifengqug/pixel-skin`），不再引用任何第三方仓库**；发布前必须先推送该 commit，否则远程候选也 404，字体会降级为系统中文字体（不影响 DSH 功能）；加载失败回退系统字体
- 桌面端 Windows 自绘标题栏样式基于 `html[data-windows-titlebar]` 与官方布局骨架类名哈希。**该哈希是压缩产物，DSH 0.1.7-rc.2 实测为 `pI_x6G`，2.1.5 及之前写死的 `.ZTP-Xa_*` 已失效**（因此桌面端标题栏适配曾静默失效）。现在同时匹配两代哈希，官方再次改名时仍会失效，届时只需在 `lib/client.js` 的桌面端段落补一个哈希前缀
- 1.5x 为半整数倍缩放，点阵可能略发虚；1x / 2x 为整数倍，最锐利
- GBA 窗框按 WAI-ARIA 浮层角色（dialog / menu / listbox / alertdialog / tooltip）与 `_popup` / `_popover` / `_dropdown` 类名后缀匹配；不使用这些角色/后缀的第三方插件浮层保持原生外观
- DSH 仍在 developer preview，token 集若变动需在 `lib/client.js` 的 `TOKENS` 里重新对齐
