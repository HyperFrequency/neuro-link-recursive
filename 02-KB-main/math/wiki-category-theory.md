---
title: Category theory
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Category_theory
confidence: medium
last_updated: 2026-04-17
word_count: 1077
---

# Category theory

## Overview

General theory of mathematical structures
Schematic representation of three objects and three morphisms of a category, which form a commutative diagram
Category theory is a general theory of mathematical structures and their relations. It was introduced by Samuel Eilenberg and Saunders Mac Lane in the mid-20th&#160;century in their foundational work on algebraic topology. Category theory can be used in most areas of mathematics. In particular, many constructions of new mathematical objects from previous ones that appear similarly in several contexts are conveniently expressed and unified in terms of categories. Examples include quotient spaces, direct products, completion, and duality.

Many areas of computer science also rely on category theory, such as functional programming and semantics.

A category is formed by two sorts of objects: the objects of the category, and the morphisms, which relate two objects called the source and the target of the morphism. A morphism is often represented by an arrow from its source to its target (see the figure). Morphisms can be composed if the target of the first morphism equals the source of the second one. Morphism composition has similar properties as function composition (associativity and existence of an identity morphism for each object). Morphisms are often some sort of functions, but this is not always the case. For example, a monoid may be viewed as a category with a single object, whose morphisms are the elements of the monoid.

### Universal constructions, limits, and colimits

- Main articles: Universal property and Limit (category theory)
Using the language of category theory, many areas of mathematical study can be categorized. Categories include sets, groups and topologies.

Each category is distinguished by properties that all its objects have in common, such as the empty set or the product of two topologies, yet in the definition of a category, objects are considered atomic, i.e., we do not know whether an object A is a set, a topology, or any other abstract concept. Hence, the challenge is to define special objects without referring to the internal structure of those objects. To define the empty set without referring to elements, or the product topology without referring to open sets, one can characterize these objects in terms of their relations to other objects, as given by the morphisms of the respective categories. Thus, the task is to find universal properties that uniquely determine the objects of interest.

Numerous important constructions can be described in a purely categorical way if the category limit can be developed and dualized to yield the notion of a colimit.

## Categories, objects, and morphisms

Main articles: Category (mathematics) and Morphism

### Categories

A category $}}$ consists of the following three mathematical entities:

- A class $}({\mathcal {C}})}$, whose elements are called objects;

- A class $}({\mathcal {C}})}$, whose elements are called morphisms or maps or arrows. Each morphism  has a source object   and target object .

The expression  would be verbally stated as " is a morphism from a to b".

The expression $}(a,b)}$ – alternatively expressed as $}_{\mathcal {C}}(a,b)}$, $}(a,b)}$, or $}(a,b)}$ – denotes the hom-class of all morphisms from  to .

- A binary operation , called composition of morphisms, such that for any three objects a, b, and c, we have$}(b,c)\times {\text{hom}}(a,b)\to {\text{hom}}(a,c)}$The composition of  and  is written as  or , governed by two axioms:

- Associativity: If , , and  then 

- Identity: For every object x, there exists a morphism $\colon x\rightarrow x}$ (also denoted as $}_{x}}$) called the identity morphism for x, such that for every morphism , we have$\circ f=f=f\circ 1_{a}}$From the axioms, it can be proved that there is exactly one identity morphism for every object.

Example
A prototypical example of a category is Set, the category of sets and functions between them.  The objects of Set are just sets, and a morphism from a set X to a set Y is a function f&#160;: X → Y.  The category axioms are satisfied since every set has an identity function, and since composition of functions is associative.

### Morphisms

Relations among morphisms (such as fg = h) are often depicted using commutative diagrams, with "points" (corners) representing objects and "arrows" representing morphisms.

Morphisms can have any of the following properties. A morphism f&#160;: a → b is:

- a monomorphism (or monic) if f ∘ g1 = f ∘ g2 implies g1 = g2 for all morphisms g1, g2&#160;: x → a.

- an epimorphism (or epic) if g1 ∘ f = g2 ∘ f implies g1 = g2 for all morphisms g1, g2&#160;: b → x.

- a bimorphism if f is both epic and monic.

- an isomorphism if there exists a morphism g&#160;: b → a such that f ∘ g = 1b and g ∘ f = 1a.

- an endomorphism if a = b. end(a) denotes the class of endomorphisms of a.

- an automorphism if f is both an endomorphism and an isomorphism. aut(a) denotes the class of automorphisms of a.

- a retraction if a right inverse of f exists, i.e. if there exists a morphism g&#160;: b → a with f ∘ g = 1b.

- a section if a left inverse of f exists, i.e. if there exists a morphism g&#160;: b → a with g ∘ f = 1a.
Every retraction is an epimorphism, and every section is a monomorphism. Furthermore, the following three statements are equivalent:

- f is a monomorphism and a retraction;

- f is an epimorphism and a section;

- f is an isomorphism.

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle {\mathcal {C}}_{1}}$

- ${\displaystyle {\mathcal {C}}_{2}}$

- ${\displaystyle {\mathcal {C}}_{1}}$

- ${\displaystyle {\mathcal {C}}_{2}}$

- ${\displaystyle {\mathcal {C}}_{1}}$

- ${\displaystyle {\mathcal {C}}_{2}}$

- ${\displaystyle {\mathcal {C}}}$

- ${\displaystyle {\text{ob}}({\mathcal {C}})}$

- ${\displaystyle {\text{hom}}({\mathcal {C}})}$

- ${\displaystyle f}$

- ${\displaystyle a}$

- ${\displaystyle b}$

- ${\displaystyle f\colon a\rightarrow b}$

- ${\displaystyle f}$

- ${\displaystyle {\text{hom}}(a,b)}$

- ${\displaystyle {\text{hom}}_{\mathcal {C}}(a,b)}$

- ${\displaystyle {\text{mor}}(a,b)}$

- ${\displaystyle {\mathcal {C}}(a,b)}$

- ${\displaystyle a}$

- ${\displaystyle b}$

- ${\displaystyle \circ }$

$$
{\displaystyle \circ \colon {\text{hom}}(b,c)\times {\text{hom}}(a,b)\to {\text{hom}}(a,c)}
$$

- ${\displaystyle f\colon a\rightarrow b}$

- ${\displaystyle g\colon b\rightarrow c}$

- ${\displaystyle g\circ f}$

- ${\displaystyle gf}$

- ${\displaystyle f\colon a\rightarrow b}$

- ${\displaystyle g\colon b\rightarrow c}$

- ${\displaystyle h\colon c\rightarrow d}$

- ${\displaystyle h\circ (g\circ f)=(h\circ g)\circ f}$

## Sources

[source:wikipedia] *Category theory* — Wikipedia. https://en.wikipedia.org/wiki/Category_theory. Retrieved 2026-04-17. Confidence: medium.
