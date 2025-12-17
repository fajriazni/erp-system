import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ReactNode } from "react"

interface DeleteConfirmDialogProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
}

export function DeleteConfirmDialog({
  trigger,
  open,
  onOpenChange,
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete this record from the database."
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            // Prevent default behavior if needed, but usually onClick is enough
            onConfirm()
          }} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
