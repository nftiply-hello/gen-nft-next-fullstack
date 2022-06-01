var heightOfElements = []
var itemOversizeIndex
var test = document.getElementById('ahuhu')
test.innerHTML = 'fuck'
for (var i = 0; i < 10; i++) {
    const elementToAppend = document.createElement("tr")
    elementToAppend.style.border = "none"
    elementToAppend.id = `tr-to-append-${i}`
    elementToAppend.innerHTML = `
            <td style="border: none; border-right: 2px solid black;" colspan=3>1</td>
            <td style="border: none; border-right: 2px solid black;" colspan=11>Kwan Wing Development Limited 3901 Far East Centre, 16 Harcourt Road, Admiralty, Hong Kong 白單出, Kwan Wing Development Limited 3901 Far East Centre, 16 Harcourt Road, Admiralty, Hong Kong 白單出 </td>
            <td style="border: none; border-right: 2px solid black;" colspan=3>3</td>
            <td style="border: none;" colspan=3>4</td>
        `
    document.getElementById("table-item").appendChild(elementToAppend)
    var heightOfTableItem = document.getElementById(`tr-to-append-${i}`).offsetHeight
    heightOfElements.push(heightOfTableItem)
    const heightOfElementsTotal = heightOfElements.reduce((a, b) => a + b)
    if (heightOfElementsTotal > 300) {
        itemOversizeIndex = i + 1
        document.getElementById("table-item").removeChild(elementToAppend)
        break;
    }
}