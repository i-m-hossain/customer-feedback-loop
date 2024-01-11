import surveyData from '@/data/surveyData.json'
import { NextResponse } from 'next/server'
import {writeFile} from 'fs'

export async function GET() {
  return NextResponse.json({ surveys: surveyData.data })
}
export async function POST(request) {
  const body = await request.json()
  const path = './data/surveyDataResult.json';
  writeFile(path, JSON.stringify(body, null, 2), (error) => {
    if (error) {
      console.log('An error has occurred ', error);
      return;
    }
    console.log('Data written successfully to disk');
  });
  return NextResponse.json({message: "Survey data saved successfully", data: body})
}
