import { NextRequest } from 'next/server';
import { submitJobs } from '@/server/jobs';
import { apiCorsPreflight, withApiCors } from '@/server/security/apiCors';

const post = async (req: NextRequest) => submitJobs(req, true);
export const POST = withApiCors(post);
export const OPTIONS = apiCorsPreflight;
