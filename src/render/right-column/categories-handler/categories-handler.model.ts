export type CategoryHandlerBind = {
  categories: string[]
  activeCategory: string
  activeFolder: string
  looseFilesText: string
  looseFiles: string[]
  searchTerm: string
  showOverlay: boolean
  showingLooseFiles: boolean
  showTip: boolean
  categoryData: { [key: string]: CategoryData }
  openPath: () => void
  reload: () => void;
  delete: (category: string) => void;
  onInputKeydown: (event: KeyboardEvent) => void
  onSearch: (event: KeyboardEvent) => void
  onDblclick: (category: string) => void
  select: (category: string) => void
  expandCategory: (category: string, prop: 'expanded' | 'searchExpanded') => void
  filterCategory: (category: string) => boolean
  filterCategoryFile: (file: string) => boolean
  showLooseFiles: () => void
}

export type CategoryData = {
  expanded: boolean;
  files: string[];
  searchExpanded: boolean;
}