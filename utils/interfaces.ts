export interface ConfigItem {
  name: string;
  url: string;
  bit: number;
}

export interface ConfigLayer {
  folder: string;
  items: ConfigItem[];
}

export interface AmountInfo {
  [key: number]: number;
}

export interface ChangeInfo {
  [key: number]: number;
}

export interface JSONAttribute {
  trait_type: string;
  value: string;
}

export interface JSONMapping {
  [key: number]: JSONAttribute;
}

export interface PreviewInfo {
  [key: string]: number;
}

export interface JSONOutputType {
  name: string;
  description: string;
  attributes: JSONAttribute[];
}
