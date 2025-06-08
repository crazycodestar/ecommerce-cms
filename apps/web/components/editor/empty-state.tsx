import { AlertCircle } from "lucide-react"

export const EmptyState = () => {
    return (
        <div className="container md:mx-auto mx-4 my-4 px-4">
            <div className="border border-destructive/30 rounded w-full py-6 bg-destructive/10 flex px-12 items-center space-x-2">
                <div className="flex space-x-2">
                    <AlertCircle className="size-5 text-destructive relative top-1" />
                    <div>
                        <h1 className="text-xl font-bold text-destructive">Missing Content</h1>
                        <p className="text-sm text-destructive/80">Add content to the component</p>
                    </div>
                </div>
            </div>
        </div>

    )
}