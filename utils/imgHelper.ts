import mergeImages from "merge-images";
import { ConfigLayer } from "./interfaces";

export const genSingleImgUrl = async (
  configLayers: ConfigLayer[],
  combination: number
) => {
  let lstUrl: string[] = [];
  for (const layer of configLayers) {
    for (const item of layer.items) {
      if (combination & item.bit) {
        lstUrl.push(URL.createObjectURL(item.source));
        break;
      }
    }
  }
  const resultB64 = await mergeImages(lstUrl);
  return resultB64;
};
