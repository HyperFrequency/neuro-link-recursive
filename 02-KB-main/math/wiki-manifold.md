---
title: Manifold
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Manifold
confidence: medium
last_updated: 2026-04-17
word_count: 1265
---

# Manifold

## Overview

Topological space that locally resembles Euclidean space
For other uses, see Manifold (disambiguation).

The Klein bottle immersed in three-dimensional space
The surface of the Earth requires (at least) two charts to include every point without plotting the same point more than once on the same chart. Here the globe is decomposed into charts around the North and South Poles.
In mathematics, a manifold is a topological space that locally resembles Euclidean space near each point. More precisely, an -dimensional manifold, or -manifold for short, is a topological space with the property that each point has a neighborhood that is homeomorphic to an open subset of -dimensional Euclidean space.

One-dimensional manifolds include lines and circles, but not self-crossing curves such as a figure-eight. Two-dimensional manifolds are also called surfaces. Examples include the plane, the sphere, and the torus, and also the Klein bottle and real projective plane.

## Definition

- Further information: Categories of manifolds
Informally, a manifold is a space that is "modeled on" Euclidean space.

A manifold can be constructed by giving a collection of coordinate charts, that is, a covering by open sets with homeomorphisms to a Euclidean space, and transition maps: homeomorphisms from one region of Euclidean space to another region if they correspond to the same part of the manifold in two different coordinate charts. A manifold can be given additional structure if the patching functions satisfy axioms beyond continuity. For instance, differentiable manifolds have homeomorphisms on overlapping neighborhoods diffeomorphic with each other, so that the manifold has a well-defined set of functions which are differentiable in each neighborhood, thus differentiable on the manifold as a whole.

Formally, a (topological) manifold is a second countable Hausdorff space that is locally homeomorphic to a Euclidean space.

Second countable and Hausdorff are point-set conditions; second countable excludes spaces which are in some sense 'too large' such as the long line, while Hausdorff excludes spaces such as the line with two origins.

Locally homeomorphic to a Euclidean space means that every point has a neighborhood homeomorphic to an open subset of the Euclidean space $^{n},}$ for some nonnegative integer n.

This implies that either the point is an isolated point (if ), or it has a neighborhood homeomorphic to the open ball
$^{n}=\left\{(x_{1},x_{2},\dots ,x_{n})\in \mathbb {R} ^{n}:x_{1}^{2}+x_{2}^{2}+\cdots +x_{n}^{2}<1\right\}.}$ This implies also that every point has a neighborhood homeomorphic to $^{n}}$
since $^{n}}$ is homeomorphic, and even diffeomorphic to any open ball in it (for ).

The n that appears in the preceding definition is called the local dimension of the manifold. Generally manifolds are taken to have a constant local dimension, and the local dimension is then called the dimension  of the manifold. This is, in particular, the case when manifolds are connected. However, some authors admit manifolds that are not connected, and where different points can have different dimensions. If a manifold has a fixed dimension, this can be emphasized by calling it  a pure manifold. For example, the (surface of a) sphere has a constant dimension of 2 and is therefore a pure manifold whereas the disjoint union of a sphere and a line in three-dimensional space is not a pure manifold. Since dimension is a local invariant (i.e. the map sending each point to the dimension of its neighbourhood over which a chart is defined, is locally constant), each connected component has a fixed dimension.

Sheaf-theoretically, a manifold is a locally ringed space, whose structure sheaf is locally isomorphic to the sheaf of continuous (or differentiable, or complex-analytic, etc.) functions on Euclidean space. This definition is mostly used when discussing analytic manifolds in algebraic geometry.

## Construction

A single manifold can be constructed in different ways, each stressing a different aspect of the manifold, thereby  leading to a slightly different viewpoint.

## History

- Further information: History of manifolds and varieties
The study of manifolds combines many important areas of mathematics: it generalizes concepts such as curves and surfaces as well as ideas from linear algebra and topology.

### Poincaré's definition

In his very influential paper, Analysis Situs, Henri Poincaré gave a definition of a differentiable manifold (variété) which served as a precursor to the modern concept of a manifold.

In the first section of Analysis Situs, Poincaré defines a manifold as the level set of a continuously differentiable function between Euclidean spaces that satisfies the nondegeneracy hypothesis of the implicit function theorem. In the third section, he begins by remarking that the graph of a continuously differentiable function is a manifold in the latter sense. He then proposes a new, more general, definition of manifold based on a 'chain of manifolds' (une chaîne des variétés).

