from flask import Flask, render_template, jsonify
from data_loader import load_labeled_actuals_and_predictions
from quaternion_utils import compute_rotated_vectors_from_df
from flask import send_file
import traceback
from flask import request

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def get_data():
    try:
        print("Loading data...")
        df = load_labeled_actuals_and_predictions()
        print(f"Loaded {len(df)} rows")
        print(f"Columns: {df.columns.tolist()}")
        print(f"Sample data:\n{df.head()}")
        
        result = compute_rotated_vectors_from_df(df)
        print(f"Computed vectors for {len(result['timestamps'])} timestamps")
        return jsonify(result)
    except Exception as e:
        print(f"Error in /data endpoint: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/export_csv")
def export_csv():
    try:
        export_type = request.args.get("type")  
        df = load_labeled_actuals_and_predictions()

        if export_type in {"actual", "predicted"}:
            df = df[df["Type"] == export_type]

        path = f"data/stitched_{export_type or 'all'}.csv"
        df.to_csv(path, index=False)
        return send_file(path, as_attachment=True)

    except Exception as e:
        print(f"Error in /export_csv: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
