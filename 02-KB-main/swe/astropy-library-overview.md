---
title: Astropy Library Overview
domain: scientific-computing
confidence: high
last_updated: 2026-04-17
sha256: 312f8eae70a4a6f502337f81917142997f7fcc5372d4102300d4786863ba7bd8
---

## Overview Astropy is the core Python package for astronomy. Submodules: `astropy.units` (unit conversion), `astropy.coordinates` (sky/time coords), `astropy.io` (FITS/ASCII/VOTable), `astropy.modeling` (model fitting), `astropy.table` (Table class).  ## Conceptual Model Units are first-class: `from astropy import units as u; 5 * u.km`. Quantities track units through arithmetic. Most APIs accept Quantity inputs and return Quantities. Coordinates use SkyCoord with frames (ICRS, FK5, Galactic).  ## Details - Tests live in `astropy/<submod>/tests/` - Common fixtures: `tmp_path`, `monkeypatch`, `capsys` - Run subset: `pytest astropy/units/tests/test_quantity.py -xvs` - Many tests use parametrize across all unit types  ## Sources - [source:astropy-docs] https://docs.astropy.org 
