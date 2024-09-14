import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Alert({
  open,
  onClose,
  desc,
  messenger,
  onContinue,
}: {
  onClose?: () => void;
  open?: boolean;
  messenger?: string;
  desc?: string;
  onContinue?: () => void;
}) {
  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
      open={open}
    >
      <AlertDialogContent className=" bg-white text-black">
        <AlertDialogHeader>
          <AlertDialogTitle>{messenger}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onClose?.()}>
            Không
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onContinue?.()}>
            Đồng ý
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
