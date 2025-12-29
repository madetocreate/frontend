import { describe, it, expect } from 'vitest'
import { consumeSseReadableStream } from './sse'

function streamFromString(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })
}

describe('consumeSseReadableStream', () => {
  it('dispatches start/chunk/end events', async () => {
    const sse =
      'event: start\n' +
      'data: {"steps": []}\n' +
      '\n' +
      'event: chunk\n' +
      'data: {"content": "Hallo", "event": "chunk"}\n' +
      '\n' +
      'event: end\n' +
      'data: {"content": "Hallo Welt", "event": "end"}\n' +
      '\n'

    const events: string[] = []
    const chunks: string[] = []
    let endContent = ''

    await consumeSseReadableStream({
      stream: streamFromString(sse),
      callbacks: {
        onStart: () => {
          events.push('start')
        },
        onChunk: (d) => {
          events.push('chunk')
          chunks.push(d.content)
        },
        onEnd: (d) => {
          events.push('end')
          endContent = d.content
        },
      },
    })

    expect(events).toEqual(['start', 'chunk', 'end'])
    expect(chunks).toEqual(['Hallo'])
    expect(endContent).toBe('Hallo Welt')
  })

  it('dispatches error event', async () => {
    const sse =
      'event: error\n' +
      'data: {"message": "kaputt", "event": "error"}\n' +
      '\n'

    let err = ''

    await consumeSseReadableStream({
      stream: streamFromString(sse),
      callbacks: {
        onError: (d) => {
          err = d.message
        },
      },
    })

    expect(err).toBe('kaputt')
  })

  it('should call onEnd only once when both final and end events are sent', async () => {
    const sse =
      'event: start\n' +
      'data: {"steps": []}\n' +
      '\n' +
      'event: final\n' +
      'data: {"content": "Final content", "event": "final"}\n' +
      '\n' +
      'event: end\n' +
      'data: {"content": "End content", "event": "end"}\n' +
      '\n'

    let endCallCount = 0
    let endContent = ''

    await consumeSseReadableStream({
      stream: streamFromString(sse),
      callbacks: {
        onStart: () => {},
        onEnd: (d) => {
          endCallCount++
          endContent = d.content
        },
      },
    })

    // onEnd should be called exactly once (final takes precedence)
    expect(endCallCount).toBe(1)
    expect(endContent).toBe('Final content')
  })
})
