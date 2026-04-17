---
title: Hilbert space
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Hilbert_space
confidence: medium
last_updated: 2026-04-17
word_count: 2599
---

# Hilbert space

## Overview

Type of vector space in math
For the space-filling curve, see Hilbert curve.

The state of a vibrating string can be modeled as a point in a Hilbert space. The decomposition of a vibrating string into its vibrations in distinct overtones is given by the projection of the point onto the coordinate axes in the space.
In mathematics, a Hilbert space is a real or complex inner product space that is also a complete metric space with respect to the metric induced by the inner product. It generalizes the notion of Euclidean space to infinite dimensions. The inner product, which is the analog of the dot product from vector calculus, allows lengths and angles to be defined. Furthermore, completeness means that there are enough limits in the space to allow the techniques of calculus to be used. A Hilbert space is a special case of a Banach space.

Hilbert spaces were studied beginning in the first decade of the 20th century by David Hilbert, Erhard Schmidt, and Frigyes Riesz. They are indispensable tools in the theories of partial differential equations, quantum mechanics, Fourier analysis (which includes applications to signal processing and heat transfer), and ergodic theory (which forms the mathematical underpinning of thermodynamics). John von Neumann coined the term Hilbert space for the abstract concept that underlies many of these diverse applications. The success of Hilbert space methods ushered in a very fruitful era for functional analysis. Apart from the classical Euclidean vector spaces, examples of Hilbert spaces include spaces of square-integrable functions, spaces of sequences, Sobolev spaces consisting of generalized functions, and Hardy spaces of holomorphic functions.

### Motivating example: Euclidean vector space

One of the most familiar examples of a Hilbert space is the Euclidean vector space consisting of three-dimensional vectors, denoted by $^{3}}$, and equipped with the dot product. The dot product takes two vectors x and y, and produces a real number x ⋅ y. If x and y are represented in Cartesian coordinates, then the dot product is defined by:
$$
x_{1}\\x_{2}\\x_{3}\end{pmatrix}}\cdot {\begin{pmatrix}y_{1}\\y_{2}\\y_{3}\end{pmatrix}}=x_{1}y_{1}+x_{2}y_{2}+x_{3}y_{3}\,.}
$$

The dot product satisfies the properties:

- It is symmetric in x and y: x ⋅ y = y ⋅ x.

- It is linear in its first argument: (ax1 + bx2) ⋅ y = a(x1 ⋅ y) + b(x2 ⋅ y) for any scalars a, b, and vectors x1, x2, and y.

- It is positive definite: for all vectors x, x ⋅ x ≥ 0 , with equality if and only if x = 0.
An operation on pairs of vectors that, like the dot product, satisfies these three properties is known as a (real) inner product. A vector space equipped with such an inner product is known as a (real) inner product space. Every finite-dimensional inner product space is also a Hilbert space. The basic feature of the dot product that connects it with Euclidean geometry is that it is related to both the length (or norm) of a vector, denoted &#x2016;x&#x2016;, and to the angle θ between two vectors x and y by means of the formula
$\cdot \mathbf {y} =\left\|\mathbf {x} \right\|\left\|\mathbf {y} \right\|\,\cos \theta \,.}$

Completeness means that a series of vectors (in blue) results in a well-defined net displacement vector (in orange).
Multivariable calculus in Euclidean space relies on the ability to compute limits, and to have useful criteria for concluding that limits exist. A mathematical series
$^{\infty }\mathbf {x} _{n}}$
consisting of vectors in R3 is absolutely convergent provided that the sum of the lengths converges as an ordinary series of real numbers:
$^{\infty }\|\mathbf {x} _{k}\|<\infty \,.}$
Just as with a series of scalars, a series of vectors that converges absolutely also converges to some limit vector L in the Euclidean space, in the sense that
$\left\|\mathbf {L} -\sum _{k=0}^{N}\mathbf {x} _{k}\right\|=0.}$
This property expresses the completeness of Euclidean space: that a series that converges absolutely also converges in the ordinary sense.

Hilbert spaces are often taken over the complex numbers. The complex plane denoted by C is equipped with a notion of magnitude, the complex modulus &#124;z&#124;, which is defined as the square root of the product of z with its complex conjugate:
$=z{\overline {z}}\,.}$

