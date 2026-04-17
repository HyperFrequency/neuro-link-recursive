---
title: Lie group
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Lie_group
confidence: medium
last_updated: 2026-04-17
word_count: 1834
---

# Lie group

## Overview

Group that is also a differentiable manifold with group operations that are smooth

Not to be confused with Group of Lie type or Ree group.

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
-

## History

Sophus Lie considered the winter of 1873–1874 as the birth date of his theory of continuous groups. Thomas Hawkins, however, suggests that it was "Lie's prodigious research activity during the four-year period from the fall of 1869 to the fall of 1873" that led to the theory's creation. Some of Lie's early ideas were developed in close collaboration with Felix Klein.  Lie met with Klein every day from October 1869 through 1872: in Berlin from the end of October 1869 to the end of February 1870, and in Paris, Göttingen and Erlangen in the subsequent two years. Lie stated that all of the principal results were obtained by 1884. But during the 1870s all his papers (except the very first note) were published in Norwegian journals, which impeded recognition of the work throughout the rest of Europe. In 1884 a young German mathematician, Friedrich Engel, came to work with Lie on a systematic treatise to expose his theory of continuous groups. From this effort resulted the three-volume Theorie der Transformationsgruppen, published in 1888, 1890, and 1893. The term groupes de Lie first appeared in French in 1893 in the thesis of Lie's student Arthur Tresse.

Lie's ideas did not stand in isolation from the rest of mathematics. In fact, his interest in the geometry of differential equations was first motivated by the work of Carl Gustav Jacobi, on the theory of partial differential equations of first order and on the equations of classical mechanics.  Much of Jacobi's work was published posthumously in the 1860s, generating enormous interest in France and Germany. Lie's idée fixe was to develop a theory of symmetries of differential equations that would accomplish for them what Évariste Galois had done for algebraic equations: namely, to classify them in terms of group theory. Lie and other mathematicians showed that the most important equations for special functions and orthogonal polynomials tend to arise from group theoretical symmetries. In Lie's early work, the idea was to construct a theory of continuous groups, to complement the theory of discrete groups that had developed in the theory of modular forms, in the hands of Felix Klein and Henri Poincaré. The initial application that Lie had in mind was to the theory of differential equations. On the model of Galois theory and polynomial equations, the driving conception was of a theory capable of unifying, by the study of symmetry, the whole area of ordinary differential equations. However, the hope that Lie theory would unify the entire field of ordinary differential equations was not fulfilled. Symmetry methods for ODEs continue to be studied, but do not dominate the subject. There is a differential Galois theory, but it was developed by others, such as Picard and Vessiot, and it provides a theory of quadratures, the indefinite integrals required to express solutions.

Additional impetus to consider continuous groups came from ideas of Bernhard Riemann, on the foundations of geometry, and their further development in the hands of Klein. Thus three major themes in 19th century mathematics were combined by Lie in creating his new theory:

- The idea of symmetry, as exemplified by Galois through the algebraic notion of a group;

- Geometric theory and the explicit solutions of differential equations of mechanics, worked out by Poisson and Jacobi;

- The new understanding of geometry that emerged in the works of Plücker, Möbius, Grassmann and others, and culminated in Riemann's revolutionary vision of the subject.
Although today Sophus Lie is rightfully recognized as the creator of the theory of continuous groups, a major stride in the development of their structure theory, which was to have a profound influence on subsequent development of mathematics, was made by Wilhelm Killing, who in 1888 published the first paper in a series entitled Die Zusammensetzung der stetigen endlichen Transformationsgruppen (The composition of continuous finite transformation groups). The work of Killing, later refined and generalized by Élie Cartan, led to classification of semisimple Lie algebras, Cartan's theory of symmetric spaces, and Hermann Weyl's description of representations of compact and semisimple Lie groups using highest weights.

In 1900 David Hilbert challenged Lie theorists with his Fifth Problem presented at the International Congress of Mathematicians in Paris.

