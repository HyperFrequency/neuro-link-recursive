---
title: Partial differential equation
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Partial_differential_equation
confidence: medium
last_updated: 2026-04-17
word_count: 1522
---

# Partial differential equation

## Overview

Type of differential equation

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

Classification
Types

## Introduction and examples

One of the most important partial differential equations, with many applications, is Laplace's equation.
For a function u(x, y, z) of three variables, Laplace's equation is
$u}{\partial x^{2}}}+{\frac {\partial ^{2}u}{\partial y^{2}}}+{\frac {\partial ^{2}u}{\partial z^{2}}}=0.}$
A function that obeys this equation is called a harmonic function.
Such functions were widely studied in the 19th century due to their relevance for classical mechanics. For example, the equilibrium temperature distribution of a homogeneous solid is a harmonic function. It is usually a matter of straightforward computation to check whether or not a given function is harmonic. For instance
${\sqrt {x^{2}-2x+y^{2}+z^{2}+1}}},}$ 
$\sin(3y)\cos(4z)}$
and $-y^{2}-z^{2}}$
are all harmonic, while

is not. It may be surprising that these examples of harmonic functions are of such different forms. This is a reflection of the fact that they are not special cases of a "general solution formula" of Laplace's equation. This is in striking contrast to the case of many ordinary differential equations (ODEs), where many introductory textbooks aim to find methods leading to general solutions. For Laplace's equation, as for a large number of partial differential equations, such solution formulas do not exist.

This can also be seen in the case of the following PDE: for a function v(x, y) of two variables, consider the equation
$v}{\partial x\partial y}}=0.}$
It can be directly checked that any function v of the form v(x, y) = f(x) + g(y), for any single-variable (differentiable) functions f and g whatsoever, satisfies this condition. This is far beyond the choices available in ODE solution formulas, which typically allow the free choice of some numbers. In the study of PDEs, one generally has the free choice of functions.

The nature of this choice varies from PDE to PDE. To understand it for any given equation, existence and uniqueness theorems are usually important organizational principles. In many introductory textbooks, the role of existence and uniqueness theorems for ODE can be somewhat opaque; the existence half is usually unnecessary, since one can directly check any proposed solution formula, while the uniqueness half is often only present in the background to ensure that a proposed solution formula is as general as possible. By contrast, for PDE, existence and uniqueness theorems are often the only means by which one can navigate through the plethora of different solutions at hand. For this reason, they are also fundamental when carrying out a purely numerical simulation, as one must have an understanding of what data is to be prescribed by the user and what is to be left to the computer to calculate.

To discuss such existence and uniqueness theorems, it is necessary to be precise about the domain of the "unknown function". Otherwise, speaking only in terms such as "a function of two variables", it is impossible to meaningfully formulate the results. That is, the domain of the unknown function must be regarded as part of the structure of the PDE itself.

The following provides two classic examples of such existence and uniqueness theorems. Even though the two PDEs in question are so similar, there is a striking difference in behavior: for the first PDE, one has the free prescription of a single function, while for the second PDE, one has the free prescription of two functions.

- Let B denote the unit-radius disk around the origin in the plane. For any continuous function U on the unit circle, there is exactly one function u on B such that $u}{\partial x^{2}}}+{\frac {\partial ^{2}u}{\partial y^{2}}}=0}$ and whose restriction to the unit circle is given by U.

- For any functions f and g on the real line R, there is exactly one function u on R × (−1, 1) such that $u}{\partial x^{2}}}-{\frac {\partial ^{2}u}{\partial y^{2}}}=0}$ and with u(x, 0) = f(x) and &#8288;∂u/∂y&#8288;(x, 0) = g(x) for all values of x.
Even more phenomena are possible. For instance, the following PDE, arising naturally in the field of differential geometry, illustrates an example where there is a simple and completely explicit solution formula, but with the free choice of only three numbers and not even one function.

- If u is a function on R2 with ${\partial x}}{\frac {\frac {\partial u}{\partial x}}{\sqrt {1+\left({\frac {\partial u}{\partial x}}\right)^{2}+\left({\frac {\partial u}{\partial y}}\right)^{2}}}}+{\frac {\partial }{\partial y}}{\frac {\frac {\partial u}{\partial y}}{\sqrt {1+\left({\frac {\partial u}{\partial x}}\right)^{2}+\left({\frac {\partial u}{\partial y}}\right)^{2}}}}=0,}$ then there are numbers a, b, and c with u(x, y) = ax + by + c.
In contrast to the earlier examples, this PDE is nonlinear, owing to the square roots and the squares. A linear PDE is one such that, if it is homogeneous, the sum of any two solutions is also a solution, and any constant multiple of any solution is also a solution.

