import csv
import io

from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection
from fastapi import HTTPException

from digital_twin import battery_twin

app = FastAPI(title="Digital Twin API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Digital Twin API is running"
    }



@app.get("/api/telemetry")
def get_telemetry():
    reading = battery_twin.update()

    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO telemetry
                (temperature, voltage, current, charge, status)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                reading["temperature"],
                reading["voltage"],
                reading["current"],
                reading["charge"],
                reading["status"],
            ))

        connection.close()

    except Exception as error:
        print(f"Database save error: {error}")

    return reading


@app.get("/api/health")
def health_check():
    return {"status": "online"}


@app.get("/api/telemetry/history")
def get_telemetry_history():
    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, temperature, voltage, current,
                       charge, status, recorded_at
                FROM telemetry
                ORDER BY id DESC
                LIMIT 100
            """)
            rows = cursor.fetchall()

        connection.close()
        return rows

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(error)}",
        )


@app.get("/api/telemetry/export")
def export_telemetry():
    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, temperature, voltage, current,
                       charge, status, recorded_at
                FROM telemetry
                ORDER BY id DESC
            """)
            rows = cursor.fetchall()

        connection.close()

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "ID",
            "Temperature",
            "Voltage",
            "Current",
            "Charge",
            "Status",
            "Recorded At",
        ])

        for row in rows:
            writer.writerow([
                row["id"],
                row["temperature"],
                row["voltage"],
                row["current"],
                row["charge"],
                row["status"],
                row["recorded_at"],
            ])

        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition":
                    "attachment; filename=telemetry_history.csv"
            },
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"CSV export failed: {error}",
        )
