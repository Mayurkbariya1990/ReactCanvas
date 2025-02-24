import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import layoutReducer from './layoutSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['layouts', 'items', 'history'] // Specify which parts of the state to persist
};

const persistedReducer = persistReducer(persistConfig, layoutReducer);

export const store = configureStore({
  reducer: {
    layout: persistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
