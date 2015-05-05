
BABEL = ./node_modules/.bin/babel

install: 
	@ln -s $(PWD)/node_modules/angular $(PWD)/public/
	@ln -s $(PWD)/node_modules/bootstrap $(PWD)/public/
	@ln -s $(PWD)/node_modules/jquery $(PWD)/public/
	@ln -s $(PWD)/node_modules/socket.io $(PWD)/public/
	@ln -s $(PWD)/node_modules/zeroclipboard $(PWD)/public/

all: node

node: lib
	@mkdir -p ./node
	@for path in lib/*.js; do \
		file=`basename $$path`; \
		$(BABEL) "lib/$$file" > "node/$$file"; \
	done

clean:
	@rm -rf ./node/