## Definition

A partial differential equation is an equation that involves an unknown function of  variables and (some of) its partial derivatives. That is, for the unknown function
$,}$
of variables $,\dots ,x_{n})}$ belonging to the open subset  of $^{n}}$, the $}$-order partial differential equation is defined as 
$u,D^{k-1}u,\dots ,Du,u,x]=0,}$
where
$^{n^{k}}\times \mathbb {R} ^{n^{k-1}}\dots \times \mathbb {R} ^{n}\times \mathbb {R} \times U\rightarrow \mathbb {R} ,}$
and  is the partial derivative operator.

### Notation

Main article: Notation for differentiation §&#160;Partial derivatives
When writing PDEs, it is common to denote partial derivatives using subscripts. For example:
$={\frac {\partial u}{\partial x}},\quad u_{xx}={\frac {\partial ^{2}u}{\partial x^{2}}},\quad u_{xy}={\frac {\partial ^{2}u}{\partial y\,\partial x}}={\frac {\partial }{\partial y}}\left({\frac {\partial u}{\partial x}}\right).}$
In the general situation that u is a function of n variables, then ui denotes the first partial derivative relative to the i-th input, uij denotes the second partial derivative relative to the i-th and j-th inputs, and so on.

The Greek letter Δ denotes the Laplace operator; if u is a function of n variables, then
$+u_{22}+\cdots +u_{nn}.}$
In the physics literature, the Laplace operator is often denoted by ∇2; in the mathematics literature, ∇2u may also denote the Hessian matrix of u.

### Linear and nonlinear equations

A PDE is called linear if it is linear in the unknown and its derivatives. For example, for a function u of x and y, a second order linear PDE is of the form
$(x,y)u_{xx}+a_{2}(x,y)u_{xy}+a_{3}(x,y)u_{yx}+a_{4}(x,y)u_{yy}+a_{5}(x,y)u_{x}+a_{6}(x,y)u_{y}+a_{7}(x,y)u=f(x,y)}$
where ai and f are functions of the independent variables x and y only. (Often the mixed-partial derivatives uxy and uyx will be equated, but this is not required for the discussion of linearity.)
If the ai are constants (independent of x and y) then the PDE is called linear with constant coefficients. If f is zero everywhere then the linear PDE is homogeneous, otherwise it is inhomogeneous. (This is separate from asymptotic homogenization, which studies the effects of high-frequency oscillations in the coefficients upon solutions to PDEs.)

Nearest to linear PDEs are semi-linear PDEs, where only the highest order derivatives appear as linear terms, with coefficients that are functions of the independent variables. The lower order derivatives and the unknown function may appear arbitrarily. For example, a general second order semi-linear PDE in two variables is
$(x,y)u_{xx}+a_{2}(x,y)u_{xy}+a_{3}(x,y)u_{yx}+a_{4}(x,y)u_{yy}+f(u_{x},u_{y},u,x,y)=0}$

In a quasilinear PDE the highest order derivatives likewise appear only as linear terms, but with coefficients possibly functions of the unknown and lower-order derivatives:
$(u_{x},u_{y},u,x,y)u_{xx}+a_{2}(u_{x},u_{y},u,x,y)u_{xy}+a_{3}(u_{x},u_{y},u,x,y)u_{yx}+a_{4}(u_{x},u_{y},u,x,y)u_{yy}+f(u_{x},u_{y},u,x,y)=0}$
Many of the fundamental PDEs in physics are quasilinear, such as the Einstein equations of general relativity and the Navier–Stokes equations describing fluid motion.

A PDE without any linearity properties is called fully nonlinear, and possesses nonlinearities on one or more of the highest-order derivatives. An example is the Monge–Ampère equation, which arises in differential geometry.

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

$$
{\displaystyle {\frac {\partial ^{2}u}{\partial x^{2}}}+{\frac {\partial ^{2}u}{\partial y^{2}}}+{\frac {\partial ^{2}u}{\partial z^{2}}}=0.}
$$

- ${\displaystyle u(x,y,z)={\frac {1}{\sqrt {x^{2}-2x+y^{2}+z^{2}+1}}},}$

- ${\displaystyle u(x,y,z)=e^{5x}\sin(3y)\cos(4z)}$

