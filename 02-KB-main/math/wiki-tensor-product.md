---
title: Tensor product
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Tensor_product
confidence: medium
last_updated: 2026-04-17
word_count: 1503
---

# Tensor product

## Overview

Mathematical operation on vector spaces
For generalizations of this concept, see Tensor product of modules and Tensor product (disambiguation).
In mathematics, the tensor product  of two vector spaces  and  (over the same field) is a vector space to which is associated a bilinear map  that maps a pair , where , to an element of  denoted &#8288;&#8288;.

An element of the form  is called the tensor product of  and . An element of  is a tensor, and the tensor product of two vectors is sometimes called an elementary tensor or a decomposable tensor. The elementary tensors span  in the sense that every element of  is a sum of elementary tensors. If bases are given for  and , a basis of  is formed by all tensor products of a basis element of  and a basis element of .

The tensor product of two vector spaces captures the properties of all bilinear maps in the sense that a bilinear map from  into another vector space  factors uniquely through a linear map  (see §&#160;Universal property), i.e. the bilinear map is associated to a unique linear map from the tensor product  to .

## Definitions and constructions

The tensor product of two vector spaces is a vector space that is defined up to an isomorphism. There are several equivalent ways to define it. Most consist of defining explicitly a vector space that is called a tensor product, and, generally, the equivalence proof results almost immediately from the basic properties of the vector spaces that are so defined. 

The tensor product can also be defined through a universal property; see §&#160;Universal property, below. As for every universal property, all objects that satisfy the property are isomorphic through a unique isomorphism that is compatible with the universal property. When this definition is used, the other definitions may be viewed as constructions of objects satisfying the universal property and as proofs that there are objects satisfying the universal property, that is that tensor products exist.

## General tensors

- See also: Tensor
For non-negative integers r and s a type  tensor on a vector space V is an element of:
$^{r}(V)=\underbrace {V\otimes \cdots \otimes V} _{r}\otimes \underbrace {V^{*}\otimes \cdots \otimes V^{*}} _{s}=V^{\otimes r}\otimes \left(V^{*}\right)^{\otimes s}.}$
Here $}$ is the dual vector space (which consists of all linear maps f from V to the ground field K).

There is a product map, called the (tensor) product of tensors:
$^{r}(V)\otimes _{K}T_{s'}^{r'}(V)\to T_{s+s'}^{r+r'}(V).}$

It is defined by grouping all occurring "factors" V together: writing $}$ for an element of V and $}$ for an element of the dual space:
$\otimes f_{1})\otimes (v'_{1})=v_{1}\otimes v'_{1}\otimes f_{1}.}$

If V is finite dimensional, then picking a basis of V and the corresponding dual basis of $}$ naturally induces a basis of $^{r}(V)}$ (this basis is described in the article on Kronecker products). In terms of these bases, the components of a (tensor) product of two (or more) tensors can be computed. For example, if F and G are two covariant tensors of orders m and n respectively (i.e. $^{0}}$ and &#8288;$^{0}}$&#8288;), then the components of their tensor product are given by:
$i_{2}\cdots i_{m+n}}=F_{i_{1}i_{2}\cdots i_{m}}G_{i_{m+1}i_{m+2}i_{m+3}\cdots i_{m+n}}.}$

Thus, the components of the tensor product of two tensors are the ordinary product of the components of each tensor. Another example: let U be a tensor of type (1, 1) with components &#8288;$^{\alpha }}$&#8288;, and let V be a tensor of type  with components &#8288;$}$&#8288;. Then:
${}_{\beta }{}^{\gamma }=U^{\alpha }{}_{\beta }V^{\gamma }}$
and:
${}_{\sigma }=V^{\mu }U^{\nu }{}_{\sigma }.}$

Tensors equipped with their product operation form an algebra, called the tensor algebra, which is graded by the order of a tensor.

### From bases

Let V and W be two vector spaces over a field F, with respective bases $}$ and &#8288;$}$&#8288;.

The tensor product  of V and W is a vector space that has as a basis the set of all  with $}$ and &#8288;$}$&#8288;, regarded purely as symbols with no further meaning. This definition can be formalized in the following way (this formalization is rarely used in practice, as the preceding informal definition is generally sufficient):  is the set of functions from the Cartesian product $\times B_{W}}$ to F that have a finite number of nonzero values. The pointwise operations make  a vector space. The function that maps  to 1 and the other elements of $\times B_{W}}$ to 0 is denoted &#8288;&#8288;.

The set $,w\in B_{W}\}}$, called the tensor product of the bases $}$ and &#8288;$}$&#8288;, is straightforwardly a basis of &#8288;&#8288;.

Equivalently, we can  define  to be the set of bilinear forms on  that are nonzero at only a finite number of elements of &#8288;$\times B_{W}}$&#8288;. To see this, given   and a bilinear form &#8288;&#8288;,  we can decompose  and  in the bases $}$ and $}$ as:
$}x_{v}\,v\quad {\text{and}}\quad y=\sum _{w\in B_{W}}y_{w}\,w,}$
where only a finite number of $}$'s and $}$'s are nonzero, and find by the bilinearity of  that:
$}\sum _{w\in B_{W}}x_{v}y_{w}\,B(v,w)}$

