
function getContainer() {
	return document.getElementById('thumbnails')
}

function appendImageData(container, data) {
	let url = URL.createObjectURL(data)
	let img = document.createElement('img')
	img.classList.add('image')
	img.src = url
	container.appendChild(img)
}

function removeImg(img) {
	URL.revokeObjectURL(img.src)
	img.parentNode.removeChild(img)
}

function fillContainer(imgs) {
	let container = getContainer()
	emptyContainer()
	imgs.forEach(img => {
		appendImageData(container, img)
	})
}

function emptyContainer() {
	let container = getContainer()
	container.querySelectorAll('img').forEach(img => removeImg(img))
}

function append(img) {
	appendImageData(getContainer(), img)
}

function loadStart() {
	document.getElementById('thumbnails').classList.remove('show')
	document.getElementById('dropzone').classList.add('loading')
	displayMessage('generating dds images')
}

function loadEnd() {
	document.getElementById('thumbnails').classList.add('show')
	document.getElementById('dropzone').classList.remove('loading')
	displayMessage('drop 512x512 white-on-black images here')
}

function showDownloadLink(blob) {
	let anchor = document.getElementById('download')
	anchor.href = window.URL.createObjectURL(blob)
	anchor.target = '_blank'
	anchor.download = 'emblems.zip'
	anchor.classList.add('show')
}

function hideDownloadLink() {
	let anchor = document.getElementById('download')
	anchor.classList.remove('show')
}

function displayMessage(msg) {
	document.getElementById('message').innerHTML = msg
}

export default {
	clear: emptyContainer,
	fill: fillContainer,
	append: append,
	loadStart: loadStart,
	loadEnd: loadEnd,
	showDownload: showDownloadLink,
	hideDownload: hideDownloadLink,
	message: displayMessage
}