export interface ConfigItem {
  source: File;
  bit: number;
}

export interface ConfigLayer {
  folder: string;
  items: ConfigItem[];
}

export interface AmountInfo {
  [key: number] : number
}

export interface ChangeInfo {
  [key: number] : number
}
