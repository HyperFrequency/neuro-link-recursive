---
title: Riemannian manifold
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Riemannian_manifold
confidence: medium
last_updated: 2026-04-17
word_count: 1079
---

# Riemannian manifold

## Overview

Smooth manifold with an inner product on each tangent space
Not to be confused with Riemann surface.
The dot product of two vectors tangent to the sphere sitting inside 3-dimensional Euclidean space contains information about the lengths and angle between the vectors. The dot products on every tangent plane, packaged together into one mathematical object, are a Riemannian metric.
In differential geometry, a Riemannian manifold (or Riemann space) is a geometric space on which many geometric notions such as distance, angles, length, volume, and curvature are defined. Euclidean space, the -sphere, hyperbolic space, and smooth surfaces in three-dimensional space, such as ellipsoids and paraboloids, are all examples of Riemannian manifolds. Riemannian manifolds take their name from German mathematician Bernhard Riemann, who first conceptualized them in 1854.

Formally, a Riemannian metric (or just a metric) on a smooth manifold is a smoothly varying choice of inner product for each tangent space of the manifold. A Riemannian manifold is a smooth manifold together with a Riemannian metric. The techniques of differential and integral calculus are used to pull geometric data out of the Riemannian metric. For example, integration leads to the Riemannian distance function, whereas differentiation is used to define curvature and parallel transport.

Any smooth surface in three-dimensional Euclidean space is a Riemannian manifold with a Riemannian metric coming from the way it sits inside the ambient space. The same is true for any submanifold of Euclidean space of any dimension. Although John Nash proved that every Riemannian manifold arises as a submanifold of Euclidean space, and although some Riemannian manifolds are naturally exhibited or defined in that way, the idea of a Riemannian manifold emphasizes the intrinsic point of view, which defines geometric notions directly on the abstract space itself without referencing an ambient space. In many instances, such as for hyperbolic space and projective space, Riemannian metrics are more naturally defined or constructed using the intrinsic point of view. Additionally, many metrics on Lie groups and homogeneous spaces are defined intrinsically by using group actions to transport an inner product on a single tangent space to the entire manifold, and many special metrics such as constant scalar curvature metrics and Kähler–Einstein metrics are constructed intrinsically using tools from partial differential equations.

## History

Riemannian manifolds were first conceptualized by their namesake, German mathematician Bernhard Riemann.
In 1827, Carl Friedrich Gauss discovered that the Gaussian curvature of a surface embedded in 3-dimensional space only depends on local measurements made within the surface (the first fundamental form). This result is known as the Theorema Egregium ("remarkable theorem" in Latin).

A map that preserves the local measurements of a surface is called a local isometry. A property of a surface is called an intrinsic property if it is preserved by local isometries and it is called an extrinsic property if it is not. In this language, the Theorema Egregium says that the Gaussian curvature is an intrinsic property of surfaces.

Riemannian manifolds and their curvature were first introduced non-rigorously by Bernhard Riemann in 1854. However, they would not be formalized until much later. In fact, the more primitive concept of a smooth manifold was first explicitly defined only in 1913 in a book by Hermann Weyl.

Élie Cartan introduced the Cartan connection, one of the first concepts of a connection. Levi-Civita defined the Levi-Civita connection, a special connection on a Riemannian manifold. 

Albert Einstein used the theory of pseudo-Riemannian manifolds (a generalization of Riemannian manifolds) to develop general relativity. Specifically, the Einstein field equations are constraints on the curvature of spacetime, which is a 4-dimensional pseudo-Riemannian manifold.

### Hopf–Rinow theorem

- Main article: Hopf–Rinow theorem
The punctured plane $^{2}\backslash \{(0,0)\}}$ is not geodesically complete because the maximal geodesic with initial conditions ,  does not have domain $}$.
The Riemannian manifold  with its Levi-Civita connection is geodesically complete if the domain of every maximal geodesic is . The plane $^{2}}$ is geodesically complete. On the other hand, the punctured plane $^{2}\smallsetminus \{(0,0)\}}$ with the restriction of the Riemannian metric from $^{2}}$ is not geodesically complete as the maximal geodesic with initial conditions ,  does not have domain $}$.

The Hopf–Rinow theorem characterizes geodesically complete manifolds.

Theorem: Let  be a connected Riemannian manifold. The following are equivalent:

- The metric space $)}$ is complete (every $}$-Cauchy sequence converges),

- All closed and bounded subsets of  are compact,

-  is geodesically complete.

### Definitions

Riemannian metrics are defined in a way similar to the finite-dimensional case. However, there is a distinction between two types of Riemannian metrics:

- A weak Riemannian metric on  is a smooth function $,}$ such that for any  the restriction $:T_{x}M\times T_{x}M\to \mathbb {R} }$ is an inner product on $M.}$&#91;citation needed&#93;

- A strong Riemannian metric on  is a weak Riemannian metric such that $}$ induces the topology on $M}$. If  is a strong Riemannian metric, then  must be a Hilbert manifold.&#91;citation needed&#93;

### Examples

- If  is a Hilbert space, then for any  one can identify  with $H.}$ The metric $(u,v)=\langle u,v\rangle }$ for all  is a strong Riemannian metric.&#91;citation needed&#93;

- Let  be a compact Riemannian manifold and denote by $(M)}$ its diffeomorphism group. The latter is a smooth manifold (see here) and in fact, a Lie group.&#91;citation needed&#93; Its tangent bundle at the identity is the set of smooth vector fields on &#91;citation needed&#93; Let  be a volume form on  The $}$ weak Riemannian metric on $(M)}$, denoted , is defined as follows. Let $(M),}$ $\operatorname {Diff} (M).}$ Then for $M}$,
$(u,v)=\int _{M}g_{f(x)}(u(x),v(x))\,d\mu (x)}$.&#91;citation needed&#93;

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle n}$

- ${\displaystyle M}$

- ${\displaystyle p\in M}$

- ${\displaystyle T_{p}M}$

- ${\displaystyle M}$

- ${\displaystyle p}$

- ${\displaystyle T_{p}M}$

- ${\displaystyle M}$

- ${\displaystyle p}$

- ${\displaystyle T_{p}M}$

- ${\displaystyle g}$

- ${\displaystyle M}$

- ${\displaystyle p}$

- ${\displaystyle g_{p}:T_{p}M\times T_{p}M\to \mathbb {R} }$

- ${\displaystyle \|\cdot \|_{p}:T_{p}M\to \mathbb {R} }$

- ${\displaystyle \|v\|_{p}={\sqrt {g_{p}(v,v)}}}$

- ${\displaystyle M}$

- ${\displaystyle g}$

- ${\displaystyle (M,g)}$

- ${\displaystyle (x^{1},\ldots ,x^{n}):U\to \mathbb {R} ^{n}}$

- ${\displaystyle M}$

$$
{\displaystyle \left\{{\frac {\partial }{\partial x^{1}}}{\Big |}_{p},\dotsc ,{\frac {\partial }{\partial x^{n}}}{\Big |}_{p}\right\}}
$$

- ${\displaystyle T_{p}M}$

- ${\displaystyle p\in U}$

- ${\displaystyle p}$

$$
{\displaystyle g_{ij}|_{p}:=g_{p}\left(\left.{\frac {\partial }{\partial x^{i}}}\right|_{p},\left.{\frac {\partial }{\partial x^{j}}}\right|_{p}\right)}
$$

- ${\displaystyle n^{2}}$

- ${\displaystyle g_{ij}:U\to \mathbb {R} }$

- ${\displaystyle n\times n}$

- ${\displaystyle U}$

## Sources

[source:wikipedia] *Riemannian manifold* — Wikipedia. https://en.wikipedia.org/wiki/Riemannian_manifold. Retrieved 2026-04-17. Confidence: medium.
