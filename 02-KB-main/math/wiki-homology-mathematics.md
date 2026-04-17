---
title: Homology (mathematics)
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Homology_%28mathematics%29
confidence: medium
last_updated: 2026-04-17
word_count: 2286
---

# Homology (mathematics)

## Overview

Algebraic structure associated with a topological space
For other uses, see Homology (disambiguation).
In mathematics, the term homology, originally introduced in algebraic topology, has three primary, closely related usages. First, there is the homology of a chain complex, a sequence of abelian groups, called homology groups, which are regarded fundamental invariants of the chain complex. Secondly, when one can associate a chain complex to a different mathematical object, one can also associate its homology to that object. Distinct procedures of associating chain complexes to a given object are grouped into homology theories. Finally, homology is important in the study of topological spaces. Under nice conditions in which distinct homology theories for a single topological space produce the same homology groups, one can define a single homology of a topological space. This last notion of homology is closely related to topological ideas frequently discussed in popular mathematics such as the holes of a surface or the cycles of a graph. There is also a related notion of the cohomology of a cochain complex, giving rise to various cohomology theories, in addition to the notion of the cohomology of a topological space.

### Inspirations for homology (informal discussion)

One of the ideas that led to the development of homology was the observation that certain low-dimensional shapes can be topologically distinguished by examining their "holes." For instance, a figure-eight shape has more holes than a circle $}$, and a 2-torus $}$ (a 2-dimensional surface shaped like an inner tube) has different holes from a 2-sphere $}$ (a 2-dimensional surface shaped like a basketball).

Studying topological features such as these led to the notion of the cycles that represent homology classes (the elements of homology groups). For example, the two embedded circles in a figure-eight shape provide examples of one-dimensional cycles, or 1-cycles, and the 2-torus $}$ and 2-sphere $}$ represent 2-cycles. Cycles form a group under the operation of formal addition, which refers to adding cycles symbolically rather than combining them geometrically. Any formal sum of cycles is again called a cycle.

### Cycles and boundaries (informal discussion)

Explicit constructions of homology groups are somewhat technical. As mentioned above, an explicit realization of the homology groups $(X)}$ of a topological space  is defined in terms of the cycles and boundaries of a chain complex  $,d_{\bullet })}$ associated to , where the type of chain complex depends on the choice of homology theory in use. These cycles and boundaries are elements of abelian groups, and are defined in terms of the boundary homomorphisms $:C_{n}\to C_{n-1}}$ of the chain complex, where each $}$ is an abelian group, and the $}$ are group homomorphisms that satisfy $\circ d_{n}=0}$ for all .

Since such constructions are somewhat technical, informal discussions of homology sometimes focus instead on topological notions that parallel some of the group-theoretic aspects of cycles and boundaries.

For example, in the context of chain complexes, a boundary is any element of the image $:=\mathrm {im} \,d_{n+1}:=\{d_{n+1}(c)\,|\;c\in C_{n+1}\}}$ of the boundary homomorphism $:C_{n}\to C_{n-1}}$, for some . In topology, the boundary of a space is technically obtained by taking the space's closure minus its interior, but it is also a notion familiar from examples, e.g., the boundary of the unit disk is the unit circle, or more topologically, the boundary of $}$ is $}$.

Topologically, the boundary of the closed interval  is given by the disjoint union $\,\amalg \,\{1\}}$, and with respect to suitable orientation conventions, the oriented boundary of  is given by the union of a positively oriented $}$ with a negatively oriented $.}$ The simplicial chain complex analog of this statement is that $([0,1])=\{1\}-\{0\}}$. (Since $}$ is a homomorphism, this implies $(k\cdot [0,1])=k\cdot \{1\}-k\cdot \{0\}}$ for any integer .)

In the context of chain complexes, a cycle is any element of the kernel $:=\ker d_{n}:=\{c\in C_{n}\,|\;d_{n}(c)=0\}}$, for some . In other words, $}$ is a cycle if and only if $(c)=0}$. The closest topological analog of this idea would be a shape that has "no boundary," in the sense that its boundary is the empty set. For example, since $,S^{2}}$, and $}$ have no boundary, one can associate cycles to each of these spaces. However, the chain complex notion of cycles (elements whose boundary is a "zero chain") is more general than the topological notion of a shape with no boundary.

