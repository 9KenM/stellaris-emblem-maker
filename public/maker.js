import Drop from './drop.js'
import Display from './display.js'
import Textures from './textures.js'
import Package from './package.js'

function readFileData(file) {
	return new Promise(resolve => {
		let reader = new FileReader()
		reader.onload = (e) => {
			resolve(e.target.result)
		}
		reader.readAsArrayBuffer(file)
	})
}

function getFileInfo(file) {
	let nameArr = file.name.split('.')
	let extension = nameArr.pop()
	nameArr = nameArr.join('.').split('_')
	let type = nameArr.pop()
	let name = nameArr.join('_')
	return [name, type, extension]
}

document.addEventListener('DOMContentLoaded', e => {
	Drop.init()
	Drop.onDrop(files => {
		Display.loadStart()
		Textures.genTextures(files).then(jobs => {
			Display.clear()
			Display.hideDownload()
			jobs.forEach(job => {
				job.then(res => {
					let msg = Display.message(`generated ${getFileInfo(res[0])[0]}.dds`)
					let defaultDDS = res.find(dds => getFileInfo(dds)[1] === 'default')
					Textures.toPNG(defaultDDS).then(png => {
						Display.append(png.blob)
					})
				})
			})
			Promise.all(jobs).then(res => {
				Package.zip(res).generateAsync({type: 'blob'}).then(blob => {
					Display.loadEnd()
					Display.showDownload(blob)
				})
			})
		})
	})
})