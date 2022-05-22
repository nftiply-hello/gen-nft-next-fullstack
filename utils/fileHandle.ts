import { combineAllBitOr } from "./combineHelper";
import { AmountInfo, ConfigItem, ConfigLayer } from "./interfaces";

export const getFolder = async () => {
  try {
    const dirHandle = await showDirectoryPicker();
    const configLayers = await handleDirectoryEntry(dirHandle);
    const itemBits = configLayers.map((cfl) => cfl.items.map((i) => i.bit));
    // + 1: for active status
    const combinations = combineAllBitOr(itemBits).map((item) => item + 1);
    const amountInfo: AmountInfo = genAmount(configLayers, combinations.length)
    return { configLayers, combinations, amountInfo };
  } catch (error) {
    console.log("error in get Folfer: ", error);
    console.log("aborted");
  }
};
const genAmount = (configLayers: ConfigLayer[], combinationsNum: number) => {
  const result: AmountInfo = {}
  configLayers.forEach(lay => {
    const itemNum = lay.items.length
    const amount = combinationsNum / itemNum
    lay.items.forEach(ite => {
      result[ite.bit] = amount
    })
  })
  return result
}
const handleDirectoryEntry = async (dirHandle: FileSystemDirectoryHandle) => {
  let bitGen = 1;
  let out: ConfigLayer[] = [];
  for await (const folderEntry of dirHandle.values()) {
    if (folderEntry.kind !== "directory") {
      continue;
    }
    const folderHandle = await dirHandle.getDirectoryHandle(folderEntry.name, {
      create: false,
    });
    const cfgLayer: ConfigLayer = {
      folder: "",
      items: [],
    };
    cfgLayer.folder = folderEntry.name;
    for await (const imgEntry of folderHandle.values()) {
      if (imgEntry.kind === "file") {
        const file = await imgEntry.getFile();
        bitGen = bitGen * 2;
        const fileItem: ConfigItem = {
          source: file,
          bit: bitGen,
        };
        cfgLayer.items.push(fileItem);
      }
    }
    out.push(cfgLayer);
  }
  return out;
};
