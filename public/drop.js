
let dropListeners = []

function initDropzone() {
	const dz = document.getElementById('dropzone')

	getInput(dz).addEventListener('change', e => handleChange(e))
	dz.addEventListener('drop', e => handleDrop(e))
	dz.addEventListener('dragover', e => handleDragover(e))
	dz.addEventListener('dragleave', e => handleDragleave(e))
}

function getInput(dz) {
	return dz.querySelector('input[type="file"]')
}

function preventDefault(e) {
	e.preventDefault()
	e.stopPropagation()
}

function handleSelect(e) {
	processFiles(getDataTransfer(e))
	preventDefault(e)
}

function handleChange(e) {
	handleSelect(e)
	e.target.value = null
}

function handleDrop(e) {
	const dz = e.target
	const fileInput = getInput(dz)
	const fileList = getDataTransfer(e)

	if(fileList.length > 0) {
		handleSelect(e)
	} else {
		processFiles(fileList)
	}

	handleDragleave(e)
}

function handleDragover(e) {
	e.target.classList.add('is_dragged-over')
	preventDefault(e)
}

function handleDragleave(e) {
	e.target.classList.remove('is_dragged-over')
	preventDefault(e)
}

function getDataTransfer(e) {
	let items = []
	if (e.dataTransfer) {
		const data = e.dataTransfer
		if (data.files && data.files.length) {
			items = data.files
		} else if (data.items && e.target.files) {
			items = data.items
		}
	} else if (e.target && e.target.files) {
		items = e.target.files
	}
	return items
}

function processFiles(files) {
	dropListeners.forEach(fn => fn(files))
}

function addDropListener(fn) {
	dropListeners.push(fn)
}

function removeDropListener(fn) {
	dropListeners.splice(dropListeners.indexOf(fn), 1)
}

export default {
	init: initDropzone,
	onDrop: addDropListener,
	removeOnDrop: removeDropListener
}