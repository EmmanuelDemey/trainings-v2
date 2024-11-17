---
layout: cover
---

# 22 - Docker & Kubernetes

---

# Docker

## Gestion des variables d'environnement

Afin de pouvoir les surcharger facilement, une fois l'application buildée, via Docker, installez et configurez le plugin [`vite-envs`](https://github.com/garronej/vite-envs).

Un starter est disponible : [`vite-envs-starter)`](https://github.com/garronej/vite-envs-starter)

---

# Création d'un Dockerfile

```docker
# build environment
FROM node:20-alpine as build
WORKDIR /app
COPY package.json yarn.lock .env ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf    
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
ENTRYPOINT sh -c "./vite-envs.sh && nginx -g 'daemon off;'"
```

---

# Pipeline GHA pour publier son image Docker

```yml {*}{maxHeight:'400px'}
name: Build and Deploy to Docker Hub

on:
  push:
    tags:
      - '*' # seulement lorsqu'un tag est poussé

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    # Vérifier le code du dépôt
    - name: Checkout repository
      uses: actions/checkout@v4

    # Se connecter à Docker Hub
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    # Construire l'image Docker
    - name: Build Docker image
      run: |
        TAG_NAME=${GITHUB_REF#refs/tags/}  # Extraire le nom du tag (ex. "v1.0.0")
        echo "Building image with tag: $TAG_NAME"
        docker build -t myusername/my-react-app:$TAG_NAME .  # Image avec tag spécifique

    # Pousser l'image avec le tag spécifique
    - name: Push Docker image with tag
      run: |
        TAG_NAME=${GITHUB_REF#refs/tags/}
        echo "Pushing image with tag: $TAG_NAME"
        docker push myusername/my-react-app:$TAG_NAME

    # Pousser l'image avec le tag "latest"
    - name: Push Docker image with latest tag
      run: |
        echo "Pushing image with tag: latest"
        docker tag myusername/my-react-app:$TAG_NAME myusername/my-react-app:latest
        docker push myusername/my-react-app:latest
```

---

# Kubernetes - Deployment

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-vite-app
  labels:
    app: react-vite-app
spec:
  replicas: 1  # Nombre de réplicas
  selector:
    matchLabels:
      app: react-vite-app
  template:
    metadata:
      labels:
        app: react-vite-app
    spec:
      containers:
      - name: react-vite-app
        image: myusername/my-react-app:1.0.0  # Remplacez par votre image Docker
        ports:
        - containerPort: 80  # Port exposé dans le container
```

---

# Kubernetes - Service

```yml
apiVersion: v1
kind: Service
metadata:
  name: react-vite-app-service
spec:
  selector:
    app: react-vite-app
  ports:
    - protocol: TCP
      port: 80        # Port exposé par le Service
      targetPort: 80   # Port du container
  type: ClusterIP  # Accessible uniquement à l'intérieur du cluster
```

---

# Kubernetes - Ingress

```yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: react-vite-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: react-vite-app.example.com  # Remplacez par votre domaine ou adresse IP
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: react-vite-app-service
            port:
              number: 80
```

---
layout: cover
---

# Travaux Pratiques

## PW 22