Poincaré's notion of a chain of manifolds is a precursor to the modern notion of atlas. In particular, he considers two manifolds defined respectively as graphs of functions  and . If these manifolds overlap (a une partie commune), then he requires that the coordinates  depend continuously differentiably on the coordinates  and vice versa ('...les  sont fonctions analytiques des  et inversement'). In this way he introduces a precursor to the notion of a chart and of a transition map.

For example, the unit circle in the plane can be thought of as the graph of the function ${\textstyle y={\sqrt {1-x^{2}}}}$ or else the function ${\textstyle y=-{\sqrt {1-x^{2}}}}$ in a neighborhood of every point except the points (1, 0) and (−1, 0); and in a neighborhood of those points, it can be thought of as the graph of, respectively, ${\textstyle x={\sqrt {1-y^{2}}}}$ and ${\textstyle x=-{\sqrt {1-y^{2}}}}$. The circle can be represented by a graph in the neighborhood of every point because the left hand side of its defining equation $+y^{2}-1=0}$ has nonzero gradient at every point of the circle.  By the implicit function theorem, every submanifold of Euclidean space is locally the graph of a function.

Hermann Weyl gave an intrinsic definition for differentiable manifolds in his lecture course on Riemann surfaces in 1911–1912, opening the road to the general concept of a topological space that followed shortly. During the 1930s Hassler Whitney and others clarified the foundational aspects of the subject, and thus intuitions dating back to the latter half of the 19th century became precise, and developed through differential geometry and Lie group theory. Notably, the Whitney embedding theorem showed that the intrinsic definition in terms of charts was equivalent to Poincaré's definition in terms of subsets of Euclidean space.

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle n}$

- ${\displaystyle n}$

- ${\displaystyle n}$

- ${\displaystyle \chi _{\mathrm {top} }(x,y)=x.\,}$

$$
{\displaystyle {\begin{aligned}\chi _{\mathrm {bottom} }(x,y)&=x\\\chi _{\mathrm {left} }(x,y)&=y\\\chi _{\mathrm {right} }(x,y)&=y.\end{aligned}}}
$$

- ${\displaystyle \chi _{\mathrm {top} }}$

- ${\displaystyle \chi _{\mathrm {right} }}$

- ${\displaystyle x}$

- ${\displaystyle y}$

- ${\displaystyle (0,1)}$

$$
{\displaystyle T:(0,1)\rightarrow (0,1)=\chi _{\mathrm {right} }\circ \chi _{\mathrm {top} }^{-1}}
$$

- ${\displaystyle \chi _{\mathrm {top} }}$

- ${\displaystyle \chi _{\mathrm {right} }}$

- ${\displaystyle (0,1)}$

$$
{\displaystyle {\begin{aligned}T(a)&=\chi _{\mathrm {right} }\left(\chi _{\mathrm {top} }^{-1}\left[a\right]\right)\\&=\chi _{\mathrm {right} }\left(a,{\sqrt {1-a^{2}}}\right)\\&={\sqrt {1-a^{2}}}\end{aligned}}}
$$

- ${\displaystyle \chi _{\mathrm {minus} }(x,y)=s={\frac {y}{1+x}}}$

- ${\displaystyle \chi _{\mathrm {plus} }(x,y)=t={\frac {y}{1-x}}}$

$$
{\displaystyle {\begin{aligned}x&={\frac {1-s^{2}}{1+s^{2}}}\\[5pt]y&={\frac {2s}{1+s^{2}}}\end{aligned}}}
$$

- ${\displaystyle t={\frac {1}{s}}}$

- ${\displaystyle \mathbb {R} ^{n},}$

- ${\displaystyle n=0}$

$$
{\displaystyle \mathbf {B} ^{n}=\left\{(x_{1},x_{2},\dots ,x_{n})\in \mathbb {R} ^{n}:x_{1}^{2}+x_{2}^{2}+\cdots +x_{n}^{2}<1\right\}.}
$$

- ${\displaystyle \mathbb {R} ^{n}}$

- ${\displaystyle \mathbb {R} ^{n}}$

- ${\displaystyle n>0}$

- ${\displaystyle \mathbb {R} ^{n}}$

- ${\displaystyle \mathbb {R} ^{2}}$

- ${\displaystyle \mathbb {R} ^{n}}$

- ${\displaystyle \mathbb {R} ^{n}}$

- ${\displaystyle \mathbb {R} ^{n}}$

## Sources

[source:wikipedia] *Manifold* — Wikipedia. https://en.wikipedia.org/wiki/Manifold. Retrieved 2026-04-17. Confidence: medium.
