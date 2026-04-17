---
title: Banach space
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Banach_space
confidence: medium
last_updated: 2026-04-17
word_count: 4469
---

# Banach space

## Overview

Normed vector space that is complete
In mathematics, more specifically in functional analysis, a Banach space (/ˈbɑː.nʌx/, Polish pronunciation: &#91;ˈba.nax&#93;) is a complete normed vector space. Thus, a Banach space is a vector space with a metric that allows the computation of vector length and distance between vectors and is complete in the sense that a Cauchy sequence of vectors always converges to a well-defined limit that is within the space.

Banach spaces are named after the Polish mathematician Stefan Banach, who introduced this concept and studied it systematically in 1920–1922 along with Hans Hahn and Eduard Helly. 
Maurice René Fréchet was the first to use the term "Banach space" and Banach in turn then coined the term "Fréchet space".
Banach spaces originally grew out of the study of function spaces by Hilbert, Fréchet, and Riesz earlier in the century. Banach spaces play a central role in functional analysis. In other areas of analysis, the spaces under study are often Banach spaces.

## Definition

A Banach space is a complete normed space $\|).}$ 
A normed space is a pair 
$\|)}$ consisting of a vector space  over a scalar field $}$ (where $}$ is commonly $}$ or $}$) together with a distinguished 
norm $\|:X\to \mathbb {R} .}$ Like all norms, this norm induces a translation invariant 
distance function, called the canonical or (norm) induced metric, defined for all vectors  by

This makes  into a metric space  
A sequence $,x_{2},\ldots }$ is called Cauchy in  or -Cauchy or $\|}$-Cauchy if for every real  there exists some index  such that
$,x_{m})=\|x_{n}-x_{m}\|<r}$
whenever  and  are greater than  
The normed space $\|)}$ is called a Banach space and the canonical metric  is called a complete metric if  is a complete metric space, which by definition means for every Cauchy sequence $,x_{2},\ldots }$ in  there exists some  such that
$x_{n}=x\;{\text{ in }}(X,d),}$
where because $-x\|=d(x_{n},x),}$ this sequence's convergence to  can equivalently be expressed as
$\|x_{n}-x\|=0\;{\text{ in }}\mathbb {R} .}$

The norm $\|}$ of a normed space $\|)}$ is called a complete norm if $\|)}$ is a Banach space.

### Banach's theorems

Here are the main general results about Banach spaces that go back to the time of Banach's book (Banach (1932)) and are related to the Baire category theorem. 
According to this theorem, a complete metric space (such as a Banach space, a Fréchet space or an F-space) cannot be equal to a union of countably many closed subsets with empty interiors. 
Therefore, a Banach space cannot be the union of countably many closed subspaces, unless it is already equal to one of them; a Banach space with a countable Hamel basis is finite-dimensional.

- 
Banach–Steinhaus Theorem—Let  be a Banach space and  be a normed vector space. Suppose that  is a collection of continuous linear operators from  to  The uniform boundedness principle states that if for all  in  we have $\|T(x)\|_{Y}<\infty ,}$ then $\|T\|_{Y}<\infty .}$

The Banach–Steinhaus theorem is not limited to Banach spaces. 
It can be extended for example to the case where  is a Fréchet space, provided the conclusion is modified as follows: under the same hypothesis, there exists a neighborhood  of $}$ in  such that all  in  are uniformly bounded on 
$\sup _{x\in U}\;\|T(x)\|_{Y}<\infty .}$

- 
The Open Mapping Theorem—Let  and  be Banach spaces and  be a surjective continuous linear operator, then  is an open map.

- 
Corollary—Every one-to-one bounded linear operator from a Banach space onto a Banach space is an isomorphism.

- 
The First Isomorphism Theorem for Banach spaces—Suppose that  and  are Banach spaces and that  Suppose further that the range of  is closed in  Then  is isomorphic to 

This result is a direct consequence of the preceding Banach isomorphism theorem and of the canonical factorization of bounded linear maps.

- 
Corollary—If a Banach space  is the internal direct sum of closed subspaces $,\ldots ,M_{n},}$ then  is isomorphic to $\oplus \cdots \oplus M_{n}.}$

This is another consequence of Banach's isomorphism theorem, applied to the continuous bijection from $\oplus \cdots \oplus M_{n}}$ onto  sending $,\cdots ,m_{n}}$ to the sum $+\cdots +m_{n}.}$

- 
The Closed Graph Theorem—Let  be a linear mapping between Banach spaces. The graph of  is closed in  if and only if  is continuous.

## Examples

- Main article: List of Banach spaces
Glossary of symbols for the table below:

- $}$ denotes the field of real numbers $}$ or complex numbers $.}$