- ${\displaystyle u(x,y,z)=2x^{2}-y^{2}-z^{2}}$

- ${\displaystyle u(x,y,z)=\sin(xy)+z}$

- ${\displaystyle {\frac {\partial ^{2}v}{\partial x\partial y}}=0.}$

$$
{\displaystyle {\frac {\partial ^{2}u}{\partial x^{2}}}+{\frac {\partial ^{2}u}{\partial y^{2}}}=0}
$$

$$
{\displaystyle {\frac {\partial ^{2}u}{\partial x^{2}}}-{\frac {\partial ^{2}u}{\partial y^{2}}}=0}
$$

$$
{\displaystyle {\frac {\partial }{\partial x}}{\frac {\frac {\partial u}{\partial x}}{\sqrt {1+\left({\frac {\partial u}{\partial x}}\right)^{2}+\left({\frac {\partial u}{\partial y}}\right)^{2}}}}+{\frac {\partial }{\partial y}}{\frac {\frac {\partial u}{\partial y}}{\sqrt {1+\left({\frac {\partial u}{\partial x}}\right)^{2}+\left({\frac {\partial u}{\partial y}}\right)^{2}}}}=0,}
$$

- ${\displaystyle n\geq 2}$

- ${\displaystyle u:U\rightarrow \mathbb {R} ,}$

- ${\displaystyle x=(x_{1},\dots ,x_{n})}$

- ${\displaystyle U}$

- ${\displaystyle \mathbb {R} ^{n}}$

- ${\displaystyle k^{th}}$

- ${\displaystyle F[D^{k}u,D^{k-1}u,\dots ,Du,u,x]=0,}$

$$
{\displaystyle F:\mathbb {R} ^{n^{k}}\times \mathbb {R} ^{n^{k-1}}\dots \times \mathbb {R} ^{n}\times \mathbb {R} \times U\rightarrow \mathbb {R} ,}
$$

- ${\displaystyle D}$

$$
{\displaystyle u_{x}={\frac {\partial u}{\partial x}},\quad u_{xx}={\frac {\partial ^{2}u}{\partial x^{2}}},\quad u_{xy}={\frac {\partial ^{2}u}{\partial y\,\partial x}}={\frac {\partial }{\partial y}}\left({\frac {\partial u}{\partial x}}\right).}
$$

- ${\displaystyle \Delta u=u_{11}+u_{22}+\cdots +u_{nn}.}$

$$
{\displaystyle a_{1}(x,y)u_{xx}+a_{2}(x,y)u_{xy}+a_{3}(x,y)u_{yx}+a_{4}(x,y)u_{yy}+a_{5}(x,y)u_{x}+a_{6}(x,y)u_{y}+a_{7}(x,y)u=f(x,y)}
$$

$$
{\displaystyle a_{1}(x,y)u_{xx}+a_{2}(x,y)u_{xy}+a_{3}(x,y)u_{yx}+a_{4}(x,y)u_{yy}+f(u_{x},u_{y},u,x,y)=0}
$$

$$
{\displaystyle a_{1}(u_{x},u_{y},u,x,y)u_{xx}+a_{2}(u_{x},u_{y},u,x,y)u_{xy}+a_{3}(u_{x},u_{y},u,x,y)u_{yx}+a_{4}(u_{x},u_{y},u,x,y)u_{yy}+f(u_{x},u_{y},u,x,y)=0}
$$

- ${\displaystyle Au_{xx}+2Bu_{xy}+Cu_{yy}+\cdots {\mbox{(lower order terms)}}=0,}$

- ${\displaystyle Ax^{2}+2Bxy+Cy^{2}+\cdots =0.}$

- ${\displaystyle u_{xx}+u_{yy}+\cdots =0,}$

- ${\displaystyle u_{xx}+\cdots =0,}$

- ${\textstyle u_{t}-u_{xx}+\cdots =0}$

- ${\displaystyle u_{xx}-u_{yy}+\cdots =0,}$

$$
{\displaystyle Lu=\sum _{i=1}^{n}\sum _{j=1}^{n}a_{i,j}{\frac {\partial ^{2}u}{\partial x_{i}\partial x_{j}}}\quad +{\text{lower-order terms}}=0.}
$$

## Sources

[source:wikipedia] *Partial differential equation* — Wikipedia. https://en.wikipedia.org/wiki/Partial_differential_equation. Retrieved 2026-04-17. Confidence: medium.
