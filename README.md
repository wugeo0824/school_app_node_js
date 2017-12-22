### school_app_node_js

## Run in docker container
1. install Docker
2. start the docker daemon
3. start a continuous running docker container with required dependencies:
```bash
docker-compose up
```

## Run tests in docker
1. get the {DOCKER_CONTAINER_ID} and
```bash
docker exec -it {DOCKER_CONTAINER_ID} npm test
```
