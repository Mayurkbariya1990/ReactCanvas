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
import { Pencil, Check, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from './ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  isExpanded?: boolean;
}

interface TableWidget extends BaseWidget {
  type: 'table';
  headers: string[];
  rows: string[][];
}

type WidgetItem = TextWidget | ButtonWidget | ImageWidget | CardWidget | TableWidget;

const promptForTableDimensions = (): { headers: string[]; rows: string[][] } | null => {
  const numHeaders = parseInt(prompt("Enter number of columns:", "2") || "0");
  if (isNaN(numHeaders) || numHeaders <= 0) return null;

  const numRows = parseInt(prompt("Enter number of rows:", "2") || "0");
  if (isNaN(numRows) || numRows <= 0) return null;

  const headers = Array(numHeaders).fill('').map((_, i) => `Header ${i + 1}`);
  const rows = Array(numRows).fill('').map(() => Array(numHeaders).fill(''));

  return { headers, rows };
};

const calculateWidgetSize = (item: WidgetItem): { w: number; h: number } => {
  switch (item.type) {
    case 'text':
      const textLength = item.content.length;
      return {
        w: Math.min(Math.max(Math.ceil(textLength / 20), 2), 6),
        h: Math.ceil(textLength / 60) || 1
      };
    
    case 'button':
      return { w: 2, h: 1 };
    
    case 'image':
      return { w: 4, h: 3 };
    
    case 'card':
      const titleLines = Math.ceil(item.title.length / 30);
      const descLines = Math.ceil(item.description.length / 60);
      return {
        w: Math.min(Math.max(Math.ceil((item.title.length + item.description.length) / 40), 3), 6),
        h: Math.min(titleLines + descLines, 4)
      };
    
    case 'table':
      // Calculate height based on number of rows plus header and padding
      const rowHeight = 40; // height per row in pixels
      const headerHeight = 40; // height of header row
      const padding = 20; // total padding (10px top + 10px bottom)
      const totalHeight = headerHeight + (item.rows.length * rowHeight) + padding;
      
      return {
        w: Math.min(item.headers.length * 2, 12),
        h: Math.ceil(totalHeight / 100) // Convert pixels to grid units (100 is rowHeight from grid config)
      };
    
    default:
      return { w: 3, h: 2 };
  }
};




