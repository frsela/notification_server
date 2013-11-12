GIT  ?= git
NODE ?= node
CLOC ?= cloc
LINTER ?= gjslint

.PHONY = all

all: version.info tests

version.info:
	@$(GIT) describe --tags > src/version.info
	@cat src/version.info

tests:
	@npm test

cloc:
	@echo "Counting lines of code ..."
	@echo "Sources:"
	@$(CLOC) src/
	@echo "Tests:"
	@$(CLOC) --exclude-dir=test/jmeter test/

linter:
	@echo "Passing linter for coding style guidelines adoption"
	@$(LINTER) --disable 210,217,220,225 -r src/
	@$(LINTER) --disable 210,217,220,225 -r test/

