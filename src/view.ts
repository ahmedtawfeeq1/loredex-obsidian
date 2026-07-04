import { buildDashboard, renderDashboardMarkdown } from 'loredex'
import { ItemView, MarkdownRenderer, type WorkspaceLeaf } from 'obsidian'
import type LoredexPlugin from './main'

export const VIEW_TYPE_LOREDEX = 'loredex-dashboard'

/** Live product dashboard — computed from the vault on open, no file written. */
export class DashboardView extends ItemView {
  constructor(
    leaf: WorkspaceLeaf,
    private readonly plugin: LoredexPlugin,
  ) {
    super(leaf)
  }

  getViewType(): string {
    return VIEW_TYPE_LOREDEX
  }

  getDisplayText(): string {
    return 'Loredex dashboard'
  }

  getIcon(): string {
    return 'radar'
  }

  async onOpen(): Promise<void> {
    this.addAction('refresh-cw', 'Refresh', () => void this.render())
    await this.render()
  }

  async render(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement
    container.empty()
    container.addClass('markdown-preview-view')
    const today = new Date().toISOString().slice(0, 10)
    try {
      const config = this.plugin.resolveConfig()
      const dashboard = buildDashboard(config.vaultPath, today)
      const markdown = renderDashboardMarkdown(dashboard, today)
      await MarkdownRenderer.render(this.app, markdown, container, '/', this)
    } catch (error) {
      container.createEl('p', { text: 'Loredex could not read the vault — see developer console.' })
      console.error('loredex: dashboard render failed', error)
    }
  }
}