If z = x + iy is a decomposition of z into its real and imaginary parts, then the modulus is the usual Euclidean two-dimensional length:
$+y^{2}}}\,.}$

The inner product of a pair of complex numbers z and w is the product of z with the complex conjugate of w:
$}\,.}$

This is complex-valued. The real part of ⟨z, w⟩ gives the usual two-dimensional Euclidean dot product.

A second example is the space C2 whose elements are pairs of complex numbers z = (z1, z2). Then an inner product of z with another such vector w = (w1, w2) is given by
${\overline {w}}_{1}+z_{2}{\overline {w}}_{2}\,.}$

The real part of ⟨z, w⟩ is then the four-dimensional Euclidean dot product. This inner product is Hermitian symmetric, which means that the result of interchanging z and w is the complex conjugate:
$}\,.}$

### Definition

A Hilbert space is a real or complex inner product space that is also a complete metric space with respect to the distance function induced by the inner product.

To say that a complex vector space H is a complex inner product space means that there is an inner product  associating a complex number to each pair of elements  of H that satisfies the following properties:

- The inner product is conjugate symmetric; that is, the inner product of a pair of elements is equal to the complex conjugate of the inner product of the swapped elements: $}\,.}$ Importantly, this implies that  is a real number.

- The inner product is linear in its first argument. For all complex numbers  and  $+bx_{2},y\rangle =a\langle x_{1},y\rangle +b\langle x_{2},y\rangle \,.}$

- The inner product of an element with itself is positive definite: $$
{4}\langle x,x\rangle >0&\quad {\text{ if }}x\neq 0,\\\langle x,x\rangle =0&\quad {\text{ if }}x=0\,.\end{alignedat}}}
$$
It follows from properties 1 and 2 that a complex inner product is antilinear, also called conjugate linear, in its second argument, meaning that
$+by_{2}\rangle ={\bar {a}}\langle x,y_{1}\rangle +{\bar {b}}\langle x,y_{2}\rangle \,.}$

A real inner product space is defined in the same way, except that H is a real vector space and the inner product takes real values. Such an inner product will be a bilinear map and  will form a dual system.

Illustration of triangle inequality with distance function on each side
The norm is the real-valued function
$}\,,}$
and the distance  between two points  in H is defined in terms of the norm by
$}\,.}$
Here,  is a distance function meaning firstly that it is symmetric in  and  secondly that the distance between  and itself is zero, and otherwise the distance between  and  must be positive, and lastly that the triangle inequality holds, meaning that the length of one leg of a triangle xyz cannot exceed the sum of the lengths of the other two legs:


This last property is ultimately a consequence of the more fundamental Cauchy–Schwarz inequality, which asserts

with equality if and only if  and  are linearly dependent.

With a distance function defined in this way, any inner product space is a metric space, and sometimes is known as a pre-Hilbert space. Any pre-Hilbert space that is additionally also a complete space is a Hilbert space.

The completeness of H is expressed using a form of the Cauchy criterion for sequences in H: a pre-Hilbert space H is complete if every Cauchy sequence converges with respect to this norm to an element in the space. Completeness can be characterized by the following equivalent condition: if a series of vectors
$^{\infty }u_{k}}$
converges absolutely in the sense that
$^{\infty }\|u_{k}\|<\infty \,,}$
then the series converges in H, in the sense that the partial sums converge to an element of H.

As a complete normed space, Hilbert spaces are by definition also Banach spaces. As such they are topological vector spaces, in which topological notions like the openness and closedness of subsets are well defined. Of special importance is the notion of a closed linear subspace of a Hilbert space that, with the inner product induced by restriction, is also complete (being a closed set in a complete metric space) and therefore a Hilbert space in its own right.

### Second example: sequence spaces

The sequence space ${\textstyle \ell ^{2}}$ consists of all infinite sequences z = (z1, z2, ...) of complex numbers such that the series of its squared norms  converges:
$^{\infty }|z_{n}|^{2}}$

The inner product on l2 is defined by:
$,\mathbf {w} \rangle =\sum _{n=1}^{\infty }z_{n}{\overline {w}}_{n}\,,}$

