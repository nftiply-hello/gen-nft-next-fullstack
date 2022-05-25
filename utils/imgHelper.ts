import mergeImages from "merge-images";
import {
  ConfigItem,
  ConfigLayer,
  JSONMapping,
  JSONOutputType,
} from "./interfaces";

export const genSingleImgUrl = async (
  configLayers: ConfigLayer[],
  combination: number,
  jsonMapping: JSONMapping,
  name: string,
  description: string,
  width: number,
  height: number
) => {
  let lstUrl: string[] = [];
  let cfgItems: ConfigItem[] = [];
  const metadataJson: JSONOutputType = {
    name,
    description,
    attributes: [],
  };
  for (const layer of configLayers) {
    for (const item of layer.items) {
      if (combination & item.bit) {
        metadataJson.attributes.push(jsonMapping[item.bit]);
        lstUrl.push(item.url);
        cfgItems.push(item);
        break;
      }
    }
  }
  const resultB64 = await mergeImages(lstUrl, { width, height });
  return { url: resultB64, metadataJson };
};