Hence, we see that the value of  for any  is uniquely and totally determined by the values that it takes on &#8288;$\times B_{W}}$&#8288;. This lets us extend the maps  defined on $\times B_{W}}$ as before into bilinear maps  , by letting:
$}\sum _{w'\in B_{W}}x_{v'}y_{w'}\,(v\otimes w)(v',w')=x_{v}\,y_{w}.}$

Then we can express any bilinear form  as a (potentially infinite) formal linear combination of the  maps according to:
$}\sum _{w\in B_{W}}B(v,w)(v\otimes w)}$
making these maps similar to a Schauder basis for the vector space $}(V,W;F)}$ of all bilinear forms on &#8288;&#8288;. To instead have it be a proper Hamel basis, it only remains to add the requirement that  is nonzero at an only a finite number of elements of &#8288;$\times B_{W}}$&#8288;, and consider the subspace of such maps instead. 

In either construction, the tensor product of two vectors is defined from their decomposition on the bases. More precisely, taking the basis decompositions of  and  as before:
$$
x\otimes y&={\biggl (}\sum _{v\in B_{V}}x_{v}\,v{\biggr )}\otimes {\biggl (}\sum _{w\in B_{W}}y_{w}\,w{\biggr )}\\[5mu]&=\sum _{v\in B_{V}}\sum _{w\in B_{W}}x_{v}y_{w}\,v\otimes w.\end{aligned}}}
$$

This definition is quite clearly derived from the coefficients of  in the expansion by bilinearity of  using the bases $}$ and &#8288;$}$&#8288;, as done above. It is then straightforward to verify that with this definition, the map $:(x,y)\mapsto x\otimes y}$ is a bilinear map from  to  satisfying the universal property that any construction of the tensor product satisfies (see below). 

If arranged into a rectangular array, the coordinate vector of  is the outer product of the coordinate vectors of   and &#8288;&#8288;. Therefore, the tensor product is a generalization of the outer product, that is, an abstraction of it beyond coordinate vectors. 

A limitation of this definition of the tensor product is that, if one changes bases, a different tensor product is defined. However, the decomposition on one basis of the elements of the other basis defines a canonical isomorphism between the two tensor products of vector spaces, which allows identifying them. Also, contrarily to the two following alternative definitions, this definition cannot be extended into a definition of the tensor product of modules over a ring.

### As a quotient space

A construction of the tensor product that is basis independent can be obtained in the following way.

Let V and W be two vector spaces over a field F. 

One considers first a vector space L that has the Cartesian product  as a basis. That is, the basis elements of L are the pairs  with  and &#8288;&#8288;. To get such a vector space, one can define it as the vector space of the functions  that have a finite number of nonzero values and identifying  with the function that takes the value 1 on  and 0 otherwise.

Let R be the linear subspace of L that is spanned by the relations that the tensor product must satisfy. More precisely, R is spanned by the elements of one of the forms:

$$
(v_{1}+v_{2},w)&-(v_{1},w)-(v_{2},w),\\(v,w_{1}+w_{2})&-(v,w_{1})-(v,w_{2}),\\(sv,w)&-s(v,w),\\(v,sw)&-s(v,w),\end{aligned}}}
$$
where &#8288;$,v_{2}\in V}$&#8288;, $,w_{2}\in W}$ and &#8288;&#8288;.

Then, the tensor product is defined as the quotient space:


and the image of  in this quotient is denoted &#8288;&#8288;.

It is straightforward to prove that the result of this construction satisfies the universal property considered below. (A very similar construction can be used to define the tensor product of modules.)

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle V\otimes W}$

- ${\displaystyle V}$

- ${\displaystyle W}$

- ${\displaystyle V\times W\rightarrow V\otimes W}$

- ${\displaystyle (v,w)}$

- ${\displaystyle v\in V,w\in W}$

- ${\displaystyle V\otimes W}$

- ${\displaystyle v\otimes w}$

- ${\displaystyle v\otimes w}$

- ${\displaystyle v}$

- ${\displaystyle w}$

- ${\displaystyle V\otimes W}$

- ${\displaystyle V\otimes W}$

- ${\displaystyle V\otimes W}$

- ${\displaystyle V}$

- ${\displaystyle W}$

- ${\displaystyle V\otimes W}$

- ${\displaystyle V}$

- ${\displaystyle W}$

- ${\displaystyle V\times W}$

- ${\displaystyle Z}$

- ${\displaystyle V\otimes W\to Z}$

- ${\displaystyle V\otimes W}$

- ${\displaystyle Z}$

- ${\displaystyle B_{V}}$

- ${\displaystyle B_{W}}$

- ${\displaystyle V\otimes W}$

- ${\displaystyle v\otimes w}$

- ${\displaystyle v\in B_{V}}$

- ${\displaystyle w\in B_{W}}$

## Sources

[source:wikipedia] *Tensor product* — Wikipedia. https://en.wikipedia.org/wiki/Tensor_product. Retrieved 2026-04-17. Confidence: medium.
