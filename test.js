
const genBitAmount = (num) => {
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
genBitAmount(11)