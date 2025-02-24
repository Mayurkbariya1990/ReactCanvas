export interface BaseWidget {
  i: string;
  type: string;
}

export interface TextWidget extends BaseWidget {
  type: 'text';
  content: string;
}

export interface ButtonWidget extends BaseWidget {
  type: 'button';
  content: string;
  action?: string;
}

export interface ImageWidget extends BaseWidget {
  type: 'image';
  url: string;
  alt: string;
}

export interface CardWidget extends BaseWidget {
  type: 'card';
  title: string;
  description: string;
}

export interface TableWidget extends BaseWidget {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export type WidgetItem = TextWidget | ButtonWidget | ImageWidget | CardWidget | TableWidget; 