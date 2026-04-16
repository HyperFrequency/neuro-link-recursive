use axum::{
    extract::Request,
    http::{header::AUTHORIZATION, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

/// Bearer token auth middleware. Fails CLOSED: if no token is configured
/// and insecure mode is not enabled, all requests are rejected.
pub async fn bearer_auth(
    request: Request,
    next: Next,
) -> Result<Response, Response> {
    let insecure = std::env::var("NLR_INSECURE_NO_AUTH").is_ok();

    let expected = match std::env::var("NLR_API_TOKEN") {
        Ok(t) if !t.is_empty() => t,
        _ if insecure => return Ok(next.run(request).await),
        _ => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "server_misconfigured",
                    "message": "No API token configured. Start with --token <value> or --insecure-no-auth for local dev.",
                    "status": 500
                })),
            ).into_response());
        }
    };

    let auth_header = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok());

    match auth_header {
        Some(h) if h.starts_with("Bearer ") && h[7..] == expected => {
            Ok(next.run(request).await)
        }
        _ => Err(StatusCode::UNAUTHORIZED.into_response()),
    }
}