const validateWidget = (widget: WidgetItem): string | null => {
  switch (widget.type) {
    case 'text':
      return !widget.content.trim() ? 'Text content cannot be empty' : null;
    
    case 'button':
      if (!widget.content.trim()) return 'Button text cannot be empty';
      if (!widget.action?.trim()) return 'Button action cannot be empty';
      return null;
    
    case 'image':
      if (!widget.url.trim()) return 'Image URL cannot be empty';
      if (!widget.alt.trim()) return 'Image description cannot be empty';
      return null;
    
    case 'card':
      if (!widget.title.trim()) return 'Card title cannot be empty';
      if (!widget.description.trim()) return 'Card description cannot be empty';
      return null;
    
    case 'table':
      if (widget.headers.some(header => !header.trim())) return 'Table headers cannot be empty';
      if (widget.rows.some(row => row.some(cell => !cell.trim()))) 
        return 'Table cells cannot be empty';
      return null;
    
    default:
      return null;
  }
};

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
        newItem = { i: id, type: 'text', content: 'Text Title' };
        break;
      case 'button':
        newItem = { 
          i: id, 
          type: 'button', 
          content: 'Click me', 
          action: 'console.log("clicked")'
        };
        break;
      case 'image':
        newItem = { i: id, type: 'image', url: '', alt: 'Image description' };
        break;
      case 'card':
        newItem = { 
          i: id, 
          type: 'card', 
          title: 'Card Title', 
          description: 'Card description',
          isExpanded: false 
        };
        break;
      case 'table':
        const dimensions = promptForTableDimensions();
        if (!dimensions) return;

        newItem = {
          i: id,
          type: 'table',
          headers: dimensions.headers,
          rows: dimensions.rows
        };
        break;
      default:
        return;
    }

    // Calculate size based on content
    const size = calculateWidgetSize(newItem);

    const newLayout: Layout = {
      i: id,
      x: Math.min(Math.max(0, gridX), 8),
      y: Math.max(0, gridY),
      w: size.w,
      h: size.h,
      isResizable: false
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

    // Automatically open edit mode for the new widget
    setEditingId(id);
    setEditingContent(newItem);

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

    // Validate the edited content
    const validationError = validateWidget(editingContent);
    
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validationError,
        duration: 3000,
      });
      return;
    }
    
    dispatch(updateLayoutAndItems({
      layouts,
      items: items.map(item => 
        item.i === editingId ? { ...editingContent } : item
      )
    }));

    toast({
      variant: "success",
      title: "Changes Saved",
      description: "Widget has been updated successfully",
      duration: 2000,
    });

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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save changes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel editing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit widget</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete widget</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
      className: " transition-all duration-200 relative group cursor-grab active:cursor-grabbing"
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
                <div className="space-y-4 w-full px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                    <Input
                      value={editingContent.content}
                      onChange={(e) => setEditingContent(prev => ({
                        ...prev,
                        content: e.target.value
                      }))}
                      placeholder="Button text"
                      className="border-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <Input
                      value={editingContent.action}
                      onChange={(e) => setEditingContent(prev => ({
                        ...prev,
                        action: e.target.value
                      }))}
                      placeholder="console.log('clicked')"
                      className="font-mono text-sm border-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                </div>
              ) : (
                <Button 
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      const actionFn = new Function(item.action || '');
                      actionFn();
                    } catch (error) {
                      console.error('Error executing button action:', error);
                    }
                  }}
                  variant="default"
                  className="w-full max-w-[200px] transition-all duration-200 transform hover:scale-105"
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
                    <Textarea
                      value={editingContent.description}
                      onChange={(e) => setEditingContent({ ...editingContent, description: e.target.value })}
                      placeholder="Card Description"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.description.length > 100 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 -mt-1 h-auto hover:bg-transparent"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const updatedItems = items.map(i => 
                            i.i === item.i 
                              ? { ...i, isExpanded: !(i as CardWidget).isExpanded }
                              : i
                          );
                          dispatch(updateLayoutAndItems({
                            layouts,
                            items: updatedItems
                          }));
                        }}
                      >
                        {(item as CardWidget).isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    )}
                  </div>
                  <p 
                    className={`text-gray-500 overflow-hidden transition-all duration-300 ${
                      item.description.length > 100 && !(item as CardWidget).isExpanded
                        ? 'line-clamp-2'
                        : ''
                    }`}
                  >
                    {item.description}
                  </p>
                </>
              )}
            </div>
          </Card>
        );

      case 'table':
        return (
          <Card {...cardProps}>
            <EditButtons item={item} />
            <div className="p-2.5">
              {isEditing ? (
                <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Headers</label>
                    <div className="flex gap-2 items-center relative">
                      {editingContent.headers.map((header: string, index: number) => (
                        <Input
                          key={index}
                          value={header}
                          onChange={(e) => {
                            const newHeaders = [...editingContent.headers];
                            newHeaders[index] = e.target.value;
                            setEditingContent({ ...editingContent, headers: newHeaders });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">Rows</label>
                    <div className="max-h-[300px] overflow-y-auto mb-2">
                      {editingContent.rows.map((row: string[], rowIndex: number) => (
                        <div key={rowIndex} className="flex gap-2 mb-2 items-center">
                          {row.map((cell: string, cellIndex: number) => (
                            <Input
                              key={`${rowIndex}-${cellIndex}`}
                              value={cell}
                              onChange={(e) => {
                                const newRows = editingContent.rows.map(r => [...r]);
                                newRows[rowIndex][cellIndex] = e.target.value;
                                setEditingContent(prev => ({
                                  ...prev,
                                  rows: newRows
                                }));
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <table className="w-full border-collapse bg-white rounded-md">
                  <thead>
                    <tr>
                      {item.headers.map((header, index) => (
                        <th key={index} className="border p-2 bg-gray-50">{header}</th>
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
      className="p-0 min-h-[calc(100vh-120px)] w-[calc(100vw-400px)] bg-gradient-to-br from-white/50 to-indigo-50/30 backdrop-blur-xl rounded-2xl shadow-inner border border-indigo-100/50"
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
        isResizable={false}
        useCSSTransforms={true}
        compactType="vertical"
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
          const size = calculateWidgetSize(item);
          return (
            <div 
              key={item.i} 
              className=""
              data-grid={{
                x: layout?.x || 0,
                y: layout?.y || 0,
                w: size.w,
                h: size.h,
                isResizable: false
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
