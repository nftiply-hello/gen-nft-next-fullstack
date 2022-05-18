export interface ImgHandleType {
  [key: string]: {
    [key: string]: File;
  };
}

export interface AmountHandleType {
  [key: string]: {
    [key: string]: number;
  };
}

export interface ConfigItem {
  source: File;
  bit: number;
}

export interface ConfigLayer {
  folder: string;
  items: ConfigItem[];
}
