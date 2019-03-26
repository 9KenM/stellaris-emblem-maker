
function zipGroup(group, zip) {
	group.forEach(file => zipFile(file, zip))
}

function zipFile(file, zip) {
	let nameArr = file.name.split('.')
	let extension = nameArr.pop()
	nameArr = nameArr.join('.').split('_')
	let type = nameArr.pop()
	type = type === 'default' ? '' : type + '/'
	let name = nameArr.join('_')
	zip.file(type + name + '.' + extension, file.blob)
}

function zipUp(files) {
	let zip = new JSZip()
	files.forEach(group => zipGroup(group, zip))
	return zip
}

export default {
	zip: zipUp
}