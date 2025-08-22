declare module 'react-quill' {
  import { Component } from 'react';

  export interface ReactQuillProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    theme?: string;
    modules?: any;
    formats?: string[];
    bounds?: string | HTMLElement;
    debug?: string | boolean;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    preserveWhitespace?: boolean;
    tabIndex?: number;
    readOnly?: boolean;
  }

  export default class ReactQuill extends Component<ReactQuillProps> {}
}
