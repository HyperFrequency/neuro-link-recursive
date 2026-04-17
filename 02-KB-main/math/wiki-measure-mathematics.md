---
title: Measure (mathematics)
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Measure_%28mathematics%29
confidence: medium
last_updated: 2026-04-17
word_count: 2307
---

# Measure (mathematics)

## Overview

Generalization of mass, length, area and volume
For the coalgebraic concept, see Measuring coalgebra.

- "Measurable" redirects here. For the physical concept, see Measurement.

- Not to be confused with Metric (mathematics).

## Definition

Countable additivity of a measure : The measure of a countable disjoint union is the same as the sum of all measures of each subset.
Let  be a set and  a σ-algebra over , defining subsets of  that are "measurable". A set function  from  to the extended real number line, that is, the real number line together with new (so-called infinite) values  and , respectively greater and lower than all other (so-called finite) elements, is called a measure if the following conditions hold:

- 

- Non-negativity: For all 

- Countable additivity (or σ-additivity): For all countable collections $\}_{k=1}^{\infty }}$ of pairwise disjoint sets in ,$^{\infty }E_{k}\right)}=\sum _{k=1}^{\infty }\mu (E_{k})}$
If at least one set  has finite measure, then the requirement  is met automatically due to countable additivity:and therefore 

Note that any sum involving  will equal , that is,  for all  in the extended reals.

If the condition of non-negativity is dropped, and  only ever equals one of , , i.e. no two distinct sets have measures , , respectively, then  is called a signed measure.

The pair  is called a measurable space, and the members of  are called measurable sets.

A triple  is called a measure space. A probability measure is a measure with total measure one – that is,  A probability space is a measure space with a probability measure.

For measure spaces that are also topological spaces various compatibility conditions can be placed for the measure and the topology. Most measures met in practice in analysis (and in many cases also in probability theory) are Radon measures (usually defined on Hausdorff spaces). When working with locally compact Hausdorff spaces, Radon measures have an alternative, equivalent definition in terms of linear functionals on the locally convex topological vector space of continuous functions with compact support. This approach is taken by Bourbaki (2004) and a number of other sources. For more details, see the article on Radon measures.

## Basic properties

Let  be a measure.

## Generalizations

For certain purposes, it is useful to have a "measure" whose values are not restricted to the non-negative reals or infinity. For instance, a countably additive set function with values in the (signed) real numbers is called a signed measure, while such a function with values in the complex numbers is called a complex measure. Observe, however, that complex measure is necessarily of finite variation, hence complex measures include finite signed measures but not, for example, the Lebesgue measure.

Measures that take values in Banach spaces have been studied extensively. A measure that takes values in the set of self-adjoint projections on a Hilbert space is called a projection-valued measure; these are used in functional analysis for the spectral theorem. When it is necessary to distinguish the usual measures which take non-negative values from generalizations, the term positive measure is used. Positive measures are closed under conical combination but not general linear combination, while signed measures are the linear closure of positive measures. More generally see measure theory in topological vector spaces.

Another generalization is the finitely additive measure, also known as a content. This is the same as a measure except that instead of requiring countable additivity we require only finite additivity. Historically, this definition was used first. It turns out that in general, finitely additive measures are connected with notions such as Banach limits, the dual of $}$ and the Stone–Čech compactification. All these are linked in one way or another to the axiom of choice.  Contents remain useful in certain technical problems in geometric measure theory; this is the theory of Banach measures.

A charge is a generalization in both directions: it is a finitely additive, signed measure. (Cf. ba space for information about bounded charges, where we say a charge is bounded to mean its range its a bounded subset of R.)

- Mathematics portal

- Abelian von Neumann algebra

- Almost everywhere

- Carathéodory's extension theorem

- Content (measure theory)

- Fubini's theorem

- Fatou's lemma

- Fuzzy measure theory

- Geometric measure theory

- Hausdorff measure

- Inner measure

- Lebesgue integration

- Lebesgue measure

- Lorentz space

- Lifting theory

- Measurable cardinal

- Measurable function

- Minkowski content

- Outer measure

- Product measure

- Pushforward measure

- Random measure

- Regular measure

