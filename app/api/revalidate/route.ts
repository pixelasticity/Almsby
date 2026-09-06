import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { tag } = await request.json();

    if (!tag) {
      return NextResponse.json({ message: 'Tag is required' }, { status: 400 });
    }

    // In a real implementation, you would verify an API key or session here
    revalidateTag(tag);

    return NextResponse.json({ 
      message: `Successfully revalidated tag: ${tag}`,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
