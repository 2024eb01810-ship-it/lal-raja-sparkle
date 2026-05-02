import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title = "Are you sure?", description, onConfirm, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; onConfirm?: () => void; description?: string }>({ open: false });
  const confirm = (onConfirm: () => void, description?: string) => setState({ open: true, onConfirm, description });
  const close = () => setState({ open: false });
  const node = (
    <ConfirmDialog
      open={state.open}
      description={state.description}
      onConfirm={() => state.onConfirm?.()}
      onClose={close}
    />
  );
  return { confirm, node };
}
