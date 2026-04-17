---
title: Gauge theory
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Gauge_theory
confidence: medium
last_updated: 2026-04-17
word_count: 2582
---

# Gauge theory

## Overview

Physical theory with fields invariant under the action of local "gauge" Lie groups
For a more accessible and less technical introduction to this topic, see Introduction to gauge theory.

- This article discusses the physics of gauge theories. For the mathematical field of gauge theory, see Gauge theory (mathematics).

In physics, a gauge theory is a type of field theory in which the Lagrangian, and hence the dynamics of the system itself, does not change under local transformations according to certain smooth families of operations (Lie groups). Formally, the Lagrangian is invariant under these transformations.

## History

The concept and the name of gauge theory derives from the work of Hermann Weyl in 1918. Weyl, in an attempt to generalize the geometrical ideas of general relativity to include electromagnetism, conjectured that Eichinvarianz or invariance under the change of scale (or "gauge") might also be a local symmetry of general relativity. After the development of quantum mechanics, Weyl, Vladimir Fock and Fritz London replaced the simple scale factor with a complex quantity and turned the scale transformation into a change of phase, which is a U(1) gauge symmetry. This explained the electromagnetic field effect on the wave function of a charged quantum mechanical particle. Weyl's 1929 paper introduced the modern concept of gauge invariance subsequently popularized by Wolfgang Pauli in his 1941 review. In retrospect, James Clerk Maxwell's formulation, in 1864–65, of electrodynamics in "A Dynamical Theory of the Electromagnetic Field" suggested the possibility of invariance, when he stated that any vector field whose curl vanishes—and can therefore normally be written as a gradient of a function—could be added to the vector potential without affecting the magnetic field. Similarly unnoticed, David Hilbert had derived the Einstein field equations by postulating the invariance of the action under a general coordinate transformation. The importance of these symmetry invariances remained unnoticed until Weyl's work.

Inspired by Pauli's descriptions of connection between charge conservation and field theory driven by invariance, Chen Ning Yang sought a field theory for atomic nuclei binding based on conservation of nuclear isospin.&#58;&#8202;202&#8202; In 1954, Yang and Robert Mills generalized the gauge invariance of electromagnetism, constructing a theory based on the action of the (non-abelian) SU(2) symmetry group on the isospin doublet of protons and neutrons. This is similar to the action of the U(1) group on the spinor fields of quantum electrodynamics.

The Yang–Mills theory became the prototype theory to resolve some of the confusion in elementary particle physics.
This idea later found application in the quantum field theory of the weak force, and its unification with electromagnetism in the electroweak theory. Gauge theories became even more attractive when it was realized that non-abelian gauge theories reproduced a feature called asymptotic freedom. Asymptotic freedom was believed to be an important characteristic of strong interactions. This motivated searching for a strong force gauge theory. This theory, now known as quantum chromodynamics, is a gauge theory with the action of the SU(3) group on the color triplet of quarks. The Standard Model unifies the description of electromagnetism, weak interactions and strong interactions in the language of gauge theory.

In the 1970s, Michael Atiyah began studying the mathematics of solutions to the classical Yang–Mills equations. In 1983, Atiyah's student Simon Donaldson built on this work to show that the differentiable classification of smooth 4-manifolds is very different from their classification up to homeomorphism. Michael Freedman used Donaldson's work to exhibit exotic R4s, that is, exotic differentiable structures on Euclidean 4-dimensional space. This led to an increasing interest in gauge theory for its own sake, independent of its successes in fundamental physics. In 1994, Edward Witten and Nathan Seiberg invented gauge-theoretic techniques based on supersymmetry that enabled the calculation of certain topological invariants (the Seiberg–Witten invariants). These contributions to mathematics from gauge theory have led to a renewed interest in this area.

The importance of gauge theories in physics is exemplified in the success of the mathematical formalism in providing a unified framework to describe the quantum field theories of electromagnetism, the weak force and the strong force. This theory, known as the Standard Model, accurately describes experimental predictions regarding three of the four fundamental forces of nature, and is a gauge theory with the gauge group SU(3) × SU(2) × U(1). Modern theories like string theory, as well as general relativity, are, in one way or another, gauge theories.

See Jackson and Okun for early history of gauge and Pickering for more about the history of gauge and quantum field theories.

### Example: scalar O(n) gauge theory

The remainder of this section requires some familiarity with classical or quantum field theory, and the use of Lagrangians.
Definitions in this section: gauge group, gauge field, interaction Lagrangian, gauge boson.
The following illustrates how local gauge invariance can be "motivated" heuristically starting from global symmetry properties, and how it leads to an interaction between originally non-interacting fields.