Weyl brought the early period of the development of the theory of Lie groups to fruition, for not only did he classify irreducible representations of semisimple Lie groups and connect the theory of groups with quantum mechanics, but he also put Lie's theory itself on firmer footing by clearly enunciating the distinction between Lie's infinitesimal groups (i.e., Lie algebras) and the Lie groups proper, and began investigations of topology of Lie groups. The theory of Lie groups was systematically reworked in modern mathematical language in a monograph by Claude Chevalley.

## Overview

The set of all complex numbers with absolute value 1 (corresponding to points on the circle of center 0 and radius 1 in the complex plane) is a Lie group under complex multiplication:  the circle group.
Lie groups are smooth differentiable manifolds and as such can be studied using differential calculus, in contrast with the case of more general topological groups. One of the key ideas in the theory of Lie groups is to replace the global object, the group, with its local or linearized version, which Lie himself called its "infinitesimal group" and which has since become known as its Lie algebra.

Lie groups play an enormous role in modern geometry, on several different levels. Felix Klein argued in his Erlangen program that one can consider various "geometries" by specifying an appropriate transformation group that leaves certain geometric properties invariant. Thus Euclidean geometry corresponds to the choice of the group E(3) of distance-preserving transformations of the Euclidean space &#8288;$^{3}}$&#8288;, conformal geometry corresponds to enlarging the group to the conformal group, whereas in projective geometry one is interested in the properties invariant under the projective group. This idea later led to the notion of a G-structure, where G is a Lie group of "local" symmetries of a manifold.

Lie groups (and their associated Lie algebras) play a major role in modern physics, with the Lie group typically playing the role of a symmetry of a physical system. Here, the representations of the Lie group (or of its Lie algebra) are especially important. Representation theory is used extensively in particle physics. Groups whose representations are of particular importance include the rotation group SO(3) (or its double cover SU(2)),  the special unitary group SU(3) and the Poincaré group.

On a "global" level, whenever a Lie group acts on a geometric object, such as a Riemannian or a symplectic manifold, this action provides a measure of rigidity and yields a rich algebraic structure. The presence of continuous symmetries expressed via a Lie group action on a manifold places strong constraints on its geometry and facilitates analysis on the manifold. Linear actions of Lie groups are especially important, and are studied in representation theory.

In the 1940s–1950s, Ellis Kolchin, Armand Borel, and Claude Chevalley realised that many foundational results concerning Lie groups can be developed completely algebraically, giving rise to the theory of algebraic groups defined over an arbitrary field. This insight opened new possibilities in pure algebra, by providing a uniform construction for most finite simple groups, as well as in algebraic geometry. The theory of automorphic forms, an important branch of modern number theory, deals extensively with analogues of Lie groups over adele rings; p-adic Lie groups play an important role, via their connections with Galois representations in number theory.

## Definitions and examples

A real Lie group is a group that is also a finite-dimensional real smooth manifold, in which the group operations of multiplication and inversion are smooth maps.  Smoothness of the group multiplication


means that μ is a smooth mapping of the product manifold G × G into G.  The two requirements can be combined to the single requirement that the mapping

$y}$
be a smooth mapping of the product manifold into G.

### First examples

- The 2×2 real invertible matrices form a group under multiplication, called general linear group of degree 2 and denoted by $(2,\mathbb {R} )}$ or by &#8288;$_{2}(\mathbb {R} )}$&#8288;: $$
(2,\mathbb {R} )=\left\{A={\begin{pmatrix}a&b\\c&d\end{pmatrix}}:\det A=ad-bc\neq 0\right\}.}
$$ This is a four-dimensional noncompact real Lie group; it is an open subset of &#8288;$^{4}}$&#8288;. This group is disconnected; it has two connected components corresponding to the positive and negative values of the determinant.

