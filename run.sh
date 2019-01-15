#! /bin/sh

npx webpack
if [ $1 = "production" ]
then
	export NODE_ENV=production
	sudo -E node src/server/index.js # &> .server.log
else
	unset NODE_ENV
	node src/server/index.js 	# &> .server-dev.log
fi