-  is a compact Hausdorff space.

- $}$ are real numbers with  that are Hölder conjugates, meaning that they satisfy ${q}}+{\frac {1}{p}}=1}$ and thus also ${p-1}}.}$

-  is a -algebra of sets.

-  is an algebra of sets (for spaces only requiring finite additivity, such as the ba space).

-  is a measure with variation  A positive measure is a real-valued positive set function defined on a -algebra which is countably additive.

Classical Banach spaces

Dual space
Reflexive
weakly sequentially complete
Norm
Notes

$^{n}}$

$^{n}}$
Yes
Yes

$}$

$^{n}|x_{i}|^{2}\right)^{1/2}}$

Euclidean space

$^{n}}$

$^{n}}$
Yes
Yes

$}$

$^{n}|x_{i}|^{p}\right)^{\frac {1}{p}}}$

$^{n}}$

$^{n}}$
Yes
Yes

$}$

$|x_{i}|}$

$}$

$}$
Yes
Yes

$}$

$^{\infty }|x_{i}|^{p}\right)^{\frac {1}{p}}}$

$}$

$}$
No
Yes

$}$

$^{\infty }\left|x_{i}\right|}$

$}$

$}$
No
No

$}$

$\left|x_{i}\right|}$

$}$

$}$
No
No

$}$

$\left|x_{i}\right|}$

$}$

$}$
No
No

$}$

$\left|x_{i}\right|}$

Isomorphic but not isometric to 

$}$

$}$
No
Yes

$}$

$\right|+\sum _{i=1}^{\infty }\left|x_{i+1}-x_{i}\right|}$

Isometrically isomorphic to $.}$

$_{0}}$

$}$
No
Yes

$}}$

$^{\infty }\left|x_{i+1}-x_{i}\right|}$

Isometrically isomorphic to $.}$

$}$

$}$
No
No

$}$

$\left|\sum _{i=1}^{n}x_{i}\right|}$

Isometrically isomorphic to $.}$

$}$

$}$
No
No

$}$

$\left|\sum _{i=1}^{n}x_{i}\right|}$

Isometrically isomorphic to 



$(\Xi )}$
No
No

$}$

$|f(k)|}$



$(K)}$
No
No

$}$

$|f(k)|}$

$(\Xi )}$

?
No
Yes

$}$

$|\mu |(S)}$

$(\Sigma )}$

?
No
Yes

$}$

$|\mu |(S)}$

A closed subspace of $(\Sigma ).}$

$(\Sigma )}$

?
No
Yes

$}$

$|\mu |(S)}$

A closed subspace of $(\Sigma ).}$

$(\mu )}$

$(\mu )}$
Yes
Yes

$}$

$\,d\mu \right)^{\frac {1}{p}}}$

$(\mu )}$

$(\mu )}$
No
Yes

$}$



The dual is $(\mu )}$ if  is -finite.

$([a,b])}$

?
No
Yes

$}$

$([a,b])+\lim \nolimits _{x\to a^{+}}f(x)}$

$([a,b])}$ is the total variation of 

$([a,b])}$

?
No
Yes

$}$

$([a,b])}$

$([a,b])}$ consists of $([a,b])}$ functions such that $}f(x)=0}$

$([a,b])}$

$+L^{\infty }([a,b])}$
No
Yes

$}$

$([a,b])+\lim \nolimits _{x\to a^{+}}f(x)}$

Isomorphic to the Sobolev space $([a,b]).}$

$([a,b])}$

$([a,b])}$
No
No



$^{n}\sup \nolimits _{x\in [a,b]}\left|f^{(i)}(x)\right|}$

Isomorphic to $^{n}\oplus C([a,b]),}$ essentially by Taylor's theorem.

## Generalizations

Several important spaces in functional analysis, for instance the space of all infinitely often differentiable functions $\to \mathbb {R} ,}$ or the space of all distributions on $,}$ are complete but are not normed vector spaces and hence not Banach spaces. 
In Fréchet spaces one still has a complete metric, while LF-spaces are complete uniform vector spaces arising as limits of Fréchet spaces.

- Space (mathematics)&#160;– Mathematical set with some added structure

- Fréchet space&#160;– Locally convex topological vector space that is also a complete metric space

- Hardy space&#160;– Concept within complex analysis

- Hilbert space&#160;– Type of vector space in math

- L-semi-inner product&#160;– Generalization of inner products that applies to all normed spaces

- $}$ space&#160;– Function spaces generalizing finite-dimensional p norm spaces

- Sobolev space&#160;– Vector space of functions in mathematics

- Banach lattice&#160;– Banach space with a compatible structure of a lattice

- Banach disk

- Banach manifold&#160;– Manifold modeled on Banach spaces