- The rotation matrices form a subgroup of &#8288;$(2,\mathbb {R} )}$&#8288;, denoted by &#8288;$(2,\mathbb {R} )}$&#8288;. It is a Lie group in its own right: specifically, a one-dimensional compact connected Lie group which is diffeomorphic to the circle. Using the rotation angle  as a parameter, this group can be parametrized as follows: $$
(2,\mathbb {R} )=\left\{{\begin{pmatrix}\cos \varphi &-\sin \varphi \\\sin \varphi &\cos \varphi \end{pmatrix}}:\varphi \in \mathbb {R} \ /\ 2\pi \mathbb {Z} \right\}.}
$$ Addition of the angles corresponds to multiplication of the elements of &#8288;$(2,\mathbb {R} )}$&#8288;, and taking the opposite angle corresponds to inversion. Thus both multiplication and inversion are differentiable maps.

- The affine group of one dimension is a two-dimensional matrix Lie group, consisting of  real, upper-triangular matrices, with the first diagonal entry being positive and the second diagonal entry being 1. Thus, the group consists of matrices of the form $$
{cc}a&b\\0&1\end{array}}\right),\quad a>0,\,b\in \mathbb {R} .}
$$

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle \mathbb {Z} }$

- ${\displaystyle \mathbb {Z} }$

- ${\displaystyle \mathbb {Z} }$

- ${\displaystyle G}$

- ${\displaystyle {\text{GL}}_{n}(\mathbb {R} )}$

- ${\displaystyle {\text{GL}}_{n}(\mathbb {C} )}$

- ${\displaystyle n\times n}$

- ${\displaystyle \mathbb {R} }$

- ${\displaystyle \mathbb {C} }$

- ${\displaystyle \mathbb {R} ^{3}}$

- ${\displaystyle \mu :G\times G\to G\quad \mu (x,y)=xy}$

- ${\displaystyle (x,y)\in G\times G\mapsto x^{-1}y}$

- ${\displaystyle \operatorname {GL} (2,\mathbb {R} )}$

- ${\displaystyle \operatorname {GL} _{2}(\mathbb {R} )}$

$$
{\displaystyle \operatorname {GL} (2,\mathbb {R} )=\left\{A={\begin{pmatrix}a&b\\c&d\end{pmatrix}}:\det A=ad-bc\neq 0\right\}.}
$$

- ${\displaystyle \mathbb {R} ^{4}}$

- ${\displaystyle \operatorname {GL} (2,\mathbb {R} )}$

- ${\displaystyle \operatorname {SO} (2,\mathbb {R} )}$

- ${\displaystyle \varphi }$

$$
{\displaystyle \operatorname {SO} (2,\mathbb {R} )=\left\{{\begin{pmatrix}\cos \varphi &-\sin \varphi \\\sin \varphi &\cos \varphi \end{pmatrix}}:\varphi \in \mathbb {R} \ /\ 2\pi \mathbb {Z} \right\}.}
$$

- ${\displaystyle \operatorname {SO} (2,\mathbb {R} )}$

- ${\displaystyle 2\times 2}$

$$
{\displaystyle A=\left({\begin{array}{cc}a&b\\0&1\end{array}}\right),\quad a>0,\,b\in \mathbb {R} .}
$$

$$
{\displaystyle H=\left\{\left({\begin{matrix}e^{2\pi i\theta }&0\\0&e^{2\pi ia\theta }\end{matrix}}\right):\,\theta \in \mathbb {R} \right\}\subset \mathbb {T} ^{2}=\left\{\left({\begin{matrix}e^{2\pi i\theta }&0\\0&e^{2\pi i\phi }\end{matrix}}\right):\,\theta ,\phi \in \mathbb {R} \right\},}
$$

- ${\displaystyle a\in \mathbb {R} \setminus \mathbb {Q} }$

- ${\displaystyle \mathbb {T} ^{2}}$

- ${\displaystyle U}$

- ${\displaystyle h}$

- ${\displaystyle H}$

- ${\displaystyle H}$

## Sources

[source:wikipedia] *Lie group* — Wikipedia. https://en.wikipedia.org/wiki/Lie_group. Retrieved 2026-04-17. Confidence: medium.
