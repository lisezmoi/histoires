build:
	mkdir -p client/dist
	./node_modules/.bin/browserify client/index.js > client/dist/app.js

test:
	./node_modules/.bin/mocha test/server/*.js --reporter list

.PHONY: build test
