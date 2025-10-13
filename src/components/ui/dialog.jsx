import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/utils/utils"

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  )
}

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex items-center justify-between p-6 border-b", className)} {...props} />
)

const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
)

const DialogClose = ({ className, ...props }) => (
  <button
    className={cn("p-1 hover:bg-gray-100 rounded", className)}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose }