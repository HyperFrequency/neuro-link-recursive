---
title: Sphinx Documentation Build
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 143037eb5742fbc642edb130fa83ac8c973f88379c309fb841553cad009bf17f
---

## Overview Sphinx builds .rst/.md docs to HTML/PDF. Bugs: cross-references unresolved, autodoc cant import, theme not loaded, intersphinx broken.  ## Conceptual Model Config in `conf.py`. Sources in `docs/source/`. Build to `docs/build/html/`. `:ref:` for cross-ref; `:doc:` for whole pages; `~` shortens. Autodoc reads docstrings.  ## Details - `make html` is the standard build - `-W` treats warnings as errors - For broken xref: check spelling, ensure target exists, run with `-v` - Common fix: add module to `sys.path` in conf.py  ## Sources - [source:sphinx-docs] https://www.sphinx-doc.org 
