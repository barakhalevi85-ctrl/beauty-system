import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');
  
  if (!file) {
    return new NextResponse('No file specified', { status: 400 });
  }
  
  try {
    const buffer = fs.readFileSync(file);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (e) {
    return new NextResponse('Error reading file', { status: 500 });
  }
}
