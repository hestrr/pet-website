from http.server import BaseHTTPRequestHandler, HTTPServer
import time
from urllib.parse import urlparse
import psycopg2
import json

hostName = "localhost"
serverPort = 8080

class Task:
    def __init__(self, id, name):
        self.id = id
        self.name = name

class MyServer(BaseHTTPRequestHandler):
    def send_500(self, text):
        self.send_response(500)
        self.send_header("Content-type", "text/html")
        self.send_header( "Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(bytes(text, "utf-8")) 

    def do_GET(self):
        query = urlparse(self.path).query

        if query == '': 
            self.send_500()            
            return

        query_components = dict(qc.split("=") for qc in query.split("&"))
        if not ("id" in query_components.keys() or "action" in query_components.keys()):
            self.send_error(500, "no id and/or action", "please check url")
            return
            
        id = query_components["id"]
        action = query_components["action"]
        
        if action == "read":
            self.read_data()
            return
        
        if action == "update":
            try: 
                name = query_components["value"]
                self.edit_task(id, name)
                self.read_data()
                self.send_response(200)
            except Exception as e:
                #print(e.__class__)
                self.send_500(e.pgerror)
            return

        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>https://pythonbasics.org</title></head>", "utf-8"))
        self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        self.wfile.write(bytes("<p>Action: %s</p>" % action, "utf-8"))
        self.wfile.write(bytes("<p>Id: %s</p>" % id, "utf-8"))
        self.wfile.write(bytes("<body>", "utf-8"))
        self.wfile.write(bytes("<p>This is an example web server.</p>", "utf-8"))
        self.wfile.write(bytes("</body></html>", "utf-8"))

    def read_data(self):
        conn = psycopg2.connect(dbname='task_list', user='postgres', 
                        password='11', host='localhost')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM task ORDER BY id')
        tasks = cursor.fetchall()
        task_list = []
        for task in tasks:
            task_list.append(Task(task[0], task[1]))
        
        print(task_list[0].id)

        json_string = json.dumps([ob.__dict__ for ob in task_list]) #!

        cursor.close()
        conn.close()
        self.send_response(200)
        self.send_header( "Access-Control-Allow-Origin", "*")
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(bytes(json_string, "utf-8"))
    
    def edit_task(self, id, name):
        conn = psycopg2.connect(dbname='task_list', user='postgres', 
                    password='11', host='localhost')
        cursor = conn.cursor()
        cursor.execute(f"UPDATE task SET name='{name}' WHERE id={id}")
        conn.commit()
        cursor.close()
        conn.close()
        

if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")