- Banach bundle

- Distortion problem

- Interpolation space&#160;– Vector space in mathematics

- Locally convex topological vector space&#160;– Space with topology generated by convex sets

- Modulus and characteristic of convexity

- Smith space

- Topological vector space&#160;– Vector space with a notion of nearness

- Tsirelson space

- Banach-Saks property

- ^ It is common to read " is a normed space" instead of the more technically correct but (usually) pedantic "$\|)}$ is a normed space", especially if the norm is well known (for example, such as with $}^{p}}$ spaces) or when there is no particular need to choose any one (equivalent) norm over any other (especially in the more abstract theory of topological vector spaces), in which case this norm (if needed) is often automatically assumed to be denoted by $\|.}$ However, in situations where emphasis is placed on the norm, it is common to see $\|)}$ written instead of  The technically correct definition of normed spaces as pairs $\|)}$ may also become important in the context of category theory where the distinction between the categories of normed spaces, normable spaces, metric spaces, TVSs, topological spaces, etc. is usually important.

- ^ This means that if the norm $\|}$ is replaced with a different norm $\|'}$ on  then $\|)}$ is not the same normed space as $\|'),}$ not even if the norms are equivalent. However, equivalence of norms on a given vector space does form an equivalence relation.

- ^ a b c A metric  on a vector space  is said to be translation invariant if  for all vectors  This happens if and only if  for all vectors  A metric that is induced by a norm is always translation invariant.

- ^ Because $\|=\|z\|}$ for all  it is always true that  for all  So the order of  and  in this definition does not matter.

- ^ a b Let  be the separable Hilbert space $(\mathbb {N} )}$ of square-summable sequences with the usual norm $\|_{2},}$ and let $=(0,\ldots ,0,1,0,\ldots ,0)}$ be the standard orthonormal basis (that is, each $}$ has zeros in every position except for a  in the th-position). The closed set $\cup \{{\tfrac {1}{n}}e_{n}\mid n=1,2,\ldots \}}$ is compact (because it is sequentially compact) but its convex hull $S}$ is not a closed set because the point ${\textstyle h:=\sum _{n=1}^{\infty }{\tfrac {1}{2^{n}}}{\tfrac {1}{n}}e_{n}}$ belongs to the closure of $S}$ in  but $S}$ (since every point $,z_{2},\ldots )\in \operatorname {co} S}$ is a finite convex combination of elements of  and so $=0}$ for all but finitely many coordinates, which is not true of ). However, like in all complete Hausdorff locally convex spaces, the closed convex hull $}}S}$ of this compact subset is compact. The vector subspace $S=\operatorname {span} \{e_{1},e_{2},\ldots \}}$ is a pre-Hilbert space when endowed with the substructure that the Hilbert space  induces on it, but  is not complete and  (since ). The closed convex hull of  in  (here, "closed" means with respect to  and not to  as before) is equal to  which is not compact (because it is not a complete subset). This shows that in a Hausdorff locally convex space that is not complete, the closed convex hull of a compact subset might fail to be compact (although it will be precompact/totally bounded).

- ^ Let $\|_{\infty })}$ denote the Banach space of continuous functions with the supremum norm and let $}$ denote the topology on  induced by $\|_{\infty }.}$ The vector space  can be identified (via the inclusion map) as a proper dense vector subspace  of the $}$ space $([0,1]),\|{\cdot }\|_{1}),}$ which satisfies $\leq \|f\|_{\infty }}$ for all  Let  denote the restriction of $\|_{1}}$ to  which makes this map $}$ a norm on  (in general, the restriction of any norm to any vector subspace will necessarily again be a norm). The normed space  is not a Banach space since its completion is the proper superset $([0,1]),\|{\cdot }\|_{1}).}$ Because $\|_{\infty }}$ holds on  the map $)\to \mathbb {R} }$ is continuous. Despite this, the norm  is not equivalent to the norm $\|_{\infty }}$ (because $\|_{\infty })}$ is complete but  is not).

- ^ The normed space $,|\cdot |)}$ is a Banach space where the absolute value is a norm on the real line $}$ that induces the usual Euclidean topology on $.}$ Define a metric $\times \mathbb {R} \to \mathbb {R} }$ on $}$ by  for all $.}$ Just like &#8202;'s induced metric, the metric  also induces the usual Euclidean topology on $.}$ However,  is not a complete metric because the sequence $=(x_{i})_{i=1}^{\infty }}$ defined by $:=i}$ is a -Cauchy sequence but it does not converge to any point of $.}$ As a consequence of not converging, this -Cauchy sequence cannot be a Cauchy sequence in $,|\cdot |)}$ (that is, it is not a Cauchy sequence with respect to the norm ) because if it was -Cauchy, then the fact that $,|\cdot |)}$ is a Banach space would imply that it converges (a contradiction).Narici & Beckenstein 2011, pp.&#160;47–51

