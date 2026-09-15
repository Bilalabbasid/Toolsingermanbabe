import { NextRequest, NextResponse } from 'next/server';
import { submitJobs } from '@/server/jobs';
import { isAdminRequest } from '@/server/security/request';
import { jobQueue } from '@/server/queue/queue';
export async function POST(req: NextRequest) { return submitJobs(req, false); }
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req, process.env.CRON_SECRET))) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  const jobs = await jobQueue.listJobs();
  return NextResponse.json({ total: jobs.length, jobs: jobs.map(j => ({ id: j.id, status: j.status, type: j.type })) }, { headers: { 'Cache-Control': 'no-store' } });
}
