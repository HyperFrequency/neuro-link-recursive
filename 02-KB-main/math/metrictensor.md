---
title: Metric Tensor
domain: math
sources:
  - slug: mathworld-metrictensor
    url: https://mathworld.wolfram.com/MetricTensor.html
    type: article
    ingested: 2026-04-17
    confidence: medium
confidence: medium
last_updated: 2026-04-17
sha256: 777401aab3a1519233ec37e1fcf13420990358ced6ca63fc522b7de1c3aef628
equations:
  - tex: 'g_(ij)'
    canonical_srepr: null
  - tex: 'dx_i'
    canonical_srepr: null
  - tex: 'ds^2=g_(11)dx_1^2+g_(12)dx_1dx_2+g_(22)dx_2^2+....'
    canonical_srepr: null
  - tex: 'g_(ij)=delta_(ij)'
    canonical_srepr: null
  - tex: 'i!=j'
    canonical_srepr: "Unequality(Symbol('i'), Symbol('j'))"
  - tex: 'i=j'
    canonical_srepr: "Equality(Symbol('i'), Symbol('j'))"
  - tex: 'ds^2=dx_1^2+dx_2^2+....'
    canonical_srepr: null
  - tex: 'g=g(·,·)'
    canonical_srepr: null
  - tex: 'u!=v'
    canonical_srepr: "Unequality(Symbol('u'), Symbol('v'))"
  - tex: 'T_pM'
    canonical_srepr: "Mul(Symbol('m'), Symbol('t_p'))"
  - tex: 'index(gx)=I'
    canonical_srepr: "Equality(Mul(Symbol('de'), Symbol('g'), Symbol('i'), Symbol('n'), Symbol('x'), Symbol('x')), I)"
  - tex: 'ds^2'
    canonical_srepr: "Pow(Symbol('ds'), Integer(2))"
  - tex: 'g^->^->'
    canonical_srepr: null
  - tex: '<kv,w>=k<v,w>=<v,kw>'
    canonical_srepr: null
  - tex: '<v+w,x>=<v,x>+<w,x>'
    canonical_srepr: null
  - tex: '<v,w+x>=<v,w>+<v,x>'
    canonical_srepr: null
  - tex: '<v,w>=<w,v>.'
    canonical_srepr: null
  - tex: '<v,v>>=0'
    canonical_srepr: null
  - tex: 'v=0'
    canonical_srepr: "Equality(Symbol('v'), Integer(0))"
  - tex: 'ds^2=dx_1^2+dx_2^2+...'
    canonical_srepr: null
  - tex: 'g_(alphabeta)'
    canonical_srepr: null
  - tex: 'g^(alphabeta)'
    canonical_srepr: null
  - tex: 'g^(alphabeta)=e^->^alpha·e^->^beta,'
    canonical_srepr: null
  - tex: 'g_(alphabeta)=e^->_alpha·e^->_beta,'
    canonical_srepr: null
  - tex: 'g_(munu)=(partialxi^alpha)/(partialx^mu)(partialxi^beta)/(partialx^nu)eta_(alphabeta),'
    canonical_srepr: null
  - tex: 'eta_(alphabeta)'
    canonical_srepr: null
  - tex: 'eta_(alphabeta)=[-1 0 0 0; 0 1 0 0; 0 0 1 0; 0 0 0 1].'
    canonical_srepr: null
  - tex: 'g=D^(T)etaD,'
    canonical_srepr: null
  - tex: 'D_(alphamu)'
    canonical_srepr: null
  - tex: '='
    canonical_srepr: null
  - tex: '(partialxi^alpha)/(partialx^mu)'
    canonical_srepr: "Mul(Pow(Mul(Symbol('a'), Symbol('a'), Symbol('i'), Symbol('l'), Symbol('p'), Symbol('r'), Symbol('t'), Symbol('u'), Pow(Symbol('x'), Symbol('m'))), Integer(-1)), Mul(Symbol('a'), Symbol('a'), Symbol('a'), Symbol('h'), Symbol('i'), Pow(Symbol('i'), Symbol('a')), Symbol('l'), Symbol('l'), Symbol('p'), Symbol('p'), Symbol('r'), Symbol('t'), Symbol('x')))"
  - tex: 'D_(alphamu)^(T)'
    canonical_srepr: null
  - tex: 'D_(mualpha).'
    canonical_srepr: null
  - tex: 'partial/(partialx^m)g_(il)g^(lk)=partial/(partialx^m)delta_i^k'
    canonical_srepr: null
  - tex: 'g_(il)(partialg^(lk))/(partialx^m)=-g^(lk)(partialg_(il))/(partialx^m)'
    canonical_srepr: null
  - tex: 'g=g_(11)g_(22)-g_(12)^2>0.'
    canonical_srepr: null
  - tex: 'g_(ik)g^(ij)=delta_k^j'
    canonical_srepr: null
  - tex: 'i=1,2,3,...,n'
    canonical_srepr: null
  - tex: 'g^(ij)'
    canonical_srepr: null
  - tex: 'g^(11)'
    canonical_srepr: null
  - tex: '(g_(22))/g'
    canonical_srepr: null
  - tex: 'g^(12)'
    canonical_srepr: null
  - tex: 'g^(21)=-(g_(12))/g'
    canonical_srepr: null
  - tex: 'g^(22)'
    canonical_srepr: null
  - tex: '(g_(11))/g.'
    canonical_srepr: null
  - tex: 'g_(betaalpha)'
    canonical_srepr: null
  - tex: 'g^(betaalpha).'
    canonical_srepr: null
  - tex: 'g_alpha^beta=g^beta_alpha=delta_alpha^beta,'
    canonical_srepr: null
  - tex: 'g_(alphaalpha)=1/(g^(alphaalpha)).'
    canonical_srepr: null
  - tex: 'cosphi=r_1^^·r_2^^=(r_1)/(g_1)·(r_2)/(g_2)=(g_(12))/(g_1g_2),'
    canonical_srepr: null
  - tex: 'sinphi=(sqrt(g))/(g_1g_2)'
    canonical_srepr: "Equality(Mul(Symbol('h'), Symbol('i'), Symbol('i'), Symbol('n'), Symbol('p'), Symbol('s')), Mul(Pow(Mul(Symbol('g_1'), Symbol('g_2')), Integer(-1)), Mul(Symbol('q'), Symbol('r'), Symbol('s'), Function('t')(Symbol('g')))))"
  - tex: '|r_1xr_2|=g_1g_2sinphi=sqrt(g).'
    canonical_srepr: null
  - tex: 'ds^2=dx_idx_i=g_(ij)dq_idq_j'
    canonical_srepr: null
  - tex: 'dx_i=(partialx_i)/(partialq_1)dq_1+(partialx_i)/(partialq_2)dq_2+(partialx_i)/(partialq_3)dq_3=(partialx_i)/(partialq_j)dq_j,'
    canonical_srepr: null
  - tex: 'g_(ij)=sum_(k)(partialx_k)/(partialq_i)(partialx_k)/(partialq_j).'
    canonical_srepr: null
  - tex: 'g_(ij)=0'
    canonical_srepr: null
  - tex: 'g_(11)dq_1^2+g_(22)dq_2^2+g_(33)dq_3^2'
    canonical_srepr: null
  - tex: '(h_1dq_1)^2+(h_2dq_2)^2+(h_3dq_3)^2,'
    canonical_srepr: null
  - tex: 'h_i=sqrt(g_(ii))'
    canonical_srepr: null
