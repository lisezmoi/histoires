build:
	mkdir -p client/dist
	./node_modules/.bin/browserify client/index.js > client/dist/app.js

TEST_SOURCES = $(wildcard test/*.js) $(wildcard test/*/*.js)
test:
	./node_modules/.bin/mocha $(TEST_SOURCES) --reporter list

.PHONY: build test
