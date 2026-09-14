import { NextRequest } from 'next/server';
import { submitJobs } from '@/server/jobs';
export async function POST(req: NextRequest) { return submitJobs(req, true); }
