---
title: Topology
domain: math
sources:
  - slug: mathworld-topology
    url: https://mathworld.wolfram.com/Topology.html
    type: article
    ingested: 2026-04-17
    confidence: medium
confidence: medium
last_updated: 2026-04-17
sha256: 999f8d5a199df8853b810117250f91868fa4d4fe1d9905c658b84e4b0f99593f
equations:
  - tex: '{emptyset,{1}}'
    canonical_srepr: "FiniteSet(FiniteSet(Integer(1)), Mul(E, E, Symbol('m'), Symbol('p'), Symbol('s'), Symbol('t'), Symbol('t'), Symbol('y')))"
  - tex: '{emptyset,{1},{1,2}}'
    canonical_srepr: "FiniteSet(FiniteSet(Integer(1)), FiniteSet(Integer(1), Integer(2)), Mul(E, E, Symbol('m'), Symbol('p'), Symbol('s'), Symbol('t'), Symbol('t'), Symbol('y')))"
  - tex: '{emptyset,{1,2}}'
    canonical_srepr: "FiniteSet(FiniteSet(Integer(1), Integer(2)), Mul(E, E, Symbol('m'), Symbol('p'), Symbol('s'), Symbol('t'), Symbol('t'), Symbol('y')))"
  - tex: '{emptyset,{1,2},{2}}'
    canonical_srepr: "FiniteSet(FiniteSet(Integer(1), Integer(2)), FiniteSet(Integer(2)), Mul(E, E, Symbol('m'), Symbol('p'), Symbol('s'), Symbol('t'), Symbol('t'), Symbol('y')))"
  - tex: '{emptyset,{1},{2},{1,2}}'
    canonical_srepr: "FiniteSet(FiniteSet(Integer(1)), FiniteSet(Integer(1), Integer(2)), FiniteSet(Integer(2)), Mul(E, E, Symbol('m'), Symbol('p'), Symbol('s'), Symbol('t'), Symbol('t'), Symbol('y')))"
  - tex: 'n=1'
    canonical_srepr: "Equality(Symbol('n'), Integer(1))"
  - tex: 'X={1,2,3,4}'
    canonical_srepr: "Equality(Symbol('x'), FiniteSet(Integer(1), Integer(2), Integer(3), Integer(4)))"
  - tex: 'T={emptyset,{1},{2,3,4},{1,2,3,4}}'
    canonical_srepr: "Equality(Symbol('t'), FiniteSet(FiniteSet(Integer(1)), FiniteSet(Integer(1), Integer(2), Integer(3), Integer(4)), FiniteSet(Integer(2), Integer(3), Integer(4)), Mul(E, E, Symbol('m'), Symbol('p'), Symbol('s'), Symbol('t'), Symbol('t'), Symbol('y'))))"
  - tex: '2^n'
    canonical_srepr: "Pow(Integer(2), Symbol('n'))"
---

# Topology

_Ingested from Mathworld: <https://mathworld.wolfram.com/Topology.html>._

Topology

General Topology

Recreational Mathematics

Mathematical Humor

MathWorld Contributors

Budney

MathWorld Contributors

Forfar

Topology is the mathematical study of the properties that are preserved through deformations, twistings, and stretchings of objects. Tearing, however, is not allowed. A circle is topologically equivalent to an ellipse (into which
 it can be deformed by stretching) and a sphere is equivalent
 to an ellipsoid . Similarly, the set of all possible
 positions of the hour hand of a clock is topologically equivalent to a circle (i.e.,
 a one-dimensional closed curve with no intersections that can be embedded in two-dimensional
 space), the set of all possible positions of the hour and minute hands taken together
 is topologically equivalent to the surface of a torus (i.e.,
 a two-dimensional a surface that can be embedded in three-dimensional space), and
 the set of all possible positions of the hour, minute, and second hands taken together
 are topologically equivalent to a three-dimensional object.

The definition of topology leads to the following mathematical joke (Renteln and Dundes 2005):

Q: What is a topologist? A: Someone who cannot distinguish between a doughnut and a coffee cup.

