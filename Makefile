install:
	npm install
	
pub:
	scp -r favicon.ico iframes.html index.css index.html index.js node_modules pyweb@pyweb.jutge.org:www/
	
	