import * as Magick from 'https://knicknic.github.io/wasm-imagemagick/magickApi.js'

function getInputData(file) {
	return new Promise(resolve => {
		let reader = new FileReader()
		reader.onload = (e) => {
			resolve({name: file.name, content: new Uint8Array(e.target.result)})
		}
		reader.readAsArrayBuffer(file)
	})
}

function genGradients() {
	return Magick.execute(`
		convert canvas:#D6CAB6 canvas:#c1a978 canvas:#725506 -append -filter Cubic -resize 512x512! gradient_fill.png
		convert canvas:#FFFFFF canvas:#E5D9C5 canvas:#CCBCA3 -append -filter Catrom -resize 512x512! gradient_highlight.png
	`)
}

function genGradientFill(img, gradient) {
	let name = img.name.split('.').slice(0, -1).join('.')
	return Magick.execute({
		inputFiles: [img, gradient],
		commands: `
			${img.name} -quiet -alpha copy gradient_fill.png -compose atop -composite ${name}_fill.png
		`
	}).then(res => {
		return genInputFiles(res.outputFiles)
	})
}

function genHighlight(img, gradient) {
	let name = img.name.split('.').slice(0, -1).join('.')
	return Magick.execute({
		inputFiles: [img, gradient],
		commands: `
			${img.name} -quiet -morphology HMT '6x6+0+5:0,-,-,-,-,- -,-,-,-,-,- -,-,-,-,-,- -,-,-,-,-,- -,-,-,-,-,- 1,-,-,-,-,-; 3x3+2+0:0,-,1 -,-,- -,-,-' -alpha copy gradient_highlight.png -compose atop -composite ${name}_highlights.png
		`
	}).then(res => {
		return genInputFiles(res.outputFiles)
	})
}

function genCompositeHighlights(img, gradients) {
	let name = img.name.split('.').slice(0, -1).join('.')
	return Magick.execute({
		inputFiles: [img, ...gradients],
		commands: `
			convert ${name}_fill.png ${name}_highlights.png -compose screen -composite -sigmoidal-contrast 2,50%% -background white ${name}_compisited.png
		`
	}).then(res => {
		return genInputFiles(res.outputFiles)
	})
}

function genBorders(img) {
	let name = img.name.split('.').slice(0, -1).join('.')
	return Magick.execute({
		inputFiles: [img],
		commands: `
			convert \( ${img.name} -morphology EdgeOut Octagon:3 -alpha copy \) \( -size 512x512 canvas:black \) -compose atop -composite ${name}_border.png
		`
	}).then(res => {
		return genInputFiles(res.outputFiles)
	})
}

function genDefault(img, border) {
	let name = img.name.split('.').slice(0, -1).join('.').split('_').slice(0, -1).join('_')
	return Magick.execute({
		inputFiles: [img, border],
		commands: `
			convert ${img.name} \
			-fill black -colorize 100%% -channel RGBA -blur 128x12 -level 0,97%% \
			${img.name} -compose Over -composite \
			${border.name} -compose Dst_Over -composite \
			-colorspace RGB -resize 128x128 -colorspace sRGB \
			${name}_default.png
		`
	})
}

function genTexture(img, gradients) {
	let name = img.name.split('.').slice(0, -1).join('.')

	let pGradientFill = genGradientFill(img, gradients[0])
	let pHighlight = genHighlight(img, gradients[1])
	let pBorders = genBorders(img)

	return Promise.all([pGradientFill, pHighlight]).then(res => {
		return genCompositeHighlights(img, res.flat())
	}).then(composited => {
		return pBorders.then(border => {
			return genDefault(composited[0], border[0])
		})
	})
}

function genInputFiles(files) {
	return Promise.all(files.map(data => Magick.asInputFile(data, data.name)))
}

function processImages(imgs) {
	let pGradients = genGradients().then(res => {
		return genInputFiles(res.outputFiles)
	})

	let pImageInputs = Array.from(imgs).map(img => getInputData(img))

	let pInputs = Promise.all([...pImageInputs, pGradients])

	return pInputs.then(res => {
		let gradients = res.pop()
		let images = res
		let pImages = images.map(img => genTexture(img, gradients))
		return pImages
	})

}

export default {
	genTextures: processImages
}