There is more to topology, though. Topology began with the study of curves, surfaces, and other objects in the plane and three-space. One of the central ideas in topology
 is that spatial objects like circles and spheres can be treated as objects in their own right, and knowledge of objects is independent
 of how they are "represented" or "embedded" in space. For example,
 the statement "if you remove a point from a circle ,
 you get a line segment" applies just as well to the circle as to an ellipse , and even to tangled or knotted circles ,
 since the statement involves only topological properties.

Topology has to do with the study of spatial objects such as curves, surfaces, the space we call our universe, the space-time of general relativity, fractals , knots , manifolds (which are
 objects with some of the same basic spatial properties as our universe), phase
 spaces that are encountered in physics (such as the space of hand-positions of
 a clock), symmetry groups like the collection of
 ways of rotating a top, etc.

Topology can be used to abstract the inherent connectivity of objects while ignoring their detailed form. For example, the figures above illustrate the connectivity of
 a number of topologically distinct surfaces. In these figures, parallel edges drawn
 in solid join one another with the orientation indicated with arrows, so corners
 labeled with the same letter correspond to the same point, and dashed lines show
 edges that remain free (Gardner 1971, pp. 15-17; Gray 1997, pp. 322-324).
 The above figures correspond to the disk ( plane ), Klein bottle , Möbius
 strip , real projective plane , sphere , torus , and tube . The labels are
 often omitted in such diagrams since they are implied by connection of parallel lines
 with the orientations indicated by the arrows.

The "objects" of topology are often formally defined as topological spaces . If two objects have the same topological properties, they are said to
 be homeomorphic (although, strictly speaking, properties
 that are not destroyed by stretching and distorting an object are really properties
 preserved by isotopy , not homeomorphism ; isotopy has to do with distorting embedded objects, while homeomorphism is intrinsic).

Around 1900, Poincaré formulated a measure of an object's topology, called homotopy (Collins 2004). In particular, two mathematical
 objects are said to be homotopic if one can be continuously
 deformed into the other.

Topology can be divided into algebraic topology (which includes combinatorial topology ), differential topology , and low-dimensional
 topology . The low-level language of topology, which is not really considered
 a separate "branch" of topology, is known as point-set
 topology .

There is also a formal definition for a topology defined in terms of set operations. A set along with a collection of subsets of it is said to be a topology if the subsets in obey the following properties:

1. The (trivial) subsets and the empty set are in .

2. Whenever sets and are in , then so is .

3. Whenever two or more sets are in , then so is their union

(Bishop and Goldberg 1980). This definition can be used to enumerate the topologies on symbols. For example, the unique topology
 of order 1 is ,
 while the four topologies of order 2 are , , , and . The numbers of topologies on sets
 of cardinalities ,
 2, ... are 1, 4, 29, 355, 6942, ... (OEIS A000798 ).

A set for which a topology has been specified is called a topological
 space (Munkres 2000, p. 76). For example, the set together with the subsets comprises
 a topology, and is a topological space .

Topologies can be built up from topological bases . For the real numbers , a topological
 basis is the set of open intervals .

### See also

### Explore with Wolfram|Alpha

More things to try:

topology

aleph0^3 = aleph0

derivative of x^2 y+ x y^2 in the direction (1,1)

### References

### Referenced
 on Wolfram|Alpha

### Cite this as:

Weisstein, Eric W. "Topology." From MathWorld --A Wolfram Resource. https://mathworld.wolfram.com/Topology.html

### Subject classifications

Topology

General Topology

Recreational Mathematics

Mathematical Humor

MathWorld Contributors

Budney

MathWorld Contributors

Forfar

$${emptyset,{1}}$$

$${emptyset,{1},{1,2}}$$

$${emptyset,{1,2}}$$

$${emptyset,{1,2},{2}}$$

$${emptyset,{1},{2},{1,2}}$$

$$n=1$$

$$X={1,2,3,4}$$

$$T={emptyset,{1},{2,3,4},{1,2,3,4}}$$

$$2^n$$
