/**
 * dsh-pixel-skin — host half（无操作占位）
 * 全部表现都在客户端：官方 ThemeService token 覆盖 + 自有 <style> 注入。
 * host 保持 no-op，避免 Node 启动时有任何 DOM 副作用。
 */
export const name = 'pixel-skin'

export function apply(ctx) {
  ctx.logger?.info?.('[dsh-pixel-skin] host loaded (client owns tokens + css)')
}
