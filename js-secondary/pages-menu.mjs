
let openers = document.querySelectorAll('.webhandle-menu-loader-tribar, .mobile-menu .close')
for (let opener of openers) {
	opener.addEventListener('click', (evt) => {
		evt.preventDefault()
		document.body.classList.toggle('menu-open')
	})
}
