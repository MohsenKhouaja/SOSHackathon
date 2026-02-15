import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
} from "@repo/ui/components/ui/context-menu";

type Props = {
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onCopy?: () => void;
};

const DataTableActions = ({ onEdit, onView, onDelete, onCopy }: Props) => (
  <ContextMenuContent className="!font-mono w-52">
    <ContextMenuItem onClick={onView}>
      View
      <ContextMenuShortcut>⎵</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem onClick={onCopy}>Copy Cell</ContextMenuItem>
    <ContextMenuItem onClick={onEdit}>
      Edit
      <ContextMenuShortcut>CTRL+⎵</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem onClick={onEdit}>
      Export
      <ContextMenuShortcut>CTRL+X</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem onClick={onDelete} variant="destructive">
      Delete
      <ContextMenuShortcut>⌫</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
);

export default DataTableActions;
