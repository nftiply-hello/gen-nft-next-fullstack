import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  Collapse,
  Input,
  List,
  Progress,
  Row,
} from "antd";
const { Panel } = Collapse;
import _ from "lodash";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import {
  adjustTotalSupply,
  adjustTraitAmount,
  changeAmountInfo,
} from "../utils/combineHelper";
import { genResult, getFolder } from "../utils/fileHandle";
import { genSingleImgUrl } from "../utils/imgHelper";
import {
  AmountInfo,
  ConfigLayer,
  JSONMapping,
  PreviewInfo,
} from "../utils/interfaces";

const Home: NextPage = () => {
  const [results, setResults] = useState<string[]>([]);
  const [, setResultsJson] = useState<string[]>([]);
  const [configLayers, setConfigLayers] = useState<ConfigLayer[]>([]);
  const [combinations, setCombinations] = useState<number[]>([]);
  const [amountInfo, setAmountInfo] = useState<AmountInfo>();
  const [jsonMapping, setJsonMapping] = useState<JSONMapping>();
  const [previewInfo, setPreviewInfo] = useState<PreviewInfo>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [baseName, setBaseName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [width, setWidth] = useState<number>(512);
  const [height, setHeight] = useState<number>(512);
  const [generating, setGenerating] = useState<boolean>(false);
  const [percentProgress, setPercentProgress] = useState<number>(0);

  const handleGenResults = async () => {
    setGenerating(true);
    const { urlResults, jsonResults } = await genResult(
      combinations,
      baseName,
      description,
      configLayers,
      jsonMapping || {},
      width,
      height,
      setPercentProgress
    );
    setResults(urlResults);
    setResultsJson(jsonResults);
    setGenerating(false);
    alert("Congratulation! Your metadata saved successfully");
  };
  const handleGetFolder = async () => {
    setPreviewUrl("");
    const folderResults = await getFolder();
    if (!folderResults) {
      return;
    }
    setCombinations(folderResults.combinations);
    setConfigLayers(folderResults.configLayers);
    setAmountInfo(folderResults.amountInfo);
    setJsonMapping(folderResults.jsonMapping);
    setPreviewInfo(folderResults.previewInfo);
  };
  useEffect(() => {
    handleSetPreviewUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewInfo, configLayers]);

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
  const handleSetPreview = async (folder: string, bit: number) => {
    setPreviewInfo((old) => ({
      ...old,
      [folder]: bit,
    }));
  };
  const handleSetPreviewUrl = async () => {
    if (configLayers.length === 0) return;
    const comPre = _.sum(Object.values(previewInfo || {}));
    const { url } = await genSingleImgUrl(
      configLayers,
      comPre,
      jsonMapping || {},
      baseName,
      description,
      width,
      height
    );
    setPreviewUrl(url);
  };
  const genPreviewImg = () => {
    if (previewUrl.length > 0) {
      return (
        <>
          <p>Preview Img</p>
          <Image src={previewUrl} alt="" width={300} height={300}></Image>
        </>
      );
    }
  };
  const genExtra = (layLen: number, layIndex: number) => (
    <>
      <CaretUpOutlined
        onClick={(e) => {
          e.stopPropagation();
          changeLayOrder(layIndex, false);
        }}
        disabled={layIndex === 0}
        style={{ fontSize: "30px", color: "#08c" }}
      />
      <CaretDownOutlined
        size={30}
        onClick={(e) => {
          e.stopPropagation();
          changeLayOrder(layIndex, true);
        }}
        disabled={layIndex === layLen - 1}
        style={{ fontSize: "30px", color: "#08c" }}
      />
    </>
  );
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
  const genConfigUi = () => {
    const layLen = configLayers.length;
    if (layLen === 0) {
      return;
    }
    const ui = (
      <Collapse
        defaultActiveKey={Array(layLen)
          .fill(1)
          .map((_, index) => index.toString())}
      >
        {configLayers.map((lay, layIndex) => {
          const getListItemStyle = (bit: number) => {
            let listItemStyle = {};
            if (previewInfo && previewInfo[lay.folder] === bit) {
              listItemStyle = { border: "2px solid #1890ff" };
            }
            return listItemStyle;
          };
          return (
            <Panel
              header={lay.folder}
              key={layIndex}
              extra={genExtra(layLen, layIndex)}
            >
              <List
                grid={{ gutter: 16, column: 4 }}
                dataSource={lay.items}
                renderItem={(item) => (
                  <List.Item
                    style={getListItemStyle(item.bit)}
                    onClick={() => handleSetPreview(lay.folder, item.bit)}
                    color="green"
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={item.url} />}
                      title={item.name}
                      description={
                        amountInfo &&
                        Number(
                          (
                            (amountInfo[item.bit] / getTotalSupply()) *
                            100
                          ).toFixed(2)
                        ) +
                          " " +
                          "%"
                      }
                    />
                    <Input
                      type="number"
                      value={amountInfo ? amountInfo[item.bit] : 0}
                      onChange={(e) => {
                        handleAdjustTraitAmount(
                          item.bit,
                          amountInfo ? amountInfo[item.bit] : 0,
                          Number(e.target.value)
                        );
                      }}
                    />
                  </List.Item>
                )}
              />
            </Panel>
          );
        })}
      </Collapse>
    );
    return ui;
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Nft metadata generator</title>
        <meta name="description" content="Come and create your nft metadatas" />
        <meta property="og:title" content="Nft generator" />
        <meta
          property="og:description"
          content="Come and create your nft metadatas"
        />
        {/* <meta property="og:url" content="https://myclothingstore.com/" /> */}
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>THE BEST FREE NFT GENERATOR TOOL</h1>

        <p className={styles.description}>
          Generate massive numbers of NFT with determined rarity – and it’s
          FREE!
        </p>
        <Row>
          <Col span={12}>
            <span>Total suply</span>
            <Input
              type="number"
              value={getTotalSupply()}
              onChange={(e) => {
                handleAdjustTotalSupply(
                  Number(e.target.value),
                  getTotalSupply()
                );
              }}
            />
            <span>Base name</span>
            <Input
              type="text"
              value={baseName}
              onChange={(e) => {
                setBaseName(e.target.value);
              }}
            />
            <span>Description</span>
            <Input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
            <span>Width</span>
            <Input
              type="number"
              value={width}
              onChange={(e) => {
                setWidth(Number(e.target.value));
              }}
            />
            <span>Height</span>
            <Input
              type="number"
              value={height}
              onChange={(e) => {
                setHeight(Number(e.target.value));
              }}
            />
            <Button type="dashed" onClick={handleGetFolder}>
              Select Layers
            </Button>
            <Button
              type="primary"
              onClick={handleGenResults}
              disabled={generating || configLayers.length === 0}
            >
              Generate Results
            </Button>
            {percentProgress > 0 && (
              <Progress
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                percent={percentProgress}
              />
            )}
            {genPreviewImg()}
            <p>Result: </p>
            {results.map((r, i) => (
              <Image key={i} src={r} alt="" width={300} height={300}></Image>
            ))}
          </Col>
          <Col span={12}>{genConfigUi()}</Col>
        </Row>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by <span className={styles.logo}></span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
