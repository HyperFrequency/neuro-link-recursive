---
title: Spectral theorem
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Spectral_theorem
confidence: medium
last_updated: 2026-04-17
word_count: 1279
---

# Spectral theorem

## Overview

Result about when a matrix can be diagonalized
In linear algebra and functional analysis, a spectral theorem is a result about when a linear operator or matrix can be diagonalized (that is, represented as a diagonal matrix in some basis). This is extremely useful because computations involving a diagonalizable matrix can often be reduced to much simpler computations involving the corresponding diagonal matrix. The concept of diagonalization is relatively straightforward for operators on finite-dimensional vector spaces but requires some modification for operators on infinite-dimensional spaces. In general, the spectral theorem identifies a class of linear operators that can be modeled by multiplication operators, which are as simple as one can hope to find. In more abstract language, the spectral theorem is a statement about commutative C*-algebras. See also spectral theory for a historical perspective.

Examples of operators to which the spectral theorem applies are self-adjoint operators or more generally normal operators on Hilbert spaces.

The spectral theorem also provides a canonical decomposition, called the spectral decomposition, of the underlying vector space on which the operator acts.

### Hermitian maps and Hermitian matrices

We begin by considering a Hermitian matrix on $^{n}}$ (but the following discussion will be adaptable to the more restrictive case of symmetric matrices on $^{n}}$). We consider a Hermitian map A on a finite-dimensional complex inner product space V endowed with a positive definite sesquilinear inner product . The Hermitian condition on  means that for all x, y ∈ V,


An equivalent condition is that A* = A, where A* is the Hermitian conjugate of A. In the case that A is identified with a Hermitian matrix, the matrix of A* is equal to its conjugate transpose. (If A is a real matrix, then this is equivalent to AT = A, that is, A is a symmetric matrix.)

This condition implies that all eigenvalues of a Hermitian map are real: To see this, it is enough to apply it to the case when x = y is an eigenvector. (Recall that an eigenvector of a linear map A is a non-zero vector v such that Av = λv for some scalar λ. The value λ is the corresponding eigenvalue. Moreover, the eigenvalues are roots of the characteristic polynomial.)

Theorem—If A is Hermitian on V, then there exists an orthonormal basis of V consisting of eigenvectors of A. Each eigenvalue of A is real.

We provide a sketch of a proof for the case where the underlying field of scalars is the complex numbers.

By the fundamental theorem of algebra, applied to the characteristic polynomial of A, there is at least one complex eigenvalue λ1 and corresponding eigenvector v1, which must by definition be non-zero. Then since 
$\langle v_{1},v_{1}\rangle =\langle A(v_{1}),v_{1}\rangle =\langle v_{1},A(v_{1})\rangle ={\bar {\lambda }}_{1}\langle v_{1},v_{1}\rangle ,}$ 
we find that λ1 is real. Now consider the space $}^{n-1}={\text{span}}(v_{1})^{\perp }}$, the orthogonal complement of v1. By Hermiticity, $}^{n-1}}$ is an invariant subspace of A. To see that, consider any $}^{n-1}}$ so that $\rangle =0}$ by definition of $}^{n-1}}$.  To satisfy invariance, we need to check if $}^{n-1}}$. This is true because, $\rangle =\langle k,A(v_{1})\rangle =\langle k,\lambda _{1}v_{1}\rangle =0}$. Applying the same argument to $}^{n-1}}$ shows that A has at least one real eigenvalue $}$ and corresponding eigenvector $\in {\mathcal {K}}^{n-1}\perp v_{1}}$. This can be used to build another invariant subspace $}^{n-2}={\text{span}}(\{v_{1},v_{2}\})^{\perp }}$. Finite induction then finishes the proof.

The matrix representation of A in a basis of eigenvectors is diagonal, and by the construction the proof gives a basis of mutually orthogonal eigenvectors; by choosing them to be unit vectors one obtains  an orthonormal basis of eigenvectors. A can be written as a linear combination of pairwise orthogonal projections, called its spectral decomposition. Let
$=\{v\in V:Av=\lambda v\}}$
be the eigenspace corresponding to an eigenvalue . Note that the definition does not depend on any choice of specific eigenvectors. In general, V is the orthogonal direct sum of the spaces $}$ where the  ranges over the spectrum of .

When the matrix being decomposed is Hermitian, the spectral decomposition is a special case of the Schur decomposition (see the proof in case of normal matrices below).

### Spectral decomposition and the singular value decomposition

