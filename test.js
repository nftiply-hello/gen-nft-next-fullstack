const testSaveMulti = async () => {
    const dirHandle = await showDirectoryPicker()
    const jsonHandle = await dirHandle.getDirectoryHandle('json', { create: true })
    const newfile = await jsonHandle.getFileHandle('newFile.json', { create: true })
    await writeFile(newfile, 'ahuhuhuhuhu')
}

async function writeFile(fileHandle, contents) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
}

testSaveMulti()