'use server';

import { revalidatePath } from 'next/cache';
import { apiPatch } from '@/lib/api';

export async function updateRepoContext(id: string, context: string) {
  await apiPatch(`/repositories/${id}`, { context });
  revalidatePath('/repositories');
}
