from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route("/health")
def health():
    return {"status": "ok"}

# In-memory storage: a list of task dicts
tasks = []
next_id = 1

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    return jsonify(tasks)

@app.route("/api/tasks", methods=["POST"])
def create_task():
    global next_id
    data = request.get_json()
    task = {
        "id": next_id,
        "title": data.get("title", ""),
        "done": False
    }
    tasks.append(task)
    next_id += 1
    return jsonify(task), 201

@app.route("/api/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    data = request.get_json()
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = data.get("done", task["done"])
            return jsonify(task)
    return {"error": "not found"}, 404

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    global tasks
    tasks = [t for t in tasks if t["id"] != task_id]
    return {"result": "deleted"}, 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)