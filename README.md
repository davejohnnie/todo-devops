# To-Do App — DevOps Pipeline Project

A simple To-Do application built with Flask, containerized with Docker, deployed to Kubernetes (Minikube), monitored with Prometheus, and automated with GitHub Actions CI/CD.

## Tech Stack

- **Backend:** Python 3 / Flask
- **Frontend:** HTML, JavaScript, Bootstrap 5
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Orchestration:** Kubernetes (Minikube)
- **Monitoring:** Prometheus (via `prometheus_client`)

## Features

- Create, list, complete, and delete tasks via a REST API
- `/health` endpoint for basic health checks
- `/metrics` endpoint exposing Prometheus metrics
- Runs with 3 replicas behind a Kubernetes Service for load-balanced, fault-tolerant access

## Project Structure
todo-devops/
├── app.py                     # Flask application (routes, API, metrics)
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container build definition
├── .dockerignore
├── templates/
│   └── index.html             # Frontend UI
├── static/
│   ├── app.js                 # Frontend logic (fetch calls to API)
│   └── style.css
├── k8s/
│   ├── deployment.yaml        # Kubernetes Deployment (3 replicas)
│   └── service.yaml           # Kubernetes Service (NodePort)
├── .github/
│   └── workflows/
│       └── ci.yml             # CI/CD pipeline
└── README.md

## Git Workflow

- `main` — production-ready code, triggers CI/CD on push
- `develop` — integration branch
- `feature-api` — backend API development
- `feature-ui` — frontend UI development

Feature branches were merged into `develop` via Pull Requests, then `develop` was merged into `main`.

## Running Locally

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

App runs at `http://127.0.0.1:5050`.

## Running with Docker

```bash
docker build -t davejohnnie/todo-app:latest .
docker run -p 5050:5050 davejohnnie/todo-app:latest
```

## CI/CD Pipeline

On every push to `main`, `.github/workflows/ci.yml`:
1. Checks out the code
2. Installs Python dependencies (build verification)
3. Logs in to Docker Hub
4. Builds the Docker image
5. Pushes the image to Docker Hub as `davejohnnie/todo-app:latest`

Docker Hub credentials are stored as encrypted GitHub Actions secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`).

## Deploying to Kubernetes (Minikube)

```bash
minikube start --driver=docker
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get pods
minikube service todo-app-service --url
```

This deploys 3 replicas of the app and exposes it via a NodePort Service.

## Monitoring with Prometheus

Prometheus was installed via Helm:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/prometheus
```

The app's pods are annotated for auto-discovery:

```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "5050"
  prometheus.io/path: "/metrics"
```

A custom metric, `todo_app_requests_total`, tracks task-creation requests, labeled by pod and endpoint.

To view metrics:

```bash
kubectl port-forward svc/prometheus-server 9090:80
```

Then open `http://localhost:9090` → **Status → Targets** to confirm all app pods are being scraped (`UP`), or run a query like:

sum(todo_app_requests_total) by (endpoint)

## Notes

- The app uses in-memory storage (no database) — data resets on pod restart, by design, to keep the project scope focused on the DevOps pipeline itself.
- Since each pod has its own in-memory metric state, Prometheus queries use `sum()` to aggregate counts across replicas.