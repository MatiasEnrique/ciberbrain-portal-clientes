"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UserFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
}

export function UserFeedbackModal({
  open,
  onOpenChange,
  title,
  message,
}: UserFeedbackModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleLogout = () => {
    window.location.href = "/auth/login";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">{message}</p>
        </div>
        <DialogFooter className="flex justify-center space-x-2">
          <Button variant="secondary" onClick={handleLogout}>
            Terminé!
          </Button>
          <Button onClick={handleClose}>Me quedo!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