The series for the inner product converges as a consequence of the Cauchy–Schwarz inequality and the assumed convergence of the two series of squared norms.

Completeness of the space holds provided that whenever a series of elements from ${\textstyle \ell ^{2}}$ converges absolutely (in norm), then it converges to an element of ${\textstyle \ell ^{2}}$. The proof is basic in mathematical analysis, and permits mathematical series of elements of the space to be manipulated with the same ease as series of complex numbers (or vectors in a finite-dimensional Euclidean space).

## History

David Hilbert
Prior to the development of Hilbert spaces, other generalizations of Euclidean spaces were known to mathematicians and physicists. In particular, the idea of an abstract linear space (vector space) had gained some traction towards the end of the 19th century: this is a space whose elements can be added together and multiplied by scalars (such as real or complex numbers) without necessarily identifying these elements with "geometric" vectors, such as position and momentum vectors in physical systems. Other objects studied by mathematicians at the turn of the 20th century, in particular spaces of sequences (including series) and spaces of functions, can naturally be thought of as linear spaces. Functions, for instance, can be added together or multiplied by constant scalars, and these operations obey the algebraic laws satisfied by addition and scalar multiplication of spatial vectors.

In the first decade of the 20th century, parallel developments led to the introduction of Hilbert spaces. The first of these was the observation, which arose during David Hilbert and Erhard Schmidt's study of integral equations, that two square-integrable real-valued functions f and g on an interval [a, b] have an inner product

$^{b}f(x)g(x)\,\mathrm {d} x}$
that has many of the familiar properties of the Euclidean dot product. In particular, the idea of an orthogonal family of functions has meaning. Schmidt exploited the similarity of this inner product with the usual dot product to prove an analog of the spectral decomposition for an operator of the form

$^{b}K(x,y)f(y)\,\mathrm {d} y}$
where K is a continuous function symmetric in x and y. The resulting eigenfunction expansion expresses the function K as a series of the form

$\lambda _{n}\varphi _{n}(x)\varphi _{n}(y)}$
where the functions φn are orthogonal in the sense that ⟨φn, φm⟩ = 0 for all n ≠ m. The individual terms in this series are sometimes referred to as elementary product solutions. However, there are eigenfunction expansions that fail to converge in a suitable sense to a square-integrable function: the missing ingredient, which ensures convergence, is completeness.

The second development was the Lebesgue integral, an alternative to the Riemann integral introduced by Henri Lebesgue in 1904. The Lebesgue integral made it possible to integrate a much broader class of functions. In 1907, Frigyes Riesz and Ernst Sigismund Fischer independently proved that the space L2 of square Lebesgue-integrable functions is a complete metric space. As a consequence of the interplay between geometry and completeness, the 19th century results of Joseph Fourier, Friedrich Bessel and Marc-Antoine Parseval on trigonometric series easily carried over to these more general spaces, resulting in a geometrical and analytical apparatus now usually known as the Riesz–Fischer theorem.

Further basic results were proved in the early 20th century. For example, the Riesz representation theorem was independently established by Maurice Fréchet and Frigyes Riesz in 1907. John von Neumann coined the term abstract Hilbert space in his work on unbounded Hermitian operators. Although other mathematicians such as Hermann Weyl and Norbert Wiener had already studied particular Hilbert spaces in great detail, often from a physically motivated point of view, von Neumann gave the first complete and axiomatic treatment of them. Von Neumann later used them in his seminal work on the foundations of quantum mechanics, and in his continued work with Eugene Wigner. The name "Hilbert space" was soon adopted by others, for example by Hermann Weyl in his book on quantum mechanics and the theory of groups.

The significance of the concept of a Hilbert space was underlined with the realization that it offers one of the best mathematical formulations of quantum mechanics. In short, the states of a quantum mechanical system are vectors in a certain Hilbert space, the observables are hermitian operators on that space, the symmetries of the system are unitary operators, and measurements are orthogonal projections. The relation between quantum mechanical symmetries and unitary operators provided an impetus for the development of the unitary representation theory of groups, initiated in the 1928 work of Hermann Weyl. On the other hand, in the early 1930s it became clear that classical mechanics can be described in terms of Hilbert space (Koopman–von Neumann classical mechanics) and that certain properties of classical dynamical systems can be analyzed using Hilbert space techniques in the framework of ergodic theory.

