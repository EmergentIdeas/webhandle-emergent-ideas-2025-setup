import "tripartite"


function create(html) {
	let parent = document.createElement('div')
	parent.innerHTML = html
	return parent.firstElementChild
}
