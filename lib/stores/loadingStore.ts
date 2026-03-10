import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type LoadingType = 'route' | 'component' | 'mutation';

interface LoadingState {
  // Derived global flag
  isLoading: boolean;

  // Per-type maps
  routeLoading: Map<string, boolean>;
  componentLoading: Map<string, boolean>;
  mutationLoading: Map<string, boolean>;

  // Actions
  startLoading: (id: string, type: LoadingType) => void;
  stopLoading: (id: string, type: LoadingType) => void;
  isComponentLoading: (id: string) => boolean;
  isMutationLoading: (id: string) => boolean;
}

const mapKey = (type: LoadingType): keyof LoadingState =>
  `${type}Loading` as keyof LoadingState;

export const useLoadingStore = create<LoadingState>()(
  devtools(
    (set, get) => ({
      isLoading: false,
      routeLoading: new Map(),
      componentLoading: new Map(),
      mutationLoading: new Map(),

      startLoading: (id, type) =>
        set((state) => {
          const map = new Map(state[mapKey(type)] as Map<string, boolean>);
          map.set(id, true);
          const isLoading =
            map.size > 0 ||
            (type !== 'route' ? state.routeLoading.size > 0 : false) ||
            (type !== 'component' ? state.componentLoading.size > 0 : false) ||
            (type !== 'mutation' ? state.mutationLoading.size > 0 : false);
          return { [mapKey(type)]: map, isLoading };
        }),

      stopLoading: (id, type) =>
        set((state) => {
          const map = new Map(state[mapKey(type)] as Map<string, boolean>);
          map.delete(id);
          const isLoading =
            state.routeLoading.size > 0 ||
            state.componentLoading.size > 0 ||
            state.mutationLoading.size > 0;
          return { [mapKey(type)]: map, isLoading };
        }),

      isComponentLoading: (id) => get().componentLoading.get(id) ?? false,
      isMutationLoading: (id) => get().mutationLoading.get(id) ?? false,
    }),
    { name: 'LoadingStore' }
  )
);
