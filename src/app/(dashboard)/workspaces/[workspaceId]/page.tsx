import { getCurrent } from '@/features/auth/actions';
import { redirect } from 'next/navigation';
import React from 'react'

const WorkspaceIdPage = async() => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");
  return (
    <div>WorkspaceIdPage</div>
  )
}

export default WorkspaceIdPage