---

# Metric Tensor

_Ingested from Mathworld: <https://mathworld.wolfram.com/MetricTensor.html>._

Calculus and Analysis

Differential Geometry

Metrics

MathWorld Contributors

Budney

MathWorld Contributors

Stover

Roughly speaking, the metric tensor is a function which tells
 how to compute the distance between any two points in a given space .
 Its components can be viewed as multiplication factors which must be placed in front
 of the differential displacements in a generalized Pythagorean
 theorem :

In Euclidean space , where is the Kronecker delta (which is 0 for and 1 for ),
 reproducing the usual form of the Pythagorean
 theorem

In this way, the metric tensor can be thought of as a tool by which geometrical characteristics of a space can be "arithmetized" by way of introducing a sort of generalized coordinate system (Borisenko and Tarapov 1979).

In the above simplification, the space in question is most often a smooth manifold ,
 whereby a metric tensor is essentially a geometrical object taking two vector inputs and calculating either the squared length of a single vector or a scalar product of two different vectors (Misner et al. 1978). In this analogy, the inputs
 in question are most commonly tangent vectors lying
 in the tangent space for some point , a fact which facilitates the more common definition
 of metric tensor as an assignment of differentiable inner products to the collection of all tangent spaces
 of a differentiable manifold (O'Neill 1967). For this reason, some literature defines a
 metric tensor on a differentiable manifold to be nothing more than a symmetric non-degenerate bilinear form (Dodson and Poston 1991).

An equivalent definition can be stated using the language of tensor fields and indices thereon. Along these lines, some literature defines a metric tensor to be a symmetric tensor field on a smooth manifold so that, for all , is non-degenerate and for some nonnegative integer (Sachs and Wu 1977). Here, is called the index of and the expression refers to the index of the respective quadratic form. This definition seems to occur less commonly than
 those stated above.

Metric tensors have a number of synonyms across the literature. In particular, metric tensors are sometimes called fundamental tensors (Fleisch 2012) or geometric structures
 (O'Neill 1967). Manifolds endowed with metric tensors are sometimes called geometric
 manifolds (O'Neill 1967), while a pair consisting of a real vector space and a metric tensor is called a metric vector space (Dodson and
 Poston 1991). Symbolically, metric tensors are most often denoted by or , although the notations (O'Neill 1967), (Fleisch 2012), and (Dodson and Poston 1991) are also sometimes used.

When defined as a differentiable inner product of every tangent space of a differentiable manifold , the inner
 product associated to a metric tensor is most often assumed to be symmetric,
 non-degenerate, and bilinear , i.e., it is most often
 assumed to take two vectors as arguments and to produce a real
 number such that

Note, however, that the inner product need not be positive
definite , i.e., the condition

with equality if and only if need not always be satisfied. When the metric tensor is positive definite , it is called a Riemannian
 metric or, more precisely, a weak Riemannian
 metric ; otherwise, it is called non-Riemannian, (weak)
 pseudo-Riemannian , or semi-Riemannian ,
 though the latter two terms are sometimes used differently in different contexts.
 The simplest example of a Riemannian metric is the Euclidean
 metric discussed above; the simplest example of a non-Riemannian metric is the Minkowski
 metric of special relativity, the four-dimensional version of the more general
 metric of signature which induces the standard Lorentzian
 Inner Product on -dimensional Lorentzian space . In some literature, the condition
 of non-degeneracy is varied to include either weak or strong non-degeneracy (Marsden et al. 2002); one may also consider metric tensors whose associated quadratic
 forms fail to be symmetric, though this is far less common.

In coordinate notation (with respect to a chosen basis), the metric tensor and its inverse satisfy a number of fundamental identities, e.g.,

and

where is the matrix of metric coefficients. One example of identity ( 0 )
 comes from special relativity where is the matrix of metric coefficients for the Minkowski metric of signature , i.e.,

Generally speaking, identities ( 3 ), ( 2 ),
and ( 1 ) can be succinctly written as

where

What's more,

gives

and hence yields a quantitative relationship between a metric tensor and its inverse.

In the event that the metric is positive definite , the metric discriminants are positive .
 For a metric in two-space, this fact can be expressed quantitatively by the inequality

The orthogonality of contravariant and covariant metrics stipulated by

for gives linear equations relating the quantities and . Therefore, if metrics are known, the others can be determined, a fact summarized
 by saying that the existence of metric tensors gives a geometrical way of changing
 from contravariant tensors to covariant ones and vice versa (Dodson and Poston 1991).

In two-space,

Therefore, if is symmetric,

In any symmetric space (e.g., in Euclidean
space ),

and so

The angle between two parametric curves is given by

so

and

In arbitrary (finite) dimension, the line element can be written

where Einstein summation has been used. In
three dimensions, this yields

and so it follows that the metric tensor in three-space can be written as

Moreover, because for when working with respect to orthogonal coordinate
 systems, the line element for three-space becomes

where are called the scale factors . Many of these notions
 can be generalized to higher dimensions and to more general contexts.

### See also

Portions of this entry contributed by Christopher
Stover

### Explore with Wolfram|Alpha

More things to try:

metric tensor of infinite cone

metric tensor of finite cone vs finite cylinder

metric tensor of infinite elliptic cylinder vs helicoid

### References

### Referenced on Wolfram|Alpha

### Cite this as:

Stover, Christopher and Weisstein, Eric W. "Metric Tensor." From MathWorld --A
 Wolfram Resource. https://mathworld.wolfram.com/MetricTensor.html

### Subject classifications

Calculus and Analysis

Differential Geometry

Metrics

MathWorld Contributors

Budney

MathWorld Contributors

Stover

$$g_(ij)$$

$$dx_i$$

$$ds^2=g_(11)dx_1^2+g_(12)dx_1dx_2+g_(22)dx_2^2+....$$

$$g_(ij)=delta_(ij)$$

$$i!=j$$

$$i=j$$

$$ds^2=dx_1^2+dx_2^2+....$$

$$g=g(·,·)$$

$$u!=v$$

$$T_pM$$

$$index(gx)=I$$

$$g_(ij)$$

$$ds^2$$

$$g^->^->$$

$$<kv,w>=k<v,w>=<v,kw>$$

$$<v+w,x>=<v,x>+<w,x>$$

$$<v,w+x>=<v,w>+<v,x>$$

$$<v,w>=<w,v>.$$

$$<v,v>>=0$$

$$v=0$$

$$ds^2=dx_1^2+dx_2^2+...$$

$$g_(alphabeta)$$

$$g^(alphabeta)$$

$$g^(alphabeta)=e^->^alpha·e^->^beta,$$

$$g_(alphabeta)=e^->_alpha·e^->_beta,$$

$$g_(munu)=(partialxi^alpha)/(partialx^mu)(partialxi^beta)/(partialx^nu)eta_(alphabeta),$$

$$eta_(alphabeta)$$

$$eta_(alphabeta)$$

$$eta_(alphabeta)=[-1 0 0 0; 0 1 0 0; 0 0 1 0; 0 0 0 1].$$

$$g=D^(T)etaD,$$

$$D_(alphamu)$$

$$=$$

$$(partialxi^alpha)/(partialx^mu)$$

$$D_(alphamu)^(T)$$

$$=$$

$$D_(mualpha).$$

$$partial/(partialx^m)g_(il)g^(lk)=partial/(partialx^m)delta_i^k$$

$$g_(il)(partialg^(lk))/(partialx^m)=-g^(lk)(partialg_(il))/(partialx^m)$$

$$g=g_(11)g_(22)-g_(12)^2>0.$$

$$g_(ik)g^(ij)=delta_k^j$$

$$i=1,2,3,...,n$$

$$g_(ij)$$

$$g^(ij)$$

$$g^(11)$$

$$=$$

$$(g_(22))/g$$

$$g^(12)$$

$$=$$

$$g^(21)=-(g_(12))/g$$

$$g^(22)$$

$$=$$

$$(g_(11))/g.$$

$$g_(alphabeta)$$

$$=$$

$$g_(betaalpha)$$

$$g^(alphabeta)$$

$$=$$

$$g^(betaalpha).$$

$$g_alpha^beta=g^beta_alpha=delta_alpha^beta,$$

$$g_(alphaalpha)=1/(g^(alphaalpha)).$$

$$cosphi=r_1^^·r_2^^=(r_1)/(g_1)·(r_2)/(g_2)=(g_(12))/(g_1g_2),$$

$$sinphi=(sqrt(g))/(g_1g_2)$$

$$|r_1xr_2|=g_1g_2sinphi=sqrt(g).$$

$$ds^2=dx_idx_i=g_(ij)dq_idq_j$$

$$dx_i=(partialx_i)/(partialq_1)dq_1+(partialx_i)/(partialq_2)dq_2+(partialx_i)/(partialq_3)dq_3=(partialx_i)/(partialq_j)dq_j,$$

$$g_(ij)$$

$$g_(ij)=sum_(k)(partialx_k)/(partialq_i)(partialx_k)/(partialq_j).$$

$$g_(ij)=0$$

$$i!=j$$

$$ds^2$$

$$=$$

$$g_(11)dq_1^2+g_(22)dq_2^2+g_(33)dq_3^2$$

$$=$$

$$(h_1dq_1)^2+(h_2dq_2)^2+(h_3dq_3)^2,$$

$$h_i=sqrt(g_(ii))$$
