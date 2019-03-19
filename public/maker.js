import * as Magick from 'https://knicknic.github.io/wasm-imagemagick/magickApi.js'
import Drop from './drop.js'
import Display from './display.js'

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
		Display.fill(Array.from(files))
	})
})