- Vector measure

- Valuation (measure theory)

- Volume form

- ^ One way to rephrase our definition is that  is semifinite if and only if $}\{+\infty \})(\exists B\subseteq A)(0<\mu (B)<+\infty ).}$ Negating this rephrasing, we find that  is not semifinite if and only if $}\{+\infty \})(\forall B\subseteq A)(\mu (B)\in \{0,+\infty \}).}$ For every such set  the subspace measure induced by the subspace sigma-algebra induced by  i.e. the restriction of  to said subspace sigma-algebra, is a  measure that is not the zero measure.

- Robert G. Bartle (1995) The Elements of Integration and Lebesgue Measure, Wiley Interscience.

- Bauer, Heinz (2001), Measure and Integration Theory, Berlin: de Gruyter, ISBN&#160;978-3110167191

- 
- Bear, H.S. (2001), A Primer of Lebesgue Integration, San Diego: Academic Press, ISBN&#160;978-0120839711

- 
- Berberian, Sterling K (1965). Measure and Integration. MacMillan.

- 
- Bogachev, Vladimir I. (2006), Measure theory, Berlin: Springer, ISBN&#160;978-3540345138

- 
- Bourbaki, Nicolas (2004), Integration I, Springer Verlag, ISBN&#160;3-540-41129-1 Chapter III.

- 
- Dudley, Richard M. (2002). Real Analysis and Probability. Cambridge University Press. ISBN&#160;978-0521007542.

- 
- Edgar, Gerald A. (1998). Integral, Probability, and Fractal Measures. Springer. ISBN&#160;978-1-4419-3112-2.

