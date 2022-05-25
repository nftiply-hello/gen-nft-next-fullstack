import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import {
  adjustTotalSupply,
  adjustTraitAmount,
  changeAmountInfo,
} from "../utils/combineHelper";
import { getFolder, saveResults } from "../utils/fileHandle";
import { genSingleImgUrl } from "../utils/imgHelper";
import { AmountInfo, ConfigLayer, JSONMapping } from "../utils/interfaces";

const Home: NextPage = () => {
  const [results, setResults] = useState<string[]>([]);
  const [resultsJson, setResultsJson] = useState<string[]>([]);
  const [configLayers, setConfigLayers] = useState<ConfigLayer[]>([]);
  const [combinations, setCombinations] = useState<number[]>([]);
  const [amountInfo, setAmountInfo] = useState<AmountInfo>();
  const [jsonMapping, setJsonMapping] = useState<JSONMapping>();
  const [baseName, setBaseName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  const genResults = async () => {
    setResults([]);
    setResultsJson([]);
    const com2Gen = combinations.filter((c) => c & 1);
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
      // const newResults = [...results, url];
      // setResults(newResults);
      setResults((old) => [...old, url]);
      setResultsJson((old) => [...old, JSON.stringify(metadataJson)]);
    }
  };
  const handleGetFolder = async () => {
    const folderResults = await getFolder();
    if (!folderResults) {
      return;
    }
    setCombinations(folderResults.combinations);
    setConfigLayers(folderResults.configLayers);
    setAmountInfo(folderResults.amountInfo);
    setJsonMapping(folderResults.jsonMapping);
  };
  const getTotalSupply = () => {
    return combinations.filter((com) => com & 1).length;
  };
  const changeLayOrder = (layIndex: number, isUp: Boolean) => {
    setConfigLayers((oldCon) => {
      const newCon = [...oldCon];
      const store = newCon[layIndex];
      let switchIndex = 0;
      if (isUp) {
        if (layIndex === newCon.length - 1) {
          return newCon;
        }
        switchIndex = layIndex + 1;
      } else {
        if (layIndex === 0) {
          return newCon;
        }
        switchIndex = layIndex - 1;
      }
      newCon[layIndex] = newCon[switchIndex];
      newCon[switchIndex] = store;
      console.log("newCon", newCon);
      return newCon;
    });
  };
  const genConfigUi = () => {
    return configLayers.map((lay, layIndex) => {
      return (
        <div key={layIndex}>
          <div>
            <p>{lay.folder}</p>
            <button
              onClick={() => {
                changeLayOrder(layIndex, true);
              }}
            >
              down
            </button>
            <button
              onClick={() => {
                changeLayOrder(layIndex, false);
              }}
            >
              up
            </button>
          </div>
          {lay.items.map((ite, otemIndex) => {
            return (
              <div key={otemIndex}>
                <span>{ite.source.name}</span>
                <input
                  type="number"
                  value={amountInfo ? amountInfo[ite.bit] : 0}
                  onChange={(e) => {
                    handleAdjustTraitAmount(
                      ite.bit,
                      amountInfo ? amountInfo[ite.bit] : 0,
                      Number(e.target.value)
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      );
    });
  };
  const handleAdjustTotalSupply = (newVal: number, oldVal: number) => {
    const { combinations: newCombinations, changeInfo } = adjustTotalSupply(
      newVal - oldVal,
      combinations
    );
    setCombinations(newCombinations);
    setAmountInfo((oldAmount) => {
      const newVal = changeAmountInfo({ ...oldAmount } || {}, changeInfo);
      return newVal;
    });
  };

  const handleAdjustTraitAmount = (
    bit: number,
    oldAmount: number,
    newAmount: number
  ) => {
    const adjustAmount = newAmount - oldAmount;
    const { bitChange, combinations: newCombinations } = adjustTraitAmount(
      combinations,
      bit,
      adjustAmount
    );
    setAmountInfo((oldAmount) => {
      const newVal = changeAmountInfo({ ...oldAmount } || {}, bitChange);
      return newVal;
    });
    setCombinations(newCombinations);
  };
  const handleSaveResults = async () => {
    saveResults(results, resultsJson);
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Nft generate images metadata</title>
        <meta name="description" content="Nft generate images metadata" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <span>Total suply</span>
        <input
          type="number"
          value={getTotalSupply()}
          onChange={(e) => {
            handleAdjustTotalSupply(Number(e.target.value), getTotalSupply());
          }}
        />
        <span>Base name</span>
        <input
          type="text"
          value={baseName}
          onChange={(e) => {
            setBaseName(e.target.value);
          }}
        />
        <span>Description</span>
        <input
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
        <span>Width</span>
        <input
          type="number"
          value={width}
          onChange={(e) => {
            setWidth(Number(e.target.value));
          }}
        />
        <span>Height</span>
        <input
          type="number"
          value={height}
          onChange={(e) => {
            setHeight(Number(e.target.value));
          }}
        />
        <button onClick={handleGetFolder}>upload</button>
        <button onClick={genResults}>genImg</button>
        <button onClick={handleSaveResults}>save Result</button>
        {genConfigUi()}
        {results.map((r, i) => (
          <div key={i}>
            <Image src={r} alt="" width={300} height={300}></Image>
          </div>
        ))}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            {/* <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} /> */}
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