Consider a set of  non-interacting real scalar fields, with equal masses m. This system is described by an action that is the sum of the (usual) action for each scalar field $}$

$}=\int \,\mathrm {d} ^{4}x\sum _{i=1}^{n}\left[{\frac {1}{2}}\partial _{\mu }\varphi _{i}\partial ^{\mu }\varphi _{i}-{\frac {1}{2}}m^{2}\varphi _{i}^{2}\right]}$
The Lagrangian (density) can be compactly written as

$}={\frac {1}{2}}(\partial _{\mu }\Phi )^{\mathsf {T}}\partial ^{\mu }\Phi -{\frac {1}{2}}m^{2}\Phi ^{\mathsf {T}}\Phi }$
by introducing a vector of fields

$}=(\varphi _{1},\varphi _{2},\ldots ,\varphi _{n})}$
The term $\Phi }$ is the partial derivative of  along dimension .

It is now transparent that the Lagrangian is invariant under the transformation


whenever G is a constant matrix belonging to the n-by-n orthogonal group O(n). This is seen to preserve the Lagrangian, since the derivative of  transforms identically to  and both quantities appear inside dot products in the Lagrangian (orthogonal transformations preserve the dot product).

$\Phi )\mapsto (\partial _{\mu }\Phi )'=G\partial _{\mu }\Phi }$
This characterizes the global symmetry of this particular Lagrangian, and the symmetry group is often called the gauge group; the mathematical term is structure group, especially in the theory of G-structures. Incidentally, Noether's theorem implies that invariance under this group of transformations leads to the conservation of the currents

$^{a}=i\partial _{\mu }\Phi ^{\mathsf {T}}T^{a}\Phi }$
where the Ta matrices are generators of the SO(n) group. There is one conserved current for every generator.

Now, demanding that this Lagrangian should have local O(n)-invariance requires that the G matrices (which were earlier constant) should be allowed to become functions of the spacetime coordinates x.

In this case, the G matrices do not "pass through" the derivatives, when G = G(x),

$(G\Phi )\neq G(\partial _{\mu }\Phi )}$
The failure of the derivative to commute with "G" introduces an additional term (in keeping with the product rule), which spoils the invariance of the Lagrangian. In order to rectify this we define a new derivative operator such that the derivative of  again transforms identically with 

$\Phi )'=GD_{\mu }\Phi }$
This new "derivative" is called a (gauge) covariant derivative and takes the form

$=\partial _{\mu }-igA_{\mu }}$
where g is called the coupling constant; a quantity defining the strength of an interaction.
After a simple calculation we can see that the gauge field A(x) must transform as follows

$=GA_{\mu }G^{-1}-{\frac {i}{g}}(\partial _{\mu }G)G^{-1}}$
The gauge field is an element of the Lie algebra, and can therefore be expanded as

$=\sum _{a}A_{\mu }^{a}T^{a}}$
There are therefore as many gauge fields as there are generators of the Lie algebra.

Finally, we now have a locally gauge invariant Lagrangian

$}_{\mathrm {loc} }={\frac {1}{2}}(D_{\mu }\Phi )^{\mathsf {T}}D^{\mu }\Phi -{\frac {1}{2}}m^{2}\Phi ^{\mathsf {T}}\Phi }$
Pauli uses the term gauge transformation of the first type to mean the transformation of , while the compensating transformation in  is called a gauge transformation of the second type.

Feynman diagram of scalar bosons interacting via a gauge boson
The difference between this Lagrangian and the original globally gauge-invariant Lagrangian is seen to be the interaction Lagrangian

$}_{\mathrm {int} }=i{\frac {g}{2}}\Phi ^{\mathsf {T}}A_{\mu }^{\mathsf {T}}\partial ^{\mu }\Phi +i{\frac {g}{2}}(\partial _{\mu }\Phi )^{\mathsf {T}}A^{\mu }\Phi -{\frac {g^{2}}{2}}(A_{\mu }\Phi )^{\mathsf {T}}A^{\mu }\Phi }$
This term introduces interactions between the n scalar fields just as a consequence of the demand for local gauge invariance. However, to make this interaction physical and not completely arbitrary, the mediator A(x) needs to propagate in space. That is dealt with in the next section by adding yet another term, $}_{\mathrm {gf} }}$, to the Lagrangian. In the quantized version of the obtained classical field theory, the quanta of the gauge field A(x) are called gauge bosons. The interpretation of the interaction Lagrangian in quantum field theory is of scalar bosons interacting by the exchange of these gauge bosons.

### Example: electrodynamics

As a simple application of the formalism developed in the previous sections, consider the case of electrodynamics, with only the electron field. The bare-bones action that generates the electron field's Dirac equation is