- 
- Folland, Gerald B. (1999). Real Analysis: Modern Techniques and Their Applications (Second&#160;ed.). Wiley. ISBN&#160;0-471-31716-0.

- Herbert Federer (1969) Geometric Measure Theory, Die Grundlehren der mathematischen Wissenschaften, Band 153 Springer-Verlag 
- ISBN&#160;978-3-540-60656-7

- 
- Fremlin, D.H. (2016). Measure Theory, Volume 2: Broad Foundations (Hardback&#160;ed.). Torres Fremlin. Second printing.

- 
- Hewitt, Edward; Stromberg, Karl (1965). Real and Abstract Analysis: A Modern Treatment of the Theory of Functions of a Real Variable. Springer. ISBN&#160;0-387-90138-8.

- 
- Jech, Thomas (2003), Set Theory: The Third Millennium Edition, Revised and Expanded, Springer Verlag, ISBN&#160;3-540-44085-2

- R. Duncan Luce and Louis Narens (1987). "measurement, theory of", The New Palgrave: A Dictionary of Economics, v. 3, pp.&#160;428–32.

- 
- Luther, Norman Y (1967). "A decomposition of measures". Canadian Journal of Mathematics. 20: 953–959. doi:10.4153/CJM-1968-092-0. S2CID&#160;124262782.

- 
- Mukherjea, A; Pothoven, K (1985). Real and Functional Analysis, Part A: Real Analysis (Second&#160;ed.). Plenum Press.

- The first edition was published with Part B: Functional Analysis as a single volume: 
- Mukherjea, A; Pothoven, K (1978). Real and Functional Analysis (First&#160;ed.). Plenum Press. doi:10.1007/978-1-4684-2331-0. ISBN&#160;978-1-4684-2333-4.

- M. E. Munroe, 1953. Introduction to Measure and Integration. Addison Wesley.

- 
- Nielsen, Ole A (1997). An Introduction to Integration and Measure Theory. Wiley. ISBN&#160;0-471-59518-7.

- 
- K. P. S. Bhaskara Rao and M. Bhaskara Rao (1983), Theory of Charges: A Study of Finitely Additive Measures, London: Academic Press, pp.&#160;x + 315, ISBN&#160;0-12-095780-9

- 
- Royden, H.L.; Fitzpatrick, P.M. (2010). Real Analysis (Fourth&#160;ed.). Prentice Hall. p.&#160;342, Exercise 17.8. First printing. There is a later (2017) second printing. Though usually there is little difference between the first and subsequent printings, in this case the second printing not only deletes from page 53 the Exercises 36, 40, 41, and 42 of Chapter 2 but also offers a (slightly, but still substantially) different presentation of part (ii) of Exercise 17.8. (The second printing's presentation of part (ii) of Exercise 17.8 (on the Luther decomposition) agrees with usual presentations, whereas the first printing's presentation provides a fresh perspective.)

- Shilov, G. E., and Gurevich, B. L., 1978. Integral, Measure, and Derivative: A Unified Approach, Richard A. Silverman, trans. Dover Publications. 
- ISBN&#160;0-486-63519-8. Emphasizes the Daniell integral.

- 
- Teschl, Gerald, Topics in Real Analysis, (lecture notes)

- 
- Tao, Terence (2011). An Introduction to Measure Theory. Providence, R.I.: American Mathematical Society. ISBN&#160;9780821869192.

- 
- Weaver, Nik (2013). Measure Theory and Functional Analysis. World Scientific. ISBN&#160;9789814508568.

- 

- ^ Archimedes Measuring the Circle

- ^ 
- Heath, T. L. (1897). "Measurement of a Circle". The Works Of Archimedes. Osmania University, Digital Library Of India. Cambridge University Press. pp.&#160;91–98.

- ^ Thomas W. Hawkins Jr. (1970) Lebesgue’s Theory of Integration: Its Origins and Development, pages 66,7 University of Wisconsin Press 
- ISBN&#160;0-299-05550-7

- ^ 
- Fremlin, D. H. (2010), Measure Theory, vol.&#160;2 (Second&#160;ed.), p.&#160;221

- ^ 
- "2.2 Measures" (PDF). heil.math.gatech.edu. Archived (PDF) from the original on 1 July 2023. Retrieved 10 March 2026.

- ^ a b c d 
- "More Measure Theory" (PDF). e.math.cornell.edu. Archived (PDF) from the original on 28 February 2023. Retrieved 10 March 2026.

- ^ a b c Mukherjea & Pothoven 1985, p.&#160;90.

- ^ Folland 1999, p.&#160;25.

- ^ Edgar 1998, Theorem 1.5.2, p. 42.

- ^ Edgar 1998, Theorem 1.5.3, p. 42.

- ^ a b Nielsen 1997, Exercise 11.30, p. 159.

- ^ Fremlin 2016, Section 213X, part (c).

- ^ Royden & Fitzpatrick 2010, Exercise 17.8, p. 342.

- ^ Hewitt & Stromberg 1965, part (b) of Example 10.4, p. 127.

- ^ Fremlin 2016, Section 211O, p. 15.

- ^ a b Luther 1967, Theorem 1.

- ^ Mukherjea & Pothoven 1985, part (b) of Proposition 2.3, p. 90.

- ^ Fremlin 2016, part (a) of Theorem 243G, p. 159.

- ^ a b Fremlin 2016, Section 243K, p. 162.

- ^ Fremlin 2016, part (a) of the Theorem in Section 245E, p. 182.

- ^ Fremlin 2016, Section 245M, p. 188.

- ^ Berberian 1965, Theorem 39.1, p. 129.

- ^ Fremlin 2016, part (b) of Theorem 243G, p. 159.

- ^ 
- Rao, M. M. (2012), Random and Vector Measures, Series on Multivariate Analysis, vol.&#160;9, World Scientific, ISBN&#160;978-981-4350-81-5, MR&#160;2840012.

- ^ 
- Bhaskara Rao, K. P. S. (1983). Theory of charges: a study of finitely additive measures. M. Bhaskara Rao. London: Academic Press. p.&#160;35. ISBN&#160;0-12-095780-9. OCLC&#160;21196971.

- ^ Folland 1999, p.&#160;27, Exercise 1.15.a.

Look up measurable in Wiktionary, the free dictionary.

- 
- "Measure", Encyclopedia of Mathematics, EMS Press, 2001 [1994]

- Tutorial: Measure Theory for Dummies
Applications&#160;&&#160;related

- Convex analysis

- Descriptive set theory

- Probability theory

- Real analysis

- Spectral theory

- 
- 
Applications&#160;&&#160;related

- Bochner space

- Fourier analysis

- Lorentz space

- Probability theory

- Quasinorm

- Real analysis

- Sobolev space

- *-algebra

- C*-algebra

- Von Neumann

- 
-

## Instances

- Main category: Measures (measure theory)
Some important measures are listed here.

- The counting measure is defined by  = number of elements in 

- The Lebesgue measure on $}$ is a complete translation-invariant measure on a σ-algebra containing the intervals in $}$ such that ; and every other measure with these properties extends the Lebesgue measure.

- The arc length of an interval on the unit circle in the Euclidean plane extends to a measure on the -algebra they generate. It can be called angle measure since the arc length of an interval equals the angle it supports. This measure is invariant under rotations preserving the circle. Similarly, hyperbolic angle measure is invariant under squeeze mapping.

- The Haar measure for a locally compact topological group. For example, $}$ is such a group and its Haar measure is the Lebesgue measure; for the unit circle (seen as a subgroup of the multiplicative group of $}$) its Haar measure is the angle measure. For a discrete group the counting measure is a Haar measure.

- Every (pseudo) Riemannian manifold  has a canonical measure $}$ that in local coordinates $,\ldots ,x_{n}}$ looks like $}d^{n}x}$ where $x}$ is the usual Lebesgue measure.

