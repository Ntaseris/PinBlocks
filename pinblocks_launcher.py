import threading
import time
import webbrowser
import socket
import json
import urllib.request
from pinblocks_app import ThreadingHTTPServer, Handler, HOST, PORT, APP_VERSION, shutdown_token

def server_info():
    try:
        with urllib.request.urlopen(f"http://{HOST}:{PORT}/api/app-info", timeout=.5) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception:
        return None

def wait_and_open():
    url=f"http://{HOST}:{PORT}"
    for _ in range(80):
        try:
            with socket.create_connection((HOST,PORT), timeout=.15):
                webbrowser.open(url)
                return
        except OSError:
            time.sleep(.1)

def quit_ui():
    """On macOS, keep a tiny native Quit control open while PinBlocks runs."""
    import platform, subprocess
    if platform.system() != "Darwin":
        return
    script = 'display dialog "PinBlocks is running in your browser." buttons {"Quit PinBlocks"} default button "Quit PinBlocks" with title "PinBlocks"'
    subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    try:
        req = urllib.request.Request(
            f"http://{HOST}:{PORT}/api/shutdown",
            data=json.dumps({"token": shutdown_token}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=1).read()
    except Exception:
        pass

def main():
    try:
        server=ThreadingHTTPServer((HOST,PORT),Handler)
    except OSError as exc:
        if getattr(exc,"errno",None) in (48,98,10048):
            info=server_info()
            if info and info.get("app")=="PinBlocks":
                running=info.get("version","unknown")
                if running==APP_VERSION:
                    webbrowser.open(f"http://{HOST}:{PORT}")
                    return
                raise RuntimeError(
                    f"PinBlocks {running} is already running. Quit that PinBlocks process before opening {APP_VERSION}."
                )
            raise RuntimeError("Port 8765 is already in use by another application.")
        raise
    threading.Thread(target=wait_and_open,daemon=True).start()
    threading.Thread(target=quit_ui,daemon=True).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__=="__main__":
    main()