$}=\int {\bar {\psi }}\left(i\hbar c\,\gamma ^{\mu }\partial _{\mu }-mc^{2}\right)\psi \,\mathrm {d} ^{4}x}$
The global symmetry for this system is

$\psi }$
The gauge group here is U(1), just rotations of the phase angle of the field, with the particular rotation determined by the constant θ.

"Localising" this symmetry implies the replacement of θ by θ(x). An appropriate covariant derivative is then

$=\partial _{\mu }-i{\frac {e}{\hbar }}A_{\mu }}$
Identifying the "charge" e (not to be confused with the mathematical constant e in the symmetry description) with the usual electric charge (this is the origin of the usage of the term in gauge theories), and the gauge field A(x) with the four-vector potential of the electromagnetic field results in an interaction Lagrangian

$}_{\text{int}}={\frac {e}{\hbar }}{\bar {\psi }}(x)\gamma ^{\mu }\psi (x)A_{\mu }(x)=J^{\mu }(x)A_{\mu }(x)}$
where $(x)={\frac {e}{\hbar }}{\bar {\psi }}(x)\gamma ^{\mu }\psi (x)}$ is the electric current four vector in the Dirac field. The gauge principle is therefore seen to naturally introduce the so-called minimal coupling of the electromagnetic field to the electron field.

Adding a Lagrangian for the gauge field $(x)}$ in terms of the field strength tensor exactly as in electrodynamics, one obtains the Lagrangian used as the starting point in quantum electrodynamics.

$}_{\text{QED}}={\bar {\psi }}\left(i\hbar c\,\gamma ^{\mu }D_{\mu }-mc^{2}\right)\psi -{\frac {1}{4\mu _{0}}}F_{\mu \nu }F^{\mu \nu }}$

- See also: Dirac equation, Maxwell's equations, and Quantum electrodynamics

## Mathematical formalism

- See also: Gauge theory (mathematics)
Gauge theories are usually discussed in the language of differential geometry. Mathematically, a gauge is just a choice of a (local) section of some principal bundle. A gauge transformation is just a transformation between two such sections.

Although gauge theory is dominated by the study of connections (primarily because it's mainly studied by high-energy physicists), the idea of a connection is not central to gauge theory in general. In fact, a result in general gauge theory shows that affine representations (i.e., affine modules) of the gauge transformations can be classified as sections of a jet bundle satisfying certain properties. There are representations that transform covariantly pointwise (called by physicists gauge transformations of the first kind), representations that transform as a connection form (called by physicists gauge transformations of the second kind, an affine representation)—and other more general representations, such as the B field in BF theory. There are more general nonlinear representations (realizations), but these are extremely complicated. Still, nonlinear sigma models transform nonlinearly, so there are applications.

If there is a principal bundle P whose base space is space or spacetime and structure group is a Lie group, then the sections of P form a principal homogeneous space of the group of gauge transformations.

Connections (gauge connection) define this principal bundle, yielding a covariant derivative ∇ in each associated vector bundle. If a local frame is chosen (a local basis of sections), then this covariant derivative is represented by the connection form A, a Lie algebra-valued 1-form, which is called the gauge potential in physics. This is evidently not an intrinsic but a frame-dependent quantity. The curvature form F, a Lie algebra-valued 2-form that is an intrinsic quantity, is constructed from a connection form by

$=\mathrm {d} \mathbf {A} +\mathbf {A} \wedge \mathbf {A} }$
where d stands for the exterior derivative and  stands for the wedge product. ($}$ is an element of the vector space spanned by the generators $}$, and so the components of $}$ do not commute with one another. Hence the wedge product $\wedge \mathbf {A} }$ does not vanish.)

Infinitesimal gauge transformations form a Lie algebra, which is characterized by a smooth Lie-algebra-valued scalar, ε. Under such an infinitesimal gauge transformation,

$\mathbf {A} =[\varepsilon ,\mathbf {A} ]-\mathrm {d} \varepsilon }$
where  is the Lie bracket.

One nice thing is that if $X=\varepsilon X}$, then $DX=\varepsilon DX}$ where D is the covariant derivative

$}{=}}\ \mathrm {d} X+\mathbf {A} X}$
Also, $\mathbf {F} =[\varepsilon ,\mathbf {F} ]}$, which means $}$ transforms covariantly.

Not all gauge transformations can be generated by infinitesimal gauge transformations in general. An example is when the base manifold is a compact manifold without boundary such that the homotopy class of mappings from that manifold to the Lie group is nontrivial. See instanton for an example.

The Yang–Mills action is now given by

