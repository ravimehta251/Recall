import { describe, expect, it, vi } from 'vitest'
import { parseSseBlock } from './chat'

describe('parseSseBlock', () => {
  it('dispatches token and citation events', () => {
    const handlers = { onToken: vi.fn(), onCitations: vi.fn(), onDone: vi.fn() }
    parseSseBlock('event: token\ndata: {"text":"hello"}', handlers)
    parseSseBlock('event: citations\ndata: [{"filename":"guide.pdf"}]', handlers)
    expect(handlers.onToken).toHaveBeenCalledWith('hello')
    expect(handlers.onCitations).toHaveBeenCalledWith([{ filename: 'guide.pdf' }])
  })
})