import { Type, Image, Square, Layout, Table2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import styled from 'styled-components';

const widgets = [
  {
    type: 'text',
    title: 'Text Block',
    icon: Type,
    description: 'Add a block of text'
  },
  {
    type: 'image',
    title: 'Image',
    icon: Image,
    description: 'Insert an image'
  },
  {
    type: 'button',
    title: 'Button',
    icon: Square,
    description: 'Add a button'
  },
  {
    type: 'card',
    title: 'Card',
    icon: Layout,
    description: 'Add a card component'
  },
  {
    type: 'table',
    title: 'Table',
    icon: Table2,
    description: 'Insert a data table'
  }
];

const SidebarContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.1);
  padding: 24px;
  width: 100%;
  height: auto;
  overflow-y: auto;
  border-radius: 16px;
  border: 1px solid rgba(79, 70, 229, 0.1);
  backdrop-filter: blur(12px);

  @media (min-width: 1024px) {
    width: 280px;
    height: calc(100vh - 32px);
    position: fixed;
    left: 16px;
    top: 16px;
    margin-bottom: 16px;
  }
`;

const WidgetButton = styled.button`
  width: 100%;
  padding: 16px;
  margin: 8px 0;
  border: 1px solid rgba(79, 70, 229, 0.1);
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #4F46E5;
  font-size: 15px;
  cursor: grab;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.05);

  &:hover {
    background-color: rgba(79, 70, 229, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
  }

  &:active {
    cursor: grabbing;
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 14px;
  }
`;

const SidebarTitle = styled.h2`
  background: linear-gradient(to right, #4F46E5, #7C3AED);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(79, 70, 229, 0.1);
`;

export function WidgetSidebar() {
  const handleDragStart = (e: React.DragEvent, widget: typeof widgets[0]) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  return (
    <SidebarContainer className='mt-14'>
      {/* <SidebarTitle></SidebarTitle> */}
      <SidebarMenu >
        {widgets.map((widget) => (
          <WidgetButton
            key={widget.type}
            draggable
            onDragStart={(e) => handleDragStart(e, widget)}
            className="cursor-grab active:cursor-grabbing"
          >
            <widget.icon className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>{widget.title}</span>
              <span className="text-xs text-gray-500">{widget.description}</span>
            </div>
          </WidgetButton>
        ))}
      </SidebarMenu>
    </SidebarContainer>
  );
}
