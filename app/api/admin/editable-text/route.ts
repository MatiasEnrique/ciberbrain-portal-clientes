import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateEditableText, isAdmin } from '@/lib/editable-text'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    
    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { pageName, elementId, content, modifiedBy } = body

    if (!pageName || !elementId || content === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const success = await updateEditableText(
      pageName,
      elementId,
      content,
      modifiedBy || userId
    )

    if (!success) {
      return NextResponse.json({ error: 'Failed to update text' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in editable text API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}