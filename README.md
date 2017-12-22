### SCHOOL APP in Node Js

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

## Assumptions
1. When registering the same teacher again, the new entry will override the old one.
2. Each registerd teach will have at least one student.
3. Find common students api endpoint only works with two input teacher emails.
4. Find common students api endpoint does not work when two input teacher emails are the same.
5. Find common students api endpoint does not work when any of the two emails are not registered.
6. Retrieve for notifications api endpoint will not return mentioned students that is not registered under any teacher.
7. Retrieve for notifications api endpoint will not return mentioned students if they are suspended.