- ^ The statement of the theorem is: Let  be any metric on a vector space  such that the topology  induced by  on  makes  into a topological vector space. If  is a complete metric space then  is a complete topological vector space.

- ^ This metric  is not assumed to be translation-invariant. So in particular, this metric  does not even have to be induced by a norm.

- ^ A norm (or seminorm)  on a topological vector space  is continuous if and only if the topology $}$ that  induces on  is coarser than  (meaning, $\subseteq \tau }$), which happens if and only if there exists some open ball  in  (such as maybe $}$ for example) that is open in 

- ^  denotes the continuous dual space of  When  is endowed with the strong dual space topology, also called the topology of uniform convergence on bounded subsets of  then this is indicated by writing $}$ (sometimes, the subscript  is used instead of ). When  is a normed space with norm $\|}$ then this topology is equal to the topology on  induced by the dual norm. In this way, the strong topology is a generalization of the usual dual norm-induced topology on 

- ^ The fact that $}$ being open implies that $}$ is continuous simplifies proving continuity because this means that it suffices to show that $)|<r\}}$ is open for  and at $:=0}$ (where ) rather than showing this for all real  and all $\in X.}$

- 

- ^ Bourbaki 1987, V.87

- ^ Narici & Beckenstein 2011, p.&#160;93.

- ^ a b Lumer, G. (1961). "Semi-inner-product spaces". Transactions of the American Mathematical Society. 100 (1): 29–43. doi:10.1090/S0002-9947-1961-0133024-2.

- ^ see Theorem&#160;1.3.9, p.&#160;20 in Megginson (1998).

- ^ Wilansky 2013, p.&#160;29.

- ^ Bessaga & Pełczyński 1975, p.&#160;189

- ^ a b Anderson & Schori 1969, p.&#160;315.

- ^ Henderson 1969.

- ^ Aliprantis & Border 2006, p.&#160;185.

- ^ Trèves 2006, p.&#160;145.

- ^ Trèves 2006, pp.&#160;166–173.

- ^ a b 
- Conrad, Keith. "Equivalence of norms" (PDF). kconrad.math.uconn.edu. Archived (PDF) from the original on 2022-10-09. Retrieved September 7, 2020.

- ^ see Corollary&#160;1.4.18, p.&#160;32 in Megginson (1998).

- ^ Narici & Beckenstein 2011, pp.&#160;47–66.

- ^ Narici & Beckenstein 2011, pp.&#160;47–51.

- ^ Schaefer & Wolff 1999, p.&#160;35.

- ^ 
- Klee, V. L. (1952). "Invariant metrics in groups (solution of a problem of Banach)" (PDF). Proc. Amer. Math. Soc. 3 (3): 484–487. doi:10.1090/s0002-9939-1952-0047250-4. Archived (PDF) from the original on 2022-10-09.

- ^ Trèves 2006, pp.&#160;57–69.

- ^ Trèves 2006, p.&#160;201.

- ^ Gabriyelyan, S.S. "On topological spaces and topological groups with certain local countable networks (2014)

- ^ a b 
- Qiaochu Yuan (June 23, 2012). "Banach spaces (and Lawvere metrics, and closed categories)". Annoying Precision.

- ^ a b Narici & Beckenstein 2011, pp.&#160;192–193.

- ^ Banach (1932, p.&#160;182)

- ^ a b see pp.&#160;17–19 in Carothers (2005).

- ^ see Banach (1932), pp.&#160;11-12.

- ^ see Banach (1932), Th.&#160;9 p.&#160;185.

- ^ see Theorem&#160;6.1, p.&#160;55 in Carothers (2005)

- ^ Several books about functional analysis use the notation $}$ for the continuous dual, for example Carothers (2005), Lindenstrauss & Tzafriri (1977), Megginson (1998), Ryan (2002), Wojtaszczyk (1991).

- ^ Theorem&#160;1.9.6, p.&#160;75 in Megginson (1998)

- ^ see also Theorem&#160;2.2.26, p.&#160;179 in Megginson (1998)

- ^ see p.&#160;19 in Carothers (2005).

- ^ Theorems&#160;1.10.16, 1.10.17 pp.94–95 in Megginson (1998)

- ^ Theorem&#160;1.12.11, p.&#160;112 in Megginson (1998)

- ^ Theorem&#160;2.5.16, p.&#160;216 in Megginson (1998).

- ^ see II.A.8, p.&#160;29 in Wojtaszczyk (1991)