It is this topological notion of no boundary that people generally have in mind when they claim that cycles can intuitively be thought of as detecting holes. The idea is that for no-boundary shapes like $}$, $}$,  and $}$, it is possible in each case to glue on a larger shape for which the original shape is the boundary. For instance, starting with a circle $}$, one could glue a 2-dimensional disk $}$ to that $}$ such that the $}$ is the boundary of that $}$. Similarly, given a two-sphere $}$, one can glue a ball $}$ to that $}$ such that the $}$ is the boundary of that $}$. This phenomenon is sometimes described as saying that $}$ has a $}$-shaped "hole" or that it could be "filled in" with a $}$.

More generally, any shape with no boundary can be "filled in" with a cone, since if a given space  has no boundary, then the boundary of the cone on  is given by , and so if one "filled in"  by gluing the cone on  onto , then  would be the boundary of that cone. (For example, a cone on $}$ is homeomorphic to a disk $}$ whose boundary is that $}$.) However, it is sometimes desirable to restrict to nicer spaces such as manifolds, and not every cone is homeomorphic to a manifold. Embedded representatives of 1-cycles, 3-cycles, and oriented 2-cycles all admit manifold-shaped holes, but for example the real projective plane $^{2}}$ and complex projective plane $^{2}}$ have nontrivial cobordism classes and therefore cannot be "filled in" with manifolds.

On the other hand, the boundaries discussed in the homology of a topological space  are different from the boundaries of "filled in" holes, because the homology of a topological space  has to do with the original space , and not with new shapes built from gluing extra pieces onto . For example, any embedded circle  in $}$ already bounds some embedded disk  in $}$, so such  gives rise to a boundary class in the homology of $}$. By contrast, no embedding of $}$ into one of the 2 lobes of the figure-eight shape gives a boundary, despite the fact that it is possible to glue a disk onto a figure-eight lobe.

## Informal examples

The homology of a topological space X is a set of topological invariants of X represented by its homology groups
$(X),H_{1}(X),H_{2}(X),\ldots }$
where the $}}$ homology group $(X)}$ describes, informally, the number of holes in X with a k-dimensional boundary. A 0-dimensional-boundary hole is simply a gap between two components. Consequently, $(X)}$ describes the path-connected components of X.

- For the homology groups of a graph, see graph homology.
The circle or 1-sphere $}$The 2-sphere $}$ is the outer shell, not the interior, of a ball
A one-dimensional sphere $}$ is a circle. It has a single connected component and a one-dimensional-boundary hole, but no higher-dimensional holes. The corresponding homology groups are given as
$$
\left(S^{1}\right)={\begin{cases}\mathbb {Z} &k=0,1\\\{0\}&{\text{otherwise}}\end{cases}}}
$$
where $}$ is the group of integers and $}$ is the trivial group. The group $\left(S^{1}\right)=\mathbb {Z} }$ represents a finitely-generated abelian group, with a single generator representing the one-dimensional hole contained in a circle.

A two-dimensional sphere $}$ has a single connected component, no one-dimensional-boundary holes, a two-dimensional-boundary hole, and no higher-dimensional holes. The corresponding homology groups are
$$
\left(S^{2}\right)={\begin{cases}\mathbb {Z} &k=0,2\\\{0\}&{\text{otherwise}}\end{cases}}}
$$

In general for an n-dimensional sphere $,}$ the homology groups are
$$
\left(S^{n}\right)={\begin{cases}\mathbb {Z} &k=0,n\\\{0\}&{\text{otherwise}}\end{cases}}}
$$

- The solid disc or 2-ball $}$The torus $\times S^{1}}$
A two-dimensional ball $}$ is a solid disc. It has a single path-connected component, but in contrast to the circle, has no higher-dimensional holes. The corresponding homology groups are all trivial except for $\left(B^{2}\right)=\mathbb {Z} }$. In general, for an n-dimensional ball $,}$
$$
\left(B^{n}\right)={\begin{cases}\mathbb {Z} &k=0\\\{0\}&{\text{otherwise}}\end{cases}}}
$$

