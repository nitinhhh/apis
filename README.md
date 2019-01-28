## Node APIs Readme
## Create new Order, listing orders and update existing orders.

## Software Uses while creating these Node APIs:
- [Docker](https://www.docker.com/) as the container service to isolate the environment.
- [Node.js](https://nodejs.org/en/) (v8.12.0) server that supports the APIs.
- [MongoDB](https://www.mongodb.com/) (v3.4.18) the database layer.

## How to Run
1. Clone/Download the project
2. Update Google API key in config/constants.js, key: `googleMapsKey`
3. Execute the *start.sh* bash file via `./start.sh`.
    1. Start the docker environment. This will:
        * Build the Node.js image
        * Download the mongo image
        * Start the Node.js server
    2. After docker-compose has built and started the project, automated test cases will start running.

## Google Maps Distance Matric API configuration
- Set the API key in config/constants.js, key: `googleMapsKey`

## Starting project manually, using docker
1. Clone/Download the project
1. Run `docker-compose up` from terminal
2. Web APIs will be accessible at `http://localhost:8080`

## Run automated tests from terminal
- After starting the project with `docker-compose up`, run: 
    1. Interation tests: `docker exec -it transport_apis_server_1 npm test test/integrationTest.js`
    2. Unit tests: `docker exec -it transport_apis_server_1 npm test test/unitTest.js`

## API Reference Documentation

- **GET** `/orders?page=:page&limit=:limit`: Fetch paginated orders

    - Response :
	```
	    [
            {
                "distance": 1199398,
                "status": "TAKEN",
                "id": "5bebba7c1c2c2d001c3e92f3"
            },
            {
                "distance": 2000,
                "status": "UNASSIGNED",
                "id": "5bebba7c1c2c2d001c3e92f1"
            },
        ]
	```
- **POST** `/orders`: Create a new order

	- Request:
	```
    {
        "origin" :["28.704060", "77.102493"],
        "destination" :["28.535517", "77.391029"]
    }
	```

    - Response:
	```
    {
        "id": "5bebcf381c2c2d001c3e92f4",
        "distance": 1071,
        "status": "UNASSIGNED"
    }
	```

- **PATCH** `/orders/:id`: Update the status of a particular order using it's id

	- Request:
	```
    {
        "status" : "TAKEN"
    }
	```

    - Responsw:
	```
    {
        "status": "SUCCESS"
    }
	```

## Folder Structure

**/config**

- Includes the project specific constants and configurations.

**/lib**

- **`googleApi.js`** has functionality for google calculate distance api.
- **`responseHandlers.js`** contains various response functions aiding in sending API responses.

**/orders**

- Separate orders folder to maintain modularity of code.
- **`controllers`** contains order related controllers to control basic flow of order related functionalities
- **`models`** has the model definition of orders.
- **`app.js`** is what builds and configures the express app
- **`validations`** includes the JSONschema based validation JSONs to be used in creating, patching and listing orders.

**/routes**
- Contains the project specific routes

**/test**
- Has the automated integration and unit test cases, which can be run to verify the project.

**/app.js**
- The initiator file, that starts the server and initiated all configurations.