- ^ a b c see Theorem&#160;2.6.23, p.&#160;231 in Megginson (1998).

- ^ see N. Bourbaki, (2004), "Integration I", Springer Verlag, 
- ISBN&#160;3-540-41129-1.

- ^ a b 
- Eilenberg, Samuel (1942). "Banach Space Methods in Topology". Annals of Mathematics. 43 (3): 568–579. doi:10.2307/1968812. JSTOR&#160;1968812.

- ^ see also Banach (1932), p.&#160;170 for metrizable  and 

- ^ 
- Amir, Dan (1965). "On isomorphisms of continuous function spaces". Israel Journal of Mathematics. 3 (4): 205–210. doi:10.1007/bf03008398. S2CID&#160;122294213.

- ^ 
- Cambern, M. (1966). "A generalized Banach–Stone theorem". Proc. Amer. Math. Soc. 17 (2): 396–400. doi:10.1090/s0002-9939-1966-0196471-9. And 
- Cambern, M. (1967). "On isomorphisms with small bound". Proc. Amer. Math. Soc. 18 (6): 1062–1066. doi:10.1090/s0002-9939-1967-0217580-2.

- ^ 
- Cohen, H. B. (1975). "A bound-two isomorphism between  Banach spaces". Proc. Amer. Math. Soc. 50: 215–217. doi:10.1090/s0002-9939-1975-0380379-5.

- ^ See for example 
- Arveson, W. (1976). An Invitation to C*-Algebra. Springer-Verlag. ISBN&#160;0-387-90176-0.

- ^ 
- R. C. James (1951). "A non-reflexive Banach space isometric with its second conjugate space". Proc. Natl. Acad. Sci. U.S.A. 37 (3): 174–177. Bibcode:1951PNAS...37..174J. doi:10.1073/pnas.37.3.174. PMC&#160;1063327. PMID&#160;16588998.

- ^ see Lindenstrauss & Tzafriri (1977), p.&#160;25.

- ^ 
- bishop, See E.; Phelps, R. (1961). "A proof that every Banach space is subreflexive". Bull. Amer. Math. Soc. 67: 97–98. doi:10.1090/s0002-9904-1961-10514-4.

- ^ see III.C.14, p.&#160;140 in Wojtaszczyk (1991).

- ^ see Corollary&#160;2, p.&#160;11 in Diestel (1984).

- ^ see p.&#160;85 in Diestel (1984).

- ^ 
- Rosenthal, Haskell P. (1974). "A characterization of Banach spaces containing ℓ1". Proc. Natl. Acad. Sci. U.S.A. 71 (6): 2411–2413. arXiv:math.FA/9210205. Bibcode:1974PNAS...71.2411R. doi:10.1073/pnas.71.6.2411. PMC&#160;388466. PMID&#160;16592162. Rosenthal's proof is for real scalars. The complex version of the result is due to L. Dor, in 
- Dor, Leonard E (1975). "On sequences spanning a complex ℓ1 space". Proc. Amer. Math. Soc. 47: 515–516. doi:10.1090/s0002-9939-1975-0358308-x.

- ^ see p.&#160;201 in Diestel (1984).

- ^ 
- Odell, Edward W.; Rosenthal, Haskell P. (1975), "A double-dual characterization of separable Banach spaces containing ℓ1" (PDF), Israel Journal of Mathematics, 20 (3–4): 375–384, doi:10.1007/bf02760341, S2CID&#160;122391702, archived (PDF) from the original on 2022-10-09.

- ^ Odell and Rosenthal, Sublemma p.&#160;378 and Remark p.&#160;379.

- ^ for more on pointwise compact subsets of the Baire class, see 
- Bourgain, Jean; Fremlin, D. H.; Talagrand, Michel (1978), "Pointwise Compact Sets of Baire-Measurable Functions", Am. J. Math., 100 (4): 845–886, doi:10.2307/2373913, JSTOR&#160;2373913.

- ^ see Proposition&#160;2.5.14, p.&#160;215 in Megginson (1998).

- ^ see for example p.&#160;49, II.C.3 in Wojtaszczyk (1991).

- ^ see Corollary&#160;2.8.9, p.&#160;251 in Megginson (1998).

- ^ see Lindenstrauss & Tzafriri (1977) p.&#160;3.

- ^ the question appears p.&#160;238, §3 in Banach's book, Banach (1932).

- ^ see S. V. Bočkarev, "Existence of a basis in the space of functions analytic in the disc, and some properties of Franklin's system". (Russian) Mat. Sb. (N.S.) 95(137) (1974), 3–18, 159.

- ^ see 
- Enflo, P. (1973). "A counterexample to the approximation property in Banach spaces". Acta Math. 130: 309–317. doi:10.1007/bf02392270. S2CID&#160;120530273.

