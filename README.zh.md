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

## 安装

### npm 安装

包已发布到 npm，执行：

```sh
npm install dsh-pixel-skin

dsh plugin --profile web add dsh-pixel-skin
```

也可以使用 pnpm：

```sh
pnpm add dsh-pixel-skin
dsh plugin --profile web add dsh-pixel-skin
```

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

安装后重启 `dsh web`，然后在浏览器中执行硬刷新（Ctrl+F5）。

## 打包下载

如果不使用 npm，也可以在仓库目录生成 tarball：

```sh
npm pack
# 生成 dsh-pixel-skin-0.1.0.tgz

dsh plugin --profile web add ./dsh-pixel-skin-0.1.0.tgz
```

仓库地址：<https://github.com/zhuifengqug/pixel-skin>

## 控制台 API

在浏览器控制台执行：

```js
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
