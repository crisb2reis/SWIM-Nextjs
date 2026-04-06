import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to: {DATABASE_URL}")

# Parse DATABASE_URL
# postgresql://swim_user:swim_password@localhost:5434/swim_db
db_parts = DATABASE_URL.replace("postgresql://", "").split("@")
user_pass = db_parts[0].split(":")
host_port_db = db_parts[1].split("/")
host_port = host_port_db[0].split(":")
db_name = host_port_db[1]

try:
    conn = psycopg2.connect(
        dbname=db_name,
        user=user_pass[0],
        password=user_pass[1],
        host=host_port[0],
        port=host_port[1]
    )
    conn.autocommit = True
    cur = conn.cursor()

    new_values = [
        "RESOURCE_CREATE", "RESOURCE_UPDATE", "RESOURCE_DELETE",
        "AUTH_SIGNUP", "AUTH_LOGIN", "AUTH_LOGOUT",
        "AUTH_PASSWORD_CHANGE", "AUTH_PASSWORD_RESET",
        "AUTH_TOKEN_REFRESH", "AUTH_PERMISSION_DENIED"
    ]

    for val in new_values:
        try:
            print(f"Adding {val} to eventtype...")
            cur.execute(f"ALTER TYPE eventtype ADD VALUE '{val}';")
        except psycopg2.errors.DuplicateObject:
            print(f"{val} already exists.")
        except Exception as e:
            print(f"Error adding {val}: {e}")

    cur.close()
    conn.close()
    print("Done.")
except Exception as e:
    print(f"Connection failed: {e}")
