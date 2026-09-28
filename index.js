/**
 * dsh-pixel-skin — host half（无操作占位）
 *
 * 2.1.5 起全部表现都在客户端（官方 ThemeService token 覆盖 + 自有 <style> 注入）；
 * 2.2.0 起在客户端新增配色扩充/自定义强调色、像素缩放档位与设置项完整化。
 * 原 /pixel-declare 推理档位补全命令与 models.dev 启动补全已移除；
 * 模型推理档位由用户在 cordis.patch.yml 中对 llm-pi-ai providers 静态声明。
 * host 保持 no-op，避免 Node 启动时有任何副作用。
 */
export const name = 'pixel-skin'
export const inject = []

export function apply(ctx) {
  ctx.logger?.info?.('[dsh-pixel-skin] host loaded (client owns tokens + css)')
}
