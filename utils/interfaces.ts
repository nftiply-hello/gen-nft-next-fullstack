export interface ConfigItem {
  source: File;
  bit: number;
}

export interface ConfigLayer {
  folder: string;
  items: ConfigItem[];
}