The torus is defined as a product of two circles $=S^{1}\times S^{1}}$. The torus has a single path-connected component, two independent one-dimensional holes (indicated by circles in red and blue) and one two-dimensional hole as the interior of the torus. The corresponding homology groups are
$$
(T^{2})={\begin{cases}\mathbb {Z} &k=0,2\\\mathbb {Z} \times \mathbb {Z} &k=1\\\{0\}&{\text{otherwise}}\end{cases}}}
$$

If n products of a topological space X is written as $}$, then in general, for an n-dimensional torus $=(S^{1})^{n}}$,
$$
(T^{n})={\begin{cases}\mathbb {Z} ^{\binom {n}{k}}&0\leq k\leq n\\\{0\}&{\text{otherwise}}\end{cases}}}
$$
(see Torus §&#160;n-dimensional torus and Betti number §&#160;More examples for more details).

The two independent 1-dimensional holes form independent generators in a finitely generated abelian group, expressed as the product group $\times \mathbb {Z} .}$ 

For the projective plane P, a simple computation shows (where $_{2}}$ is the cyclic group of order 2):
$$
(P)={\begin{cases}\mathbb {Z} &k=0\\\mathbb {Z} _{2}&k=1\\\{0\}&{\text{otherwise}}\end{cases}}}
$$
$(P)=\mathbb {Z} }$ corresponds, as in the previous examples, to the fact that there is a single connected component. $(P)=\mathbb {Z} _{2}}$ is a new phenomenon: intuitively, it corresponds to the fact that there is a single non-contractible "loop", but if we do the loop twice, it becomes contractible to zero. This phenomenon is called torsion.

## Construction of homology groups

The following text describes a general algorithm for constructing the homology groups. It may be easier for the reader to look at some simple examples first: graph homology and simplicial homology.

The general construction begins with an object such as a topological space X, on which one first defines a chain complex C(X) encoding information about X. A chain complex is a sequence of abelian groups or modules $,C_{1},C_{2},\ldots }$. connected by homomorphisms $:C_{n}\to C_{n-1},}$ which are called boundary operators. That is,

$}{\longrightarrow \,}}C_{n}{\overset {\partial _{n}}{\longrightarrow \,}}C_{n-1}{\overset {\partial _{n-1}}{\longrightarrow \,}}\dotsb {\overset {\partial _{2}}{\longrightarrow \,}}C_{1}{\overset {\partial _{1}}{\longrightarrow \,}}C_{0}{\overset {\partial _{0}}{\longrightarrow \,}}0}$
where 0 denotes the trivial group and $\equiv 0}$ for i < 0. It is also required that the composition of any two consecutive boundary operators be trivial. That is, for all n,

$\circ \partial _{n+1}=0_{n+1,n-1},}$
i.e., the constant map sending every element of $}$ to the group identity in $.}$

The statement that the boundary of a boundary is trivial is equivalent to the statement that $(\partial _{n+1})\subseteq \ker(\partial _{n})}$, where $(\partial _{n+1})}$ denotes the image of the boundary operator and $)}$ its kernel. Elements of $(X)=\mathrm {im} (\partial _{n+1})}$ are called boundaries and elements of $(X)=\ker(\partial _{n})}$ are called cycles.

Since each chain group Cn is abelian all its subgroups are normal. Then because $)}$ is a subgroup of Cn, $)}$ is abelian, and since $(\partial _{n+1})\subseteq \ker(\partial _{n})}$ therefore $(\partial _{n+1})}$ is a normal subgroup of $)}$. Then one can create the quotient group

$(X):=\ker(\partial _{n})/\operatorname {im} (\partial _{n+1})=Z_{n}(X)/B_{n}(X),}$
called the nth homology group of X. The elements of Hn(X) are called homology classes. Each homology class is an equivalence class over cycles and two cycles in the same homology class are said to be homologous.