The spectral decomposition is a special case of the singular value decomposition, which states that any matrix  $^{m\times n}}$ can be expressed as 
$}$, where $^{m\times m}}$ and $^{n\times n}}$ are unitary matrices and $^{m\times n}}$ is a diagonal matrix. The diagonal entries of  are uniquely determined by  and are known as the singular values of . If  is Hermitian, then $=A}$ and $=U\Sigma V^{*}}$ which implies .

### Normal matrices

Main article: Normal matrix
The spectral theorem extends to a more general class of matrices. Let A be an operator on a finite-dimensional inner product space. A is said to be normal  if A*A = AA*. 

One can show that A is normal if and only if it is unitarily diagonalizable using the Schur decomposition. That is, any matrix can be written as A = UTU*, where U is unitary and T is upper triangular.
If A is normal, then one sees that TT* = T*T. Therefore, T must be diagonal since a normal upper triangular matrix is diagonal (see normal matrix). The converse is obvious.

In other words, A is normal if and only if there exists a unitary matrix U such that
$,}$
where D is a diagonal matrix. Then, the entries of the diagonal of D are the eigenvalues of A. The column vectors of U are the eigenvectors of A and they are orthonormal. Unlike the Hermitian case, the entries of D need not be real.

## Compact self-adjoint operators

- See also: Compact operator on Hilbert space §&#160;Spectral theorem
In the more general setting of Hilbert spaces, which may have an infinite dimension, the statement of the spectral theorem for compact self-adjoint operators is virtually the same as in the finite-dimensional case.

- 
Theorem—Suppose A is a compact self-adjoint operator on a (real or complex) Hilbert space V. Then there is an orthonormal basis of V consisting of eigenvectors of A. Each eigenvalue is real.

As for Hermitian matrices, the key point is to prove the existence of at least one nonzero eigenvector. One cannot rely on determinants to show existence of eigenvalues, but one can use a maximization argument analogous to the variational characterization of eigenvalues.

If the compactness assumption is removed, then it is not true that every self-adjoint operator has eigenvectors; see #Possible absence of eigenvectors.

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle \mathbb {C} ^{n}}$

- ${\displaystyle \mathbb {R} ^{n}}$

- ${\displaystyle \langle \cdot ,\cdot \rangle }$

- ${\displaystyle A}$

- ${\displaystyle \langle Ax,y\rangle =\langle x,Ay\rangle .}$

$$
{\displaystyle \lambda _{1}\langle v_{1},v_{1}\rangle =\langle A(v_{1}),v_{1}\rangle =\langle v_{1},A(v_{1})\rangle ={\bar {\lambda }}_{1}\langle v_{1},v_{1}\rangle ,}
$$

- ${\displaystyle {\mathcal {K}}^{n-1}={\text{span}}(v_{1})^{\perp }}$

- ${\displaystyle {\mathcal {K}}^{n-1}}$

- ${\displaystyle k\in {\mathcal {K}}^{n-1}}$

- ${\displaystyle \langle k,v_{1}\rangle =0}$

- ${\displaystyle {\mathcal {K}}^{n-1}}$

- ${\displaystyle A(k)\in {\mathcal {K}}^{n-1}}$

$$
{\displaystyle \langle A(k),v_{1}\rangle =\langle k,A(v_{1})\rangle =\langle k,\lambda _{1}v_{1}\rangle =0}
$$

- ${\displaystyle {\mathcal {K}}^{n-1}}$

- ${\displaystyle \lambda _{2}}$

- ${\displaystyle v_{2}\in {\mathcal {K}}^{n-1}\perp v_{1}}$

- ${\displaystyle {\mathcal {K}}^{n-2}={\text{span}}(\{v_{1},v_{2}\})^{\perp }}$

- ${\displaystyle V_{\lambda }=\{v\in V:Av=\lambda v\}}$

- ${\displaystyle \lambda }$

- ${\displaystyle V_{\lambda }}$

- ${\displaystyle \lambda }$

- ${\displaystyle A}$

- ${\displaystyle A\in \mathbb {C} ^{m\times n}}$

- ${\displaystyle A=U\Sigma V^{*}}$

- ${\displaystyle U\in \mathbb {C} ^{m\times m}}$

- ${\displaystyle V\in \mathbb {C} ^{n\times n}}$

- ${\displaystyle \Sigma \in \mathbb {R} ^{m\times n}}$

- ${\displaystyle \Sigma }$

- ${\displaystyle A}$

- ${\displaystyle A}$

## Sources

[source:wikipedia] *Spectral theorem* — Wikipedia. https://en.wikipedia.org/wiki/Spectral_theorem. Retrieved 2026-04-17. Confidence: medium.
