'use server';

import { revalidatePath } from 'next/cache';
import { apiPatch, apiPost } from '@/lib/api';

export async function generateSessionSummary(sessionId: string) {
  const result = await apiPost<{ summary: string; source: 'llm' | 'rule' }>(
    `/sessions/${sessionId}/summary`,
    {},
  );
  revalidatePath('/today');
  revalidatePath('/sessions');
  return result;
}

export async function saveSessionSummary(sessionId: string, summary: string) {
  await apiPatch(`/sessions/${sessionId}/summary`, { summary });
  revalidatePath('/today');
  revalidatePath('/sessions');
}