- ^ see R.C. James, "Bases and reflexivity of Banach spaces". Ann. of Math. (2) 52, (1950). 518–527. See also Lindenstrauss & Tzafriri (1977) p.&#160;9.

- ^ see A. Grothendieck, "Produits tensoriels topologiques et espaces nucléaires". Mem. Amer. Math. Soc. 1955 (1955), no. 16, 140 pp., and A. Grothendieck, "Résumé de la théorie métrique des produits tensoriels topologiques". Bol. Soc. Mat. São Paulo 8 1953 1–79.

- ^ see chap.&#160;2, p.&#160;15 in Ryan (2002).

- ^ see chap.&#160;3, p.&#160;45 in Ryan (2002).

- ^ see Example.&#160;2.19, p.&#160;29, and pp.&#160;49–50 in Ryan (2002).

- ^ see Proposition&#160;4.6, p.&#160;74 in Ryan (2002).

- ^ see Pisier, Gilles (1983), "Counterexamples to a conjecture of Grothendieck", Acta Math. 151:181–208.

- ^ see Szankowski, Andrzej (1981), " does not have the approximation property", Acta Math. 147: 89–108. Ryan claims that this result is due to Per Enflo, p.&#160;74 in Ryan (2002).

- ^ see Kwapień, S. (1970), "A linear topological characterization of inner-product spaces", Studia Math. 38:277–278.

- ^ 
- Lindenstrauss, Joram; Tzafriri, Lior (1971). "On the complemented subspaces problem". Israel Journal of Mathematics. 9 (2): 263–269. doi:10.1007/BF02771592.

- ^ see p.&#160;245 in Banach (1932). The homogeneity property is called "propriété&#160;(15)" there. Banach writes: "on ne connaît aucun exemple d'espace à une infinité de dimensions qui, sans être isomorphe avec $).}$ possède la propriété&#160;(15)".

- ^ a b Gowers, W. T. (1996), "A new dichotomy for Banach spaces", Geom. Funct. Anal. 6:1083–1093.

- ^ see 
- Gowers, W. T. (1994). "A solution to Banach's hyperplane problem". Bull. London Math. Soc. 26 (6): 523–530. doi:10.1112/blms/26.6.523.

- ^ see 
- Komorowski, Ryszard A.; Tomczak-Jaegermann, Nicole (1995). "Banach spaces without local unconditional structure". Israel Journal of Mathematics. 89 (1–3): 205–226. arXiv:math/9306211. doi:10.1007/bf02808201. S2CID&#160;5220304. and also 
- Komorowski, Ryszard A.; Tomczak-Jaegermann, Nicole (1998). "Erratum to: Banach spaces without local unconditional structure". Israel Journal of Mathematics. 105: 85–92. arXiv:math/9607205. doi:10.1007/bf02780323. S2CID&#160;18565676.

- ^ 
- C. Bessaga, A. Pełczyński (1975). Selected Topics in Infinite-Dimensional Topology. Panstwowe wyd. naukowe. pp.&#160;177–230.

- ^ 
- H. Torunczyk (1981). Characterizing Hilbert Space Topology. Fundamenta Mathematicae. pp.&#160;247–262.

- ^ Milyutin, Alekseĭ A. (1966), "Isomorphism of the spaces of continuous functions over compact sets of the cardinality of the continuum". (Russian) Teor. Funkciĭ Funkcional. Anal. i Priložen. Vyp. 2:150–156.

- ^ Milutin. See also Rosenthal, Haskell P., "The Banach spaces C(K)" in Handbook of the geometry of Banach spaces, Vol. 2, 1547–1602, North-Holland, Amsterdam, 2003.

- ^ One can take α = ωβn, where  is the Cantor–Bendixson rank of  and  is the finite number of points in the -th derived set  of  See Mazurkiewicz, Stefan; Sierpiński, Wacław (1920), "Contribution à la topologie des ensembles dénombrables", Fundamenta Mathematicae 1: 17–27.

- ^ Bessaga, Czesław; Pełczyński, Aleksander (1960), "Spaces of continuous functions. IV. On isomorphical classification of spaces of continuous functions", Studia Math. 19:53–62.

- 
- Aliprantis, Charalambos D.; Border, Kim C. (2006). Infinite Dimensional Analysis: A Hitchhiker's Guide (Third&#160;ed.). Berlin: Springer Science & Business Media. ISBN&#160;978-3-540-29587-7. OCLC&#160;262692874.

- 
- Anderson, R. D.; Schori, R. (1969). "Factors of infinite-dimensional manifolds" (PDF). Transactions of the American Mathematical Society. 142. American Mathematical Society (AMS): 315–330. doi:10.1090/s0002-9947-1969-0246327-5. ISSN&#160;0002-9947.

