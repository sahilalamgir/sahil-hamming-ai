import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  
  let samplePath;
  
  if (type === 'clinic') {
    samplePath = path.join(process.cwd(), 'tests/inputs/clinic-receptionist.json');
  } else if (type === 'drivethrough') {
    samplePath = path.join(process.cwd(), 'tests/inputs/drive-through.json');
  } else {
    return NextResponse.json({ error: 'Invalid sample type' }, { status: 400 });
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading sample configuration:', error);
    return NextResponse.json({ error: 'Failed to load sample configuration' }, { status: 500 });
  }
} 