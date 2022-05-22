export interface ConfigItem {
  source: File;
  bit: number;
  amount: number;
}

export interface ConfigLayer {
  folder: string;
  items: ConfigItem[];
}
