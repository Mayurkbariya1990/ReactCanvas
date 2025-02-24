import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Layout } from 'react-grid-layout';
import type { WidgetItem } from '@/types/widgets';

interface LayoutState {
  layouts: Layout[];
  items: WidgetItem[];
  history: {
    past: { layouts: Layout[]; items: WidgetItem[] }[];
    future: { layouts: Layout[]; items: WidgetItem[] }[];
  };
}

const initialState: LayoutState = {
  layouts: [],
  items: [],
  history: {
    past: [],
    future: []
  }
};

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    updateLayoutAndItems: (
      state,
      action: PayloadAction<{ layouts: Layout[]; items: WidgetItem[] }>
    ) => {
      // Always save current state before updating
      state.history.past = [
        ...state.history.past,
        {
          layouts: [...state.layouts],
          items: [...state.items]
        }
      ];
      
      // Clear future when new changes are made
      state.history.future = [];
      
      // Update current state
      state.layouts = [...action.payload.layouts];
      state.items = [...action.payload.items];
    },
    
    undo: (state) => {
      const lastPast = state.history.past[state.history.past.length - 1];
      if (!lastPast) return;

      // Add current state to future
      state.history.future = [
        {
          layouts: state.layouts,
          items: state.items
        },
        ...state.history.future
      ];

      // Set state to last past state
      state.layouts = lastPast.layouts;
      state.items = lastPast.items;

      // Remove used state from past
      state.history.past = state.history.past.slice(0, -1);
    },
    
    redo: (state) => {
      const nextFuture = state.history.future[0];
      if (!nextFuture) return;

      // Add current state to past
      state.history.past = [
        ...state.history.past,
        {
          layouts: state.layouts,
          items: state.items
        }
      ];

      // Set state to next future state
      state.layouts = nextFuture.layouts;
      state.items = nextFuture.items;

      // Remove used state from future
      state.history.future = state.history.future.slice(1);
    },
    
    clearCanvas: (state) => {
      if (state.layouts.length === 0 && state.items.length === 0) return;

      // Add current state to past before clearing
      state.history.past = [
        ...state.history.past,
        {
          layouts: state.layouts,
          items: state.items
        }
      ];

      // Clear current state and future
      state.layouts = [];
      state.items = [];
      state.history.future = [];
    }
  }
});

export const { updateLayoutAndItems, undo, redo, clearCanvas } = layoutSlice.actions;
export default layoutSlice.reducer;