- The Hausdorff measure is a generalization of the Lebesgue measure to sets with non-integer dimension, in particular, fractal sets.

- Every probability space gives rise to a measure which takes the value 1 on the whole space (and therefore takes all its values in the unit interval [0, 1]). Such a measure is called a probability measure or distribution. See the list of probability distributions for instances.

- The Dirac measure δa (cf. Dirac delta function) is given by δa(S) = χS(a), where χS is the indicator function of  The measure of a set is 1 if it contains the point  and 0 otherwise.
Other 'named' measures used in various theories include: Borel measure, Jordan measure, ergodic measure, Gaussian measure, Baire measure, Radon measure, Young measure, and Loeb measure.

In physics an example of a measure is spatial distribution of mass (see for example, gravity potential), or another non-negative extensive property, conserved (see conservation law for a list of these) or not. Negative values lead to signed measures, see "generalizations" below.

- Liouville measure, known also as the natural volume form on a symplectic manifold, is useful in classical statistical and Hamiltonian mechanics.

- Gibbs measure is widely used in statistical mechanics, often under the name canonical ensemble.

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle A}$

- ${\displaystyle B,}$

- ${\displaystyle A}$

- ${\displaystyle B.}$

- ${\displaystyle \mu }$

- ${\displaystyle X}$

- ${\displaystyle \Sigma }$

- ${\displaystyle X}$

- ${\displaystyle X}$

- ${\displaystyle \mu }$

- ${\displaystyle \Sigma }$

- ${\displaystyle +\infty }$

- ${\displaystyle -\infty }$

- ${\displaystyle \mu (\varnothing )=0}$

- ${\displaystyle E\in \Sigma ,\ \ \mu (E)\geq 0}$

- ${\displaystyle \{E_{k}\}_{k=1}^{\infty }}$

- ${\displaystyle \Sigma }$

$$
{\displaystyle \mu {\left(\bigcup _{k=1}^{\infty }E_{k}\right)}=\sum _{k=1}^{\infty }\mu (E_{k})}
$$

- ${\displaystyle E}$

- ${\displaystyle \mu (\varnothing )=0}$

- ${\displaystyle \mu (E)=\mu (E\cup \varnothing )=\mu (E)+\mu (\varnothing ),}$

- ${\displaystyle \mu (\varnothing )=0.}$

- ${\displaystyle +\infty }$

- ${\displaystyle +\infty }$

- ${\displaystyle a+\infty =+\infty }$

- ${\displaystyle a}$

- ${\displaystyle \mu (E)}$

- ${\displaystyle +\infty }$

- ${\displaystyle -\infty }$

- ${\displaystyle +\infty }$

## Sources

[source:wikipedia] *Measure (mathematics)* — Wikipedia. https://en.wikipedia.org/wiki/Measure_%28mathematics%29. Retrieved 2026-04-17. Confidence: medium.
