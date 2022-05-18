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
