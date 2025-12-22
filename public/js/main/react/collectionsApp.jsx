import { API_BASE, AlbumPreview, useFontsFromCollection, useFavorite, useSaveMenu } from "./collectionsParts/hooks.jsx";
import { FavButton, SaveMenu, GridSaveMenu, ListItem, GridItem, PairsCard } from "./collectionsParts/items.jsx";
import { CollectionHeader, CollectionToolbar, AlbumsGrid, CollectionList, CollectionGrid, PairsGrid } from "./collectionsParts/views.jsx";

// Expose for Babel standalone global usage
window.CollectionsApp = {
  API_BASE,
  AlbumPreview,
  useFontsFromCollection,
  useFavorite,
  useSaveMenu,
  FavButton,
  SaveMenu,
  GridSaveMenu,
  ListItem,
  GridItem,
  PairsCard,
  CollectionHeader,
  CollectionToolbar,
  AlbumsGrid,
  CollectionList,
  CollectionGrid,
  PairsGrid
};