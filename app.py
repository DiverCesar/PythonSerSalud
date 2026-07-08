import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__, static_folder="frontend/static", static_url_path="/static")
CORS(app)

from api_get_service.routes import get_bp
from api_post_service.routes import post_bp
from api_put_service.routes import put_bp
from api_delete_service.routes import delete_bp
from frontend.routes import frontend_bp

app.register_blueprint(get_bp)
app.register_blueprint(post_bp)
app.register_blueprint(put_bp)
app.register_blueprint(delete_bp)
app.register_blueprint(frontend_bp)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
