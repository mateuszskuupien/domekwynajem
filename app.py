from flask import Flask, render_template, request

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        message = request.form.get("message")
        print(f"Nowa wiadomość: {name}, {email}, {message}")
        return "Wiadomość wysłana!"  # Możesz zmienić na przekierowanie lub alert

    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
