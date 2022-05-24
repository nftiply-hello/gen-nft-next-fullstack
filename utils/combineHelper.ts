import { genRange } from "./arrayHelper";
import { ChangeInfo, AmountInfo } from "./interfaces";
import _ from "lodash";

export const combineAllBitOr = (array: number[][]) => {
  const res: number[] = [];
  let max = array.length - 1;
  const helper = (total: number, i: number) => {
    for (let j = 0, l = array[i].length; j < l; j++) {
      let copy = total;
      copy = copy | array[i][j];
      if (i == max) res.push(copy);
      else helper(copy, i + 1);
    }
  };
  helper(0, 0);
  return res;
};

const genArrBit = (num: number) => {
  const arrGen = [];
  let i = 0;
  while (num >>> i > 0) {
    const checkNum = 1 << i;
    if (num & checkNum) {
      arrGen.push(checkNum);
    }
    i++;
  }
  return arrGen;
};

export const adjustTotalSupply = (
  adjustAmout: number,
  combinations: number[]
): { combinations: number[]; changeInfo: ChangeInfo } => {
  const changeInfo: ChangeInfo = {};
  const iterIndexes = _.shuffle(genRange(combinations.length));
  let genCount = 0;
  const isIncrement = Number(adjustAmout > 0);
  const unitChange = isIncrement ? 1 : -1;
  for (const index of iterIndexes) {
    const com = combinations[index];
    const isExist = com & 1;
    if (isIncrement !== Number(isExist)) {
      combinations[index] += isIncrement ? 1 : -1;
      const arrBit = genArrBit(combinations[index]);
      for (const ab of arrBit) {
        if (ab !== 1) {
          const newCount = changeInfo[ab]
            ? changeInfo[ab] + unitChange
            : unitChange;
          changeInfo[ab] = newCount;
        }
      }
      genCount++;
    }
    if (genCount === Math.abs(adjustAmout)) {
      break;
    }
  }
  return {
    combinations,
    changeInfo,
  };
};

const checkIsRemove = (com: number, bit: number, isIncrement: boolean) => {
  const containBit = com & bit;
  const isExist = com & 1;
  if (isIncrement) {
    return !containBit && isExist;
  } else {
    return containBit && isExist;
  }
};

const checkIsAdd = (com: number, bit: number, isIncrement: boolean) => {
  const containBit = com & bit;
  const isExist = com & 1;
  if (isIncrement) {
    return containBit && !isExist;
  } else {
    return !containBit && !isExist;
  }
};

export const adjustTraitAmount = (
  combinations: number[],
  bit: number,
  adjustAmout: number
) => {
  const bitChange: ChangeInfo = {};
  // const iterIndexes = _.shuffle(genRange(combinations.length));
  const isIncrement = adjustAmout > 0;
  const lstIndexAddAll: number[] = [];
  const lstIndexRemoveAll: number[] = [];
  const iterIndexes = _.shuffle(genRange(combinations.length));
  for (const index of iterIndexes) {
    const com = combinations[index];
    if (checkIsAdd(com, bit, isIncrement)) {
      lstIndexAddAll.push(index);
    }
    if (checkIsRemove(com, bit, isIncrement)) {
      lstIndexRemoveAll.push(index);
    }
  }
  const changeAmount = Math.min(
    lstIndexAddAll.length,
    lstIndexRemoveAll.length,
    Math.abs(adjustAmout)
  );
  const lstIndexAdd = lstIndexAddAll.slice(0, changeAmount);
  const lstIndexRemove = lstIndexRemoveAll.slice(0, changeAmount);

  for (const index of iterIndexes) {
    let isAdd: boolean | null = null;
    if (lstIndexAdd.includes(index)) {
      isAdd = true;
    } else if (lstIndexRemove.includes(index)) {
      isAdd = false;
    } else {
      continue;
    }
    const unitChange = isAdd ? 1 : -1;
    combinations[index] += unitChange;
    const arrBit = genArrBit(combinations[index]);
    for (const ab of arrBit) {
      if (ab !== 1) {
        const newCount = bitChange[ab]
          ? bitChange[ab] + unitChange
          : unitChange;
        bitChange[ab] = newCount;
      }
    }
  }
  return { combinations, bitChange };
};

export const changeAmountInfo = (
  amountInfo: AmountInfo,
  changeInfo: ChangeInfo
) => {
  for (const bit in changeInfo) {
    amountInfo[bit] += changeInfo[bit];
  }
  return amountInfo;
};
