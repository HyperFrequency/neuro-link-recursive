use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "nlr", version, about = "neuro-link-recursive: unified MCP server + CLI")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Start MCP server (stdio JSON-RPC)
    Mcp,
    /// Initialize directory structure
    Init,
    /// System health check
    Status,
    /// Crawl + ingest a source
    Ingest {
        /// URL or file path to ingest
        sources: Vec<String>,
        /// Run parallel async crawl
        #[arg(long)]
        parallel: bool,
    },
    /// Placeholder: prints instructions to use wiki-curate skill
    Curate {
        /// Topic to curate
        topic: String,
    },
    /// Keyword search across wiki
    Search {
        /// Search query
        query: String,
        /// Max results
        #[arg(long, default_value_t = 10)]
        limit: usize,
    },
    /// Embed wiki into Qdrant
    Embed {
        /// Recreate collection before embedding
        #[arg(long)]
        recreate: bool,
    },
    /// Run grading pipeline
    Grade {
        /// Grade session logs
        #[arg(long)]
        session: bool,
        /// Grade wiki quality
        #[arg(long)]
        wiki: bool,
    },
    /// Health check daemon
    Heartbeat {
        /// Check interval in seconds
        #[arg(long, default_value_t = 60)]
        interval: u64,
    },
    /// Brain scan (staleness, gaps, tasks)
    Scan,
    /// Task queue operations
    Tasks {
        #[command(subcommand)]
        action: Option<TaskAction>,
    },
    /// Read a config file
    Config {
        /// Config file name (without extension)
        name: Option<String>,
    },
    /// Start HTTP bridge wrapping MCP
    Ngrok {
        /// Port to listen on
        #[arg(long, default_value_t = 8080)]
        port: u16,
    },
    /// Neo4j temporal graph operations
    Graph {
        #[command(subcommand)]
        action: GraphAction,
    },
    /// State machine workflow operations
    Workflow {
        #[command(subcommand)]
        action: WorkflowAction,
    },
}

#[derive(Subcommand)]
pub enum TaskAction {
    /// List tasks
    List {
        /// Filter by status
        #[arg(long, default_value = "all")]
        status: String,
    },
    /// Create a new task
    Create {
        /// Task title
        title: String,
        /// Task type (ingest, curate, scan, repair, report, ontology)
        #[arg(long, name = "type")]
        task_type: String,
        /// Priority 1-5
        #[arg(long, default_value_t = 3)]
        priority: u64,
    },
}

#[derive(Subcommand)]
pub enum GraphAction {
    /// Add a temporal fact triple
    AddFact {
        subject: String,
        predicate: String,
        object: String,
    },
    /// Query facts by topic
    Query {
        topic: String,
    },
}

#[derive(Subcommand)]
pub enum WorkflowAction {
    /// Create a new workflow
    Create {
        name: String,
    },
    /// Transition workflow to a new state
    Transition {
        id: String,
        state: String,
    },
    /// List all workflows
    List,
}
