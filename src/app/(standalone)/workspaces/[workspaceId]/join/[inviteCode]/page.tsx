import { getCurrent } from '@/features/auth/queries';
import { JoinWorkspaceForm } from '@/features/workspaces/components/join-workspace-form';
import { getWorksapceInfo } from '@/features/workspaces/queries';
import { redirect } from 'next/navigation';
import React from 'react'


interface WorkspaceIdJoinPageProps {
    params: {
        workspaceId: string
    }
}

const WorkspaceIdJoinPage = async ({
    params,
}: WorkspaceIdJoinPageProps) => {
    const user = await getCurrent();
    if (!user) redirect('/sign-in')
    
    const initialValues = await getWorksapceInfo({
        workspaceId: params.workspaceId
    })

    if (!initialValues) {
        redirect("/")
    }
    
  return (
      <div className='w-full lg:max-w-xl'>
          <JoinWorkspaceForm initialValues={initialValues} />
    </div>
  )
}

export default WorkspaceIdJoinPage