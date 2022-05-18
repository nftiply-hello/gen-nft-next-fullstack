import { combineAllBitOr } from "./combineHelper";
import {
  AmountHandleType,
  ConfigItem,
  ConfigLayer,
  ImgHandleType,
} from "./interfaces";

export const getFolder = async () => {
  const out1: ImgHandleType = {}; // store img file
  const out2: AmountHandleType = {}; // store corresponding amount of img
  try {
    const dirHandle = await showDirectoryPicker();
    const configLayers = await await handleDirectoryEntry(dirHandle);
    const itemBits = configLayers.map((cfl) => cfl.items.map((i) => i.bit));
    // + 1: for active status
    const combinations = combineAllBitOr(itemBits).map((item) => item + 1);
    return { configLayers, combinations };
  } catch (error) {
    console.log("error in get Folfer: ", error);
    console.log("aborted");
  }
};
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
