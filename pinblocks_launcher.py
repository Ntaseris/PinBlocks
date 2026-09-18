import threading
import time
import webbrowser
import socket
import sys
from pinblocks_app import ThreadingHTTPServer, Handler, HOST, PORT

def wait_and_open():
    url=f"http://{HOST}:{PORT}"
    for _ in range(80):
        try:
            with socket.create_connection((HOST,PORT), timeout=.15):
                webbrowser.open(url)
                return
        except OSError:
            time.sleep(.1)

def main():
    try:
        server=ThreadingHTTPServer((HOST,PORT),Handler)
    except OSError as exc:
        # If PinBlocks is already running, just open it.
        if getattr(exc,"errno",None) in (48,98,10048):
            webbrowser.open(f"http://{HOST}:{PORT}")
            return
        raise
    threading.Thread(target=wait_and_open,daemon=True).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__=="__main__":
    main()
