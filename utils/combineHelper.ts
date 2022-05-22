import { genRange } from "./arrayHelper";
import { ChangeInfo, AmountInfo } from "./interfaces";
import _ from 'lodash'

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
  const arrGen = []
  let i = 0
  while((num>>>i)>0) {
      const checkNum = 1<<i
      if (num & checkNum) {
          arrGen.push(checkNum)
      }
      i++
  }
  return arrGen
}

export const getCombinationChanges = (
  combinations: number[],
  bit: number,
  adjustAmout: number
) => {
  const bitChange: ChangeInfo = {}
  const iterIndexes = _.shuffle(genRange(combinations.length))
  let genCount = 0
  const isIncrement = Number(adjustAmout > 0)
  for (const index of iterIndexes) {
    const com = combinations[index]
    const containBit = !!(com & bit)
    const isExist = com & 1
    if(containBit && (isIncrement !== Number(isExist))) {
      combinations[index] += isIncrement ? 1 : -1
      const arrBit = genArrBit(combinations[index])
      for (const ab of arrBit) {
        if (ab !== 1) {
          const newCount = bitChange[ab] ? bitChange[ab] + 1 : 1
          bitChange[ab] = newCount
        }
      }
      genCount ++
    }
    if (genCount === Math.abs(adjustAmout)) {
      break
    }
  }
  return {combinations, bitChange}
}

export const changeAmountInfo = (
  amountInfo: AmountInfo,
  changeInfo: ChangeInfo,
  isIncrement: boolean
) => {
  const sign = isIncrement ? 1 : -1
  for (const bit in changeInfo) {
    const changeAmount = sign * changeInfo[bit]
    amountInfo[bit] += changeAmount
  }
  return amountInfo
}
