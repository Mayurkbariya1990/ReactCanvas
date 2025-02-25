import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store';
import GridLayout from '@/components/GridLayout';
import { WidgetSidebar } from '@/components/WidgetSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { undo, redo, clearCanvas } from '@/lib/layoutSlice';
import { RootState } from '@/lib/store';
import { ToastProvider } from "@/components/ui/toast";

const MainContent = () => {
  const dispatch = useDispatch();
  const canUndo = useSelector((state: RootState) => state.layout.history.past.length > 0);
  const canRedo = useSelector((state: RootState) => state.layout.history.future.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 w-full">
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-indigo-100 shadow-sm w-full">
        <div className=" flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Widget Builder
          </h1>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              title="Undo"
              disabled={!canUndo}
              onClick={() => dispatch(undo())}
              className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50"
            >
              <Undo className="h-4 w-4 text-indigo-600" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              title="Redo"
              disabled={!canRedo}
              onClick={() => dispatch(redo())}
              className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50"
            >
              <Redo className="h-4 w-4 text-indigo-600" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              title="Clear Canvas"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear the canvas?')) {
                  dispatch(clearCanvas());
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-1 p-4 lg:p-6 relative">
        <div className="w-full lg:w-[280px] mb-6 lg:mb-0">
          <WidgetSidebar />
        </div>
        <div className="flex-1 ">
          <GridLayout />
        </div>
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <SidebarProvider>
            <MainContent />
          </SidebarProvider>
        </ToastProvider>
      </PersistGate>
    </Provider>
  );
};

export default Index;
