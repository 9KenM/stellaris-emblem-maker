import Drop from './drop.js'
import Display from './display.js'
import Textures from './textures.js'

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
					Display.append(res.outputFiles[0].blob)
				})
			})
			Promise.all(jobs).then(res => {
				Display.loadEnd()
			})
		})
	})
})