setup:
	which yarn || (brew update && brew install yarn)

run:
	yarn install
	yarn start

bundle:
	yarn run bundle