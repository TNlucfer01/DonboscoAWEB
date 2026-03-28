const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Donbosco AMS API',
    description: 'API documentation for the Donbosco Attendance Management System Backend',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./server.js']; // The main entry file

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger documentation generated successfully.");
});
