export type FolderBind = {
  selected: string
  folders: FolderData[]
  dragging: boolean
  showTip: boolean
  sortFolder: (folder: FolderData) => void
  toggleFolderWatcher: (event: MouseEvent, folder: FolderData) => void
  selectFolder: (folder: FolderData) => void
  removeFolder: (folder: FolderData) => void
  openFolderDialog: () => void
  showFoldersHelp: () => void
  onDragOver: (event: DragEvent) => void
  onDrop: () => void
}

export type FolderData = {
  name: string;
  active: boolean;
  categories: { [key:string]: string[] };
  order: string[]
}