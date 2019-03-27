import * as Magick from './lib/wasm-imagemagick.esm-es2018.js'

function replaceSpaces(str) {
	return str.split(' ').join('_')
}

function getInputData(file) {
	return new Promise(resolve => {
		let reader = new FileReader()
		reader.onload = (e) => {
			resolve({name: replaceSpaces(file.name), content: new Uint8Array(e.target.result)})
		}
		reader.readAsArrayBuffer(file)
	})
}

function genGradients() {
	return Magick.execute(`
		convert canvas:#D6CAB6 canvas:#c1a978 canvas:#725506 -append -filter Cubic -resize 512x512! gradient_fill.png
		convert canvas:#FFFFFF canvas:#E5D9C5 canvas:#CCBCA3 -append -filter Catrom -resize 512x512! gradient_highlight.png
	`).catch(err => {
		console.error(err)
	})
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
	}).catch(err => {
		console.error(err)
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
	}).catch(err => {
		console.error(err)
	})
}

function genCompositeHighlights(img, gradients) {
	let name = img.name.split('.').slice(0, -1).join('.')
	return Magick.execute({
		inputFiles: [img, ...gradients],
		commands: `
			convert ${name}_fill.png ${name}_highlights.png -compose screen -composite -sigmoidal-contrast 2,50%% -background white ${name}_composited.png
		`
	}).then(res => {
		return genInputFiles(res.outputFiles)
	}).catch(err => {
		console.error(err)
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
	}).catch(err => {
		console.error(err)
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
			-define dds:compression=none \
			${name}_default.dds
		`
	}).catch(err => {
		console.error(err)
	})
}

function genMap(img) {
	let name = img.name.split('.').slice(0, -1).join('.')
	return Magick.execute({
		inputFiles: [img],
		commands: `
			convert ${img.name} -alpha copy \
			-resize 256x256 \
			-define dds:compression=dxt5 -define dds:cluster-fit=true -define dds:weight-by-alpha=true \
			${name}_map.dds
		`
	}).catch(err => {
		console.error(err)
	})
}

function genSmall(img, border) {
	let name = img.name.split('.').slice(0, -1).join('.').split('_').slice(0, -1).join('_')
	return Magick.execute({
		inputFiles: [img, border],
		commands: `
			convert ${img.name} \
			-fill black -colorize 100%% -channel RGBA -blur 32x32 -level 0,97%% \
			${img.name} -compose Over -composite \
			${border.name} -compose Dst_Over -composite \
			-colorspace RGB -resize 24x24 -colorspace sRGB \
			-define dds:compression=none \
			${name}_small.dds
		`
	}).catch(err => {
		console.error(err)
	})
}

function toPNG(img) {
	let name = img.name.split('.').slice(0, -1).join('.')
	let pInputs = Magick.asInputFile(img, img.name).catch(err => console.error(err))
	return pInputs.then(input => {
		return Magick.execute({
			inputFiles: [input],
			commands: `
				convert ${input.name} ${name}.png
			`
		}).then(res => {
			return res.outputFiles[0]
		}).catch(err => {
			console.error(err)
		})
	})
}

function genTexture(img, gradients) {
	let name = img.name.split('.').slice(0, -1).join('.')

	let pGradientFill = genGradientFill(img, gradients[0])
	let pHighlight = genHighlight(img, gradients[1])
	let pBorders = genBorders(img)
	let pMap = genMap(img)

	return Promise.all([pGradientFill, pHighlight]).then(res => {
		return genCompositeHighlights(img, res.flat())
	}).then(composited => {
		return pBorders.then(border => {
			return Promise.all([
				genDefault(composited[0], border[0]),
				genSmall(composited[0], border[0]),
				pMap
			]).then(res => {
				return res.map(data => data.outputFiles).flat()
			})
		})
	})
}

function genInputFiles(files) {
	return Promise.all(files.map(data => Magick.asInputFile(data, data.name).catch(err => console.error(err))))
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
	genTextures: processImages,
	toPNG: toPNG
}