import { Navbar } from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import { CreateWorkSpaceModal } from "@/features/workspaces/components/create-workspaces-modal"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen">
            <CreateWorkSpaceModal />
            <div className="flex w-full h-full">
                <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
                    <Sidebar />
                </div>
                <div className="lg:pl-[264px] w-full">
                    <div className="mx-auto max-w-screen-2xl h-full">
                        <Navbar />
                        <main className="flex flex-col py-8 px-6 h-full">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout