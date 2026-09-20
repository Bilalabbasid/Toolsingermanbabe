import { NextRequest, NextResponse } from 'next/server';
import { submitJobs } from '@/server/jobs';
import { isAdminRequest } from '@/server/security/request';
import { jobQueue } from '@/server/queue/queue';
import { apiCorsPreflight, withApiCors } from '@/server/security/apiCors';

const post = async (req: NextRequest) => submitJobs(req, false);
const get = async (req: NextRequest) => {
  if (!(await isAdminRequest(req, process.env.CRON_SECRET))) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  const jobs = await jobQueue.listJobs();
  return NextResponse.json({ total: jobs.length, jobs: jobs.map(j => ({ id: j.id, status: j.status, type: j.type })) }, { headers: { 'Cache-Control': 'no-store' } });
};

export const POST = withApiCors(post);
export const GET = withApiCors(get);
export const OPTIONS = apiCorsPreflight;
