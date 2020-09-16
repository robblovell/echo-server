# Echo Server

A minimal implementation of a server that goes "ping"!

This code is used to demonstrate how a dockerized application that runs in kubernetes can be installed in the clouds with CodeZero.

# A Simple Cloud Application
## Node

Build, test and run

```
npm install
npm test
npm start
```
Note, you can go straight to `npm start` if you don't want to run the tests.

Navigate to: [localhost:8080](http://localhost:8080)

It should respond:
```
Running On: unknown | Total Requests: 2 | App Uptime: 23.035 seconds | Log Time: Wed Sep 09 2020 18:54:34 GMT-0700 (Pacific Daylight Time)unknown | v=1
```

## Docker

Build:
```
> docker build --tag ping-server:1.0 .
...
Successfully built 6554bb4fff02
Successfully tagged ping-server:1.0
```
Run:
```
> docker run --publish 8000:8080 --detach --name ping-server ping-server:1.0
831fec9bf7c295bc3a85dbedb0af3b9b003e3ccb93b71c6889f7f66650ac8938
> docker ps
831fec9bf7c2 ping-server:1.0 "docker-entrypoint.s…"  3 seconds ago  Up 2 seconds 0.0.0.0:8000->8080/tcp ping-server
```
Navigate to [localhost:8000](http://localhost:8000) and the request will go to the running docker 
container which will forward requests to the running application inside `from port 8000` `to port 8080`.

It should respond:
```
Running On: 73825806f530 | Total Requests: 3 | App Uptime: 10688.865 seconds | Log Time: Thu Sep 10 2020 01:56:07 GMT+0000 (Coordinated Universal Time)73825806f530 | v=1
```

#### Other useful docker commands:

```
# Look at the images that have been created:
> docker images
# Look at running images:
> docker ps
# Stop a running image: (uses the id given in docker ps)
> docker stop [container name]
# Kill a running image: (uses the id given in docker ps)
> docker kill [running container id]
# Stale or dormant docker images sometimes old onto resources:
> docker system prune --all
# Look at what's in the working directory of your container.
> docker exec -t ping-server /bin/sh -c ls
# Check to make sure you haven't copied in development depenedencies!.
> docker exec -t ping-server /bin/sh -c 'ls node_modules'
```
### Publishing
```
> docker login --username=robblovell 
Password: 
Login Succeeded
> docker images
REPOSITORY                    TAG                 IMAGE ID            CREATED             SIZE
ping-server                   1.0                 cdf50f420cca        44 hours ago        83.5MB
gcr.io/k8s-minikube/kicbase   v0.0.12-snapshot3   25ac91b9c8d7        2 weeks ago         952MB
node                          12-alpine           18f4bc975732        6 weeks ago         89.3MB
node                          10-alpine           8e473595b853        7 weeks ago         83.5MB
> docker tag cdf50f420cca robblovell/ping-server:1.0
> docker push robblovell/ping-server:1.0
The push refers to repository [docker.io/robblovell/ping-server]
0b7d8056c708: Pushed 
cb98af462e9c: Pushed 
3780f321c373: Mounted from library/node 
789d258c5696: Mounted from library/node 
9c733f70df77: Mounted from library/node 
3e207b409db3: Mounted from library/node 
1.0: digest: sha256:c4372a0e041132ae5447c77b1e9a466d1aab6c77b57b318d2d9419f9e278f2ef size: 1572
```
### Troubleshooting

you might get this error running your docker container:

```
docker: Error response from daemon: Conflict. The container name "/ping-server" is already in use by container "ed2426367ca5957fc8869614a4f66b92d33d0e513696d25b264846cd54c439af". You have to remove (or rename) that container to be able to reuse that name.
See 'docker run --help'.
```
A sledge hammer approach is to use `docker system prune`, but a better way is to find the container and remove it:

Using the container referenced in the error message:
```
> docker rm ed2426367ca5957fc8869614a4f66b92d33d0e513696d25b264846cd54c439af
ed2426367ca5957fc8869614a4f66b92d33d0e513696d25b264846cd54c439af
# now docker run works: 
> docker run --publish 8000:8080 --detach --name ping-server ping-server:1.0
73825806f5302ee5d28827775b20a26f5869b84c76539f0091e7aa3b93766f79
> 
```

## Kubernetes

It's useful to use the command below to watch what kubernetes is doing:
```
watch -n 2 kubectl get no,po,deploy,svc,jobs,secret,rs
```

If you don't have `watch`:
```
brew install watch
```

This example will run the ping-server inside of a miniKube kubernetes cluster for local validation:

see: [Running a docker container on minikube](https://medium.com/bb-tutorials-and-thoughts/how-to-use-own-local-doker-images-with-minikube-2c1ed0b0968)

### Minikube install

you can install minikube with homebrew:
```
brew install minikube
```

Start and stop minikube this way:
```
minikube start
minikube stop
```
To use miniKube, you need to use its own docker daemon, not your operating system's docker daemon.

To gain access to a running miniKube docker command in the current shell, type:
```
> eval $(minikube docker-env)
```
This will set up four environment variables that will disconnect the current shell from your system's docker daemon:
```
export DOCKER_TLS_VERIFY="1"
export DOCKER_HOST="tcp://127.0.0.1:32770"
export DOCKER_CERT_PATH="/Users/[your home]/.minikube/certs"
export MINIKUBE_ACTIVE_DOCKERD="minikube"
```

### Kubernetes

Now you can use the kubernetes *deployment* configuration in the kubernetes directory to 
create a local running instance. Note that the kubectl command will apply all kubernetes configurations
in this directory.:

```
kubectl create -f k8s
kubectl get pods
kubectl get deployments
kubectl get services
```

Make sure the pods are running. You can't navigate to the server yet, you need to do some 
forwarding incantations first.

To update the service and deployment with changes to the kubernetes.yaml file:
```
> kubectl apply -f k8s
```
To delete the service and deployment:
```
> kubectl apply -f k8s
```
If you have only one replica, a useful environment variable you can set is:
```
> export POD_NAME=$(kubectl get pods -l name=ping-server -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
```

The k8s directory creates a service that has a "NodePort" that you can use to talk to the
deployment. You could create this manually with a `kubectl expose` command like so: 
`kubectl expose deployment/ping-server --type="NodePort" --port 8080` but something similar has
been created for you by the k8s/service.yaml. 
(Note use `kubectl port-forward service/ping-server 8888:8080` with this as 8080 
is proxied from 8880 by service.yaml) 
Since the service is already created in the file for you, you shouldn't have to do this.

Now to gain access to the cluster, you need to start a port forwarder
to proxy requests to the created service, much like in the docker instance described above:

Use `kubectl port-forward` to do this:

```
> kubectl port-forward service/ping-server 8888:8880
Forwarding from 127.0.0.1:8888 -> 8080
Forwarding from [::1]:8888 -> 8080
```
Now navigate to:[localhost:8888/](http://localhost:8888/)
```
Running On: ping-server-778d4dcd75-cl492 | Total Requests: 1 | App Uptime: 1180.664 seconds | Log Time: Thu Sep 10 2020 02:23:32 GMT+0000 (Coordinated Universal Time)ping-server-778d4dcd75-cl492 | v=1
```

In a different shell, or put the forwarding command in the background:
```
> curl $(minikube ip):8888
Running On: ping-server-778d4dcd75-cl492 | Total Requests: 8 | App Uptime: 2145.541 seconds | Log Time: Thu Sep 10 2020 02:39:36 GMT+0000 (Coordinated Universal Time)ping-server-778d4dcd75-cl492 | v=1
```
#### Useful commands:
```
# add a -l [some label] to restrict output to the labeled resource. remember, labels are key-value pairs so
# you need to give bothe label and the value from your kubernetes file.
kubectl get services -l area=learning
kubectl get services -l app=ping-server
kubectl get rs
```

