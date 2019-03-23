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

document.addEventListener('DOMContentLoaded', e => {
	Drop.init()
	Drop.onDrop(files => {
		Display.loadStart()
		Textures.genTextures(files).then(jobs => {
			Display.clear()
			jobs.forEach(job => {
				job.then(res => {
					Promise.all(res.map(dds => Textures.toPNG(dds))).then(res => {
						res.forEach(png => Display.append(png.blob))
					})
				})
			})
			Promise.all(jobs).then(res => {
				Display.loadEnd()
				Package.zip(res).generateAsync({type: 'base64'}).then(base64 => {
					window.location = 'data:application/zip;base64,' + base64
				})
			})
		})
	})
})