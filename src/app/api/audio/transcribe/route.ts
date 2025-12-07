import { NextRequest, NextResponse } from 'next/server'
import { Buffer } from 'node:buffer'
import OpenAI from 'openai'
import { toFile } from 'openai/uploads'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'Es wurde keine Audiodatei übermittelt.' },
        { status: 400 },
      )
    }

    const audioFile = file as File
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(buffer, 'speech.webm'),
      model: process.env.OPENAI_TRANSCRIPTION_MODEL ?? 'gpt-4o-mini-transcribe',
    })

    const text = typeof transcription.text === 'string' ? transcription.text : ''

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Error in /api/audio/transcribe', error)
    return NextResponse.json(
      { error: 'Die Transkription ist fehlgeschlagen.' },
      { status: 500 },
    )
  }
}
