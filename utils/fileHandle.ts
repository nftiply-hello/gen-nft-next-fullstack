import _ from "lodash";
import { Dispatch, SetStateAction } from "react";
import { combineAllBitOr } from "./combineHelper";
import { IMAGES_OUT_DIR, JSON_OUT_DIR } from "./constants";
import { genSingleImgUrl } from "./imgHelper";
import {
  AmountInfo,
  ConfigItem,
  ConfigLayer,
  JSONMapping,
  PreviewInfo,
} from "./interfaces";
import { genPadNum } from "./numberHelper";

export const getFolder = async () => {
  try {
    const dirHandle = await showDirectoryPicker();
    const { configLayers, jsonMapping } = await handleDirectoryEntry(dirHandle);
    const itemBits = configLayers.map((cfl) => cfl.items.map((i) => i.bit));
    // + 1: for active status
    const combinations = combineAllBitOr(itemBits).map((item) => item + 1);
    const amountInfo: AmountInfo = genAmount(configLayers, combinations.length);
    const previewInfo: PreviewInfo = {};
    configLayers.forEach((lay) => {
      const bit = _.sample(lay.items.map((ite) => ite.bit)) || 0;
      previewInfo[lay.folder] = bit;
    });
    return { configLayers, combinations, amountInfo, jsonMapping, previewInfo };
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
        const fileName = file.name.substring(0, file.name.lastIndexOf("."));
        bitGen = bitGen * 2;
        const fileItem: ConfigItem = {
          name: fileName,
          url: URL.createObjectURL(file),
          bit: bitGen,
        };
        jsonMapping[bitGen] = {
          trait_type: folderEntry.name,
          value: fileName,
        };
        cfgLayer.items.push(fileItem);
      }
    }
    out.push(cfgLayer);
  }
  return { configLayers: out, jsonMapping };
};

export const genResult = async (
  combinations: number[],
  baseName: string,
  description: string,
  configLayers: ConfigLayer[],
  jsonMapping: JSONMapping,
  width: number,
  height: number,
  setPercentProgress: Dispatch<SetStateAction<number>>
) => {
  const outputDir = await showDirectoryPicker();
  const imgsHandle = await outputDir.getDirectoryHandle(IMAGES_OUT_DIR, {
    create: true,
  });
  const jsonshandle = await outputDir.getDirectoryHandle(JSON_OUT_DIR, {
    create: true,
  });
  const urlResults: string[] = [];
  const jsonResults: string[] = [];
  const com2Gen = combinations.filter((c) => c & 1);
  const comGenLen = com2Gen.length;
  const padNum = genPadNum(comGenLen);
  for (const index in com2Gen) {
    const metaName = baseName + index;
    const { url, metadataJson } = await genSingleImgUrl(
      configLayers,
      com2Gen[index],
      jsonMapping || {},
      metaName,
      description,
      width,
      height
    );
    const jsonString = JSON.stringify(metadataJson);
    const imgName = `${index.toString().padStart(padNum, "0")}.png`;
    const imgFile = await imgsHandle.getFileHandle(imgName, {
      create: true,
    });
    await writeURLToFile(imgFile, url);
    const jsonName = `${index.toString().padStart(padNum, "0")}.json`;
    const jsonFile = await jsonshandle.getFileHandle(jsonName, {
      create: true,
    });
    await writeFile(jsonFile, jsonString);
    urlResults.push(url);
    jsonResults.push(jsonString);
    setPercentProgress(+((+(index + 1) * 100) / comGenLen).toFixed(2));
  }
  return { urlResults, jsonResults };
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
