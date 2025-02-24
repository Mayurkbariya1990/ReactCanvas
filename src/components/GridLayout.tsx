import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { RootState } from '@/lib/store';
import { updateLayoutAndItems } from '@/lib/layoutSlice';
import { Card } from './ui/card';
import { Button } from './ui/button';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Input } from './ui/input';
import { Pencil, Check, X, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface BaseWidget {
  i: string;
  type: string;
}

interface TextWidget extends BaseWidget {
  type: 'text';
  content: string;
}

interface ButtonWidget extends BaseWidget {
  type: 'button';
  content: string;
  action?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface ImageWidget extends BaseWidget {
  type: 'image';
  url: string;
  alt: string;
}

interface CardWidget extends BaseWidget {
  type: 'card';
  title: string;
  description: string;
}

interface TableWidget extends BaseWidget {
  type: 'table';
  headers: string[];
  rows: string[][];
}

type WidgetItem = TextWidget | ButtonWidget | ImageWidget | CardWidget | TableWidget;

const GridLayout = () => {
  const dispatch = useDispatch();
  const layouts = useSelector((state: RootState) => state.layout.layouts);
  const items = useSelector((state: RootState) => state.layout.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const { toast } = useToast();

  console.log(items,"items")

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const widgetData = JSON.parse(e.dataTransfer.getData('widget'));
    
    const gridElement = e.currentTarget;
    const rect = gridElement.getBoundingClientRect();
    
    // Adjust for margins and padding
    const margin = 16;
    const padding = 16;
    
    // Calculate available width for grid
    const availableWidth = rect.width - (padding * 2);
    const columnWidth = availableWidth / 12; 
    
    // Calculate position considering margins
    const relativeX = e.clientX - rect.left - padding;
    const relativeY = e.clientY - rect.top - padding;
    
    // Convert to grid units accounting for margins
    const gridX = Math.floor(relativeX / (columnWidth + margin));
    const gridY = Math.floor(relativeY / (100 + margin)); 

    const id = `${widgetData.type}-${Date.now()}`;
    
    let newItem: WidgetItem;
    switch (widgetData.type) {
      case 'text':
        newItem = { i: id, type: 'text', content: 'Double click to edit text' };
        break;
      case 'button':
        newItem = { 
          i: id, 
          type: 'button', 
          content: 'Click me', 
          action: 'console.log("clicked")',
          variant: 'primary'
        };
        break;
      case 'image':
        newItem = { i: id, type: 'image', url: '', alt: 'Image description' };
        break;
      case 'card':
        newItem = { i: id, type: 'card', title: 'Card Title', description: 'Card description' };
        break;
      case 'table':
        newItem = {
          i: id,
          type: 'table',
          headers: ['Header 1', 'Header 2'],
          rows: [['Data 1', 'Data 2']]
        };
        break;
      default:
        return;
    }

    const newLayout: Layout = {
      i: id,
      x: Math.min(Math.max(0, gridX), 8),
      y: Math.max(0, gridY), 
      w: 4,
      h: 2
    };

    // Find the highest y position of existing layouts
    const maxY = layouts.reduce((max, layout) => {
      return Math.max(max, layout.y + layout.h);
    }, 0);

    // If dropping in empty space, place at the end
    if (gridY > maxY) {
      newLayout.y = maxY;
    }

    dispatch(updateLayoutAndItems({
      layouts: [...layouts, newLayout],
      items: [...items, newItem]
    }));

    toast({
      variant: "success",
      title: "Widget Added",
      description: `${widgetData.title} has been added to the canvas`,
      duration: 2000,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const startEditing = (item: WidgetItem) => {
    setEditingId(item.i);
    setEditingContent({ ...item });
  };

  const saveEdits = () => {
    if (!editingId || !editingContent) return;
    
    dispatch(updateLayoutAndItems({
      layouts,
      items: items.map(item => 
        item.i === editingId ? { ...editingContent } : item
      )
    }));

    setEditingId(null);
    setEditingContent(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingContent(null);
  };

  const handleDelete = (itemId: string) => {
    dispatch(updateLayoutAndItems({
      layouts: layouts.filter(layout => layout.i !== itemId),
      items: items.filter(item => item.i !== itemId)
    }));
  };

  const EditButtons = ({ item }: { item: WidgetItem }) => {
    const isEditing = editingId === item.i;
    
    return (
      <div 
        className="absolute top-2 right-2 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200" 
        onMouseDown={(e) => e.stopPropagation()}
      >
        {isEditing ? (
          <>
            <Button 
              size="sm" 
              variant="ghost" 
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
              onMouseDown={(e) => {
                e.stopPropagation();
                saveEdits();
              }}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="bg-white/80 backdrop-blur-sm hover:bg-white" 
              onMouseDown={(e) => {
                e.stopPropagation();
                cancelEditing();
              }}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </>
        ) : (
          <>
            <Button 
              size="sm" 
              variant="ghost"
              className="bg-white/80 backdrop-blur-sm hover:bg-white" 
              onMouseDown={(e) => {
                e.stopPropagation();
                startEditing(item);
              }}
            >
              <Pencil className="h-4 w-4 text-indigo-600" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleDelete(item.i);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
            </Button>
          </>
        )}
      </div>
    );
  };

  const handleCardClick = (e: React.MouseEvent, item: WidgetItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editingId) {
      startEditing(item);
    }
  };

  const renderWidget = (item: WidgetItem) => {
    const isEditing = editingId === item.i;
    
    const cardProps = {
      className: "w-full h-full p-4 bg-white/90 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 relative group border border-indigo-50 cursor-grab active:cursor-grabbing"
    };

    switch (item.type) {
      case 'text':
        return (
          <Card {...cardProps}>
            <EditButtons item={item} />
            <div className="h-full flex items-center justify-center">
              {isEditing ? (
                <div className="space-y-2 w-full px-2 sm:px-4">
                  <Input
                    value={editingContent.content}
                    onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                    autoFocus
                  />
                </div>
              ) : (
                <p className="text-gray-700">{item.content}</p>
              )}
            </div>
          </Card>
        );

      case 'button':
        return (
          <Card {...cardProps}>
            <EditButtons item={item} />
            <div className="h-full flex items-center justify-center">
              {isEditing ? (
                <div className="space-y-4 w-full px-2 sm:px-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                    <Input
                      value={editingContent.content}
                      onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                      placeholder="Button text"
                      className="border-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <Input
                      value={editingContent.action}
                      onChange={(e) => setEditingContent({ ...editingContent, action: e.target.value })}
                      placeholder="console.log('clicked')"
                      className="font-mono text-sm border-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingContent({ 
                          ...editingContent, 
                          variant: 'primary'
                        })}
                        className={`px-3 py-1 rounded-md text-sm ${
                          editingContent.variant === 'primary' 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        Primary
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingContent({ 
                          ...editingContent, 
                          variant: 'secondary'
                        })}
                        className={`px-3 py-1 rounded-md text-sm ${
                          editingContent.variant === 'secondary' 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Secondary
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingContent({ 
                          ...editingContent, 
                          variant: 'outline'
                        })}
                        className={`px-3 py-1 rounded-md text-sm ${
                          editingContent.variant === 'outline' 
                            ? 'border-2 border-indigo-500 text-indigo-600' 
                            : 'border border-gray-200 text-gray-600'
                        }`}
                      >
                        Outline
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    try {
                      new Function(item.action!)();
                    } catch (error) {
                      console.error('Error executing button action:', error);
                    }
                  }}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105
                    ${item.variant === 'primary' ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg' : ''}
                    ${item.variant === 'secondary' ? 'bg-gray-800 hover:bg-gray-900 text-white shadow-md hover:shadow-lg' : ''}
                    ${item.variant === 'outline' ? 'border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50' : ''}
                  `}
                >
                  {item.content}
                </Button>
              )}
            </div>
          </Card>
        );

      case 'image':
        return (
          <Card {...cardProps}>
            <EditButtons item={item} />
            <div className="h-full flex items-center justify-center">
              {isEditing ? (
                <div className="space-y-2 w-full px-2 sm:px-4">
                  <Input
                    value={editingContent.url}
                    onChange={(e) => setEditingContent({ ...editingContent, url: e.target.value })}
                    placeholder="Image URL"
                  />
                  <Input
                    value={editingContent.alt}
                    onChange={(e) => setEditingContent({ ...editingContent, alt: e.target.value })}
                    placeholder="Image description"
                  />
                </div>
              ) : (
                item.url ? (
                  <img 
                    src={item.url} 
                    alt={item.alt} 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">Add image URL</p>
                  </div>
                )
              )}
            </div>
          </Card>
        );

      case 'card':
        return (
          <Card {...cardProps}>
            <EditButtons item={item} />
            <div className="space-y-2">
              {isEditing ? (
                <>
                  <div className="space-y-2 w-full px-2 sm:px-4">
                    <Input
                      value={editingContent.title}
                      onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                      placeholder="Card Title"
                    />
                    <Input
                      value={editingContent.description}
                      onChange={(e) => setEditingContent({ ...editingContent, description: e.target.value })}
                      placeholder="Card Description"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-gray-500">{item.description}</p>
                </>
              )}
            </div>
          </Card>
        );

      case 'table':
        return (
          <Card {...cardProps}>
            <EditButtons item={item} />
            <div className="h-full overflow-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Headers</label>
                    <div className="flex gap-2">
                      {editingContent.headers.map((header: string, index: number) => (
                        <Input
                          key={index}
                          value={header}
                          onChange={(e) => {
                            console.log("DATA")
                            const newHeaders = [...editingContent.headers];
                            newHeaders[index] = e.target.value;
                            setEditingContent({ ...editingContent, headers: newHeaders });
                          }}
                        />
                      ))}
                      <Button
                        size="lg"
                        onClick={(e) => {
                          console.log("DATA")
                          e.stopPropagation();
                          setEditingContent({
                            ...editingContent,
                            headers: [...editingContent.headers, ''],
                            rows: editingContent.rows.map((row: string[]) => [...row, ''])
                          });
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rows</label>
                    {editingContent.rows.map((row: string[], rowIndex: number) => (
                      <div key={rowIndex} className="flex gap-2 mb-2">
                        {row.map((cell: string, cellIndex: number) => (
                          <Input
                            key={`${rowIndex}-${cellIndex}`}
                            value={cell}
                            onChange={(e) => {
                              const newRows = [...editingContent.rows];
                              newRows[rowIndex][cellIndex] = e.target.value;
                              setEditingContent({ ...editingContent, rows: newRows });
                            }}
                          />
                        ))}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        console.log("DATA")
                        e.stopPropagation();
                        setEditingContent({
                          ...editingContent,
                          rows: [...editingContent.rows, new Array(editingContent.headers.length).fill('')]
                        });
                      }}
                    >
                      Add Row
                    </Button>
                  </div>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {item.headers.map((header, index) => (
                        <th key={index} className="border p-2">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {item.rows.map((row, index) => (
                      <tr key={index}>
                        {row.map((cell, cellIndex) => (
                          <td key={`${index}-${cellIndex}`} className="border p-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="p-4 lg:p-6 min-h-[calc(100vh-120px)] bg-gradient-to-br from-white/50 to-indigo-50/30 backdrop-blur-xl rounded-2xl shadow-inner border border-indigo-100/50"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layouts }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 8, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        isDraggable={true}
        isResizable={true}
        useCSSTransforms={true}
        resizeHandles={['se']}
        compactType={null}
        preventCollision={false}
        onDragStart={(layout, oldItem, newItem, placeholder, e, element) => {
          element.classList.add('dragging');
          element.style.cursor = 'grabbing';
        }}
        onDragStop={(layout, oldItem, newItem, placeholder, e, element) => {
          element.classList.remove('dragging');
          element.style.cursor = 'grab';
          dispatch(updateLayoutAndItems({
            layouts: layout,
            items: items
          }));
        }}
        onResizeStop={(layout) => {
          dispatch(updateLayoutAndItems({
            layouts: layout,
            items: items
          }));
        }}
      >
        {items.map((item) => {
          const layout = layouts.find(l => l.i === item.i);
          return (
            <div 
              key={item.i} 
              className="transition-all duration-200 hover:shadow-lg group cursor-grab active:cursor-grabbing"
              data-grid={{
                x: layout?.x || 0,
                y: layout?.y || 0,
                w: layout?.w || 4,
                h: layout?.h || 2,
                minW: 2,
                minH: 1
              }}
            >
              {renderWidget(item)}
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default GridLayout;
