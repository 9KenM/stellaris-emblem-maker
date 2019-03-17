import Drop from './drop.js'

document.addEventListener('DOMContentLoaded', e => {
	Drop.init()
	Drop.onDrop(files => {
		console.log(files.length + ' files have been dropped')
	})
})