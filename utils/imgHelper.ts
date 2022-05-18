import mergeImages from "merge-images";
import { ConfigItem, ConfigLayer } from "./interfaces";

export const genSingleImgUrl = async (
  configLayers: ConfigLayer[],
  combination: number
) => {
  let lstUrl: string[] = [];
  let cfgItems: ConfigItem[] = [];
  for (const layer of configLayers) {
    for (const item of layer.items) {
      if (combination & item.bit) {
        lstUrl.push(URL.createObjectURL(item.source));
        cfgItems.push(item)
        break;
      }
    }
  }
  console.log('cfgItems', cfgItems.map(ite => ite.source.name))
  const resultB64 = await mergeImages(lstUrl);
  return resultB64;
};
