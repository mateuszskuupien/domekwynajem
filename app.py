from flask import Flask, render_template, request, jsonify
from flask_mail import Mail, Message
import requests
import threading

app = Flask(__name__)

API_KEY = '014b383a5fba8b9610caa4d474ca181ad7bfc7e7'
API_URL = 'https://api.hunter.io/v2/email-verifier'

@app.route('/verify_recaptcha', methods=['POST'])
def verify_recaptcha():
    # Pobieramy odpowiedź z reCAPTCHA
    recaptcha_response = request.form.get('g-recaptcha-response')
    
    # Wysyłamy zapytanie do Google API, aby zweryfikować odpowiedź
    data = {
        'secret': '6LfY6hQrAAAAAFGU6NW-NAZ5BYj2DJSfnYJ1-Ome',
        'response': recaptcha_response
    }
    verify_url = "https://www.google.com/recaptcha/api/siteverify"
    response = requests.post(verify_url, data=data)
    result = response.json()

    if result.get("success"):
        return jsonify({"status": "success", "message": "CAPTCHA passed!"}), 200
    else:
        return jsonify({"status": "error", "message": "CAPTCHA failed!"}), 400


@app.route('/verify_email', methods=['POST'])
def verify_email():
    email = request.json.get('email')

    if not email:
        return jsonify({'valid': False, 'message': 'Email jest wymagany'}), 400

    # Parametry do zapytania API
    params = {
        'email': email,
        'api_key': API_KEY
    }

    # Wysłanie zapytania do API Hunter.io
    response = requests.get(API_URL, params=params)

    if response.status_code == 200:
        data = response.json()

        # Jeśli wynik jest "deliverable", e-mail jest poprawny
        if data['data']['result'] == 'deliverable':
            return jsonify({'valid': True, 'message': 'E-mail jest poprawny i istnieje'})

        # Inne przypadki, gdy e-mail jest niepoprawny
        return jsonify({'valid': False, 'message': 'E-mail jest niepoprawny lub nie istnieje'})

    return jsonify({'valid': False, 'message': 'Coś poszło nie tak z API'}), 500


# Konfiguracja poczty
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'mateurzskupien@gmail.com'  # Twój e-mail
app.config['MAIL_PASSWORD'] = 'xbamyanbeilvlcli'          # Hasło aplikacji

mail = Mail(app)

# Funkcja do wysyłania maila w tle
def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        message = request.form.get("message")

        msg = Message(
            subject=f"Nowa wiadomość od {name}",
            sender=app.config['MAIL_USERNAME'],
            recipients=["mateurz1337@gmail.com"],
            body=f"""
            Imię i nazwisko: {name}
            Email: {email}

            Wiadomość:
            {message}
            """
        )
        thread = threading.Thread(target=send_async_email, args=(app, msg))
        thread.start()
        return "", 204  # Nic nie renderujemy, tylko status "OK"

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)