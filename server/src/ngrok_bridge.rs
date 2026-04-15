use anyhow::Result;
use serde_json::Value;
use std::io::{BufRead, Write};
use std::path::Path;
use std::process::{Command, Stdio};

pub async fn start_bridge(root: &Path, port: u16) -> Result<()> {
    let root = root.to_path_buf();

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await?;
    eprintln!("HTTP bridge listening on port {port}");
    eprintln!("  POST /mcp   — JSON-RPC request");
    eprintln!("  GET  /health — health check");
    eprintln!("  GET  /tools  — list tools");

    loop {
        let (stream, _addr) = listener.accept().await?;
        let root = root.clone();
        tokio::spawn(async move {
            if let Err(e) = handle_connection(stream, &root).await {
                eprintln!("connection error: {e}");
            }
        });
    }
}

async fn handle_connection(stream: tokio::net::TcpStream, root: &Path) -> Result<()> {
    stream.readable().await?;
    let mut buf = vec![0u8; 65536];
    let n = stream.try_read(&mut buf)?;
    let request = String::from_utf8_lossy(&buf[..n]).to_string();

    let (method, path, body) = parse_http(&request);
    let (status, response_body) = match (method.as_str(), path.as_str()) {
        ("GET", "/health") => ("200 OK".to_string(), r#"{"status":"ok"}"#.to_string()),
        ("GET", "/tools") => {
            let tools = call_mcp_subprocess(
                root,
                &serde_json::json!({"jsonrpc":"2.0","method":"tools/list","id":1}),
            )?;
            ("200 OK".to_string(), tools)
        }
        ("POST", "/mcp") => {
            let result = call_mcp_subprocess(root, &serde_json::from_str(&body)?)?;
            ("200 OK".to_string(), result)
        }
        _ => (
            "404 Not Found".to_string(),
            r#"{"error":"not found"}"#.to_string(),
        ),
    };

    let http_response = format!(
        "HTTP/1.1 {status}\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{response_body}",
        response_body.len()
    );

    stream.writable().await?;
    stream.try_write(http_response.as_bytes())?;
    Ok(())
}

fn parse_http(raw: &str) -> (String, String, String) {
    let lines: Vec<&str> = raw.lines().collect();
    let first = lines.first().unwrap_or(&"");
    let parts: Vec<&str> = first.split_whitespace().collect();
    let method = parts.first().unwrap_or(&"GET").to_string();
    let path = parts.get(1).unwrap_or(&"/").to_string();
    let body_start = raw.find("\r\n\r\n").map(|i| i + 4).unwrap_or(raw.len());
    let body = raw[body_start..].to_string();
    (method, path, body)
}

fn call_mcp_subprocess(root: &Path, request: &Value) -> Result<String> {
    let exe = std::env::current_exe()?;
    let mut child = Command::new(&exe)
        .arg("mcp")
        .env("NLR_ROOT", root.as_os_str())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()?;

    let stdin = child.stdin.as_mut().unwrap();
    writeln!(stdin, "{}", serde_json::to_string(request)?)?;
    stdin.flush()?;
    drop(child.stdin.take());

    let stdout = child.stdout.take().unwrap();
    let reader = std::io::BufReader::new(stdout);
    let mut response = String::new();
    for line in reader.lines() {
        let line = line?;
        if !line.trim().is_empty() {
            response = line;
            break;
        }
    }

    let _ = child.kill();
    Ok(response)
}
