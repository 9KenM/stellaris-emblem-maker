
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
	document.getElementById('dropzone').classList.add('loading')
}

function loadEnd() {
	document.getElementById('dropzone').classList.remove('loading')
}

export default {
	clear: emptyContainer,
	fill: fillContainer,
	append: append,
	loadStart: loadStart,
	loadEnd: loadEnd
}