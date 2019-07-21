all: dev

.env:
	cp .env.example .env

include .env
export

deploy:
	docker-compose up -d --exit-code-from api --build api

dev:
	docker-compose up -d mongo
	source .env && npm run dev

publish: tag = expelledboy/txjs:$(shell node -p "require('./package.json').version")
publish:
	docker-compose build release
	docker tag expelledboy/txjs $(tag)
	docker push $(tag)