- 
- Bachman, George; Narici, Lawrence (2000). Functional Analysis (Second&#160;ed.). Mineola, New York: Dover Publications. ISBN&#160;978-0486402512. OCLC&#160;829157984.

- 
- Banach, Stefan (1932). Théorie des Opérations Linéaires &#91;Theory of Linear Operations&#93; (PDF). Monografie Matematyczne (in French). Vol.&#160;1. Warszawa: Subwencji Funduszu Kultury Narodowej. Zbl&#160;0005.20901. Archived from the original (PDF) on 2014-01-11. Retrieved 2020-07-11.

- 
- Beauzamy, Bernard (1985) [1982], Introduction to Banach Spaces and their Geometry (Second revised&#160;ed.), North-Holland.* 
- Bourbaki, Nicolas (1987) [1981]. Topological Vector Spaces: Chapters 1–5. Éléments de mathématique. Translated by Eggleston, H.G.; Madan, S. Berlin New York: Springer-Verlag. ISBN&#160;3-540-13627-4. OCLC&#160;17499190.

- 
- Bessaga, C.; Pełczyński, A. (1975), Selected Topics in Infinite-Dimensional Topology, Monografie Matematyczne, Warszawa: Panstwowe wyd. naukowe.

- 
- Carothers, Neal L. (2005), A short course on Banach space theory, London Mathematical Society Student Texts, vol.&#160;64, Cambridge: Cambridge University Press, pp.&#160;xii+184, ISBN&#160;0-521-84283-2.

- 
- Conway, John B. (1990). A Course in Functional Analysis. Graduate Texts in Mathematics. Vol.&#160;96 (2nd&#160;ed.). New York: Springer-Verlag. ISBN&#160;978-0-387-97245-9. OCLC&#160;21195908.

- 
- Diestel, Joseph (1984), Sequences and series in Banach spaces, Graduate Texts in Mathematics, vol.&#160;92, New York: Springer-Verlag, pp.&#160;xii+261, ISBN&#160;0-387-90859-5.

- 
- Dunford, Nelson; Schwartz, Jacob T. with the assistance of W. G. Bade and R. G. Bartle (1958), Linear Operators. I. General Theory, Pure and Applied Mathematics, vol.&#160;7, New York: Interscience Publishers, Inc., MR&#160;0117523

- 
- Edwards, Robert E. (1995). Functional Analysis: Theory and Applications. New York: Dover Publications. ISBN&#160;978-0-486-68143-6. OCLC&#160;30593138.

- 
- Grothendieck, Alexander (1973). Topological Vector Spaces. Translated by Chaljub, Orlando. New York: Gordon and Breach Science Publishers. ISBN&#160;978-0-677-30020-7. OCLC&#160;886098.

- 
- Henderson, David W. (1969). "Infinite-dimensional manifolds are open subsets of Hilbert space". Bull. Amer. Math. Soc. 75 (4): 759–762. doi:10.1090/S0002-9904-1969-12276-7. MR&#160;0247634.

- 
- Khaleelulla, S. M. (1982). Counterexamples in Topological Vector Spaces. Lecture Notes in Mathematics. Vol.&#160;936. Berlin, Heidelberg, New York: Springer-Verlag. ISBN&#160;978-3-540-11565-6. OCLC&#160;8588370.

- 
- Lindenstrauss, Joram; Tzafriri, Lior (1977), Classical Banach Spaces I, Sequence Spaces, Ergebnisse der Mathematik und ihrer Grenzgebiete, vol.&#160;92, Berlin: Springer-Verlag, ISBN&#160;3-540-08072-4.

- 
- Megginson, Robert E. (1998), An introduction to Banach space theory, Graduate Texts in Mathematics, vol.&#160;183, New York: Springer-Verlag, pp.&#160;xx+596, ISBN&#160;0-387-98431-3.

- 
- Narici, Lawrence; Beckenstein, Edward (2011). Topological Vector Spaces. Pure and applied mathematics (Second&#160;ed.). Boca Raton, FL: CRC Press. ISBN&#160;978-1584888666. OCLC&#160;144216834.

- 
- Riesz, Frederic; Sz.-Nagy, Béla (1990) [1955]. Functional Analysis. Translated by Boron, Leo F. New York: Dover Publications. ISBN&#160;0-486-66289-6. OCLC&#160;21228994.

- 
- Rudin, Walter (1991). Functional Analysis. International Series in Pure and Applied Mathematics. Vol.&#160;8 (Second&#160;ed.). New York, NY: McGraw-Hill Science/Engineering/Math. ISBN&#160;978-0-07-054236-5. OCLC&#160;21163277.

- 
- Ryan, Raymond A. (2002), Introduction to Tensor Products of Banach Spaces, Springer Monographs in Mathematics, London: Springer-Verlag, pp.&#160;xiv+225, ISBN&#160;1-85233-437-1.

- 
- Schaefer, Helmut H.; Wolff, Manfred P. (1999). Topological Vector Spaces. GTM. Vol.&#160;8 (Second&#160;ed.). New York, NY: Springer New York Imprint Springer. ISBN&#160;978-1-4612-7155-0. OCLC&#160;840278135.

- 
- Swartz, Charles (1992). An introduction to Functional Analysis. New York: M. Dekker. ISBN&#160;978-0-8247-8643-4. OCLC&#160;24909067.

- 
- Trèves, François (2006) [1967]. Topological Vector Spaces, Distributions and Kernels. Mineola, N.Y.: Dover Publications. ISBN&#160;978-0-486-45352-1. OCLC&#160;853623322.

- 
- Wilansky, Albert (2013). Modern Methods in Topological Vector Spaces. Mineola, New York: Dover Publications, Inc. ISBN&#160;978-0-486-49353-4. OCLC&#160;849801114.

- 
- Wojtaszczyk, Przemysław (1991), Banach spaces for analysts, Cambridge Studies in Advanced Mathematics, vol.&#160;25, Cambridge: Cambridge University Press, pp.&#160;xiv+382, ISBN&#160;0-521-35618-0.

Wikimedia Commons has media related to Banach spaces.

- 
- "Banach space", Encyclopedia of Mathematics, EMS Press, 2001 [1994]

- 
- Weisstein, Eric W. "Banach Space". MathWorld.

- 
- Theorems

- Hahn–Banach

- Riesz representation

- Closed graph

- Uniform boundedness principle

- Kakutani fixed-point

- Krein–Milman

- Min–max

- Gelfand–Naimark

- Banach–Alaoglu
Operators

- Adjoint

- Bounded

- Compact

- Hilbert–Schmidt

- Normal

- Nuclear

- Trace class

- Transpose

- Unbounded

- Unitary
Algebras

- Banach algebra

- C*-algebra

- Spectrum of a C*-algebra

- Operator algebra

- Group algebra of a locally compact group

- Von Neumann algebra
Open problems

- Invariant subspace problem

- Mahler's conjecture
Applications

- Hardy space

- Spectral theory of ordinary differential equations

- Heat kernel

- Index theorem

- Calculus of variations

- Functional calculus

- Integral linear operator

- Jones polynomial

- Topological quantum field theory

- Noncommutative geometry

- Riemann hypothesis

- Distribution (or Generalized functions)
Advanced topics

- Approximation property

- Balanced set

- Choquet theory

- Weak topology

- Banach–Mazur distance

- Tomita–Takesaki theory

-  Category

- 
-

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle (X,\|{\cdot }\|).}$

- ${\displaystyle (X,\|{\cdot }\|)}$

- ${\displaystyle X}$

- ${\displaystyle \mathbb {K} }$

- ${\displaystyle \mathbb {K} }$

- ${\displaystyle \mathbb {R} }$

- ${\displaystyle \mathbb {C} }$

- ${\displaystyle \|{\cdot }\|:X\to \mathbb {R} .}$

- ${\displaystyle x,y\in X}$

- ${\displaystyle d(x,y):=\|y-x\|=\|x-y\|.}$

- ${\displaystyle X}$

- ${\displaystyle (X,d).}$

- ${\displaystyle x_{1},x_{2},\ldots }$

- ${\displaystyle (X,d)}$

- ${\displaystyle d}$

- ${\displaystyle \|{\cdot }\|}$

- ${\displaystyle r>0,}$

- ${\displaystyle N}$

- ${\displaystyle d(x_{n},x_{m})=\|x_{n}-x_{m}\|<r}$

- ${\displaystyle m}$

- ${\displaystyle n}$

- ${\displaystyle N.}$

- ${\displaystyle (X,\|{\cdot }\|)}$

- ${\displaystyle d}$

- ${\displaystyle (X,d)}$

- ${\displaystyle x_{1},x_{2},\ldots }$

- ${\displaystyle (X,d),}$

- ${\displaystyle x\in X}$

- ${\displaystyle \lim _{n\to \infty }x_{n}=x\;{\text{ in }}(X,d),}$

- ${\displaystyle \|x_{n}-x\|=d(x_{n},x),}$

## Sources

[source:wikipedia] *Banach space* — Wikipedia. https://en.wikipedia.org/wiki/Banach_space. Retrieved 2026-04-17. Confidence: medium.