${4g^{2}}}\int \operatorname {Tr} [{\star }F\wedge F]}$
where $}$ is the Hodge star operator and the integral is defined as in differential geometry.

A quantity which is gauge-invariant (i.e., invariant under gauge transformations) is the Wilson loop, which is defined over any closed path, γ, as follows:

$\left({\mathcal {P}}\left\{e^{\int _{\gamma }A}\right\}\right)}$
where χ is the character of a complex representation ρ and $}}$ represents the path-ordered operator.

The formalism of gauge theory carries over to a general setting. For example, it is sufficient to ask that a vector bundle have a metric connection; when one does so, one finds that the metric connection satisfies the Yang–Mills equations of motion.

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle V\mapsto V+C}$

- ${\displaystyle \mathbf {E} =-\nabla V}$

$$
{\displaystyle {\begin{aligned}\mathbf {E} &=-\nabla V-{\frac {\partial \mathbf {A} }{\partial t}}\\\mathbf {B} &=\nabla \times \mathbf {A} \end{aligned}}}
$$

- ${\displaystyle V\mapsto V+C}$

$$
{\displaystyle {\begin{aligned}\mathbf {A} &\mapsto \mathbf {A} +\nabla f\\V&\mapsto V-{\frac {\partial f}{\partial t}}\end{aligned}}}
$$

- ${\displaystyle n}$

- ${\displaystyle \varphi _{i}}$

$$
{\displaystyle {\mathcal {S}}=\int \,\mathrm {d} ^{4}x\sum _{i=1}^{n}\left[{\frac {1}{2}}\partial _{\mu }\varphi _{i}\partial ^{\mu }\varphi _{i}-{\frac {1}{2}}m^{2}\varphi _{i}^{2}\right]}
$$

$$
{\displaystyle \ {\mathcal {L}}={\frac {1}{2}}(\partial _{\mu }\Phi )^{\mathsf {T}}\partial ^{\mu }\Phi -{\frac {1}{2}}m^{2}\Phi ^{\mathsf {T}}\Phi }
$$

$$
{\displaystyle \ \Phi ^{\mathsf {T}}=(\varphi _{1},\varphi _{2},\ldots ,\varphi _{n})}
$$

- ${\displaystyle \partial _{\mu }\Phi }$

- ${\displaystyle \Phi }$

- ${\displaystyle \mu }$

- ${\displaystyle \ \Phi \mapsto \Phi '=G\Phi }$

- ${\displaystyle \Phi '}$

- ${\displaystyle \Phi }$

$$
{\displaystyle \ (\partial _{\mu }\Phi )\mapsto (\partial _{\mu }\Phi )'=G\partial _{\mu }\Phi }
$$

- ${\displaystyle \ J_{\mu }^{a}=i\partial _{\mu }\Phi ^{\mathsf {T}}T^{a}\Phi }$

- ${\displaystyle \ \partial _{\mu }(G\Phi )\neq G(\partial _{\mu }\Phi )}$

- ${\displaystyle \Phi '}$

- ${\displaystyle \Phi }$

- ${\displaystyle \ (D_{\mu }\Phi )'=GD_{\mu }\Phi }$

- ${\displaystyle \ D_{\mu }=\partial _{\mu }-igA_{\mu }}$

$$
{\displaystyle \ A'_{\mu }=GA_{\mu }G^{-1}-{\frac {i}{g}}(\partial _{\mu }G)G^{-1}}
$$

- ${\displaystyle \ A_{\mu }=\sum _{a}A_{\mu }^{a}T^{a}}$

$$
{\displaystyle \ {\mathcal {L}}_{\mathrm {loc} }={\frac {1}{2}}(D_{\mu }\Phi )^{\mathsf {T}}D^{\mu }\Phi -{\frac {1}{2}}m^{2}\Phi ^{\mathsf {T}}\Phi }
$$

- ${\displaystyle \Phi }$

- ${\displaystyle A}$

$$
{\displaystyle \ {\mathcal {L}}_{\mathrm {int} }=i{\frac {g}{2}}\Phi ^{\mathsf {T}}A_{\mu }^{\mathsf {T}}\partial ^{\mu }\Phi +i{\frac {g}{2}}(\partial _{\mu }\Phi )^{\mathsf {T}}A^{\mu }\Phi -{\frac {g^{2}}{2}}(A_{\mu }\Phi )^{\mathsf {T}}A^{\mu }\Phi }
$$

- ${\displaystyle {\mathcal {L}}_{\mathrm {gf} }}$

## Sources

[source:wikipedia] *Gauge theory* — Wikipedia. https://en.wikipedia.org/wiki/Gauge_theory. Retrieved 2026-04-17. Confidence: medium.