The algebra of observables in quantum mechanics is naturally an algebra of operators defined on a Hilbert space, according to Werner Heisenberg's matrix mechanics formulation of quantum theory. Von Neumann began investigating operator algebras in the 1930s, as rings of operators on a Hilbert space. The kind of algebras studied by von Neumann and his contemporaries are now known as von Neumann algebras. In the 1940s, Israel Gelfand, Mark Naimark and Irving Segal gave a definition of a kind of operator algebras called C*-algebras that on the one hand made no reference to an underlying Hilbert space, and on the other extrapolated many of the useful features of the operator algebras that had previously been studied. The spectral theorem for self-adjoint operators in particular that underlies much of the existing Hilbert space theory was generalized to C*-algebras. These techniques are now basic in abstract harmonic analysis and representation theory.

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle \mathbf {R} ^{3}}$

$$
{\displaystyle {\begin{pmatrix}x_{1}\\x_{2}\\x_{3}\end{pmatrix}}\cdot {\begin{pmatrix}y_{1}\\y_{2}\\y_{3}\end{pmatrix}}=x_{1}y_{1}+x_{2}y_{2}+x_{3}y_{3}\,.}
$$

$$
{\displaystyle \mathbf {x} \cdot \mathbf {y} =\left\|\mathbf {x} \right\|\left\|\mathbf {y} \right\|\,\cos \theta \,.}
$$

- ${\displaystyle \sum _{n=0}^{\infty }\mathbf {x} _{n}}$

- ${\displaystyle \sum _{k=0}^{\infty }\|\mathbf {x} _{k}\|<\infty \,.}$

$$
{\displaystyle \lim _{N\to \infty }\left\|\mathbf {L} -\sum _{k=0}^{N}\mathbf {x} _{k}\right\|=0.}
$$

- ${\displaystyle |z|^{2}=z{\overline {z}}\,.}$

- ${\displaystyle |z|={\sqrt {x^{2}+y^{2}}}\,.}$

- ${\displaystyle \langle z,w\rangle =z{\overline {w}}\,.}$

$$
{\displaystyle \langle z,w\rangle =z_{1}{\overline {w}}_{1}+z_{2}{\overline {w}}_{2}\,.}
$$

- ${\displaystyle \langle w,z\rangle ={\overline {\langle z,w\rangle }}\,.}$

- ${\displaystyle \langle x,y\rangle }$

- ${\displaystyle x,y}$

- ${\displaystyle \langle y,x\rangle ={\overline {\langle x,y\rangle }}\,.}$

- ${\displaystyle \langle x,x\rangle }$

- ${\displaystyle a}$

- ${\displaystyle b,}$

$$
{\displaystyle \langle ax_{1}+bx_{2},y\rangle =a\langle x_{1},y\rangle +b\langle x_{2},y\rangle \,.}
$$

$$
{\displaystyle {\begin{alignedat}{4}\langle x,x\rangle >0&\quad {\text{ if }}x\neq 0,\\\langle x,x\rangle =0&\quad {\text{ if }}x=0\,.\end{alignedat}}}
$$

$$
{\displaystyle \langle x,ay_{1}+by_{2}\rangle ={\bar {a}}\langle x,y_{1}\rangle +{\bar {b}}\langle x,y_{2}\rangle \,.}
$$

- ${\displaystyle (H,H,\langle \cdot ,\cdot \rangle )}$

- ${\displaystyle \|x\|={\sqrt {\langle x,x\rangle }}\,,}$

- ${\displaystyle d}$

- ${\displaystyle x,y}$

- ${\displaystyle d(x,y)=\|x-y\|={\sqrt {\langle x-y,x-y\rangle }}\,.}$

- ${\displaystyle d(x,y)}$

- ${\displaystyle x}$

- ${\displaystyle y,}$

- ${\displaystyle x}$

- ${\displaystyle x}$

## Sources

[source:wikipedia] *Hilbert space* — Wikipedia. https://en.wikipedia.org/wiki/Hilbert_space. Retrieved 2026-04-17. Confidence: medium.
