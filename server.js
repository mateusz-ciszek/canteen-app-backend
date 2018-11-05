const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port);
console.log('Server is running...');
console.log('http://localhost:' + port);

module.exports = {
	app,
	close() {
		server.close();
	}
}