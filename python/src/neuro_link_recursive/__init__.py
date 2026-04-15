"""neuro-link-recursive: Python helpers for the unified RAG + LLM-Wiki control plane."""

__version__ = "0.1.0"


def main():
    from .cli import main as cli_main
    cli_main()
