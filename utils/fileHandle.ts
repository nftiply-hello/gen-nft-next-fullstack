import { combineAllBitOr } from "./combineHelper";
import { IMAGES_OUT_DIR, JSON_OUT_DIR } from "./constants";
import { AmountInfo, ConfigItem, ConfigLayer, JSONMapping } from "./interfaces";

export const getFolder = async () => {
  try {
    const dirHandle = await showDirectoryPicker();
    const { configLayers, jsonMapping } = await handleDirectoryEntry(dirHandle);
    const itemBits = configLayers.map((cfl) => cfl.items.map((i) => i.bit));
    // + 1: for active status
    const combinations = combineAllBitOr(itemBits).map((item) => item + 1);
    const amountInfo: AmountInfo = genAmount(configLayers, combinations.length);
    return { configLayers, combinations, amountInfo, jsonMapping };
  } catch (error) {
    console.log("error in get Folfer: ", error);
    console.log("aborted");
  }
};
const genAmount = (configLayers: ConfigLayer[], combinationsNum: number) => {
  const result: AmountInfo = {};
  configLayers.forEach((lay) => {
    const itemNum = lay.items.length;
    const amount = combinationsNum / itemNum;
    lay.items.forEach((ite) => {
      result[ite.bit] = amount;
    });
  });
  return result;
};
const handleDirectoryEntry = async (dirHandle: FileSystemDirectoryHandle) => {
  let bitGen = 1;
  let out: ConfigLayer[] = [];
  const jsonMapping: JSONMapping = {};
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
        jsonMapping[bitGen] = {
          trait_type: folderEntry.name,
          value: file.name.substring(0, file.name.lastIndexOf(".")),
        };
        cfgLayer.items.push(fileItem);
      }
    }
    out.push(cfgLayer);
  }
  return { configLayers: out, jsonMapping };
};

export const saveResults = async (urls: string[], jsons: string[]) => {
  const outputDir = await showDirectoryPicker();
  const imgsHandle = await outputDir.getDirectoryHandle(IMAGES_OUT_DIR, {
    create: true,
  });
  const jsonshandle = await outputDir.getDirectoryHandle(JSON_OUT_DIR, {
    create: true,
  });
  const padNum = (urls.length - 1).toString().length;
  for (const index in urls) {
    const fileName = `${index.toString().padStart(padNum, "0")}.png`;
    const newFile = await imgsHandle.getFileHandle(fileName, {
      create: true,
    });
    await writeURLToFile(newFile, urls[index]);
  }
  for (const index in jsons) {
    const fileName = `${index.toString().padStart(padNum, "0")}.json`;
    const newFile = await jsonshandle.getFileHandle(fileName, {
      create: true,
    });
    await writeFile(newFile, jsons[index]);
  }
};

const writeFile = async (
  fileHandle: FileSystemFileHandle,
  contents: string
) => {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  // Write the contents of the file to the stream.
  await writable.write(contents);
  // Close the file and write the contents to disk.
  await writable.close();
};

const writeURLToFile = async (
  fileHandle: FileSystemFileHandle,
  url: string
) => {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  // Make an HTTP request for the contents.
  const response = await fetch(url);
  // Stream the response into the file.
  if (response.body) {
    await response.body.pipeTo(writable);
  } else {
    console.log("url not valid");
  }
  // pipeTo() closes the destination pipe by default, no need to close it.
};
