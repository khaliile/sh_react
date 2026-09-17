using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;

class Program {
    static HttpListener listener;
    static string distPath;

    static void Main() {
        try {
            distPath = @"C:\Users\khalil\Documents\sh_react_local\dist";
            int port = 5174;

            listener = new HttpListener();
            listener.Prefixes.Add("http://localhost:" + port + "/");
            try {
                listener.Start();
            } catch {
                // If port in use, try next
                port = 5175;
                listener = new HttpListener();
                listener.Prefixes.Add("http://localhost:" + port + "/");
                listener.Start();
            }

            Thread serverThread = new Thread(RunServer);
            serverThread.IsBackground = true;
            serverThread.Start();

            string userDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "StudyHubData");
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "msedge.exe";
            psi.Arguments = "--app=\"http://localhost:" + port + "/\" --user-data-dir=\"" + userDataDir + "\"";
            psi.UseShellExecute = true;

            Process proc = Process.Start(psi);
            if (proc != null) {
                proc.WaitForExit();
            }
        } catch (Exception ex) {
            System.Windows.Forms.MessageBox.Show("Error: " + ex.Message);
        }
    }

    static void RunServer() {
        while (listener != null && listener.IsListening) {
            try {
                HttpListenerContext ctx = listener.GetContext();
                HttpListenerRequest req = ctx.Request;
                HttpListenerResponse resp = ctx.Response;

                string urlPath = req.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(urlPath)) urlPath = "index.html";

                string filePath = Path.Combine(distPath, urlPath.Replace('/', Path.DirectorySeparatorChar));

                // SPA fallback for routing
                if (!File.Exists(filePath)) {
                    filePath = Path.Combine(distPath, "index.html");
                }

                if (File.Exists(filePath)) {
                    byte[] bytes = File.ReadAllBytes(filePath);
                    string ext = Path.GetExtension(filePath).ToLower();
                    switch (ext) {
                        case ".html": resp.ContentType = "text/html"; break;
                        case ".js": resp.ContentType = "text/javascript"; break;
                        case ".css": resp.ContentType = "text/css"; break;
                        case ".json": resp.ContentType = "application/json"; break;
                        case ".png": resp.ContentType = "image/png"; break;
                        case ".svg": resp.ContentType = "image/svg+xml"; break;
                        case ".ico": resp.ContentType = "image/x-icon"; break;
                        case ".webmanifest": resp.ContentType = "application/manifest+json"; break;
                    }
                    resp.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
                    resp.Headers.Add("Pragma", "no-cache");
                    resp.Headers.Add("Expires", "0");
                    resp.ContentLength64 = bytes.Length;
                    resp.OutputStream.Write(bytes, 0, bytes.Length);
                } else {
                    resp.StatusCode = 404;
                }
                resp.OutputStream.Close();
            } catch { }
        }
    }
}
