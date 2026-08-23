# dsh-pixel-skin · 红白机像素风皮肤

[English README](README.md)

给 DeepSeek Harness Web GUI 换上红白机（Famicom）风格：米白机壳、卡带红、炭黑文字、墨蓝代码区、复古黄色交互态和掌机绿色成功态。

## 特性

- 通过官方 ThemeService 覆盖浅色/深色语义 token，不修改 DSH 主仓库
- 中文与英文 UI 使用 Fusion Pixel 12px Proportional SC
- 代码与终端使用 Fusion Pixel 12px Monospaced SC
- 正文基准约 16px，代码与数字约 17px
- 直角、硬阴影、像素按下位移、方形滚动条和网格背景
- 墨蓝色代码/终端区域，黄色进行中和提示状态，绿色成功状态
- 可选 CRT 扫描线，默认关闭
- 与官方浅色、深色、跟随系统模式兼容
- 与其他主题插件共存时，本插件作为最后加载层优先覆盖冲突 token
- **四套可切换强调色**：红 / 蓝 / 绿 / 黄，在「设置 → 像素皮肤」分区一键切换，localStorage 持久化
- **HP 条式状态**：上下文分解条改为方形血量段（系统绿 / 工具蓝 / 消息随主题色），运行中的工具卡片显示「战斗中」斜纹扫动
- **GBA 式对话窗**：弹窗 / 菜单 / 面板使用双层像素描边，选中项黄色高亮
- **像素球加载动画**：圆形 spinner 替换为原创 8-bit 红白像素球（弹跳阶跃动画）
- **回合状态句**：思考中的「Deep diving...」可独立替换为 待机… / 正在蓄力… / 正在出招… / 正在进化…（「像素皮肤」设置分区或控制台切换）
- **滑块配色可选**：能力等级滑块支持蓝系 / 绿系 / 红橙三套由浅到深的单色渐变，也可用自定义取色器生成专属色带
- **能力等级面板**：点击模型菜单中的「推理等级」打开 GBA 双描边窗框；使用 Fusion Pixel 字体、EXP 经验条、HP 段格子和像素箭头。
- **推理等级拖动**：支持 0–100 拖动、16ms 节流写入 effort，松手或失焦时吸附到最近的模型档位。
- **能力色谱**：单色系由浅到深渐深，最深档仍保持可见颜色；当前格显示白色顶边。
- **自动补全图鉴**：无推理档位的模型会出现「补全图鉴」入口，调用 `/pixel-declare` 按 models.dev 和模型家族规则补全配置。

> 像素球、HP 条与窗框均为原创 8-bit 图形，灵感来自 90 年代掌机游戏界面；未使用任天堂 / Pokémon 官方素材或商标名称。

## 截图

### DSH Web 主页

![dsh-pixel-skin 主页](assets/screenshots/home.png)

### 设置页面

![dsh-pixel-skin 设置页](assets/screenshots/settings.png)

## 安装

### DSH Web 安装（推荐）

只需要执行下面这一条命令。`dsh plugin` 会在 `web` profile 中完成包安装、登记和激活：

```sh
dsh plugin --profile web add dsh-pixel-skin
```

安装后重启 `dsh web`，然后在浏览器中硬刷新（Ctrl+F5）。

### 作为普通 npm 依赖使用（可选）

如果你想在其他 Node.js 项目中使用这个包，可以执行：

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

安装后重启 `dsh web`，然后在浏览器中执行硬刷新（Ctrl+F5）。之后改 `lib/client.js` 需要重新构建客户端 bundle；若 DSH checkout 正在运行 `pnpm run dev:web`，客户端 HMR 可在重载后生效。

## 打包下载

如果不使用 npm，也可以在仓库目录生成 tarball：

```sh
npm pack
# 生成 dsh-pixel-skin-2.0.0.tgz

dsh plugin --profile web add ./dsh-pixel-skin-2.0.0.tgz
```

仓库地址：<https://github.com/zhuifengqug/pixel-skin>

## 控制台 API

在浏览器控制台执行：

```js
__PIXELSKIN__.palette('red') // 切换主题色：red / blue / green / yellow
__PIXELSKIN__.palettes() // ['red','blue','green','yellow']
__PIXELSKIN__.status('idle') // 状态句：idle / charge / move / evolve
__PIXELSKIN__.statuses() // ['idle','charge','move','evolve']
__PIXELSKIN__.effortPalette('blue') // 滑块配色：blue / green / ember
__PIXELSKIN__.effortCustom('#f0a030') // 自定义滑块主色
__PIXELSKIN__.scanlines(true) // 开启扫描线
__PIXELSKIN__.scanlines(false) // 关闭扫描线
__PIXELSKIN__.off() // 停用皮肤，刷新后恢复官方外观
__PIXELSKIN__.on() // 重新启用皮肤，刷新后生效
```

也可以通过 localStorage 控制：

```text
pixel-skin:enabled = 0     # 整体停用
pixel-skin:scanlines = 1   # 开启扫描线
```

## 推理等级补全

Host 注册 `/pixel-declare <provider>` 命令。它只修改没有 `reasoningEfforts` 的模型：优先读取 [models.dev](https://models.dev) 的唯一匹配，目录不可用时使用保守的模型家族推断；图像模型和无法判断的模型会跳过。可选的启动补全仍由 `cordis.patch.yml` 中的 `enrichFromModelsDev` 控制，默认关闭。

点击模型菜单中的「推理等级」后，面板会读取当前模型公开的 `reasoning.efforts`，并通过 `session.selectModel` 写回当前会话。没有档位的模型则提供「补全图鉴」按钮。

## 卸载

```sh
dsh plugin --profile web remove dsh-pixel-skin
```

卸载后重启 `dsh web` 并刷新页面即可恢复官方外观。

## 字体与许可证

插件使用 Fusion Pixel 字体：

- `Fusion Pixel 12px Proportional SC`：中文/英文 UI
- `Fusion Pixel 12px Monospaced SC`：代码和终端
- `Fusion Pixel Latin`：拉丁字符补充

字体版权归 TakWolf 所有，字体部分使用 SIL Open Font License 1.1。完整许可证见 [`assets/fonts/LICENSE.fusion-pixel.txt`](assets/fonts/LICENSE.fusion-pixel.txt)，第三方声明见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。

## 已知边界

- 侧栏和工具栏图标是矢量图标，本皮肤主要调整颜色和表面，不重绘图标形状
- 当前 client bundle 使用固定 commit 的远程字体 URL，同时保留 `assets/fonts` 字体文件作为离线构建来源
- 网络字体加载失败时会回退到系统中文字体，不影响 DSH 功能
- DSH 仍处于 developer preview，官方 token 名称变化时需要更新 `lib/client.js` 中的 `TOKENS`
