import { Loader } from 'lucide-react'
import React from 'react'

const DashboardLoading = () => {
  return (
      <div className='h-full flex items-center justify-center'>
          <Loader className='size-8 animate-spin text-muted-foreground'/>
    </div>
  )
}

export default DashboardLoading