from flask_mail import Mail

mail = Mail()

def configure_mail(app):
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'mindcare24365@gmail.com'
    app.config['MAIL_PASSWORD'] = 'nidr iimb deux ides'  # Use App Password, not your real Gmail password
    app.config['MAIL_DEFAULT_SENDER'] = 'mindcare24365@gmail.com'
    mail.init_app(app)
