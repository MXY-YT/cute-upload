// 文件长度 + 文件类型 + 前中后 的片段的 hash 值，
self.onmessage = async (e) => {
	const SparkMD5 = await import("spark-md5")
	let {fileChunkList, file, isProgress} = e.data
	fileChunkList = fileChunkList.length === 1 ? fileChunkList : [fileChunkList[0], fileChunkList[Math.floor(fileChunkList.length / 2)], fileChunkList[fileChunkList.length - 1]]
	const spark = new SparkMD5.ArrayBuffer()
	let percentage = 0
	let count = 0
	const loadNext = (index) => {
		spark.append(new Uint8Array([file.size]).buffer)
		spark.append(new TextEncoder().encode(file.type))
		const reader = new FileReader()
		reader.readAsArrayBuffer(fileChunkList[index].chunkData)
		reader.onload = e => {
			count++
			spark.append(e.target.result)
			if (count === fileChunkList.length) {
				self.postMessage(isProgress ? {
					percentage: 100, hash: spark.end()
				} : spark.end())
				self.close()
			} else {
				percentage += 100 / fileChunkList.length
				isProgress && self.postMessage({
					percentage
				})
				loadNext(count)
			}
		}
	}
	loadNext(count)
}