A chain complex is said to be exact if the image of the (n+1)th map is always equal to the kernel of the nth map. The homology groups of X therefore measure "how far" the chain complex associated to X is from being exact.

The reduced homology groups of a chain complex C(X) are defined as homologies of the augmented chain complex

$}{\longrightarrow \,}}C_{n}{\overset {\partial _{n}}{\longrightarrow \,}}C_{n-1}{\overset {\partial _{n-1}}{\longrightarrow \,}}\dotsb {\overset {\partial _{2}}{\longrightarrow \,}}C_{1}{\overset {\partial _{1}}{\longrightarrow \,}}C_{0}{\overset {\varepsilon }{\longrightarrow \,}}\mathbb {Z} {\longrightarrow \,}0}$
where the boundary operator  is

$n_{i}\sigma _{i}\right)=\sum _{i}n_{i}}$
for a combination $\sigma _{i},}$ of points $,}$ which are the fixed generators of C0. The reduced homology groups $}_{i}(X)}$ coincide with $(X)}$ for  The extra $}$ in the chain complex represents the unique map  from the empty simplex to X.

Computing the cycle $(X)}$ and boundary $(X)}$ groups is usually rather difficult since they have a very large number of generators. On the other hand, there are tools which make the task easier.

The simplicial homology groups Hn(X) of a simplicial complex X are defined using the simplicial chain complex C(X), with Cn(X) the free abelian group generated by the n-simplices of X. See simplicial homology for details.

The singular homology groups Hn(X) are defined for any topological space X, and agree with the simplicial homology groups for a simplicial complex.

Cohomology groups are formally similar to homology groups: one starts with a cochain complex, which is the same as a chain complex but whose arrows, now denoted $,}$ point in the direction of increasing n rather than decreasing n; then the groups $\right)=Z^{n}(X)}$ of cocycles and $\left(d^{n-1}\right)=B^{n}(X)}$ of coboundaries follow from the same description. The nth cohomology group of X is then the quotient group

$(X)=Z^{n}(X)/B^{n}(X),}$
in analogy with the nth homology group.

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle (C_{\bullet },d_{\bullet })}$

- ${\displaystyle C_{n}}$

- ${\displaystyle d_{n}}$

$$
{\displaystyle \cdots \longrightarrow C_{n+1}{\stackrel {d_{n+1}}{\longrightarrow }}C_{n}{\stackrel {d_{n}}{\longrightarrow }}C_{n-1}{\stackrel {d_{n-1}}{\longrightarrow }}\cdots }
$$

- ${\displaystyle d_{n}\circ d_{n+1}=0.}$

- ${\displaystyle n}$

- ${\displaystyle Z_{n}}$

- ${\displaystyle Z_{n}=\ker d_{n}=\{c\in C_{n}\,|\;d_{n}(c)=0\}}$

- ${\displaystyle n}$

- ${\displaystyle B_{n}}$

- ${\displaystyle B_{n}:=\mathrm {im} \,d_{n+1}=\{d_{n+1}(c)\,|\;c\in C_{n+1}\}}$

- ${\displaystyle n}$

- ${\displaystyle H_{n}}$

- ${\displaystyle H_{n}=Z_{n}/B_{n}}$

- ${\displaystyle C_{n}}$

- ${\displaystyle R}$

- ${\displaystyle d_{n}}$

- ${\displaystyle R}$

- ${\displaystyle H_{n}}$

- ${\displaystyle S^{1}}$

- ${\displaystyle T^{2}}$

- ${\displaystyle S^{2}}$

- ${\displaystyle T^{2}}$

- ${\displaystyle S^{2}}$

- ${\displaystyle H_{n}(X)}$

- ${\displaystyle X}$

- ${\displaystyle (C_{\bullet },d_{\bullet })}$

- ${\displaystyle X}$

- ${\displaystyle d_{n}:C_{n}\to C_{n-1}}$

- ${\displaystyle C_{n}}$

## Sources

[source:wikipedia] *Homology (mathematics)* — Wikipedia. https://en.wikipedia.org/wiki/Homology_%28mathematics%29. Retrieved 2026-04-17. Confidence: medium.
